import { eq } from "drizzle-orm";
import { auth } from "@/auth";
import { getDb } from "@/db";
import {
  board as boardTable,
  card as cardTable,
  brandPrinciple,
} from "@/db/schema";
import { resolveActor } from "@/lib/profiles";
import { fetchSiteText } from "@/lib/agent/site";
import { generateIdeas, type Goal } from "@/lib/agent/ideas";

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

  const rows = await db
    .select()
    .from(brandPrinciple)
    .where(eq(brandPrinciple.profileId, actor.profileId));
  const principles = { voice: "", visual: "", format: "" };
  for (const row of rows) principles[row.kind] = row.text;

  const site = await fetchSiteText(body.url ?? "");
  if (!site.ok) return Response.json({ error: site.error }, { status: 400 });

  let ideas: string[];
  try {
    ideas = await generateIdeas({
      principles,
      goal: brd.goal as Goal,
      siteUrl: site.url,
      siteText: site.text,
      profileId: actor.profileId,
    });
  } catch (cause) {
    console.error("[onboarding] ideas failed:", cause);
    return Response.json(
      { error: "We could not write ideas for that page. Try again." },
      { status: 502 },
    );
  }

  await db
    .insert(cardTable)
    .values(
      ideas.map((idea, position) => ({ boardId: brd.id, idea, position })),
    );

  return Response.json({ count: ideas.length });
}
