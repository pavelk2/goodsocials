import { after } from "next/server";
import { researchCompetitors, type ResearchEvent } from "@/lib/agent/competitors";
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
 *
 * The answer is a stream of JSON lines: one per search run and per page read,
 * as the research does them, then one with the result. The waiting screen
 * shows those lines, so what the member watches is the research itself.
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
  const encoder = new TextEncoder();

  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      // The member may have left. The research still finishes and is stored.
      const send = (line: ResearchEvent) => {
        try {
          controller.enqueue(encoder.encode(`${JSON.stringify(line)}\n`));
        } catch {}
      };

      try {
        const research = await researchCompetitors({
          site: text,
          profileId: actor.profile.id,
          personName: actor.profile.name,
          onProgress: (progress) => send({ type: "progress", ...progress }),
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

        send({
          type: "result",
          field: research.field,
          companies: research.companies.map((c) => c.name),
          reviewed: research.companies.filter((c) => c.praised || c.criticised).length,
          sources: [...new Set(research.companies.map((c) => c.source).filter(Boolean))] as string[],
        });
      } catch (cause) {
        console.error("[onboarding] competitors failed:", cause);
        after(() =>
          track("research_failed", {
            distinctId: actor.distinctId,
            memberId: actor.memberId,
            part: "competitors",
          }),
        );
        send({ type: "error", error: "Competitor research did not finish." });
      } finally {
        try {
          controller.close();
        } catch {}
      }
    },
  });

  return new Response(stream, {
    headers: { "content-type": "application/x-ndjson; charset=utf-8", "cache-control": "no-store" },
  });
}

