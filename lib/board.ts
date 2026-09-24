import { and, asc, eq, isNotNull, isNull } from "drizzle-orm";
import { getDb } from "@/db";
import {
  profile as profileTable,
  board as boardTable,
  card as cardTable,
  brandPrinciple,
  linkedinConnection,
  scheduledPost,
  theme as themeTable,
} from "@/db/schema";
import { parseFunnel } from "@/lib/funnel-steps";

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
 * What pressing approve does in each column, said in the column header so the
 * board reads as a list of things waiting on the member. The column names stay
 * the card states; this is the verb that moves a card out of one.
 */
export const COLUMN_NEXT: Partial<Record<Column, string>> = {
  idea: "approve to draft",
  draft: "approve to add image",
  image: "approve to schedule",
};

export type BoardCard = typeof cardTable.$inferSelect;
export type BoardTheme = typeof themeTable.$inferSelect;

export type BoardView = {
  profile: typeof profileTable.$inferSelect;
  board: typeof boardTable.$inferSelect;
  principles: { voice: string; visual: string; format: string };
  /** What this profile posts about. Ordered, editable, four to start with. */
  themes: BoardTheme[];
  cards: Record<Column, BoardCard[]>;
  /**
   * Days the publish queue can sustain, from scheduled posts only. A card in
   * the Image column is approved text and picture but has no slot, and the
   * cron publishes nothing it was not handed, so counting it here showed nine
   * days of runway over an empty Scheduled column.
   */
  runwayDays: number;
  /** Finished posts one approve away from the queue, said beside the runway. */
  readyToSchedule: number;
  /**
   * True while the principles are still the placeholders from sign in, or
   * while the onboarding funnel on this board is not finished.
   */
  needsOnboarding: boolean;
  /** True once a website has been read into principles, placeholders gone. */
  brandWritten: boolean;
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

  const [principleRows, themeRows, cardRows, connectionRows, stuckRows] =
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

  const cards = Object.fromEntries(
    COLUMNS.map((c) => [c, [] as BoardCard[]]),
  ) as Record<Column, BoardCard[]>;
  for (const row of cardRows) {
    // A rejected card is off the board. It stays in the table for the log.
    if (row.state === "rejected") continue;
    cards[row.state].push(row);
  }

  // Scheduled work only. Anything short of a slot publishes nothing.
  const perDay = brd.targetCadence / 7;
  const runwayDays =
    perDay > 0 ? Math.floor(cards.scheduled.length / perDay) : 0;

  const brandWritten = !Object.values(principles).every(
    (t) => t === "" || t.startsWith(PLACEHOLDER_PREFIX),
  );

  return {
    profile: prof,
    board: brd,
    principles,
    themes: themeRows,
    cards,
    runwayDays,
    readyToSchedule: cards.image.length,
    // Placeholders mean nothing was ever read. A funnel that is not done means
    // the member left partway, and comes back to the screen they left. A
    // board from before the funnel has none, and is never sent back into it.
    needsOnboarding:
      !brandWritten || (parseFunnel(brd.funnel)?.step ?? "done") !== "done",
    brandWritten,
    connection: connectionRows[0] ?? null,
    queueError: stuckRows[0]?.lastError ?? null,
  };
}
