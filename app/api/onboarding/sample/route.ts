import { randomUUID } from "node:crypto";
import { eq } from "drizzle-orm";
import { after } from "next/server";
import { getDb } from "@/db";
import { board as boardTable, card as cardTable } from "@/db/schema";
import { isResearch, researchCompetitors, type Research } from "@/lib/agent/competitors";
import { generateMarketPost } from "@/lib/agent/drafts";
import { generateImage } from "@/lib/agent/images";
import { funnelActor, readBrand, siteFor } from "@/lib/funnel-context";
import { advance, applyAnswers, readFunnel, updateFunnel } from "@/lib/funnel";
import { planWeek } from "@/lib/funnel-plan";
import { track } from "@/lib/track";

/**
 * The payoff screen of the free half of the funnel: one finished post with its
 * picture.
 *
 * The post is a map of the member's field: the companies in it, theirs among
 * them, and what customers say about each, read from public reviews by the
 * research that ran while the questions were answered. At this point we know
 * the website and nothing the member has done, so this is the one post we can
 * write without inventing anything.
 *
 * The draft and the picture run side by side. The picture is prompted from
 * the field rather than from the finished text, so it does not wait on it.
 * The seven ideas the board fills with are written after the response, since
 * the offer does not show them and the ideas step writes them again if they
 * never land.
 *
 * Idempotent. A sample that exists is returned as it is, because a reload on
 * the waiting screen must not write, draw and charge a second one.
 */
export const runtime = "nodejs";
export const maxDuration = 300;

export async function POST() {
  const actor = await funnelActor();
  if (!actor) return Response.json({ error: "Sign in first." }, { status: 401 });

  const profileId = actor.profile.id;
  const db = getDb();

  const funnel = await readFunnel(profileId);
  if (!funnel) return Response.json({ error: "Start from your website." }, { status: 409 });
  if (funnel.sampleCardId) return Response.json({ ok: true });

  const [brd] = await db.select().from(boardTable).where(eq(boardTable.profileId, profileId)).limit(1);
  if (!brd) return Response.json({ error: "No board for this profile." }, { status: 404 });

  const brand = await readBrand(profileId);
  if (brand.themes.length === 0) {
    return Response.json(
      { error: "Your website is still being read. Give it a few more seconds." },
      { status: 409 },
    );
  }

  const site = await siteFor(funnel.site, actor.profile.name);
  if (!site.ok) return Response.json({ error: site.error }, { status: 400 });

  const started = Date.now();

  // Research normally landed while the questions were answered. If the member
  // reloaded before it did, it runs here, and it has its own fallback. Research
  // stored before the market map had another shape and is read again.
  let research: Research | null = isResearch(funnel.research) ? funnel.research : null;
  if (!research) {
    try {
      research = await researchCompetitors({ site, profileId, personName: actor.profile.name });
      const fresh = research;
      await updateFunnel(profileId, (f) => ({ ...f, research: fresh }));
    } catch (cause) {
      console.error("[onboarding] research in sample failed:", cause);
    }
  }
  if (!research) {
    after(() =>
      track("sample_failed", { distinctId: actor.distinctId, memberId: actor.memberId }),
    );
    return Response.json(
      { error: "We could not read your market. Try again, it takes about half a minute." },
      { status: 502 },
    );
  }

  const applied = await applyAnswers(profileId, funnel, brand.principles);
  const principles = { voice: applied.voice, visual: applied.visual, format: applied.format };
  const theme = brand.themes[0];
  const idea = `Who operates in ${research.field}, and what their customers say about each.`;

  // The id is chosen here so the picture can be stored under it before the
  // row exists. The row is written once, with both halves, so a failed draft
  // leaves nothing half made on the board.
  const cardId = randomUUID();
  const names = research.companies.map((c) => c.name).join(", ");
  const [drafted, drawn] = await Promise.allSettled([
    generateMarketPost({
      research,
      principles,
      goal: applied.goal,
      siteUrl: brd.siteUrl,
      profileId,
    }),
    generateImage({
      profileId,
      cardId,
      postText: `A LinkedIn post comparing the companies in ${research.field}: ${names}. What their customers like about each and what they do not.`,
      visualPrinciple: principles.visual,
    }),
  ]);

  if (drafted.status === "rejected") {
    console.error("[onboarding] sample failed:", drafted.reason);
    after(() =>
      track("sample_failed", { distinctId: actor.distinctId, memberId: actor.memberId }),
    );
    return Response.json(
      { error: "Your first post did not write. Try again, it takes about half a minute." },
      { status: 502 },
    );
  }

  // A picture that failed leaves the card in Draft with its text, which is
  // still a post worth showing. The offer screen draws it without an image.
  const image = drawn.status === "fulfilled" && drawn.value.ok ? drawn.value : null;
  await db.insert(cardTable).values({
    id: cardId,
    boardId: brd.id,
    idea,
    kind: "data",
    themeId: theme.id,
    draftText: drafted.value,
    state: image ? "image" : "draft",
    imageUrl: image?.url ?? null,
    imageAlt: image?.prompt ?? null,
    position: 0,
  });

  await updateFunnel(profileId, (f) => advance({ ...f, sampleCardId: cardId }, "offer"));

  const market = research;
  after(async () => {
    await track("sample_ready", {
      distinctId: actor.distinctId,
      memberId: actor.memberId,
      seconds: Math.round((Date.now() - started) / 1000),
      image: Boolean(image),
      companies: market.companies.length,
      reviewed: market.companies.filter((c) => c.praised || c.criticised).length,
      searched: market.searched,
      goal: applied.goal,
    });
    // Not fatal. The ideas step writes them again if the column is empty.
    try {
      await planWeek({
        boardId: brd.id,
        profileId,
        principles,
        themes: brand.themes,
        goal: applied.goal,
        siteUrl: brd.siteUrl,
        siteText: site.text,
      });
    } catch (cause) {
      console.error("[onboarding] plan failed:", cause);
    }
  });

  return Response.json({ ok: true });
}
