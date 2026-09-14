/**
 * The facts both legal pages state, in one place so they cannot drift apart.
 *
 * LinkedIn asks for a privacy policy URL and a terms of use URL when it
 * verifies the app, and a reviewer reads both. Change these three before
 * submitting: OPERATOR needs the registered legal name and KvK number, and
 * CONTACT has to deliver to a human, because that is where a reviewer writes.
 */
export const OPERATOR = "GoodSocials, operated from Amsterdam, Netherlands";
export const CONTACT = "privacy@goodsocials.co";
export const LAST_UPDATED = "14 September 2026";

/** The prices. Stated on the landing page and again in the terms plan rows. */
export const PRICE_SOLO = "100 USD a month";
export const PRICE_AGENCY = "1000 USD a month";
export const PRICE_CONSULTANT = "2000 USD a month";
export const AGENCY_SEATS = 12;

/**
 * The three plans, in one place so the landing page and the terms cannot
 * disagree about what a person is buying. `amount` and `period` are split
 * because the landing page sets the number large and the period small.
 */
export const PLANS = [
  {
    name: "Pro",
    amount: "100 USD",
    period: "a month",
    price: PRICE_SOLO,
    terms: "one LinkedIn profile",
    summary: "One LinkedIn profile. The board, the queue, and the schedule.",
  },
  {
    name: "Agency",
    amount: "1000 USD",
    period: "a month",
    price: PRICE_AGENCY,
    terms: `up to ${AGENCY_SEATS} LinkedIn profiles`,
    summary: `Up to ${AGENCY_SEATS} profiles under one login. A board, a voice, and a queue for each client.`,
  },
  {
    name: "Consultant",
    amount: "2000 USD",
    period: "a month",
    price: PRICE_CONSULTANT,
    terms: `up to ${AGENCY_SEATS} profiles, and one call a month with the founder`,
    summary:
      "Everything in Agency, and one call a month with Pavel, who builds it.",
  },
];

/** Hard cap from CLAUDE.md, counted in the database, stated in the terms. */
export const IMAGE_CAP_PER_MONTH = 200;
