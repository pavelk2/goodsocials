import { and, desc, eq, gte } from "drizzle-orm";
import { getDb } from "@/db";
import { fact as factTable, source as sourceTable } from "@/db/schema";
import { CATALOG } from "./catalog";
import { day } from "./format";
import type { SourceKind } from "./types";

/**
 * Reading facts back out, and rendering them for a prompt.
 *
 * The budget here is the whole reason this is a separate file. Text generation
 * costs about 0.15 USD per finished post against a 100 USD subscription, and
 * that holds only while the prompt stays a fixed size. Five sources with a
 * Notion excerpt each could put two thousand words in front of every draft, and
 * the excerpts are the part that grows, so they sort last and get cut first.
 *
 * The other ceiling here is age. A sync that starts failing leaves its readings
 * in place on purpose, so the settings screen can show what the source last
 * said, but a number that stopped being re-read stopped being a fact. The
 * prompt calls these readings true as of the date beside them, so a revoked
 * Stripe key must not still be publishing August's MRR in October under
 * somebody's own name. Past the shelf life a reading is dropped from the
 * prompt and the draft goes back to bracketing the gap, which is the failure
 * we already know how to show.
 */

/** Hard ceilings. A source that suddenly returns forty rows cannot spend money. */
const MAX_FACTS = 24;
const MAX_CHARS = 2_600;

/**
 * Seven daily syncs. The cron reads anything older than 20 hours, so a healthy
 * reading is never more than two days old and a week is unambiguously broken:
 * long enough to sit through a provider outage over a weekend, short enough
 * that nothing a month stale reaches a post.
 */
export const FACT_SHELF_LIFE_DAYS = 7;

/** The oldest `observed_at` a reading can carry and still go into a prompt. */
export function factCutoff(now = new Date()): Date {
  return new Date(now.getTime() - FACT_SHELF_LIFE_DAYS * 86_400_000);
}

/** True when this reading is too old to put under somebody's name. */
export function isStale(observedAt: Date, now = new Date()): boolean {
  return observedAt.getTime() < factCutoff(now).getTime();
}

export type FactRow = {
  kind: SourceKind;
  key: string;
  label: string;
  value: string;
  detail: string | null;
  period: string | null;
  observedAt: Date;
};

/**
 * The readings a prompt is allowed to see. Filtered in SQL rather than by the
 * caller, because every generation path goes through here and one of them
 * forgetting is a wrong number in a published post.
 */
export async function readFacts(
  profileId: string,
  now = new Date(),
): Promise<FactRow[]> {
  const rows = await getDb()
    .select({
      kind: sourceTable.kind,
      key: factTable.key,
      label: factTable.label,
      value: factTable.value,
      detail: factTable.detail,
      period: factTable.period,
      observedAt: factTable.observedAt,
    })
    .from(factTable)
    .innerJoin(sourceTable, eq(factTable.sourceId, sourceTable.id))
    .where(
      and(
        eq(factTable.profileId, profileId),
        gte(factTable.observedAt, factCutoff(now)),
      ),
    )
    .orderBy(desc(factTable.observedAt));

  return rows as FactRow[];
}

/** Notes last, because a note is prose and a number is four words. */
function weight(row: FactRow): number {
  return row.key.startsWith("note:") ? 1 : 0;
}

function line(row: FactRow): string {
  const parts = [`${row.label}: ${row.value}`];
  if (row.detail) parts.push(`(${row.detail})`);
  if (row.period) parts.push(`, ${row.period}`);
  return `- ${parts.join(" ").replace(" ,", ",")}`;
}

/**
 * The block that goes into an ideas or a draft call. Empty string when there is
 * nothing connected, so a caller can drop it without a conditional of its own.
 *
 * The instruction above the readings is the important part. Without it a model
 * treats a real number as a plausible number and rounds it, and a rounded
 * receipt is a receipt nobody can check.
 */
export function factsBrief(facts: FactRow[], now = new Date()): string {
  // `readFacts` already dropped these. Checked again because this function
  // takes an array rather than a profile id, and the cost of a caller passing
  // a stale row is a real number that is no longer real in a published post.
  const fresh = facts.filter((row) => !isStale(row.observedAt, now));
  if (fresh.length === 0) return "";

  const ordered = [...fresh]
    .sort((a, b) => weight(a) - weight(b))
    .slice(0, MAX_FACTS);

  const byKind = new Map<SourceKind, FactRow[]>();
  for (const row of ordered) {
    const list = byKind.get(row.kind) ?? [];
    list.push(row);
    byKind.set(row.kind, list);
  }

  const blocks: string[] = [];
  let spent = 0;
  for (const [kind, rows] of byKind) {
    const read = rows[0]?.observedAt;
    const header = `${CATALOG[kind].name}, read ${read ? day(read) : "recently"}:`;
    const body: string[] = [];
    for (const row of rows) {
      const text = line(row);
      if (spent + text.length > MAX_CHARS) break;
      spent += text.length;
      body.push(text);
    }
    if (body.length > 0) blocks.push([header, ...body].join("\n"));
  }
  if (blocks.length === 0) return "";

  return [
    "Readings from the tools this person connected. Every one of these is real, read from their own account, and true as of the date beside the source.",
    "",
    "Use them exactly as written, including the currency and the period. Never round one for effect, never add a second number beside one, and never turn a reading into an approximation. If a number you want is not here, it is not available: say so in the needs field rather than estimating it.",
    "",
    // A blank line between sources, so five of them do not read as one list.
    blocks.join("\n\n"),
  ].join("\n");
}
