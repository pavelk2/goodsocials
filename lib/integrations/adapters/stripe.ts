import { credentialError, request } from "../http";
import { WINDOW_LABEL, atLeast, money, windowStart } from "../format";
import type { Adapter, AdapterInput, DraftFact, ReadResult } from "../types";

/**
 * Stripe, read only, over raw fetch rather than the SDK: five GETs do not earn
 * a dependency, and the SDK would pull a write surface into a module that must
 * not have one.
 *
 * This is the source that matters most, because a receipt post is credible
 * only because the number is theirs, and this is the one place the number
 * already lives.
 */

const BASE = "https://api.stripe.com/v1";
const PAGE = 100;
/** 500 subscriptions is five calls. Past that the MRR line says "or more". */
const MAX_PAGES = 5;

type Price = {
  unit_amount: number | null;
  unit_amount_decimal: string | null;
  currency: string;
  recurring: { interval: string; interval_count: number } | null;
};

type Subscription = {
  items: { data: { quantity: number | null; price: Price }[] };
};

type List<T> = { data: T[]; has_more: boolean };

function headers(credential: string): HeadersInit {
  return {
    Authorization: `Bearer ${credential}`,
    // Pinned, for the reason LinkedIn-Version is pinned: an API that moves
    // under a cron is an outage nobody triggered.
    "Stripe-Version": "2025-08-27.basil",
  };
}

/**
 * Monthly value of one recurring price. A yearly plan is a twelfth of its
 * invoice every month, and a weekly one is not four times its price: 52 weeks
 * over 12 months, because the other arithmetic is off by 4 percent and a
 * revenue number that is off by 4 percent is worse than no revenue number.
 */
function monthlyFactor(interval: string, intervalCount: number): number | null {
  const per = intervalCount > 0 ? intervalCount : 1;
  switch (interval) {
    case "month":
      return 1 / per;
    case "year":
      return 1 / (12 * per);
    case "week":
      return 52 / 12 / per;
    case "day":
      return 365 / 12 / per;
    default:
      return null;
  }
}

function amountOf(price: Price): number | null {
  if (price.unit_amount !== null) return price.unit_amount;
  if (price.unit_amount_decimal !== null) {
    const parsed = Number(price.unit_amount_decimal);
    return Number.isFinite(parsed) ? parsed : null;
  }
  return null;
}

async function activeSubscriptions(
  credential: string,
): Promise<
  | { ok: true; mrrMinor: number; currency: string; subscriptions: number; more: boolean }
  | { ok: false; error: string; status: number | null }
> {
  let mrrMinor = 0;
  let subscriptions = 0;
  let currency = "";
  let cursor: string | null = null;
  let more = false;

  for (let page = 0; page < MAX_PAGES; page += 1) {
    const url = new URL(`${BASE}/subscriptions`);
    url.searchParams.set("status", "active");
    url.searchParams.set("limit", String(PAGE));
    if (cursor) url.searchParams.set("starting_after", cursor);

    const result = await request<List<Subscription & { id: string }>>(url.toString(), {
      headers: headers(credential),
    });
    if (!result.ok) return { ok: false, error: result.error, status: result.status };

    for (const sub of result.data.data) {
      subscriptions += 1;
      for (const item of sub.items?.data ?? []) {
        const price = item.price;
        if (!price?.recurring) continue;
        const amount = amountOf(price);
        const factor = monthlyFactor(
          price.recurring.interval,
          price.recurring.interval_count,
        );
        if (amount === null || factor === null) continue;
        // Mixed currencies on one account would make a single total a lie, so
        // the first one seen wins and the rest are left out rather than added.
        if (!currency) currency = price.currency;
        if (price.currency !== currency) continue;
        mrrMinor += amount * (item.quantity ?? 1) * factor;
      }
    }

    const last = result.data.data.at(-1);
    more = result.data.has_more;
    if (!more || !last) break;
    cursor = last.id;
  }

  return {
    ok: true,
    mrrMinor: Math.round(mrrMinor),
    currency: currency || "usd",
    subscriptions,
    more,
  };
}

async function listCount(
  credential: string,
  path: string,
  params: Record<string, string>,
): Promise<{ ok: true; n: number; more: boolean; rows: unknown[] } | { ok: false }> {
  const url = new URL(`${BASE}/${path}`);
  url.searchParams.set("limit", String(PAGE));
  for (const [k, v] of Object.entries(params)) url.searchParams.set(k, v);

  const result = await request<List<unknown>>(url.toString(), {
    headers: headers(credential),
  });
  if (!result.ok) return { ok: false };
  return {
    ok: true,
    n: result.data.data.length,
    more: result.data.has_more,
    rows: result.data.data,
  };
}

export const stripeAdapter: Adapter = {
  kind: "stripe",

  /**
   * One customer, which every restricted key that is any use at all can read.
   * A key that fails here is mistyped or scoped to nothing.
   */
  async check({ credential }: AdapterInput) {
    const result = await request<List<unknown>>(`${BASE}/customers?limit=1`, {
      headers: headers(credential),
    });
    if (!result.ok) {
      return {
        ok: false,
        error: credentialError("Stripe", result.status, result.error),
      };
    }
    return { ok: true };
  },

  async read({ credential, now }: AdapterInput): Promise<ReadResult> {
    const since = Math.floor(windowStart(now).getTime() / 1000);
    const facts: DraftFact[] = [];

    // Subscriptions first, because it is the one call whose failure means the
    // key is not worth keeping. Everything after it is allowed to come back
    // empty: a restricted key scoped to subscriptions only is a reasonable
    // thing for a careful person to create, and it should still produce facts.
    const subs = await activeSubscriptions(credential);
    if (!subs.ok) {
      return {
        ok: false,
        error: credentialError("Stripe", subs.status, subs.error),
      };
    }

    if (subs.subscriptions > 0) {
      facts.push({
        key: "mrr",
        label: "Monthly recurring revenue",
        value: money(subs.mrrMinor, subs.currency),
        detail: `across ${atLeast(subs.subscriptions, subs.more)} active subscriptions`,
        period: "right now",
      });
      facts.push({
        key: "active_subscriptions",
        label: "Active subscriptions",
        value: atLeast(subs.subscriptions, subs.more),
        period: "right now",
      });
    }

    const customers = await listCount(credential, "customers", {
      "created[gte]": String(since),
    });
    if (customers.ok) {
      facts.push({
        key: "new_customers",
        label: "New customers",
        value: atLeast(customers.n, customers.more),
        period: WINDOW_LABEL,
      });
    }

    const charges = await listCount(credential, "charges", {
      "created[gte]": String(since),
    });
    if (charges.ok) {
      const paid = (charges.rows as {
        paid: boolean;
        amount: number;
        amount_refunded: number;
        currency: string;
      }[]).filter((c) => c.paid);
      const currency = paid[0]?.currency ?? subs.currency;
      const net = paid
        .filter((c) => c.currency === currency)
        .reduce((sum, c) => sum + c.amount - (c.amount_refunded ?? 0), 0);
      if (paid.length > 0) {
        facts.push({
          key: "collected",
          label: "Payments collected",
          value: money(net, currency),
          detail: `across ${atLeast(paid.length, charges.more)} payments, refunds already deducted`,
          period: WINDOW_LABEL,
        });
      }
    }

    // Cancellations come from the event log rather than the subscription list,
    // because Stripe filters subscriptions by when they were created and not by
    // when they ended. Events are retained 30 days, which is exactly our window.
    const cancelled = await listCount(credential, "events", {
      type: "customer.subscription.deleted",
      "created[gte]": String(since),
    });
    if (cancelled.ok) {
      facts.push({
        key: "cancellations",
        label: "Subscriptions cancelled",
        value: atLeast(cancelled.n, cancelled.more),
        period: WINDOW_LABEL,
      });
    }

    if (facts.length === 0) {
      return {
        ok: false,
        error:
          "Stripe accepted the key and returned nothing. Either the account has no activity yet or the key reads none of Customers, Subscriptions, Charges or Events.",
      };
    }
    return { ok: true, facts };
  },
};
