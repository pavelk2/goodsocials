import { cookies } from "next/headers";
import { asc, eq } from "drizzle-orm";
import { getDb } from "@/db";
import {
  account as accountTable,
  linkedinConnection,
  profile as profileTable,
} from "@/db/schema";

/**
 * Which LinkedIn profile the app is looking at right now.
 *
 * Agency mode is one login with up to twelve boards, so the signed in member
 * is the account owner and every profile under that account is a seat they
 * post as. Resolution is by account.owner_member_id, never by
 * profile.linkedin_member_id: a client whose profile an agency manages must
 * not be able to sign in and read the other eleven boards.
 *
 * A seat other than the owner's own has no login of its own, which is the
 * point. Its 60 day token is refreshed through the link flow in
 * app/api/linkedin/link, with the owner signed in the whole time.
 */

export const ACTIVE_PROFILE_COOKIE = "gs_profile";

export type Seat = {
  profile: typeof profileTable.$inferSelect;
  connection: typeof linkedinConnection.$inferSelect | null;
};

export type Access = {
  account: typeof accountTable.$inferSelect;
  seats: Seat[];
  /** Null only while the account has no profile at all, which is a broken sign in. */
  active: Seat | null;
  /** True while another profile could still be connected under this plan. */
  seatsLeft: number;
};

export async function loadAccess(memberId: string): Promise<Access | null> {
  const db = getDb();

  const [acct] = await db
    .select()
    .from(accountTable)
    .where(eq(accountTable.ownerMemberId, memberId))
    .limit(1);
  if (!acct) return null;

  const rows = await db
    .select({ profile: profileTable, connection: linkedinConnection })
    .from(profileTable)
    .leftJoin(
      linkedinConnection,
      eq(linkedinConnection.profileId, profileTable.id),
    )
    .where(eq(profileTable.accountId, acct.id))
    .orderBy(asc(profileTable.createdAt));

  const seats: Seat[] = rows.map((row) => ({
    profile: row.profile,
    connection: row.connection,
  }));

  return {
    account: acct,
    seats,
    active: pickActive(seats, acct.ownerMemberId, await readCookie()),
    seatsLeft: Math.max(0, acct.seatLimit - seats.length),
  };
}

/**
 * The cookie wins when it names a seat on this account, so a switch survives a
 * reload. Anything else falls back to the owner's own profile, which is the
 * one seat that always exists, so a stale cookie from a deleted profile or
 * from another account reads as no choice rather than as an error.
 */
function pickActive(
  seats: Seat[],
  ownerMemberId: string,
  chosen: string | null,
): Seat | null {
  if (seats.length === 0) return null;
  return (
    seats.find((s) => s.profile.id === chosen) ??
    seats.find((s) => s.profile.linkedinMemberId === ownerMemberId) ??
    seats[0]
  );
}

async function readCookie(): Promise<string | null> {
  const store = await cookies();
  return store.get(ACTIVE_PROFILE_COOKIE)?.value ?? null;
}

/** Server functions and route handlers only. Rendering cannot set a cookie. */
export async function setActiveProfile(profileId: string): Promise<void> {
  const store = await cookies();
  store.set(ACTIVE_PROFILE_COOKIE, profileId, {
    httpOnly: true,
    sameSite: "lax",
    secure: true,
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
  });
}

/**
 * What every card action needs: who is acting, which account they own, and
 * which board they are looking at. One call so no caller invents its own
 * authorization rule.
 */
export type Actor = {
  memberId: string;
  accountId: string;
  profileId: string;
};

export async function resolveActor(memberId: string): Promise<Actor | null> {
  const access = await loadAccess(memberId);
  if (!access?.active) return null;
  return {
    memberId,
    accountId: access.account.id,
    profileId: access.active.profile.id,
  };
}

/** The name on a seat, with the member id as the honest fallback. */
export function seatName(seat: Seat): string {
  return seat.profile.name ?? seat.profile.linkedinMemberId;
}
