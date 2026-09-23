import { desc, eq, sql } from "drizzle-orm";
import { getDb } from "@/db";
import { pastPost, PAST_POST_LIMIT } from "@/db/schema";
import { sourceKey, type PastPostInput } from "@/lib/history";

/**
 * The stored side of lib/history.ts. Split from it because the parser runs in
 * the browser and nothing that imports the database can.
 */

export type PastPost = typeof pastPost.$inferSelect;

/** Newest first, capped. The calendar indexes these by day. */
export async function readPastPosts(profileId: string): Promise<PastPost[]> {
  return getDb()
    .select()
    .from(pastPost)
    .where(eq(pastPost.profileId, profileId))
    .orderBy(desc(pastPost.postedAt))
    .limit(PAST_POST_LIMIT);
}

/** What settings says about the import, in the numbers a user recognises. */
export async function summarisePastPosts(profileId: string): Promise<{
  count: number;
  newest: Date | null;
  oldest: Date | null;
}> {
  const [row] = await getDb()
    .select({
      count: sql<number>`count(*)::int`,
      newest: sql<Date | null>`max(${pastPost.postedAt})`,
      oldest: sql<Date | null>`min(${pastPost.postedAt})`,
    })
    .from(pastPost)
    .where(eq(pastPost.profileId, profileId));

  return {
    count: row?.count ?? 0,
    newest: row?.newest ? new Date(row.newest) : null,
    oldest: row?.oldest ? new Date(row.oldest) : null,
  };
}

/**
 * Adds what is not already there. Importing the same archive twice, which is
 * what a user does six months later to pick up the posts since, adds only the
 * posts since.
 */
export async function savePastPosts(
  profileId: string,
  rows: PastPostInput[],
): Promise<{ added: number }> {
  if (rows.length === 0) return { added: 0 };

  const written = await getDb()
    .insert(pastPost)
    .values(
      rows.map((row) => ({
        profileId,
        postedAt: new Date(row.postedAt),
        text: row.text,
        url: row.url,
        sourceKey: sourceKey(row),
      })),
    )
    .onConflictDoNothing({
      target: [pastPost.profileId, pastPost.sourceKey],
    })
    .returning({ id: pastPost.id });

  return { added: written.length };
}

/**
 * Keeps the newest PAST_POST_LIMIT and drops the rest. Run after an import
 * rather than inside it: the cap is about what this profile stores, not about
 * which file a user happened to upload.
 */
export async function trimPastPosts(profileId: string): Promise<void> {
  await getDb().execute(sql`
    delete from ${pastPost}
    where ${pastPost.profileId} = ${profileId}
      and ${pastPost.id} not in (
        select ${pastPost.id} from ${pastPost}
        where ${pastPost.profileId} = ${profileId}
        order by ${pastPost.postedAt} desc
        limit ${PAST_POST_LIMIT}
      )
  `);
}

export async function clearPastPosts(profileId: string): Promise<void> {
  await getDb().delete(pastPost).where(eq(pastPost.profileId, profileId));
}
