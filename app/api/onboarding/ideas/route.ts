import { asc, eq } from "drizzle-orm";
import { auth } from "@/auth";
import { getDb } from "@/db";
import {
  board as boardTable,
  card as cardTable,
  brandPrinciple,
  theme as themeTable,
} from "@/db/schema";
import { resolveActor } from "@/lib/profiles";
import { fetchSiteText } from "@/lib/agent/site";
import { generateIdeas, type GeneratedIdea, type Goal } from "@/lib/agent/ideas";
import { readFacts } from "@/lib/integrations/facts";

/** Step two. Fills the Idea column with seven cards. */
export const runtime = "nodejs";
export const maxDuration = 300;

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.memberId) {
    return Response.json({ error: "Sign in first." }, { status: 401 });
  }

  // The profile picked in settings, not the member's own. An agency sets up a
  // client's board while signed in as itself.
  const actor = await resolveActor(session.memberId);
  if (!actor) {
    return Response.json({ error: "No profile for this account." }, { status: 404 });
  }

  const body = (await request.json()) as { url?: string };
  const db = getDb();

  const [brd] = await db
    .select()
    .from(boardTable)
    .where(eq(boardTable.profileId, actor.profileId))
    .limit(1);
  if (!brd) {
    return Response.json({ error: "No board for this profile." }, { status: 404 });
  }

  // Facts join the same round trip as the principles and the themes. Onboarding
  // has a 90 second budget and a third sequential query is not how it gets spent.
  const [rows, themes, facts] = await Promise.all([
    db
      .select()
      .from(brandPrinciple)
      .where(eq(brandPrinciple.profileId, actor.profileId)),
    db
      .select()
      .from(themeTable)
      .where(eq(themeTable.profileId, actor.profileId))
      .orderBy(asc(themeTable.position)),
    readFacts(actor.profileId),
  ]);
  const principles = { voice: "", visual: "", format: "" };
  for (const row of rows) principles[row.kind] = row.text;

  // Step one writes the themes. Reaching step two without them means step one
  // half failed, and seven ideas with no subject is what this change exists to
  // stop, so it is an error rather than a quiet fallback.
  if (themes.length === 0) {
    return Response.json(
      { error: "No themes for this profile yet. Start again from your website." },
      { status: 409 },
    );
  }

  const site = await fetchSiteText(body.url ?? "");
  if (!site.ok) return Response.json({ error: site.error }, { status: 400 });

  let ideas: GeneratedIdea[];
  try {
    ideas = await generateIdeas({
      principles,
      themes,
      goal: brd.goal as Goal,
      siteUrl: site.url,
      siteText: site.text,
      facts,
      profileId: actor.profileId,
    });
  } catch (cause) {
    console.error("[onboarding] ideas failed:", cause);
    return Response.json(
      { error: "We could not write ideas for that page. Try again." },
      { status: 502 },
    );
  }

  // Matched on the title the model was given, case and spacing forgiven. A
  // card whose theme did not match keeps its idea and loses the label, because
  // an unlabelled card is a small loss and a dropped card is a hole in a week.
  const byTitle = new Map(
    themes.map((t) => [t.title.trim().toLowerCase(), t.id]),
  );

  await db.insert(cardTable).values(
    ideas.map((idea, position) => ({
      boardId: brd.id,
      idea: idea.idea,
      kind: idea.kind,
      themeId: byTitle.get(idea.theme.trim().toLowerCase()) ?? null,
      needs: idea.needs,
      position,
    })),
  );

  return Response.json({ count: ideas.length });
}
