import { eq } from "drizzle-orm";
import { after } from "next/server";
import { getDb } from "@/db";
import { board as boardTable } from "@/db/schema";
import { writeBrand } from "@/lib/brand-intake";
import { normalizeUrl } from "@/lib/agent/site";
import { funnelActor, siteFor } from "@/lib/funnel-context";
import { MAX_READS, advance, readFunnel, updateFunnel, type Funnel } from "@/lib/funnel";
import { track } from "@/lib/track";
import { isZone } from "@/lib/time";

/**
 * Funnel step one, fired the moment the website question is answered and left
 * running while the member answers the next three. Writes the three principles
 * and the four themes, in parallel, from the page or from the two sentences a
 * member with no website wrote instead.
 *
 * Competitor research is a separate request fired at the same moment, so the
 * slower of the two never holds up the other and each can fail on its own.
 */
export const runtime = "nodejs";
export const maxDuration = 300;

export async function POST(request: Request) {
  const actor = await funnelActor();
  if (!actor) return Response.json({ error: "Sign in first." }, { status: 401 });

  const body = (await request.json()) as {
    url?: string;
    description?: string;
    source?: string;
    timezone?: string;
  };

  const url = body.url ? normalizeUrl(body.url) : null;
  if (body.url && !url) {
    return Response.json({ error: "That does not look like a website address." }, { status: 400 });
  }
  const site: Funnel["site"] = url
    ? { url }
    : { url: null, description: body.description?.trim().slice(0, 1200) };

  const before = await readFunnel(actor.profile.id);
  if ((before?.reads ?? 0) >= MAX_READS) {
    return Response.json(
      { error: "That is three reads. Carry on with the site you gave us, you can change it in settings." },
      { status: 429 },
    );
  }

  // Stored before the model runs, so a member who reloads mid-read comes back
  // to the questions with the read started again, not to the website field.
  await updateFunnel(actor.profile.id, (f) =>
    advance({ ...f, site, reads: (f.reads ?? 0) + 1 }, "image"),
  );

  after(() =>
    track("onboarding_step_completed", {
      distinctId: actor.distinctId,
      memberId: actor.memberId,
      step: "website",
      choice: body.source ?? (url ? "url" : "none"),
    }),
  );

  const started = Date.now();
  const text = await siteFor(site, actor.profile.name);
  if (!text.ok) return Response.json({ error: text.error }, { status: 400 });

  const written = await writeBrand({
    profileId: actor.profile.id,
    personName: actor.profile.name,
    site: text,
    url,
  });
  if (!written.ok) {
    after(() =>
      track("research_failed", {
        distinctId: actor.distinctId,
        memberId: actor.memberId,
        part: "brand",
      }),
    );
    return Response.json({ error: written.error }, { status: 502 });
  }

  // The zone is asked of the browser, never of the person. Every slot this
  // board claims is 09:00 in it.
  const timezone = body.timezone && isZone(body.timezone) ? body.timezone : null;
  if (timezone) {
    await getDb()
      .update(boardTable)
      .set({ timezone })
      .where(eq(boardTable.profileId, actor.profile.id));
  }

  after(() =>
    track("research_finished", {
      distinctId: actor.distinctId,
      memberId: actor.memberId,
      part: "brand",
      seconds: Math.round((Date.now() - started) / 1000),
    }),
  );

  return Response.json({ themes: written.themes });
}
