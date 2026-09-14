import { and, desc, eq, isNull } from "drizzle-orm";
import { getDb } from "@/db";
import { scheduledPost } from "@/db/schema";

/**
 * LinkedIn has no scheduling endpoint, so the queue is ours. A slot is 09:00
 * UTC on some future day, which is a morning in Europe and the night before in
 * California. Per profile local time is a Day 4 problem and it is written down
 * as one; picking a single hour now means the cron has one thing to read.
 *
 * Spacing is 7 divided by the target cadence, rounded to whole days, so a
 * cadence of 5 posts a week lands daily and a cadence of 3 lands every other
 * day. Rounding up to daily at 5 is deliberate: the offer says close to daily.
 */

const PUBLISH_HOUR_UTC = 9;

function slotOn(day: Date): Date {
  const slot = new Date(day);
  slot.setUTCHours(PUBLISH_HOUR_UTC, 0, 0, 0);
  return slot;
}

function addDays(date: Date, days: number): Date {
  const next = new Date(date);
  next.setUTCDate(next.getUTCDate() + days);
  return next;
}

export function spacingDays(targetCadence: number): number {
  if (targetCadence <= 0) return 1;
  return Math.max(1, Math.round(7 / targetCadence));
}

/**
 * The next free slot after everything already queued for this profile. Reads
 * scheduled_post rather than the board because that table is the publish
 * intent, and two cards must never claim the same minute.
 */
export async function nextSlot(opts: {
  profileId: string;
  targetCadence: number;
  now?: Date;
}): Promise<Date> {
  const now = opts.now ?? new Date();
  const gap = spacingDays(opts.targetCadence);

  const [last] = await getDb()
    .select({ publishAt: scheduledPost.publishAt })
    .from(scheduledPost)
    .where(
      and(
        eq(scheduledPost.profileId, opts.profileId),
        isNull(scheduledPost.publishedAt),
      ),
    )
    .orderBy(desc(scheduledPost.publishAt))
    .limit(1);

  // Nothing queued, or the queue has run out: start tomorrow morning.
  const earliest = slotOn(addDays(now, 1));
  if (!last || last.publishAt < earliest) return earliest;

  return slotOn(addDays(last.publishAt, gap));
}
