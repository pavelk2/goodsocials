/**
 * Every constant LinkedIn needs from us. Nothing else in the repo hardcodes
 * a LinkedIn URL, scope, or header. See CLAUDE.md for the verified constraints.
 */

/**
 * Pinned, never computed from the current date. A version that rolls over on
 * the first of the month changes the API contract without a deploy, which is a
 * failure nobody is watching for. Versions stay valid about 12 months, so this
 * is tracked by the same expiry monitor as the access token.
 */
export const LINKEDIN_VERSION = process.env.LINKEDIN_API_VERSION ?? "202606";

export const LINKEDIN_OAUTH_AUTHORIZE =
  "https://www.linkedin.com/oauth/v2/authorization";
export const LINKEDIN_OAUTH_TOKEN =
  "https://www.linkedin.com/oauth/v2/accessToken";
export const LINKEDIN_API_BASE = "https://api.linkedin.com";

/**
 * All four in one authorization request so the member consents once.
 * openid, profile, email come from Sign In with LinkedIn using OpenID Connect.
 * w_member_social comes from Share on LinkedIn.
 *
 * Requesting a scope the app has not been granted fails the whole request with
 * unauthorized_scope_error. It does not degrade quietly. Test unknown scopes
 * in an isolated authorization attempt.
 */
export const LINKEDIN_SCOPES = [
  "openid",
  "profile",
  "email",
  "w_member_social",
] as const;

/** 150 requests per member per day, 100,000 per app per day, reset daily UTC. */
export const LINKEDIN_MEMBER_DAILY_LIMIT = 150;
export const LINKEDIN_APP_DAILY_LIMIT = 100_000;

/**
 * Standard apps get a 60-day token and no refresh token. We treat the token as
 * a perishable asset from the moment it is issued.
 */
export const TOKEN_LIFETIME_DAYS = 60;
export const TOKEN_WARN_EMAIL_DAY = 50;
export const TOKEN_WARN_BANNER_DAY = 55;

export function requiredEnv(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`Missing environment variable: ${name}`);
  return value;
}
