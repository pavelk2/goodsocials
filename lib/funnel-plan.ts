import { and, eq } from "drizzle-orm";
import { getDb } from "@/db";
import { card as cardTable, type theme as themeTable } from "@/db/schema";
import { generateIdeas, type Goal } from "@/lib/agent/ideas";

/**
 * The seven ideas behind the sample: the week the offer shows and the list the
 * member picks from after paying. Written beside the sample so neither waits,
 * and again from the ideas step if that run failed, which is why it does
 * nothing on a board whose Idea column already has cards.
 *
 * Positions start at 1. Position 0 belongs to the sample, and to an idea the
 * member writes themselves, both of which go first.
 */
export async function planWeek(opts: {
  boardId: string;
  profileId: string;
  principles: { voice: string; visual: string; format: string };
  themes: (typeof themeTable.$inferSelect)[];
  goal: Goal;
  siteUrl: string | null;
  siteText: string;
}): Promise<number> {
  const db = getDb();
  const existing = await db
    .select({ id: cardTable.id })
    .from(cardTable)
    .where(and(eq(cardTable.boardId, opts.boardId), eq(cardTable.state, "idea")))
    .limit(1);
  if (existing.length > 0) return 0;

  const ideas = await generateIdeas({
    principles: opts.principles,
    themes: opts.themes,
    goal: opts.goal,
    siteUrl: opts.siteUrl ?? "",
    siteText: opts.siteText,
    profileId: opts.profileId,
  });

  // Matched on the title the model was given, case and spacing forgiven. An
  // unmatched card keeps its idea and loses the label.
  const byTitle = new Map(opts.themes.map((t) => [t.title.trim().toLowerCase(), t.id]));
  await db.insert(cardTable).values(
    ideas.map((idea, i) => ({
      boardId: opts.boardId,
      idea: idea.idea,
      title: idea.title || null,
      kind: idea.kind,
      themeId: byTitle.get(idea.theme.trim().toLowerCase()) ?? null,
      needs: idea.needs,
      position: i + 1,
    })),
  );
  return ideas.length;
}
