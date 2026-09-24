import { and, asc, eq, isNull, lt, notInArray, or, sql } from "drizzle-orm";
import { getDb } from "@/db";
import { fact as factTable, source as sourceTable } from "@/db/schema";
import { adapterFor } from "./adapters";
import { CATALOG } from "./catalog";
import { openCredential } from "./credentials";
import type { DraftFact, SourceKind } from "./types";

/**
 * One sync: read a source, write what it said, record why it did not.
 *
 * The failure posture is the one the publish cron already uses. A refused sync
 * writes `last_error` and flips `status` to broken so it is visible in a query
 * and on the settings page, rather than logged and forgotten. `last_synced_at`
 * is left alone on a failure, because it means "when we last got a reading
 * out of this" and a broken source that claims to have been read an hour ago is worse
 * than one that admits it is three days stale.
 */

export type SyncReport = {
  kind: SourceKind;
  ok: boolean;
  facts: number;
  error?: string;
};

/**
 * Facts are replaced, not accumulated. A reading that stopped coming back
 * stopped being true: a Notion page that fell out of the recent three, an MRR
 * line from a key that lost its subscription scope. Upsert then delete is two
 * statements rather than a transaction, which the Neon HTTP driver does not
 * offer, and the worst case is one stale row that the next run clears.
 */
async function writeFacts(
  profileId: string,
  sourceId: string,
  facts: DraftFact[],
  now: Date,
): Promise<void> {
  const db = getDb();

  if (facts.length > 0) {
    await db
      .insert(factTable)
      .values(
        facts.map((f) => ({
          profileId,
          sourceId,
          key: f.key,
          label: f.label,
          value: f.value,
          detail: f.detail ?? null,
          period: f.period ?? null,
          observedAt: now,
        })),
      )
      .onConflictDoUpdate({
        target: [factTable.sourceId, factTable.key],
        set: {
          label: sql`excluded.label`,
          value: sql`excluded.value`,
          detail: sql`excluded.detail`,
          period: sql`excluded.period`,
          observedAt: sql`excluded.observed_at`,
        },
      });
  }

  const keys = facts.map((f) => f.key);
  await db
    .delete(factTable)
    .where(
      keys.length > 0
        ? and(eq(factTable.sourceId, sourceId), notInArray(factTable.key, keys))
        : eq(factTable.sourceId, sourceId),
    );
}

export async function syncSource(
  row: typeof sourceTable.$inferSelect,
  now = new Date(),
): Promise<SyncReport> {
  const db = getDb();
  const adapter = adapterFor(row.kind);

  let result;
  try {
    result = await adapter.read({
      credential: openCredential(row),
      handle: row.handle,
      host: row.host,
      now,
    });
  } catch (cause) {
    // A thrown adapter is a bug in ours, not a refusal by theirs, and it must
    // not take down a cron run over the other four sources.
    console.error(`[sync] ${row.kind} threw:`, cause);
    result = {
      ok: false as const,
      error: `Reading ${CATALOG[row.kind].name} failed on our side. We are looking at it.`,
    };
  }

  if (!result.ok) {
    await db
      .update(sourceTable)
      .set({ status: "broken", lastError: result.error })
      .where(eq(sourceTable.id, row.id));
    return { kind: row.kind, ok: false, facts: 0, error: result.error };
  }

  await writeFacts(row.profileId, row.id, result.facts, now);
  await db
    .update(sourceTable)
    .set({ status: "active", lastError: null, lastSyncedAt: now })
    .where(eq(sourceTable.id, row.id));

  // Same shape as the llm_spend line in lib/agent/client.ts, so per-account
  // cost and per-account freshness are queryable from the same place.
  console.log(
    JSON.stringify({
      event: "source_sync",
      profile_id: row.profileId,
      source: row.kind,
      facts: result.facts.length,
    }),
  );

  return { kind: row.kind, ok: true, facts: result.facts.length };
}

export async function syncProfile(
  profileId: string,
  now = new Date(),
): Promise<SyncReport[]> {
  const rows = await getDb()
    .select()
    .from(sourceTable)
    .where(eq(sourceTable.profileId, profileId));

  const reports: SyncReport[] = [];
  for (const row of rows) reports.push(await syncSource(row, now));
  return reports;
}

/**
 * Once a day is the cadence, so the window is 20 hours rather than 24: a cron
 * that fires at 04:00 and checks for work older than a full day skips every
 * other day the moment one run is a minute late.
 */
const STALE_HOURS = 20;

/**
 * How much of the function's 300 seconds the run is allowed to spend starting
 * work. A source is several calls at up to 12 seconds each, so the margin has
 * to cover the slowest one finishing after the last one starts. Past the
 * deadline the run stops claiming rows and says how many it left, rather than
 * being killed mid-source with nothing written and nothing reported.
 */
const RUN_BUDGET_MS = 210_000;

/**
 * Four at a time. Every row is a different profile or a different product, so
 * no two of them hold the same credential and nothing here can cause the rate
 * limit it is trying to avoid. Sequential was fine for one profile and is not
 * fine for fifty: at twenty seconds a source, one at a time reads fifteen of
 * them before the function is killed, and a source read every fourth day is
 * past the shelf life in `lib/integrations/facts.ts` before it is read again.
 */
const CONCURRENCY = 4;

export type DueReport = {
  reports: SyncReport[];
  /** Rows that were due and not reached, because the run ran out of time. */
  skipped: number;
};

export async function syncDue(
  now = new Date(),
  limit = 200,
): Promise<DueReport> {
  const cutoff = new Date(now.getTime() - STALE_HOURS * 3_600_000);

  const rows = await getDb()
    .select()
    .from(sourceTable)
    .where(
      or(isNull(sourceTable.lastSyncedAt), lt(sourceTable.lastSyncedAt, cutoff)),
    )
    // Stalest first, nulls first, so a run that cannot finish leaves behind
    // the rows that were read most recently rather than an arbitrary set. A
    // source cannot be starved by whatever order the table happens to return.
    .orderBy(asc(sql`${sourceTable.lastSyncedAt} nulls first`))
    .limit(limit);

  const deadline = Date.now() + RUN_BUDGET_MS;
  const reports: SyncReport[] = [];
  let next = 0;
  let skipped = 0;

  async function worker(): Promise<void> {
    for (;;) {
      if (next >= rows.length) return;
      if (Date.now() > deadline) {
        // Count what is left once, by the worker that finds the queue open.
        skipped += rows.length - next;
        next = rows.length;
        return;
      }
      const row = rows[next++];
      if (!row) return;
      reports.push(await syncSource(row, now));
    }
  }

  await Promise.all(
    Array.from({ length: Math.min(CONCURRENCY, rows.length) }, worker),
  );

  if (skipped > 0) {
    console.warn(
      `[sync] ran out of time with ${skipped} sources still due. They are the stalest rows on the next run.`,
    );
  }

  return { reports, skipped };
}
