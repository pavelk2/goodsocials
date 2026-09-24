import type Stripe from "stripe";
import { applySubscription, accountForCustomer } from "@/lib/billing";
import { callStripe, getStripe, stripeConfigured } from "@/lib/stripe/client";

/**
 * What Stripe tells us, written onto the account.
 *
 * Three rules, and the reason for each.
 *
 * The signature is checked against the raw body, so the body is read as text
 * and never parsed first. A webhook route that trusts its payload is a route
 * anybody can use to give themselves the agency plan.
 *
 * Every subscription event re-reads the subscription from the API instead of
 * trusting the copy in the payload. Stripe does not promise delivery order, and
 * a `created` arriving after an `updated` would write a stale plan over a fresh
 * one. Re-reading costs one call and makes the last write the true one.
 *
 * A handler that fails returns 500 so Stripe retries. An event we do not care
 * about returns 200 so it stops. The one thing this route never does is return
 * 200 on a write that did not happen, because that is a subscription silently
 * detached from its board.
 */
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!secret || !stripeConfigured()) {
    console.error("[stripe/webhook] STRIPE_WEBHOOK_SECRET is not set.");
    return Response.json({ error: "Billing is not configured." }, { status: 500 });
  }

  const signature = request.headers.get("stripe-signature");
  if (!signature) {
    return Response.json({ error: "No signature." }, { status: 400 });
  }

  const body = await request.text();

  let event: Stripe.Event;
  try {
    event = await getStripe().webhooks.constructEventAsync(
      body,
      signature,
      secret,
    );
  } catch (cause) {
    // A bad signature is not a retryable failure, so it gets a 400 and Stripe
    // stops. It is also the only thing on this route worth alerting on.
    console.error("[stripe/webhook] signature check failed:", cause);
    return Response.json({ error: "Bad signature." }, { status: 400 });
  }

  try {
    const outcome = await handle(event);
    console.log(
      JSON.stringify({
        event: "stripe_webhook",
        type: event.type,
        id: event.id,
        outcome,
      }),
    );
    return Response.json({ received: true, outcome });
  } catch (cause) {
    console.error(`[stripe/webhook] ${event.type} ${event.id} failed:`, cause);
    return Response.json({ error: "Handler failed." }, { status: 500 });
  }
}

async function handle(event: Stripe.Event): Promise<string> {
  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object;
      if (session.mode !== "subscription") return "not a subscription";
      const id = idOf(session.subscription);
      if (!id) return "no subscription on the session";
      return sync(id);
    }

    case "customer.subscription.created":
    case "customer.subscription.updated":
    case "customer.subscription.trial_will_end":
      return sync(event.data.object.id);

    case "customer.subscription.deleted": {
      // The one event not worth re-reading: the subscription is gone and the
      // payload is the last true word on it.
      const applied = await applySubscription(event.data.object);
      return applied.applied ? `account ${applied.accountId}` : (applied.reason ?? "no account");
    }

    // A paid invoice moves the period end, a failed one moves the status to
    // past_due. Both are on the subscription, so both are one re-read.
    case "invoice.paid":
    case "invoice.payment_failed": {
      const id = subscriptionOfInvoice(event.data.object);
      if (!id) return "invoice with no subscription";
      if (event.type === "invoice.payment_failed") {
        const customer = idOf(event.data.object.customer);
        const account = customer ? await accountForCustomer(customer) : null;
        console.error(
          `[stripe/webhook] payment failed on ${id}${account ? ` for account ${account.id}` : ""}`,
        );
      }
      return sync(id);
    }

    default:
      return "ignored";
  }
}

/** Reads the subscription as Stripe has it now and writes it to the account. */
async function sync(subscriptionId: string): Promise<string> {
  const read = await callStripe("subscriptions.retrieve", (stripe) =>
    stripe.subscriptions.retrieve(subscriptionId),
  );
  // A failed read is a failed handler. Returning here would 200 an event that
  // changed nothing, and Stripe would never send it again.
  if (!read.ok) throw new Error(`could not read ${subscriptionId}: ${read.error}`);

  const applied = await applySubscription(read.value);
  if (!applied.applied) {
    // No account for this customer is not retryable: a subscription created in
    // the dashboard for somebody who never signed in will never find a board.
    // It is loud in the log and the event stops here.
    console.error(`[stripe/webhook] ${applied.reason}`);
    return applied.reason ?? "no account";
  }
  return `account ${applied.accountId}`;
}

function idOf(value: string | { id: string } | null | undefined): string | null {
  if (!value) return null;
  return typeof value === "string" ? value : value.id;
}

/**
 * The subscription an invoice belongs to. It moved under `parent` in the 2025
 * API versions, which is the kind of change that reads as "this customer has
 * no subscription" rather than as an error.
 */
function subscriptionOfInvoice(invoice: Stripe.Invoice): string | null {
  return idOf(invoice.parent?.subscription_details?.subscription);
}
