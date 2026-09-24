import Stripe from "stripe";

/**
 * Every call to Stripe goes through this file, the way every call to LinkedIn
 * goes through lib/linkedin/client.ts. One client, one place that knows the
 * secret key is missing, and one error shape.
 *
 * Nothing here throws at a component. A Stripe outage should put a sentence on
 * the settings screen saying what to do, not an error boundary over the board.
 */

export type StripeResult<T> =
  | { ok: true; value: T }
  | { ok: false; error: string };

let client: Stripe | null = null;

/** False on a deployment where billing has not been configured yet. */
export function stripeConfigured(): boolean {
  return Boolean(process.env.STRIPE_SECRET_KEY);
}

export function getStripe(): Stripe {
  if (client) return client;

  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) throw new Error("STRIPE_SECRET_KEY is not set on this deployment.");

  client = new Stripe(key, {
    // No apiVersion pin. The SDK sends the version it was built against, so
    // the types in node_modules and the objects on the wire are the same
    // shape. Pinning an older string here is how a field quietly goes missing.
    appInfo: { name: "GoodSocials", url: "https://goodsocials.co" },
    maxNetworkRetries: 2,
  });
  return client;
}

/**
 * Runs one Stripe call and turns anything it throws into a sentence a user can
 * act on. `what` names the step, so a log line says which call failed without
 * the reader counting stack frames.
 */
export async function callStripe<T>(
  what: string,
  run: (stripe: Stripe) => Promise<T>,
): Promise<StripeResult<T>> {
  if (!stripeConfigured()) {
    console.error(`[stripe] ${what} skipped: STRIPE_SECRET_KEY is not set.`);
    return {
      ok: false,
      error: "Billing is not configured on this deployment yet.",
    };
  }

  try {
    return { ok: true, value: await run(getStripe()) };
  } catch (cause) {
    console.error(`[stripe] ${what} failed:`, cause);
    return { ok: false, error: message(cause) };
  }
}

/**
 * What the user reads. Stripe's own `message` is written for a developer on
 * configuration errors and for a customer on card errors, so the card ones go
 * through and the rest become one line that names the next step.
 */
function message(cause: unknown): string {
  if (cause instanceof Stripe.errors.StripeCardError) {
    return cause.message;
  }
  if (cause instanceof Stripe.errors.StripeConnectionError) {
    return "Could not reach Stripe. Try again in a minute.";
  }
  if (cause instanceof Stripe.errors.StripeAuthenticationError) {
    return "Billing is not configured correctly. We have been told.";
  }
  if (cause instanceof Stripe.errors.StripeInvalidRequestError) {
    return "Stripe refused that request. We have been told.";
  }
  return "Something went wrong opening Stripe. Try again in a minute.";
}
