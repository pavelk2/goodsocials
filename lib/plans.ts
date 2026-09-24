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

/** Where every landing page button points once the reader has a session. */
export const BOARD_HREF = "/board";

/**
 * What the landing page's two big buttons say once the reader has a session.
 *
 * The same label on both, because signed in they do the same thing: the plan
 * is picked, the board exists, and /signin sends a member who already has a
 * session straight to it anyway. A button that quotes a price and lands on a
 * board is a lie the reader catches on the first click, and the landing page
 * is the one surface a returning member arrives at by accident.
 */
export const SIGNED_IN_CTA = "Open your board";

/** The href a plan's button carries, which is the board once there is one. */
export function planHref(slug: PlanSlug, signedIn: boolean): string {
  return signedIn ? BOARD_HREF : `/signin?plan=${slug}`;
}
