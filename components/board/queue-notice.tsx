import Link from "next/link";
import { daysUntilExpiry } from "@/lib/token-expiry";

/**
 * The one screen where a stopped queue has to be readable. The cron runs
 * unattended, so the only alternative to this line is the customer finding out
 * from the client whose feed went quiet.
 *
 * Two states, one line each, and both name what to do. A reconnect is a link
 * rather than an explanation, because the fix is thirty seconds long and
 * nobody should have to go looking for it.
 */
export function QueueNotice({
  connection,
  queueError,
  ownProfile,
}: {
  connection: { status: "active" | "expiring" | "dead"; expiresAt: Date } | null;
  queueError: string | null;
  /**
   * True when this board's profile is the signed in member's own. On any other
   * seat, signing in again re-authorizes the agency rather than the client, so
   * the banner would never come down. That seat renews through the link flow.
   */
  ownProfile: boolean;
}) {
  const line = noticeFor(connection, queueError, ownProfile);
  if (!line) return null;

  return (
    <div
      role="status"
      className="mb-6 flex flex-wrap items-baseline gap-x-3 gap-y-1 rounded-[14px] border border-hairline bg-surface px-4 py-3 text-[14px]"
    >
      {/* The dot carries the urgency so the sentence does not have to shout. */}
      <span aria-hidden className="size-[7px] shrink-0 rounded-full bg-accent" />
      <p className="text-ink">{line.text}</p>
      {line.action ? (
        <Link href={line.action.href} className="underline underline-offset-2">
          {line.action.label}
        </Link>
      ) : null}
    </div>
  );
}

type Notice = { text: string; action?: { href: string; label: string } };

function noticeFor(
  connection: { status: "active" | "expiring" | "dead"; expiresAt: Date } | null,
  queueError: string | null,
  ownProfile: boolean,
): Notice | null {
  // Our own sign in page, not the Auth.js route. It names the four scopes and
  // says what we never do, which is the page that got the domain unflagged.
  // A seat that is not the member's own has no sign in of its own, so it
  // renews through the link flow with the owner signed in the whole time.
  const reconnect = ownProfile
    ? { href: "/signin", label: "Sign in again" }
    : { href: "/api/linkedin/link", label: "Reconnect this profile" };

  if (!connection) {
    return { text: "This profile has no LinkedIn connection, so nothing can publish.", action: reconnect };
  }

  if (connection.status === "dead") {
    return {
      text: "The LinkedIn connection expired and the queue is paused. Reconnecting publishes everything that waited.",
      action: reconnect,
    };
  }

  if (connection.status === "expiring") {
    const days = daysUntilExpiry(connection.expiresAt);
    return {
      text: `LinkedIn ends this connection in ${days} ${days === 1 ? "day" : "days"}. Posting pauses when it does.`,
      action: reconnect,
    };
  }

  // A live connection and a stuck post is a different problem, and the reason
  // the cron wrote down is more use than anything this component could invent.
  if (queueError) return { text: queueError };

  return null;
}
