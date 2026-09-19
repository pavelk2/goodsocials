import { eq, asc } from "drizzle-orm";
import { getDb } from "@/db";
import {
  profile as profileTable,
  board as boardTable,
  card as cardTable,
  brandPrinciple,
} from "@/db/schema";

export const COLUMNS = [
  "idea",
  "draft",
  "image",
  "scheduled",
  "posted",
] as const;
export type Column = (typeof COLUMNS)[number];

export const COLUMN_LABEL: Record<Column, string> = {
  idea: "Idea",
  draft: "Draft",
  image: "Image",
  scheduled: "Scheduled",
  posted: "Posted",
};

export type BoardCard = typeof cardTable.$inferSelect;

export type BoardView = {
  profile: typeof profileTable.$inferSelect;
  board: typeof boardTable.$inferSelect;
  principles: { voice: string; visual: string; format: string };
  cards: Record<Column, BoardCard[]>;
  /** Days of near-daily posting the approved queue can sustain. */
  runwayDays: number;
  /** True while the principles are still the placeholders from sign in. */
  needsOnboarding: boolean;
};

const PLACEHOLDER_PREFIX = "Not set yet.";

/**
 * By profile id, not by member id. An agency account has up to twelve profiles
 * under one login, so which board to draw is a choice the user made in
 * settings, resolved once in lib/profiles.ts and passed in here.
 */
export async function loadBoard(profileId: string): Promise<BoardView | null> {
  const db = getDb();

  const [prof] = await db
    .select()
    .from(profileTable)
    .where(eq(profileTable.id, profileId))
    .limit(1);
  if (!prof) return null;

  const [brd] = await db
    .select()
    .from(boardTable)
    .where(eq(boardTable.profileId, prof.id))
    .limit(1);
  if (!brd) return null;

  const [principleRows, cardRows] = await Promise.all([
    db.select().from(brandPrinciple).where(eq(brandPrinciple.profileId, prof.id)),
    db
      .select()
      .from(cardTable)
      .where(eq(cardTable.boardId, brd.id))
      .orderBy(asc(cardTable.position), asc(cardTable.createdAt)),
  ]);

  const principles = { voice: "", visual: "", format: "" };
  for (const row of principleRows) principles[row.kind] = row.text;

  const cards = Object.fromEntries(
    COLUMNS.map((c) => [c, [] as BoardCard[]]),
  ) as Record<Column, BoardCard[]>;
  for (const row of cardRows) {
    // A rejected card is off the board. It stays in the table for the log.
    if (row.state === "rejected") continue;
    cards[row.state].push(row);
  }

  // Approved work only. A draft nobody has approved cannot sustain anything.
  const ready = cards.image.length + cards.scheduled.length;
  const perDay = brd.targetCadence / 7;
  const runwayDays = perDay > 0 ? Math.floor(ready / perDay) : 0;

  return {
    profile: prof,
    board: brd,
    principles,
    cards,
    runwayDays,
    needsOnboarding: Object.values(principles).every(
      (t) => t === "" || t.startsWith(PLACEHOLDER_PREFIX),
    ),
  };
}
