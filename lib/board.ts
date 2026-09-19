import { and, asc, eq, isNotNull, isNull } from "drizzle-orm";
import { getDb } from "@/db";
import {
  profile as profileTable,
  board as boardTable,
  card as cardTable,
  cardSource,
  brandPrinciple,
  linkedinConnection,
  scheduledPost,
  theme as themeTable,
} from "@/db/schema";
import type { CardSource } from "@/lib/post-kind";

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

/**
 * The card as the board draws it, which is the row plus the pages it was
 * written from. The sources travel with the card because they are what the
 * person approving it is meant to check, and a link they have to go looking
 * for is a link nobody clicks.
 */
export type BoardCard = typeof cardTable.$inferSelect & {
  sources: CardSource[];
};
export type BoardTheme = typeof themeTable.$inferSelect;

export type BoardView = {
  profile: typeof profileTable.$inferSelect;
  board: typeof boardTable.$inferSelect;
  principles: { voice: string; visual: string; format: string };
  /** What this profile posts about. Ordered, editable, four to start with. */
  themes: BoardTheme[];
  cards: Record<Column, BoardCard[]>;
  /** Days of near-daily posting the approved queue can sustain. */
  runwayDays: number;
  /** True while the principles are still the placeholders from sign in. */
  needsOnboarding: boolean;
  /**
   * What the publish queue is doing when it is not publishing. The cron runs
   * whether or not anybody opens this page, so without these two the failure
   * the whole product is built around is invisible until a client asks where
   * the posts went.
   */
  connection: {
    status: "active" | "expiring" | "dead";
    expiresAt: Date;
  } | null;
  /** The reason the oldest stuck post gave, if the queue is stuck. */
  queueError: string | null;
};

const PLACEHOLDER_PREFIX = "Not set yet.";

/**
 * By profile id, not by member id. An agency account has one profile per seat
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

  const [principleRows, themeRows, cardRows, sourceRows, connectionRows, stuckRows] =
    await Promise.all([
      db
        .select()
        .from(brandPrinciple)
        .where(eq(brandPrinciple.profileId, prof.id)),
      db
        .select()
        .from(themeTable)
        .where(eq(themeTable.profileId, prof.id))
        .orderBy(asc(themeTable.position), asc(themeTable.createdAt)),
      db
        .select()
        .from(cardTable)
        .where(eq(cardTable.boardId, brd.id))
        .orderBy(asc(cardTable.position), asc(cardTable.createdAt)),
      // One join for the whole board rather than a query per card. Joined on
      // the board so a card whose sources outlive a theme change still finds
      // them, and ordered so every card's list reads in citation order.
      db
        .select({
          cardId: cardSource.cardId,
          url: cardSource.url,
          title: cardSource.title,
        })
        .from(cardSource)
        .innerJoin(cardTable, eq(cardSource.cardId, cardTable.id))
        .where(eq(cardTable.boardId, brd.id))
        .orderBy(asc(cardSource.position), asc(cardSource.createdAt)),
      db
        .select({
          status: linkedinConnection.status,
          expiresAt: linkedinConnection.expiresAt,
        })
        .from(linkedinConnection)
        .where(eq(linkedinConnection.profileId, prof.id))
        .limit(1),
      // The oldest unpublished post that has a reason attached. One sentence on
      // the board beats twelve identical rows nobody queries.
      db
        .select({ lastError: scheduledPost.lastError })
        .from(scheduledPost)
        .where(
          and(
            eq(scheduledPost.profileId, prof.id),
            isNull(scheduledPost.publishedAt),
            isNotNull(scheduledPost.lastError),
          ),
        )
        .orderBy(asc(scheduledPost.publishAt))
        .limit(1),
    ]);

  const principles = { voice: "", visual: "", format: "" };
  for (const row of principleRows) principles[row.kind] = row.text;

  const sourcesByCard = new Map<string, CardSource[]>();
  for (const row of sourceRows) {
    const list = sourcesByCard.get(row.cardId);
    if (list) list.push({ url: row.url, title: row.title });
    else sourcesByCard.set(row.cardId, [{ url: row.url, title: row.title }]);
  }

  const cards = Object.fromEntries(
    COLUMNS.map((c) => [c, [] as BoardCard[]]),
  ) as Record<Column, BoardCard[]>;
  for (const row of cardRows) {
    // A rejected card is off the board. It stays in the table for the log.
    if (row.state === "rejected") continue;
    cards[row.state].push({ ...row, sources: sourcesByCard.get(row.id) ?? [] });
  }

  // Approved work only. A draft nobody has approved cannot sustain anything.
  const ready = cards.image.length + cards.scheduled.length;
  const perDay = brd.targetCadence / 7;
  const runwayDays = perDay > 0 ? Math.floor(ready / perDay) : 0;

  return {
    profile: prof,
    board: brd,
    principles,
    themes: themeRows,
    cards,
    runwayDays,
    needsOnboarding: Object.values(principles).every(
      (t) => t === "" || t.startsWith(PLACEHOLDER_PREFIX),
    ),
    connection: connectionRows[0] ?? null,
    queueError: stuckRows[0]?.lastError ?? null,
  };
}
