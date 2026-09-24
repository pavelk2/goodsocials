import { after } from "next/server";
import { researchCompetitors } from "@/lib/agent/competitors";
import { normalizeUrl } from "@/lib/agent/site";
import { funnelActor, siteFor } from "@/lib/funnel-context";
import { updateFunnel, type Funnel } from "@/lib/funnel";
import { track } from "@/lib/track";

/**
 * Funnel step one, second half: the companies in this member's field and what
 * their customers say about each, which the sample post is written from. Fired beside /research rather than after it, and given
 * the site in the body for the same reason, so neither waits on the other.
 *
 * A failure here does not stop the funnel. The sample route runs research
 * again if this never landed.
 */
export const runtime = "nodejs";
export const maxDuration = 120;

export async function POST(request: Request) {
  const actor = await funnelActor();
  if (!actor) return Response.json({ error: "Sign in first." }, { status: 401 });

  const body = (await request.json()) as { url?: string; description?: string };
  const url = body.url ? normalizeUrl(body.url) : null;
  const site: Funnel["site"] = url
    ? { url }
    : { url: null, description: body.description?.trim().slice(0, 1200) };

  const text = await siteFor(site, actor.profile.name);
  if (!text.ok) return Response.json({ error: text.error }, { status: 400 });

  const started = Date.now();
  try {
    const research = await researchCompetitors({
      site: text,
      profileId: actor.profile.id,
      personName: actor.profile.name,
    });
    await updateFunnel(actor.profile.id, (f) => ({ ...f, research }));

    after(() =>
      track("research_finished", {
        distinctId: actor.distinctId,
        memberId: actor.memberId,
        part: "competitors",
        competitors: research.companies.length,
        reviewed: research.companies.filter((c) => c.praised || c.criticised).length,
        searched: research.searched,
        seconds: Math.round((Date.now() - started) / 1000),
      }),
    );

    return Response.json({ field: research.field, companies: research.companies });
  } catch (cause) {
    console.error("[onboarding] competitors failed:", cause);
    after(() =>
      track("research_failed", {
        distinctId: actor.distinctId,
        memberId: actor.memberId,
        part: "competitors",
      }),
    );
    return Response.json({ error: "Competitor research did not finish." }, { status: 502 });
  }
}
