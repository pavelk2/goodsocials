import { and, eq, sql } from "drizzle-orm";
import { getDb } from "@/db";
import { linkedinCallBudget } from "@/db/schema";
import { LINKEDIN_MEMBER_DAILY_LIMIT } from "./config";

/**
 * 150 requests per member per day. Near-daily posting needs one, so the
 * headroom is enormous and the limit is not there to ration the product. It is
 * there because an unattended cron with a bug is the one thing that can spend
 * a member's whole day of calls before anybody is awake, and a member who is
 * rate limited by LinkedIn gets a 429 on their next real action too.
 *
 * Claimed before the call for the same reason the image quota is: a check that
 * runs after the spend is a report.
 */

export function utcDay(now = new Date()): string {
  return now.toISOString().slice(0, 10);
}

export type Budget = {
  day: string;
  used: number;
  limit: number;
  remaining: number;
};

export async function readBudget(
  memberId: string,
  now = new Date(),
): Promise<Budget> {
  const day = utcDay(now);
  const [row] = await getDb()
    .select()
    .from(linkedinCallBudget)
    .where(
      and(
        eq(linkedinCallBudget.memberId, memberId),
        eq(linkedinCallBudget.day, day),
      ),
    )
    .limit(1);

  const used = row?.count ?? 0;
  return {
    day,
    used,
    limit: LINKEDIN_MEMBER_DAILY_LIMIT,
    remaining: Math.max(0, LINKEDIN_MEMBER_DAILY_LIMIT - used),
  };
}

/**
 * The insert and the increment are one statement, so two runs of the cron
 * overlapping cannot both pass the check. The WHERE on the update is what
 * refuses the 151st call, not a read followed by a write.
 *
 * A refused claim is not an error to retry. The day resets at midnight UTC.
 */
export async function claimCalls(
  memberId: string,
  count = 1,
  now = new Date(),
): Promise<{ ok: boolean; budget: Budget }> {
  const day = utcDay(now);

  const claimed = await getDb()
    .insert(linkedinCallBudget)
    .values({ memberId, day, count })
    .onConflictDoUpdate({
      target: [linkedinCallBudget.memberId, linkedinCallBudget.day],
      set: { count: sql`${linkedinCallBudget.count} + ${count}` },
      setWhere: sql`${linkedinCallBudget.count} <= ${LINKEDIN_MEMBER_DAILY_LIMIT - count}`,
    })
    .returning();

  const row = claimed[0];
  if (!row) return { ok: false, budget: await readBudget(memberId, now) };

  // The claim already returned the new count, so a successful call costs one
  // round trip rather than two. Only a refusal pays for a second read.
  return {
    ok: true,
    budget: {
      day,
      used: row.count,
      limit: LINKEDIN_MEMBER_DAILY_LIMIT,
      remaining: Math.max(0, LINKEDIN_MEMBER_DAILY_LIMIT - row.count),
    },
  };
}
