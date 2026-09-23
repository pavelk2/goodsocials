import { eq } from "drizzle-orm";
import type Stripe from "stripe";
import { getDb } from "@/db";
import { account as accountTable } from "@/db/schema";
import {
  TRIAL_DAYS,
  TRIAL_LINE,
  columnForSlug,
  planForColumn,
  planForPriceId,
  planFromSlug,
  priceIdFor,
  type Plan,
  type PlanSlug,
} from "@/lib/plans";
import { callStripe, type StripeResult } from "@/lib/stripe/client";

/**
 * What the account is paying for, and what that entitles it to.
 *
 * Stripe owns the subscription; this file owns what a subscription means here.
 * Two rules keep it honest.
 *
 * One writer. Every column below `stripe_customer_id` is written by
 * `applySubscription`, which the webhook calls and nothing else does. A screen
 * that inferred "they must be active, they just paid" would disagree with
 * Stripe the first time a card failed, and the disagreement would be invisible.
 *
 * One reader for the decision that costs money. `canPublish` is the only place
 * that decides whether the cron may post for an account. The settings row, the
 * board banner and the publish loop all ask it, so a cancelled account cannot
 * look stopped on one screen and keep posting to a client's feed.
 */

export type Account = typeof accountTable.$inferSelect;
export type BillingStatus = Account["subscriptionStatus"];

/**
 * The statuses that keep posts going out.
 *
 * `past_due` is in the list on purpose. Stripe retries a failed card for about
 * three weeks and most of those retries succeed, so cutting the queue on the
 * first decline would stop an agency's twelve client feeds over a card that
 * expired. When the retries are exhausted Stripe moves the subscription to
 * `canceled` or `unpaid`, and both of those stop it here.
 */
const PUBLISHING: readonly BillingStatus[] = [
  "trialing",
  "active",
  "past_due",
] as const;

/**
 * True while there is a subscription for the portal to show.
 *
 * A customer id is not enough. Somebody who opened checkout and closed it has
 * one, and the portal would show them invoices, a card form and no way to
 * subscribe, which is a dead end reached by pressing the obvious button. The
 * subscription id is nulled when a subscription ends, so this is also what
 * sends a cancelled account back to the prices rather than into the portal.
 */
export function canManageBilling(
  account: Pick<Account, "stripeCustomerId" | "stripeSubscriptionId">,
): boolean {
  return Boolean(account.stripeCustomerId && account.stripeSubscriptionId);
}

export function canPublish(
  account: Pick<Account, "subscriptionStatus">,
): boolean {
  return PUBLISHING.includes(account.subscriptionStatus);
}

/** The plan an account is on, named the way the pricing page names it. */
export function planOf(account: Pick<Account, "plan">): Plan {
  return planForColumn(account.plan);
}

/**
 * The reason the queue is stopped, for the board banner and for the row the
 * cron writes on every post it skipped. Null while posting is allowed, so one
 * check covers both "is it stopped" and "what do I say".
 */
export function billingBlock(
  account: Pick<Account, "subscriptionStatus">,
): string | null {
  if (canPublish(account)) return null;

  switch (account.subscriptionStatus) {
    case "none":
      return "This account has no plan, so nothing publishes. Starting one publishes everything that waited.";
    case "canceled":
    case "incomplete_expired":
      return "The subscription ended and the queue is paused. Starting a plan publishes everything that waited.";
    case "unpaid":
      return "The last payments did not go through and the queue is paused. Updating the card in billing restarts it.";
    case "incomplete":
      return "Checkout was never finished, so nothing publishes. Finishing it publishes everything that waited.";
    case "paused":
      return "The subscription is paused, and so is the queue.";
    default:
      return "Billing needs attention and the queue is paused.";
  }
}

/**
 * The billing row on the settings screen. One line, which says the state and
 * the date that state changes, because the two questions a subscriber asks are
 * "am I paying" and "until when".
 */
export function billingLine(account: Account, now = new Date()): string {
  const plan = planOf(account);

  switch (account.subscriptionStatus) {
    case "none":
      // No price here. The button beside this row carries it, and it carries
      // the plan the visitor picked on the way in, which this row cannot know.
      return `No plan yet. ${TRIAL_LINE}`;
    case "trialing": {
      const ends = account.trialEndsAt ?? account.currentPeriodEnd;
      const left = ends ? daysUntil(ends, now) : null;
      if (account.cancelAtPeriodEnd) {
        return `Trial, ending ${onDay(ends)}. Nothing will be charged.`;
      }
      return left === null
        ? `Trial. Then ${plan.priceLine}.`
        : `Trial, ${left} ${left === 1 ? "day" : "days"} left. Then ${plan.priceLine} on ${onDay(ends)}.`;
    }
    case "active":
      return account.cancelAtPeriodEnd
        ? `Ends ${onDay(account.currentPeriodEnd)}. Posting stops that day.`
        : `${plan.priceLine}, renews ${onDay(account.currentPeriodEnd)}.`;
    case "past_due":
      return "The last payment did not go through. Stripe retries, and posting carries on meanwhile. Update the card to be sure.";
    case "unpaid":
      return "The payments stopped going through and posting is paused. Update the card to restart it.";
    case "canceled":
    case "incomplete_expired":
      return "Cancelled. Posting is paused until a plan starts again.";
    case "incomplete":
      return "Checkout was started and never finished. Nothing has been charged.";
    case "paused":
      return "Paused. Nothing is charged and nothing publishes.";
    default:
      return "Billing needs attention.";
  }
}

/** "29 September", the way lib/quota.ts writes a date. */
function onDay(date: Date | null): string {
  if (!date) return "the end of the period";
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "long",
    timeZone: "UTC",
  }).format(date);
}

function daysUntil(date: Date, now: Date): number {
  return Math.max(
    0,
    Math.ceil((date.getTime() - now.getTime()) / (24 * 60 * 60 * 1000)),
  );
}

/**
 * The Stripe customer for this account, created on first use.
 *
 * Created here rather than by Checkout, for two reasons. The billing portal
 * needs a customer id, and somebody who abandons checkout still has a card on
 * file to come back to. And the webhook finds the account by customer id, so
 * the row has to exist before the first event arrives rather than because of it.
 */
export async function ensureCustomer(
  account: Account,
): Promise<StripeResult<string>> {
  if (account.stripeCustomerId) return { ok: true, value: account.stripeCustomerId };

  const created = await callStripe("customers.create", (stripe) =>
    stripe.customers.create(
      {
        email: account.email ?? undefined,
        metadata: { accountId: account.id, ownerMemberId: account.ownerMemberId },
      },
      // Two clicks on the same button would otherwise leave an orphan customer
      // holding the card, and the webhook would find the account by the other.
      { idempotencyKey: `customer:${account.id}` },
    ),
  );
  if (!created.ok) return created;

  await getDb()
    .update(accountTable)
    .set({ stripeCustomerId: created.value.id })
    .where(eq(accountTable.id, account.id));

  return { ok: true, value: created.value.id };
}

/**
 * A Checkout session for one plan. Returns the URL to send the browser to.
 *
 * The trial is set here rather than on the price, so changing the free days is
 * one edit in lib/plans.ts and does not need a new price in Stripe. A card is
 * still collected up front, which is what makes the trial roll into a
 * subscription instead of expiring into nothing.
 */
export async function startCheckout(opts: {
  account: Account;
  plan: PlanSlug;
  origin: string;
}): Promise<StripeResult<string>> {
  const plan = planFromSlug(opts.plan);
  const price = priceIdFor(plan.slug);
  if (!price) {
    console.error(`[billing] ${plan.priceEnv} is not set on this deployment.`);
    return { ok: false, error: "That plan is not on sale on this deployment yet." };
  }

  const customer = await ensureCustomer(opts.account);
  if (!customer.ok) return customer;

  const session = await callStripe("checkout.sessions.create", (stripe) =>
    stripe.checkout.sessions.create({
      mode: "subscription",
      customer: customer.value,
      line_items: [{ price, quantity: 1 }],
      // Both of these carry the account through the whole flow, so the webhook
      // never has to guess which board a payment belongs to.
      client_reference_id: opts.account.id,
      metadata: { accountId: opts.account.id, plan: plan.slug },
      subscription_data: {
        trial_period_days: TRIAL_DAYS,
        metadata: { accountId: opts.account.id, plan: plan.slug },
      },
      customer_update: { name: "auto", address: "auto" },
      billing_address_collection: "auto",
      // An agency in the EU needs its VAT number on the invoice, and asking at
      // checkout is the only moment anybody is willing to type one.
      tax_id_collection: { enabled: true },
      allow_promotion_codes: true,
      success_url: `${opts.origin}/settings?billing=started`,
      cancel_url: `${opts.origin}/settings?billing=cancelled`,
    }),
  );
  if (!session.ok) return session;

  if (!session.value.url) {
    console.error("[billing] checkout session came back with no url");
    return { ok: false, error: "Stripe did not return a checkout page. Try again." };
  }
  return { ok: true, value: session.value.url };
}

/**
 * The billing portal, which is where changing plan, updating the card and
 * cancelling all happen. Stripe hosts it and the configuration lives in the
 * Stripe dashboard, which is why this repo has no billing forms of its own.
 */
export async function openPortal(opts: {
  account: Account;
  origin: string;
}): Promise<StripeResult<string>> {
  if (!opts.account.stripeCustomerId) {
    return { ok: false, error: "There is no subscription on this account yet." };
  }

  const session = await callStripe("billingPortal.sessions.create", (stripe) =>
    stripe.billingPortal.sessions.create({
      customer: opts.account.stripeCustomerId as string,
      return_url: `${opts.origin}/settings`,
    }),
  );
  if (!session.ok) return session;

  return { ok: true, value: session.value.url };
}

/**
 * Writes what Stripe says about a subscription onto the account. The only
 * writer of the billing columns, called by the webhook and by nothing else.
 *
 * The account is found by customer id first, because that is the one field
 * every Stripe object carries. Metadata is the fallback for a subscription
 * created outside our own checkout, by hand in the dashboard.
 */
export async function applySubscription(
  subscription: Stripe.Subscription,
): Promise<{ applied: boolean; accountId?: string; reason?: string }> {
  const customerId =
    typeof subscription.customer === "string"
      ? subscription.customer
      : subscription.customer.id;

  const db = getDb();
  const account = await findAccount(
    customerId,
    subscription.metadata?.accountId,
  );
  if (!account) {
    return {
      applied: false,
      reason: `No account for Stripe customer ${customerId}.`,
    };
  }

  const status = statusOf(subscription, account.subscriptionStatus);
  const plan = planOfSubscription(subscription) ?? planOf(account);
  const ended = ENDED.includes(status);

  await db
    .update(accountTable)
    .set({
      // An account that never had its customer id written down gets it here,
      // which is how a subscription started in the dashboard finds its board.
      stripeCustomerId: customerId,
      stripeSubscriptionId: ended ? null : subscription.id,
      subscriptionStatus: status,
      plan: columnForSlug(plan.slug),
      // The seat limit follows the plan, so a downgrade from agency takes the
      // seats with it, and an ended subscription takes all but one. Profiles
      // already connected stay connected: taking one away would take a
      // client's board with it, and the seat check in lib/profiles.ts already
      // refuses the next one. The plan column is left where it was, so the
      // button that restarts a cancelled agency offers agency.
      seatLimit: ended ? 1 : plan.seats,
      currentPeriodEnd: periodEnd(subscription),
      trialEndsAt: subscription.trial_end
        ? new Date(subscription.trial_end * 1000)
        : null,
      cancelAtPeriodEnd: subscription.cancel_at_period_end,
    })
    .where(eq(accountTable.id, account.id));

  console.log(
    JSON.stringify({
      event: "billing_applied",
      account_id: account.id,
      subscription: subscription.id,
      status,
      plan: plan.slug,
      cancel_at_period_end: subscription.cancel_at_period_end,
    }),
  );

  return { applied: true, accountId: account.id };
}

/** Statuses where there is no subscription left to manage. */
const ENDED: readonly BillingStatus[] = [
  "canceled",
  "incomplete_expired",
] as const;

/**
 * Stripe's status, narrowed to the enum. An unknown value leaves the stored
 * status alone rather than guessing: a status Stripe invented after this was
 * written is not a reason to stop an agency's queue, and the log line is what
 * gets it added here.
 */
function statusOf(
  subscription: Stripe.Subscription,
  current: BillingStatus,
): BillingStatus {
  const known: BillingStatus[] = [
    "trialing",
    "active",
    "past_due",
    "canceled",
    "incomplete",
    "incomplete_expired",
    "unpaid",
    "paused",
  ];
  const found = known.find((value) => value === subscription.status);
  if (found) return found;

  console.error(
    `[billing] unknown Stripe status ${subscription.status} on ${subscription.id}, keeping ${current}`,
  );
  return current;
}

/**
 * The period end moved onto the subscription items in the 2025 API versions,
 * so it is read from the items and not from the subscription. A subscription
 * here has one item, but the latest of them is the right answer either way.
 */
function periodEnd(subscription: Stripe.Subscription): Date | null {
  const ends = subscription.items?.data
    ?.map((item) => item.current_period_end)
    .filter((value): value is number => typeof value === "number");
  if (!ends || ends.length === 0) return null;
  return new Date(Math.max(...ends) * 1000);
}

/** Which of our plans this subscription is paying for, by price id. */
function planOfSubscription(subscription: Stripe.Subscription): Plan | null {
  for (const item of subscription.items?.data ?? []) {
    const priceId =
      typeof item.price === "string" ? item.price : item.price?.id ?? null;
    const plan = planForPriceId(priceId);
    if (plan) return plan;
  }

  console.error(
    `[billing] ${subscription.id} is on a price this deployment does not know. Check STRIPE_PRICE_*.`,
  );
  return null;
}

async function findAccount(
  customerId: string,
  accountId: string | undefined,
): Promise<Account | null> {
  const db = getDb();

  const [byCustomer] = await db
    .select()
    .from(accountTable)
    .where(eq(accountTable.stripeCustomerId, customerId))
    .limit(1);
  if (byCustomer) return byCustomer;

  if (!accountId) return null;
  const [byId] = await db
    .select()
    .from(accountTable)
    .where(eq(accountTable.id, accountId))
    .limit(1);
  return byId ?? null;
}

/** The account a Stripe customer id belongs to, for the webhook's own logging. */
export async function accountForCustomer(
  customerId: string,
): Promise<Account | null> {
  return findAccount(customerId, undefined);
}
