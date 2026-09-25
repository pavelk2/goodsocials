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
  /**
   * The Stripe price this plan checks out at, written here rather than read
   * from the environment. Three ids in three deployments was three things to
   * keep in step for no benefit: a price id is not a secret, and it changes
   * about as often as the price on the page does.
   *
   * These are live mode. Rehearsing a checkout in test mode means swapping
   * them for the test ids, which is a one line edit and a deploy rather than
   * an environment variable.
   */
  priceId: string;
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
    priceId: "price_1UIQaFBxtKkTb0BvoWnfIXFJ",
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
    priceId: "price_1UIQaLBxtKkTb0Bv42qzgiWK",
  },
  {
    slug: "consultancy",
    name: "Consultancy",
    price: "$2,000",
    priceLine: "$2,000 a month",
    line: "Pasha, the founder, sets everything up with you.",
    features: [
      `Everything in Agency, up to ${AGENCY_SEATS} profiles`,
      "Pasha sets up your themes, principles and sources with you",
      "A call with Pasha every week",
      "A direct line when a board needs a decision",
    ],
    cta: "Start for $2,000 a month",
    seats: AGENCY_SEATS,
    priceId: "price_1UIQaNBxtKkTb0BvcAbdUIhO",
  },
];

export const DEFAULT_PLAN = PLANS[0];

/**
 * The landing page's first step, on the hero, the section on what it writes,
 * and the close. Signing in with LinkedIn and pasting a URL puts seven posts on
 * a board before any card is asked for, so the step a stranger takes first is
 * seeing their first post, and the button says that. The price sits beside it
 * as the secondary.
 */
export const HERO_CTA = "See your first post for free";

/** The hero's second button. The price and what it buys, in the button. */
export const HIRE_CTA = `Hire a social media manager for ${DEFAULT_PLAN.price}`;

/** Free days on every plan, before the first charge. Stated wherever a price is. */
export const TRIAL_DAYS = 7;

/** The one sentence that carries the trial. Same words on every surface. */
export const TRIAL_LINE = `${TRIAL_DAYS} days free, cancel any time.`;

/**
 * The plan cards' button on the landing page. The price sits above it in 46px,
 * so the button says the step instead. `cta` keeps the price for the surfaces
 * where the button is the only place it appears.
 */
export const TRIAL_CTA = `Start a ${TRIAL_DAYS} day trial`;

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

/** The Stripe price this plan checks out at. */
export function priceIdFor(slug: PlanSlug): string {
  return planFromSlug(slug).priceId;
}

/**
 * Which plan a Stripe subscription is on, read from its price id. This is the
 * direction the webhook needs: Stripe says what the customer is paying for and
 * we decide what that means here, so a plan switched in the billing portal
 * lands on the account without a second source of truth.
 */
export function planForPriceId(priceId: string | null | undefined): Plan | null {
  if (!priceId) return null;
  return PLANS.find((plan) => plan.priceId === priceId) ?? null;
}

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
