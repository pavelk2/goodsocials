import { eq } from "drizzle-orm";
import { getDb } from "@/db";
import { board as boardTable, brandPrinciple } from "@/db/schema";
import type { Goal } from "@/lib/agent/ideas";
import {
  CONTENT_QUESTION,
  GOAL_QUESTION,
  IMAGE_QUESTION,
  answerLine,
  appendLine,
  emptyFunnel,
  goalFor,
  parseFunnel,
  type Funnel,
} from "@/lib/funnel-steps";

export * from "@/lib/funnel-steps";

/**
 * The half of the funnel that touches the database. The steps, the questions
 * and every word on the funnel screens are in lib/funnel-steps.ts.
 */

export async function readFunnel(profileId: string): Promise<Funnel | null> {
  const [row] = await getDb()
    .select({ funnel: boardTable.funnel })
    .from(boardTable)
    .where(eq(boardTable.profileId, profileId))
    .limit(1);
  return row ? parseFunnel(row.funnel) : null;
}

/**
 * Read, change, write. Two requests racing on one board can lose an answer,
 * and the cost of that is one question asked twice, which is why this is not
 * a transaction.
 */
export async function updateFunnel(
  profileId: string,
  change: (funnel: Funnel) => Funnel,
): Promise<Funnel> {
  const current = (await readFunnel(profileId)) ?? emptyFunnel();
  const next = change(current);
  await getDb()
    .update(boardTable)
    .set({ funnel: next })
    .where(eq(boardTable.profileId, profileId));
  return next;
}

/**
 * Writes the answers into the visual and format principles, and the goal onto
 * the board. Idempotent: a line already in a principle is not appended twice,
 * so a retried sample request cannot stack the same instruction.
 */
export async function applyAnswers(
  profileId: string,
  funnel: Funnel,
  principles: { voice: string; visual: string; format: string },
): Promise<{ voice: string; visual: string; format: string; goal: Goal }> {
  const db = getDb();
  const goal = goalFor(funnel.answers.goal);

  const goalNote =
    funnel.answers.goal?.choice === "other"
      ? answerLine(GOAL_QUESTION, funnel.answers.goal)?.replace(
          "asked for this",
          "wants their posts to achieve this",
        ) ?? null
      : null;

  const contentNote =
    answerLine(CONTENT_QUESTION, funnel.answers.content)?.replace(
      "asked for this in their own words",
      "wants their posts to be about this, in their own words",
    ) ?? null;

  const next = {
    voice: principles.voice,
    visual: appendLine(principles.visual, answerLine(IMAGE_QUESTION, funnel.answers.image)),
    format: appendLine(appendLine(principles.format, contentNote), goalNote),
  };

  await Promise.all(
    (["voice", "visual", "format"] as const)
      .filter((kind) => next[kind] !== principles[kind])
      .map((kind) =>
        db
          .insert(brandPrinciple)
          .values({ profileId, kind, text: next[kind] })
          .onConflictDoUpdate({
            target: [brandPrinciple.profileId, brandPrinciple.kind],
            set: { text: next[kind], updatedAt: new Date() },
          }),
      ),
  );

  await db.update(boardTable).set({ goal }).where(eq(boardTable.profileId, profileId));

  return { ...next, goal };
}

