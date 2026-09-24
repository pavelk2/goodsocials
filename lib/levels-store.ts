import { and, count, desc, eq, gte, inArray, isNotNull, isNull, ne } from "drizzle-orm";
import { getDb } from "@/db";
import {
  board as boardTable,
  card as cardTable,
  cardAction,
  levelStep,
  profile as profileTable,
  scheduledPost,
  source,
} from "@/db/schema";
import {
  daysSince,
  earnedLevel,
  firstDraftRate,
  FIRST_DRAFT_WINDOW,
  weeksAtCadence,
  type Evidence,
} from "@/lib/levels";
import { boardZone } from "@/lib/schedule";
import { dayKey, todayKey } from "@/lib/time";
import { readAnonId, track } from "@/lib/track";

/**
 * The half of levels that reads and writes. lib/levels.ts decides; this file
 * gathers what it decides from, and is the only writer of `profile.level` and
 * of `level_step`.
 */

/** A step row that is the agent's offer rather than the member's answer. */
export const SUGGESTED = "suggested";

export type LevelState = {
  level: number;
  evidence: Evidence;
  startedAt: Date;
};

/**
 * Reads the evidence and raises the stored level if it has been earned. Called
 * on every board and levels render: seven small queries, and the level is
 * right the moment the post that earned it is published, without a cron.
 * Never lowers it: a holiday week costs nothing.
 */
export async function syncLevel(
  profileId: string,
  memberId?: string | null,
): Promise<LevelState | null> {
  const db = getDb();

  const [row] = await db
    .select({
      level: profileTable.level,
      createdAt: profileTable.createdAt,
      boardId: boardTable.id,
      cadence: boardTable.targetCadence,
      timezone: boardTable.timezone,
    })
    .from(profileTable)
    .innerJoin(boardTable, eq(boardTable.profileId, profileTable.id))
    .where(eq(profileTable.id, profileId))
    .limit(1);
  if (!row) return null;

  const evidence = await readEvidence({
    profileId,
    boardId: row.boardId,
    cadence: row.cadence,
    zone: boardZone(row.timezone),
    startedAt: row.createdAt,
  });

  const earned = earnedLevel(row.level, evidence, row.createdAt);
  if (earned > row.level) {
    // Guarded on the old level, so two renders racing each other raise it once
    // and send the event once.
    const raised = await db
      .update(profileTable)
      .set({ level: earned, levelReachedAt: new Date() })
      .where(and(eq(profileTable.id, profileId), eq(profileTable.level, row.level)))
      .returning({ id: profileTable.id });

    if (raised.length > 0) {
      await track("level_reached", {
        distinctId: (await readAnonId()) ?? memberId ?? profileId,
        memberId,
        profile_id: profileId,
        level: earned,
        from_level: row.level,
        days_since_start: evidence.days,
        published: evidence.published,
      });
    }
  }

  return { level: Math.max(earned, row.level), evidence, startedAt: row.createdAt };
}

async function readEvidence(opts: {
  profileId: string;
  boardId: string;
  cadence: number;
  zone: string;
  startedAt: Date;
}): Promise<Evidence> {
  const db = getDb();
  // Ten weeks back covers every weekly streak a level asks for with room over.
  const since = new Date(Date.now() - 70 * 86_400_000);

  const [published, stepRows, sources, receipts, recent, postedRows] =
    await Promise.all([
      db
        .select({ n: count() })
        .from(cardTable)
        .where(and(eq(cardTable.boardId, opts.boardId), eq(cardTable.state, "posted"))),
      db
        .selectDistinct({ level: levelStep.level })
        .from(levelStep)
        .where(and(eq(levelStep.profileId, opts.profileId), ne(levelStep.choice, SUGGESTED))),
      db
        .select({ n: count() })
        .from(source)
        .where(
          and(
            eq(source.profileId, opts.profileId),
            eq(source.status, "active"),
            isNotNull(source.lastSyncedAt),
          ),
        ),
      // A posted receipt with no open `needs` went out carrying a real number,
      // either one a connected source read or one the member supplied.
      db
        .select({ n: count() })
        .from(cardTable)
        .where(
          and(
            eq(cardTable.boardId, opts.boardId),
            eq(cardTable.state, "posted"),
            eq(cardTable.kind, "receipt"),
            isNull(cardTable.needs),
          ),
        ),
      db
        .select({ id: cardTable.id })
        .from(cardTable)
        .where(
          and(
            eq(cardTable.boardId, opts.boardId),
            inArray(cardTable.state, ["image", "scheduled", "posted"]),
          ),
        )
        .orderBy(desc(cardTable.updatedAt))
        .limit(FIRST_DRAFT_WINDOW * 2),
      db
        .select({ publishedAt: scheduledPost.publishedAt })
        .from(scheduledPost)
        .where(
          and(
            eq(scheduledPost.profileId, opts.profileId),
            isNotNull(scheduledPost.publishedAt),
            gte(scheduledPost.publishedAt, since),
          ),
        ),
    ]);

  const actionRows =
    recent.length > 0
      ? await db
          .select({ cardId: cardAction.cardId, action: cardAction.action })
          .from(cardAction)
          .where(inArray(cardAction.cardId, recent.map((c) => c.id)))
          .orderBy(cardAction.createdAt)
      : [];

  const byCard = new Map<string, ("approve" | "revise" | "reject")[]>();
  for (const a of actionRows) {
    const list = byCard.get(a.cardId) ?? [];
    list.push(a.action);
    byCard.set(a.cardId, list);
  }

  return {
    days: daysSince(opts.startedAt),
    published: published[0]?.n ?? 0,
    steps: new Set(stepRows.map((r) => r.level)),
    sourceActive: (sources[0]?.n ?? 0) > 0,
    receiptsWithNumber: receipts[0]?.n ?? 0,
    firstDraft: firstDraftRate(recent.map((c) => ({ actions: byCard.get(c.id) ?? [] }))),
    weeksAtCadence: weeksAtCadence(
      postedRows.map((r) => dayKey(r.publishedAt as Date, opts.zone)),
      todayKey(opts.zone),
      opts.cadence,
    ),
  };
}

/** Writes the member's answer. The step is done from this row on. */
export async function recordStep(opts: {
  profileId: string;
  level: number;
  choice: string;
  text?: string | null;
  detail?: unknown;
  memberId: string;
}): Promise<void> {
  await getDb().insert(levelStep).values({
    profileId: opts.profileId,
    level: opts.level,
    choice: opts.choice,
    text: opts.text ?? null,
    detail: opts.detail ?? null,
    actorMemberId: opts.memberId,
  });

  await track("level_step_completed", {
    distinctId: (await readAnonId()) ?? opts.memberId,
    memberId: opts.memberId,
    profile_id: opts.profileId,
    level: opts.level,
    choice: opts.choice,
  });
}

/** What the agent offered on this step last time, so a reload does not pay again. */
export async function readSuggestion<T>(
  profileId: string,
  level: number,
): Promise<T | null> {
  const [row] = await getDb()
    .select({ detail: levelStep.detail })
    .from(levelStep)
    .where(
      and(
        eq(levelStep.profileId, profileId),
        eq(levelStep.level, level),
        eq(levelStep.choice, SUGGESTED),
      ),
    )
    .orderBy(desc(levelStep.createdAt))
    .limit(1);
  return (row?.detail as T | undefined) ?? null;
}

export async function saveSuggestion(
  profileId: string,
  level: number,
  detail: unknown,
): Promise<void> {
  await getDb()
    .insert(levelStep)
    .values({ profileId, level, choice: SUGGESTED, detail });
}
