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
  const sealed = sealToken(input.accessToken);
  const expiresAt = new Date(input.expiresAt * 1000);

  const [acct] = await db
    .insert(accountTable)
    .values({ ownerMemberId: input.memberId, email: input.email ?? null })
    .onConflictDoUpdate({
      target: accountTable.ownerMemberId,
      set: { email: input.email ?? null },
    })
    .returning();

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
