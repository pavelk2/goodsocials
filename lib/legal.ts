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

/** The prices from the offer. Stated on the landing page and the terms page. */
export const PRICE_SOLO = "100 USD a month";
export const PRICE_AGENCY = "1000 USD a month";
export const PRICE_CONSULTANCY = "2000 USD a month";
export const AGENCY_SEATS = 10;

/** Hard cap from CLAUDE.md, counted in the database, stated in the terms. */
export const IMAGE_CAP_PER_MONTH = 200;
