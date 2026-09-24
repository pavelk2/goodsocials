import { AGENCY_SEATS, IMAGE_CAP_PER_MONTH } from "@/lib/legal";

/**
 * The three prices, in one place, with the flow each one starts.
 *
 * Every plan has its own entry point. The landing page links each card to
 * /signin?plan=<slug>, the sign in page states the plan the visitor picked and
 * writes it to a cookie, and Stripe checkout reads that cookie to open the
 * right price. A visitor who wants the agency plan never passes through a
 * button that says 100.
 */
export type PlanSlug = "pro" | "agency" | "consultancy";

export type Plan = {
  slug: PlanSlug;
  name: string;
  /** The amount alone, for the price on a card. Tabular numerals, `.num`. */
  price: string;
  /** Price and period, for a sentence. */
  priceLine: string;
  /** What you get, one line. Used wherever a card has room for a sentence. */
  line: string;
  /**
   * What you get, itemised. Every line is a fact the product already enforces
   * in code, because the plan card is the one place on the page where an
   * invented capability turns into a refund. No line here without a constant,
   * a table or a cron behind it.
   */
  features: string[];
  /**
   * The one plan the page recommends. Drawn on ink, with the label below.
   * Exactly one plan carries this.
   */
  featured?: boolean;
  /** Button label. The price is in the button, always. */
  cta: string;
  /** LinkedIn profiles this plan can connect. The seat limit on the account. */
  seats: number;
  /** The environment variable holding this plan's Stripe price id. */
  priceEnv: string;
};

export const PLANS: Plan[] = [
  {
    slug: "pro",
    name: "Pro",
    price: "$100",
    priceLine: "$100 a month",
    line: "One LinkedIn profile.",
    features: [
      "One LinkedIn profile",
      "Four themes, so week four does not read like week one",
      "Three brand principles that learn from every revision",
      `Up to ${IMAGE_CAP_PER_MONTH} generated images a month`,
      "Publishes on your schedule, checked every 15 minutes",
    ],
    featured: true,
    cta: "Start for $100 a month",
    seats: 1,
    priceEnv: "STRIPE_PRICE_PRO",
  },
  {
    slug: "agency",
    name: "Agency",
    price: "$1,000",
    priceLine: "$1,000 a month",
    line: `Up to ${AGENCY_SEATS} profiles, one board per client.`,
    features: [
      `Everything in Pro, up to ${AGENCY_SEATS} profiles`,
      "One board, themes and principles per client",
      "Each client authorises their own profile, you never hold a password",
      "We email you before a client's access runs out",
    ],
    cta: "Start for $1,000 a month",
    seats: AGENCY_SEATS,
    priceEnv: "STRIPE_PRICE_AGENCY",
  },
  {
    slug: "consultancy",
    name: "Consultancy",
    price: "$2,000",
    priceLine: "$2,000 a month",
    line: `Up to ${AGENCY_SEATS} profiles, and a call with the founder every week.`,
    features: [
      "Everything in Agency",
      "A call with the founder every week",
      "We write the first set of themes with you",
      "A direct line when a client board needs a decision",
    ],
    cta: "Start for $2,000 a month",
    seats: AGENCY_SEATS,
    priceEnv: "STRIPE_PRICE_CONSULTANCY",
  },
];

export const DEFAULT_PLAN = PLANS[0];

/**
 * The landing hero's button, and only the hero's. It names the job rather than
 * the step, because the hero is where a visitor decides whether this replaces a
 * person. `Start for $100 a month` reads as a subscription to a tool, which
 * invites a comparison with a cheap generator instead of with a hire.
 *
 * The closing call to action and the three plan cards keep the short `cta`. By
 * then the reader has been through the pricing and wants the step, not the
 * pitch, and on a card the plan name above the button already says which job
 * is being bought.
 */
export const HERO_CTA = `Hire a social media manager for ${DEFAULT_PLAN.price} / month`;

/** Free days on every plan, before the first charge. Stated wherever a price is. */
export const TRIAL_DAYS = 7;

/** The one sentence that carries the trial. Same words on every surface. */
export const TRIAL_LINE = `${TRIAL_DAYS} days free, cancel any time.`;

/** The cookie the checkout route reads once Stripe is wired. */
export const PLAN_COOKIE = "gs_plan";

/** Anything we did not write ourselves falls back to the entry plan. */
export function planFromSlug(value: string | undefined | null): Plan {
  return PLANS.find((plan) => plan.slug === value) ?? DEFAULT_PLAN;
}

const BY_SLUG = Object.fromEntries(PLANS.map((plan) => [plan.slug, plan]));

export const PRICE_SOLO = BY_SLUG.pro.priceLine;
export const PRICE_AGENCY = BY_SLUG.agency.priceLine;
export const PRICE_CONSULTANCY = BY_SLUG.consultancy.priceLine;

/**
 * The plan column on `account` and the slug on this page are not spelled the
 * same. The column said `solo` before the plan was named Pro, and renaming a
 * live enum value so two spellings agree is a migration with nothing to show
 * for it. These two functions are the only place that difference exists, and
 * nothing else in the repo compares a plan column to a string.
 */
export type PlanColumn = "solo" | "agency" | "consultancy";

export function slugForColumn(value: PlanColumn): PlanSlug {
  return value === "solo" ? "pro" : value;
}

export function columnForSlug(slug: PlanSlug): PlanColumn {
  return slug === "pro" ? "solo" : slug;
}

/** The plan an account is on, named the way the page names it. */
export function planForColumn(value: PlanColumn): Plan {
  return planFromSlug(slugForColumn(value));
}

/**
 * The Stripe price this plan checks out at. Missing rather than throwing,
 * because a price id absent from the environment is a deployment that is not
 * finished, and the caller says so in a sentence instead of a stack trace.
 */
export function priceIdFor(slug: PlanSlug): string | null {
  return process.env[planFromSlug(slug).priceEnv] || null;
}

/**
 * Which plan a Stripe subscription is on, read from its price id. This is the
 * direction the webhook needs: Stripe says what the customer is paying for and
 * we decide what that means here, so a plan switched in the billing portal
 * lands on the account without a second source of truth.
 */
export function planForPriceId(priceId: string | null | undefined): Plan | null {
  if (!priceId) return null;
  return PLANS.find((plan) => priceIdFor(plan.slug) === priceId) ?? null;
}
