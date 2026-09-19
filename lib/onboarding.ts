import { eq } from "drizzle-orm";
import { getDb } from "@/db";
import {
  account as accountTable,
  profile as profileTable,
  linkedinConnection,
  board as boardTable,
  brandPrinciple,
} from "@/db/schema";
import { sealToken } from "@/lib/linkedin/crypto";
import { personUrn } from "@/lib/linkedin/posts";

/**
 * Everything a member needs to exist before they see a board. Idempotent, so a
 * second sign in refreshes the token instead of creating a second account.
 *
 * Day 2 replaces these three placeholders with principles generated from the
 * member's website. Until then they are honest about being empty rather than
 * inventing a voice nobody chose.
 */
const PLACEHOLDER_PRINCIPLES = [
  {
    kind: "voice" as const,
    text: "Not set yet. Paste your website and this fills in.",
  },
  {
    kind: "visual" as const,
    text: "Not set yet. Paste your website and this fills in.",
  },
  {
    kind: "format" as const,
    text: "Not set yet. Paste your website and this fills in.",
  },
];

export type OnboardInput = {
  memberId: string;
  name?: string | null;
  email?: string | null;
  avatarUrl?: string | null;
  accessToken: string;
  /** Unix seconds from the LinkedIn token response. */
  expiresAt: number;
  scopes: string;
};

export async function onboardMember(input: OnboardInput): Promise<void> {
  const db = getDb();

  const [acct] = await db
    .insert(accountTable)
    .values({ ownerMemberId: input.memberId, email: input.email ?? null })
    .onConflictDoUpdate({
      target: accountTable.ownerMemberId,
      set: { email: input.email ?? null },
    })
    .returning();

  // A member whose profile an agency already connected keeps that seat. The
  // account created above stays empty, and settings says so rather than
  // stealing the profile back and taking their client's board with it.
  const [claimed] = await db
    .select({ accountId: profileTable.accountId })
    .from(profileTable)
    .where(eq(profileTable.linkedinMemberId, input.memberId))
    .limit(1);

  await onboardProfile({
    accountId: claimed?.accountId ?? acct.id,
    memberId: input.memberId,
    name: input.name,
    email: input.email,
    avatarUrl: input.avatarUrl,
    accessToken: input.accessToken,
    expiresAt: input.expiresAt,
    scopes: input.scopes,
  });
}

/**
 * One profile, its connection, its board and its three placeholder principles.
 * Idempotent, so a re-authorization refreshes the token instead of creating a
 * second seat. Shared by sign in and by the link flow, which is what keeps a
 * seat added in settings identical to the one sign in creates.
 */
async function onboardProfile(
  input: OnboardInput & { accountId: string },
): Promise<void> {
  const db = getDb();
  const sealed = sealToken(input.accessToken);
  const expiresAt = new Date(input.expiresAt * 1000);
  const acct = { id: input.accountId };

  const [prof] = await db
    .insert(profileTable)
    .values({
      accountId: acct.id,
      linkedinMemberId: input.memberId,
      name: input.name ?? null,
      email: input.email ?? null,
      avatarUrl: input.avatarUrl ?? null,
    })
    .onConflictDoUpdate({
      target: profileTable.linkedinMemberId,
      set: {
        name: input.name ?? null,
        email: input.email ?? null,
        avatarUrl: input.avatarUrl ?? null,
      },
    })
    .returning();

  // A re-authorization lands here on day 60. Same row, fresh token, status back
  // to active, and the day 50 email allowed to fire again next cycle.
  await db
    .insert(linkedinConnection)
    .values({
      profileId: prof.id,
      accessTokenCiphertext: sealed.ciphertext,
      accessTokenIv: sealed.iv,
      accessTokenTag: sealed.tag,
      memberUrn: personUrn(input.memberId),
      scopes: input.scopes,
      expiresAt,
      status: "active",
    })
    .onConflictDoUpdate({
      target: linkedinConnection.profileId,
      set: {
        accessTokenCiphertext: sealed.ciphertext,
        accessTokenIv: sealed.iv,
        accessTokenTag: sealed.tag,
        scopes: input.scopes,
        connectedAt: new Date(),
        expiresAt,
        status: "active",
        expiryEmailSentAt: null,
      },
    });

  await db
    .insert(boardTable)
    .values({ profileId: prof.id })
    .onConflictDoNothing({ target: boardTable.profileId });

  await db
    .insert(brandPrinciple)
    .values(PLACEHOLDER_PRINCIPLES.map((p) => ({ profileId: prof.id, ...p })))
    .onConflictDoNothing();
}

export async function profileForMember(memberId: string) {
  const [row] = await getDb()
    .select()
    .from(profileTable)
    .where(eq(profileTable.linkedinMemberId, memberId))
    .limit(1);
  return row ?? null;
}

export type AttachResult =
  | { ok: true; profileId: string; name: string; reconnected: boolean }
  | { ok: false; error: string };

/**
 * A second, third or twelfth LinkedIn profile under an account that already
 * exists. Sign in creates an account; this adds a seat to one, with the owner
 * signed in the whole time, so the agency keeps one login and the client never
 * gets a way into the rest of them.
 *
 * It is also how a seat is renewed. LinkedIn tokens last 60 days with no
 * refresh token, and a seat that is not the owner's own has no sign in of its
 * own to renew through, so re-authorizing the same member lands here and
 * refreshes the row it already has.
 */
export async function attachProfile(input: {
  accountId: string;
  seatLimit: number;
  memberId: string;
  name?: string | null;
  email?: string | null;
  avatarUrl?: string | null;
  accessToken: string;
  /** Unix seconds from the LinkedIn token response. */
  expiresAt: number;
  scopes: string;
}): Promise<AttachResult> {
  const db = getDb();

  const [existing] = await db
    .select()
    .from(profileTable)
    .where(eq(profileTable.linkedinMemberId, input.memberId))
    .limit(1);

  if (existing && existing.accountId !== input.accountId) {
    return {
      ok: false,
      error: "That LinkedIn profile is connected to a different GoodSocials account.",
    };
  }

  if (!existing) {
    const seats = await db
      .select({ id: profileTable.id })
      .from(profileTable)
      .where(eq(profileTable.accountId, input.accountId));
    if (seats.length >= input.seatLimit) {
      return {
        ok: false,
        error: `This plan covers ${input.seatLimit} profile${
          input.seatLimit === 1 ? "" : "s"
        }.`,
      };
    }
  }

  await onboardProfile({
    accountId: input.accountId,
    memberId: input.memberId,
    name: input.name,
    email: input.email,
    avatarUrl: input.avatarUrl,
    accessToken: input.accessToken,
    expiresAt: input.expiresAt,
    scopes: input.scopes,
  });

  const [prof] = await db
    .select()
    .from(profileTable)
    .where(eq(profileTable.linkedinMemberId, input.memberId))
    .limit(1);

  return {
    ok: true,
    profileId: prof.id,
    name: prof.name ?? prof.linkedinMemberId,
    reconnected: Boolean(existing),
  };
}
