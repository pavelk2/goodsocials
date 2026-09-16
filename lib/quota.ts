import { and, eq, sql } from "drizzle-orm";
import { getDb } from "@/db";
import { imageQuota, IMAGE_CAP_PER_MONTH } from "@/db/schema";

/**
 * Images are the margin risk, so the cap lives in the database and is checked
 * before the Replicate call, never after. A regeneration costs the same money
 * as a generation and counts the same.
 */

export function currentPeriod(now = new Date()): string {
  return `${now.getUTCFullYear()}-${String(now.getUTCMonth() + 1).padStart(2, "0")}`;
}

export function periodResetsOn(period: string): Date {
  const [year, month] = period.split("-").map(Number);
  return new Date(Date.UTC(month === 12 ? year + 1 : year, month % 12, 1));
}

/** "1 October" in the user's reading, not an ISO string in an error message. */
export function resetLabel(period: string): string {
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "long",
    timeZone: "UTC",
  }).format(periodResetsOn(period));
}

export type QuotaState = {
  period: string;
  used: number;
  cap: number;
  remaining: number;
  resetsOn: string;
};

export async function readQuota(
  profileId: string,
  now = new Date(),
): Promise<QuotaState> {
  const period = currentPeriod(now);
  const [row] = await getDb()
    .select()
    .from(imageQuota)
    .where(and(eq(imageQuota.profileId, profileId), eq(imageQuota.period, period)))
    .limit(1);

  const used = row?.generatedCount ?? 0;
  return {
    period,
    used,
    cap: IMAGE_CAP_PER_MONTH,
    remaining: Math.max(0, IMAGE_CAP_PER_MONTH - used),
    resetsOn: resetLabel(period),
  };
}

/**
 * Claims one image before it is generated. The insert and the increment are a
 * single statement so two clicks on the same card cannot both pass the check,
 * and the WHERE on the update is what refuses the 201st image rather than a
 * read followed by a write that races with itself.
 */
export async function claimImage(
  profileId: string,
  now = new Date(),
): Promise<{ ok: true; state: QuotaState } | { ok: false; state: QuotaState }> {
  const period = currentPeriod(now);

  const claimed = await getDb()
    .insert(imageQuota)
    .values({ profileId, period, generatedCount: 1 })
    .onConflictDoUpdate({
      target: [imageQuota.profileId, imageQuota.period],
      set: { generatedCount: sql`${imageQuota.generatedCount} + 1` },
      setWhere: sql`${imageQuota.generatedCount} < ${IMAGE_CAP_PER_MONTH}`,
    })
    .returning();

  const state = await readQuota(profileId, now);
  return claimed.length > 0 ? { ok: true, state } : { ok: false, state };
}

/** A generation that failed after the claim gives the image back. */
export async function releaseImage(
  profileId: string,
  now = new Date(),
): Promise<void> {
  const period = currentPeriod(now);
  await getDb()
    .update(imageQuota)
    .set({ generatedCount: sql`greatest(${imageQuota.generatedCount} - 1, 0)` })
    .where(and(eq(imageQuota.profileId, profileId), eq(imageQuota.period, period)));
}
