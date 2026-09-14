/**
 * token_expiry is not a table. It is derived from linkedin_connection.
 * expires_at, and this is the one place that derives it, so the settings
 * screen, the day 55 banner and the Day 4 cron cannot disagree about what
 * "expiring" means.
 *
 * The failure this guards against is silent: a dead token means weeks of
 * scheduled posts never publish and the user hears about it from their client.
 */

const DAY_MS = 24 * 60 * 60 * 1000;

/** Day 50 of 60 sends the email. */
export const WARN_AFTER_DAYS_LEFT = 10;
/** Day 55 of 60 puts a banner on the board. */
export const BANNER_AFTER_DAYS_LEFT = 5;

export function daysUntilExpiry(expiresAt: Date, now = new Date()): number {
  return Math.max(0, Math.ceil((expiresAt.getTime() - now.getTime()) / DAY_MS));
}

export function expiryLine(expiresAt: Date | null, now = new Date()): string {
  if (!expiresAt) return "Not connected. Sign in again to reconnect.";

  const left = daysUntilExpiry(expiresAt, now);
  if (left === 0) return "Expired. Sign in again to keep posting.";
  if (left <= BANNER_AFTER_DAYS_LEFT) {
    return `${left} days left. Sign in again this week or posting pauses.`;
  }
  return `${left} days left, then you sign in again`;
}
