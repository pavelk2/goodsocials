import { AGENCY_SEATS } from "@/lib/legal";

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
  /** What you get, one line. */
  line: string;
  /** Button label. The price is in the button, always. */
  cta: string;
};

export const PLANS: Plan[] = [
  {
    slug: "pro",
    name: "Pro",
    price: "$100",
    priceLine: "$100 a month",
    line: "One LinkedIn profile.",
    cta: "Start for $100 a month",
  },
  {
    slug: "agency",
    name: "Agency",
    price: "$1,000",
    priceLine: "$1,000 a month",
    line: `Up to ${AGENCY_SEATS} profiles, one board per client.`,
    cta: "Start for $1,000 a month",
  },
  {
    slug: "consultancy",
    name: "Consultancy",
    price: "$2,000",
    priceLine: "$2,000 a month",
    line: `Up to ${AGENCY_SEATS} profiles, and a call with the founder every week.`,
    cta: "Start for $2,000 a month",
  },
];

export const DEFAULT_PLAN = PLANS[0];

/**
 * The landing hero's button. It names the job, not the step, because the hero
 * is where a visitor decides whether this replaces a person. The three pricing
 * cards keep the short `cta`, where the plan name above the button already
 * says which job is being bought.
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
