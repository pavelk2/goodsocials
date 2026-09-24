import { randomUUID } from "node:crypto";
import { eq } from "drizzle-orm";
import { after } from "next/server";
import { getDb } from "@/db";
import { board as boardTable, card as cardTable } from "@/db/schema";
import {
  isResearch,
  researchCompetitors,
  withDefaults,
  type Research,
} from "@/lib/agent/competitors";
import {
  generateSamplePost,
  sampleContent,
  sampleIdea,
  type SampleContent,
} from "@/lib/agent/drafts";
import { generateImage } from "@/lib/agent/images";
import { funnelActor, readBrand, siteFor } from "@/lib/funnel-context";
import { advance, applyAnswers, contentFor, readFunnel, updateFunnel } from "@/lib/funnel";
import { planWeek } from "@/lib/funnel-plan";
import { track } from "@/lib/track";

/**
 * The payoff screen of the free half of the funnel: one finished post with its
 * picture.
 *
 * The post is about what the member picked on the content screen: a map of
 * their field and what customers say about each company, the jobs customers
 * hire products in the field to do, or how the field started. All three are
 * read from public sources by the research that ran while the questions were
 * answered. At this point we know the website and nothing the member has
 * done, so these are the posts we can write without inventing anything. When
 * the research found no jobs or no history, the post is the market map.
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
  let research: Research | null = isResearch(funnel.research) ? withDefaults(funnel.research) : null;
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
  const asked = contentFor(funnel.answers.content);
  const content = sampleContent(asked, research);
  const idea = sampleIdea(content, research.field);

  // The id is chosen here so the picture can be stored under it before the
  // row exists. The row is written once, with both halves, so a failed draft
  // leaves nothing half made on the board.
  const cardId = randomUUID();
  const picture = pictureBrief(content, research);
  const [drafted, drawn] = await Promise.allSettled([
    generateSamplePost({
      content,
      research,
      principles,
      goal: applied.goal,
      siteUrl: brd.siteUrl,
      profileId,
    }),
    generateImage({
      profileId,
      cardId,
      postText: picture,
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
    kind: content === "competitors" ? "data" : "finding",
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
      content,
      asked,
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

/** What the picture shows, prompted from the research so it does not wait on the text. */
function pictureBrief(content: SampleContent, research: Research): string {
  if (content === "jobs") {
    return `A LinkedIn post about why people buy in ${research.field}: ${research.jobs.map((j) => j.job).join("; ")}.`;
  }
  if (content === "history") {
    return `A LinkedIn post about how ${research.field} started and changed: ${research.history.map((m) => `${m.when}, ${m.what}`).join("; ")}.`;
  }
  const names = research.companies.map((c) => c.name).join(", ");
  return `A LinkedIn post comparing the companies in ${research.field}: ${names}. What their customers like about each and what they do not.`;
}
