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
/**
 * The address on every footer. A role address, not a person's: the footer is
 * the first thing a stranger reads, and the operator's own name belongs in the
 * company register rather than on the page. Must forward to a human before
 * launch, same as CONTACT.
 */
export const SUPPORT = "hello@goodsocials.co";
export const LAST_UPDATED = "24 September 2026";

/** Seats on the agency and consultancy plans. The prices live in lib/plans.ts. */
export const AGENCY_SEATS = 10;

/** Hard cap from CLAUDE.md, counted in the database, stated in the terms. */
export const IMAGE_CAP_PER_MONTH = 200;
