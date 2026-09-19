import { desc, eq } from "drizzle-orm";
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
 */

/** Hard ceilings. A source that suddenly returns forty rows cannot spend money. */
const MAX_FACTS = 24;
const MAX_CHARS = 2_600;

export type FactRow = {
  kind: SourceKind;
  key: string;
  label: string;
  value: string;
  detail: string | null;
  period: string | null;
  observedAt: Date;
};

export async function readFacts(profileId: string): Promise<FactRow[]> {
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
    .where(eq(factTable.profileId, profileId))
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
export function factsBrief(facts: FactRow[]): string {
  if (facts.length === 0) return "";

  const ordered = [...facts]
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

/** What the board says under a card that is waiting on nothing. */
export function factSummary(facts: FactRow[]): string {
  if (facts.length === 0) return "Nothing connected yet.";
  const kinds = new Set(facts.map((f) => f.kind));
  const sources = kinds.size === 1 ? "1 source" : `${kinds.size} sources`;
  const readings = facts.length === 1 ? "1 reading" : `${facts.length} readings`;
  return `${readings} from ${sources}.`;
}
