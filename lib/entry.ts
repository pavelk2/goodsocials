import { auth } from "@/auth";
import { loadBoard, type BoardView } from "@/lib/board";
import { ensureBoard } from "@/lib/onboarding";
import { loadAccess, type Access, type Seat } from "@/lib/profiles";

/**
 * Where a request belongs, answered once.
 *
 * /board, /onboarding and /signin each used to answer this for themselves, in
 * the same four steps, and any disagreement between two of them is an infinite
 * redirect with nothing on screen to say why. Worse, three different failures
 * all bounced to /signin, where LinkedIn re-consents in a blink and sends the
 * member straight back into the same bounce. One resolver, one answer, and the
 * states sign in cannot mend stop on a page that names them.
 */
export type EntryBlock = "signed-out" | "no-account" | "no-seat" | "no-board";

export type Entry =
  /** No session cookie, or one issued before memberId existed. */
  | { at: "signed-out" }
  /** Signed in, but the sign in callback never wrote the account. */
  | { at: "no-account" }
  /** An account whose every profile belongs to somebody else's agency. */
  | { at: "no-seat"; access: Access }
  /** A seat whose board row is missing and could not be rebuilt. */
  | { at: "no-board"; access: Access; seat: Seat }
  | { at: "onboarding"; access: Access; seat: Seat; view: BoardView }
  | { at: "board"; access: Access; seat: Seat; view: BoardView };

export async function resolveEntry(): Promise<Entry> {
  const session = await auth();
  if (!session?.memberId) return { at: "signed-out" };

  const access = await loadAccess(session.memberId);
  if (!access) return blocked({ at: "no-account" }, session.memberId);
  if (!access.active) return blocked({ at: "no-seat", access }, session.memberId);

  const seat = access.active;

  // A seat with no board row is the one broken state we can mend on our own:
  // the rows are ours and LinkedIn is not involved. One insert beats a bounce
  // the member has no way to act on.
  let view = await loadBoard(seat.profile.id);
  if (!view) {
    await ensureBoard(seat.profile.id);
    view = await loadBoard(seat.profile.id);
  }
  if (!view) return blocked({ at: "no-board", access, seat }, session.memberId);

  return { at: view.needsOnboarding ? "onboarding" : "board", access, seat, view };
}

/** The href every blocked entry bounces to, carrying what blocked it. */
export function signInHref(block: EntryBlock): string {
  return `/signin?stuck=${block}`;
}

/**
 * The line the sign in page shows instead of pretending the visitor is a
 * stranger. Signed out is absent on purpose: that one is not a failure.
 */
export const BLOCK_LINE: Record<Exclude<EntryBlock, "signed-out">, string> = {
  "no-account":
    "You are signed in, but there is no GoodSocials account on this LinkedIn profile. Connecting again finishes setting it up.",
  "no-seat":
    "You are signed in, but every profile on this account is managed by somebody else. Settings says which.",
  "no-board":
    "You are signed in, but your board could not be opened. Connecting again rebuilds it.",
};

function blocked<T extends Entry>(entry: T, memberId: string): T {
  // The member sees a sentence. The log gets the member id, so a support
  // question can be answered without asking them to reproduce it.
  console.warn(`[entry] ${entry.at} for member ${memberId}`);
  return entry;
}
