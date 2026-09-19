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

/**
 * The one function that decides what a connection's status should be, so the
 * banner, the settings screen and the publish cron cannot disagree. The cron
 * is what writes the value, because it is the only thing that runs whether or
 * not anybody opens the board: a token that dies on a Saturday must be dead in
 * the table before Monday's queue tries to use it.
 */
export function statusFor(
  expiresAt: Date,
  now = new Date(),
): "active" | "expiring" | "dead" {
  const left = daysUntilExpiry(expiresAt, now);
  if (left === 0) return "dead";
  if (left <= BANNER_AFTER_DAYS_LEFT) return "expiring";
  return "active";
}

/**
 * What a connection is doing, for a screen rather than for the cron. The stored
 * status wins over the clock, because Day 4 decided a token LinkedIn has
 * already refused is dead whatever the calendar says. A row reading "38 days
 * left" next to a queue the cron has paused is exactly the silent failure this
 * file exists to prevent.
 */
export function connectionLine(
  connection: { status: "active" | "expiring" | "dead"; expiresAt: Date } | null,
  now = new Date(),
): string {
  if (!connection) return "Not connected. Reconnect to start posting.";
  if (connection.status === "dead") return "Expired. Reconnect to keep posting.";
  return expiryLine(connection.expiresAt, now);
}

/** True while a connection needs a person before the queue stops. */
export function needsReconnect(
  connection: { status: "active" | "expiring" | "dead"; expiresAt: Date } | null,
  now = new Date(),
): boolean {
  if (!connection) return true;
  if (connection.status !== "active") return true;
  return daysUntilExpiry(connection.expiresAt, now) <= BANNER_AFTER_DAYS_LEFT;
}
