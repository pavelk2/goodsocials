import { eq } from "drizzle-orm";
import { auth } from "@/auth";
import { getDb } from "@/db";
import {
  board as boardTable,
  brandPrinciple,
  theme as themeTable,
} from "@/db/schema";
import { loadAccess } from "@/lib/profiles";
import { fetchSiteText } from "@/lib/agent/site";
import { generatePrinciples } from "@/lib/agent/principles";
import { generateThemes } from "@/lib/agent/themes";
import type { Goal } from "@/lib/agent/ideas";
import { isZone } from "@/lib/time";

/**
 * Step one of onboarding. Split from idea generation so the board starts
 * filling while the second call is still running. Two shorter calls also stay
 * inside the function timeout that one long call would risk.
 *
 * Principles and themes are written here, in parallel. They read the same page
 * and neither needs the other, so running them in sequence would put a second
 * model call in front of the 90 second budget for no gain. Step two needs both.
 */
export const runtime = "nodejs";
export const maxDuration = 300;

const GOALS = new Set<Goal>(["interesting", "followers", "traffic"]);

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.memberId) {
    return Response.json({ error: "Sign in first." }, { status: 401 });
  }

  const body = (await request.json()) as {
    url?: string;
    goal?: string;
    timezone?: string;
  };
  const goal = (body.goal ?? "interesting") as Goal;
  if (!GOALS.has(goal)) {
    return Response.json({ error: "Pick one of the three goals." }, { status: 400 });
  }

  const site = await fetchSiteText(body.url ?? "");
  if (!site.ok) return Response.json({ error: site.error }, { status: 400 });

  const db = getDb();
  // The profile picked in settings, not the member's own. An agency sets up a
  // client's board while signed in as itself.
  const access = await loadAccess(session.memberId);
  const prof = access?.active?.profile;
  if (!prof) {
    return Response.json({ error: "No profile for this account." }, { status: 404 });
  }

  let principles;
  let themes;
  try {
    [principles, themes] = await Promise.all([
      generatePrinciples({ site, profileId: prof.id, personName: prof.name }),
      generateThemes({ site, profileId: prof.id, personName: prof.name }),
    ]);
  } catch (cause) {
    console.error("[onboarding] principles failed:", cause);
    return Response.json(
      { error: "We could not read enough from that page. Try your homepage." },
      { status: 502 },
    );
  }

  await Promise.all(
    (["voice", "visual", "format"] as const).map((kind) =>
      db
        .insert(brandPrinciple)
        .values({ profileId: prof.id, kind, text: principles[kind] })
        .onConflictDoUpdate({
          target: [brandPrinciple.profileId, brandPrinciple.kind],
          set: { text: principles[kind], updatedAt: new Date() },
        }),
    ),
  );

  // Replaced rather than added to. Running onboarding again means the URL or
  // the goal changed, and four themes written from the old page sitting beside
  // four from the new one is a board with no subject at all.
  await db.delete(themeTable).where(eq(themeTable.profileId, prof.id));
  await db.insert(themeTable).values(
    themes.map((t, position) => ({
      profileId: prof.id,
      title: t.title,
      description: t.description,
      position,
    })),
  );

  // The URL is kept because the traffic goal has to have somewhere to link to,
  // and because re-reading the page later beats asking for it twice.
  //
  // The zone comes from the browser rather than from a question, because every
  // slot this board ever claims is 09:00 in it and the alternative is 09:00
  // UTC, which is the middle of the night for half the people this is sold to.
  // A zone the browser did not report leaves the column null, and the board
  // asks again on first load.
  const timezone = body.timezone && isZone(body.timezone) ? body.timezone : null;
  await db
    .update(boardTable)
    .set(timezone ? { goal, siteUrl: site.url, timezone } : { goal, siteUrl: site.url })
    .where(eq(boardTable.profileId, prof.id));

  return Response.json({ principles, themes, siteUrl: site.url });
}
