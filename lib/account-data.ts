import { del } from "@vercel/blob";
import { eq, inArray } from "drizzle-orm";
import { getDb } from "@/db";
import {
  account as accountTable,
  board as boardTable,
  brandPrinciple,
  card as cardTable,
  cardAction,
  fact as factTable,
  imageQuota,
  linkedinCallBudget,
  linkedinConnection,
  pastPost,
  profile as profileTable,
  scheduledPost,
  source as sourceTable,
  theme as themeTable,
} from "@/db/schema";
import { endBilling, type Account } from "@/lib/billing";

/**
 * The two things a member can do with everything we hold about them: take a
 * copy, or have it gone.
 *
 * Both work on the account, not on the profile being looked at. An agency owner
 * who asks for their data gets every client board under the account, because
 * the account is what they signed up for and what they would be deleting.
 */

/**
 * Everything stored under one account, as one JSON document.
 *
 * Secrets are left out by column, not by redaction after the fact: the select
 * lists below never name a ciphertext, so a sealed LinkedIn token or a source
 * credential cannot reach this file even if a column is added later. The
 * integrations screen already refuses to show what a source was read with, and
 * a download is the same screen saved to disk.
 */
export async function exportAccount(account: Account) {
  const db = getDb();

  const profiles = await db
    .select()
    .from(profileTable)
    .where(eq(profileTable.accountId, account.id));
  const profileIds = profiles.map((p) => p.id);
  const none = profileIds.length === 0;

  const [connections, boards, principles, themes, quotas, past, sources, facts] =
    none
      ? [[], [], [], [], [], [], [], []]
      : await Promise.all([
          db
            .select({
              profileId: linkedinConnection.profileId,
              memberUrn: linkedinConnection.memberUrn,
              scopes: linkedinConnection.scopes,
              connectedAt: linkedinConnection.connectedAt,
              expiresAt: linkedinConnection.expiresAt,
              status: linkedinConnection.status,
            })
            .from(linkedinConnection)
            .where(inArray(linkedinConnection.profileId, profileIds)),
          db
            .select()
            .from(boardTable)
            .where(inArray(boardTable.profileId, profileIds)),
          db
            .select()
            .from(brandPrinciple)
            .where(inArray(brandPrinciple.profileId, profileIds)),
          db
            .select()
            .from(themeTable)
            .where(inArray(themeTable.profileId, profileIds)),
          db
            .select()
            .from(imageQuota)
            .where(inArray(imageQuota.profileId, profileIds)),
          db
            .select()
            .from(pastPost)
            .where(inArray(pastPost.profileId, profileIds)),
          db
            .select({
              id: sourceTable.id,
              profileId: sourceTable.profileId,
              kind: sourceTable.kind,
              handle: sourceTable.handle,
              host: sourceTable.host,
              status: sourceTable.status,
              lastSyncedAt: sourceTable.lastSyncedAt,
              lastError: sourceTable.lastError,
              createdAt: sourceTable.createdAt,
            })
            .from(sourceTable)
            .where(inArray(sourceTable.profileId, profileIds)),
          db
            .select()
            .from(factTable)
            .where(inArray(factTable.profileId, profileIds)),
        ]);

  const boardIds = boards.map((b) => b.id);
  const cards =
    boardIds.length === 0
      ? []
      : await db
          .select()
          .from(cardTable)
          .where(inArray(cardTable.boardId, boardIds));

  const cardIds = cards.map((c) => c.id);
  const [actions, scheduled] =
    cardIds.length === 0
      ? [[], []]
      : await Promise.all([
          db
            .select()
            .from(cardAction)
            .where(inArray(cardAction.cardId, cardIds)),
          db
            .select()
            .from(scheduledPost)
            .where(inArray(scheduledPost.cardId, cardIds)),
        ]);

  return {
    exportedAt: new Date().toISOString(),
    account: {
      id: account.id,
      email: account.email,
      plan: account.plan,
      seatLimit: account.seatLimit,
      subscriptionStatus: account.subscriptionStatus,
      currentPeriodEnd: account.currentPeriodEnd,
      trialEndsAt: account.trialEndsAt,
      cancelAtPeriodEnd: account.cancelAtPeriodEnd,
      createdAt: account.createdAt,
    },
    profiles: profiles.map((p) => ({
      ...p,
      linkedinConnection: connections.find((c) => c.profileId === p.id) ?? null,
      board: boards.find((b) => b.profileId === p.id) ?? null,
      brandPrinciples: principles.filter((r) => r.profileId === p.id),
      themes: themes.filter((r) => r.profileId === p.id),
      imageQuota: quotas.filter((r) => r.profileId === p.id),
      sources: sources.filter((r) => r.profileId === p.id),
      facts: facts.filter((r) => r.profileId === p.id),
      pastPosts: past.filter((r) => r.profileId === p.id),
    })),
    cards: cards.map((c) => ({
      ...c,
      actions: actions.filter((a) => a.cardId === c.id),
      scheduledPost: scheduled.find((s) => s.cardId === c.id) ?? null,
    })),
  };
}

export type DeleteResult = { ok: true } | { ok: false; error: string };

/**
 * Closes the account and removes what it holds.
 *
 * Billing goes first and a failure there stops everything. Deleting the rows
 * and then failing to cancel would leave Stripe charging a card every month for
 * an account that no longer exists, with nothing on our side to find it by.
 *
 * Then one delete on `account`. Every table under it cascades from there:
 * profiles, connections and their sealed tokens, boards, cards, actions, the
 * publish queue, principles, themes, quotas, past posts, sources and facts. One
 * statement is one transaction on the Neon HTTP driver, so there is no half
 * deleted account for the cron to trip over.
 *
 * Images last, and best effort. They sit in Vercel Blob rather than Postgres,
 * so no cascade reaches them, and a Blob outage is not a reason to keep
 * somebody's account open. A failure is logged with the urls so it can be
 * finished by hand inside the 30 days the privacy policy promises.
 */
export async function deleteAccount(account: Account): Promise<DeleteResult> {
  const billing = await endBilling(account);
  if (!billing.ok) return { ok: false, error: billing.error };

  const db = getDb();
  const profiles = await db
    .select({ id: profileTable.id, memberId: profileTable.linkedinMemberId })
    .from(profileTable)
    .where(eq(profileTable.accountId, account.id));

  const images =
    profiles.length === 0
      ? []
      : await db
          .select({ url: cardTable.imageUrl })
          .from(cardTable)
          .innerJoin(boardTable, eq(boardTable.id, cardTable.boardId))
          .where(
            inArray(
              boardTable.profileId,
              profiles.map((p) => p.id),
            ),
          );

  await db.delete(accountTable).where(eq(accountTable.id, account.id));

  // Keyed by member id with no foreign key, so the cascade does not reach it.
  // It is a count, but it is a count of what one named person did.
  const members = [account.ownerMemberId, ...profiles.map((p) => p.memberId)];
  await db
    .delete(linkedinCallBudget)
    .where(inArray(linkedinCallBudget.memberId, members));

  const urls = images
    .map((row) => row.url)
    .filter((url): url is string => Boolean(url && isBlobUrl(url)));
  if (urls.length > 0) {
    try {
      await del(urls);
    } catch (cause) {
      console.error(
        `[account] deleted ${account.id} but could not remove ${urls.length} images:`,
        cause,
        urls,
      );
    }
  }

  console.log(
    JSON.stringify({
      event: "account_deleted",
      account_id: account.id,
      profiles: profiles.length,
      images: urls.length,
      subscription_cancelled: billing.value.cancelled,
    }),
  );
  return { ok: true };
}

/** Only our own store. A card could hold any url, and del() would reject it. */
function isBlobUrl(url: string): boolean {
  try {
    return new URL(url).hostname.endsWith(".blob.vercel-storage.com");
  } catch {
    return false;
  }
}
