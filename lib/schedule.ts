import { and, desc, eq, isNull, ne } from "drizzle-orm";
import { getDb } from "@/db";
import { scheduledPost } from "@/db/schema";
import {
  PUBLISH_HOUR,
  addDays,
  dayKey,
  isZone,
  publishSlot,
  todayKey,
  type DayKey,
} from "@/lib/time";

/**
 * LinkedIn has no scheduling endpoint, so the queue is ours. A slot is 09:00 on
 * some future day in the profile's own zone, which is stored on the board and
 * asked for once at onboarding. It used to be 09:00 UTC for everybody, which
 * was a morning in Europe and the night before in California.
 *
 * Spacing is 7 divided by the target cadence, rounded to whole days, so a
 * cadence of 5 posts a week lands daily and a cadence of 3 lands every other
 * day. Rounding up to daily at 5 is deliberate: the offer says close to daily.
 *
 * Everything here works in calendar days rather than in milliseconds. A day
 * after a clock change is still 09:00, and only lib/time.ts turns a day into
 * an instant.
 */

export { PUBLISH_HOUR };

/** Until somebody tells us otherwise. The board asks the browser on first load. */
export const FALLBACK_ZONE = "UTC";

/**
 * The zone to schedule in, from whatever the board has stored. Validated on the
 * way out as well as on the way in, because a zone that Intl stopped
 * recognising would otherwise throw inside the cron rather than on the screen
 * where somebody chose it.
 */
export function boardZone(timezone: string | null | undefined): string {
  return timezone && isZone(timezone) ? timezone : FALLBACK_ZONE;
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
  zone: string;
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
  const earliestKey = addDays(todayKey(opts.zone, now), 1);
  const earliest = publishSlot(earliestKey, opts.zone);
  if (!last || last.publishAt < earliest) return earliest;

  return publishSlot(addDays(dayKey(last.publishAt, opts.zone), gap), opts.zone);
}

/**
 * Whether a day can still take a post, and why not when it cannot.
 *
 * Two rules, both of which the automatic scheduler already obeys and neither of
 * which was visible until the calendar drew them. A slot in the past cannot be
 * published into, and a day already carrying a post is taken: spacing is in
 * whole days, so one post a day is the shape of the whole queue rather than a
 * limit invented for this screen.
 */
export type DayCheck = { ok: true } | { ok: false; error: string };

export async function checkDay(opts: {
  profileId: string;
  cardId: string;
  day: DayKey;
  zone: string;
  now?: Date;
}): Promise<DayCheck> {
  const now = opts.now ?? new Date();
  const slot = publishSlot(opts.day, opts.zone);

  if (Number.isNaN(slot.getTime())) {
    return { ok: false, error: "That is not a day." };
  }
  if (slot.getTime() <= now.getTime()) {
    return { ok: false, error: "That time has gone. Pick a later day." };
  }

  // Everything queued for this profile except the card being placed, so moving
  // a post onto the day it already sits on is not a collision with itself.
  const taken = await getDb()
    .select({ publishAt: scheduledPost.publishAt })
    .from(scheduledPost)
    .where(
      and(
        eq(scheduledPost.profileId, opts.profileId),
        isNull(scheduledPost.publishedAt),
        ne(scheduledPost.cardId, opts.cardId),
      ),
    );

  const clash = taken.some(
    (row) => dayKey(row.publishAt, opts.zone) === opts.day,
  );
  if (clash) {
    return { ok: false, error: "There is already a post on that day." };
  }

  return { ok: true };
}
