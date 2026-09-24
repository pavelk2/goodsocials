import { eq } from "drizzle-orm";
import { after } from "next/server";
import { getDb } from "@/db";
import { board as boardTable, card as cardTable } from "@/db/schema";
import { researchCompetitors, type Research } from "@/lib/agent/competitors";
import { generateDraft } from "@/lib/agent/drafts";
import { generateImage } from "@/lib/agent/images";
import { funnelActor, readBrand, siteFor } from "@/lib/funnel-context";
import { advance, applyAnswers, readFunnel, updateFunnel } from "@/lib/funnel";
import { planWeek } from "@/lib/funnel-plan";
import { track } from "@/lib/track";

/**
 * The payoff screen of the free half of the funnel: one finished post with its
 * picture, and the week it starts planned behind it.
 *
 * Two jobs run side by side. The sample is a draft and then its image, written
 * from the opening idea competitor research aimed at the gap. The plan is the
 * seven ideas the board fills with. Both are here rather than after payment so
 * the offer can show the real week, and so a member coming back from Stripe
 * finds their ideas already waiting instead of another minute of progress rows.
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

  // Competitor research normally landed while the questions were answered. If
  // the member reloaded before it did, it runs here, and it has its own
  // fallback, so this cannot be the reason a sample never appears.
  let research: Research | null = funnel.research ?? null;
  if (!research) {
    try {
      research = await researchCompetitors({ site, profileId, personName: actor.profile.name });
      await updateFunnel(profileId, (f) => ({ ...f, research }));
    } catch (cause) {
      console.error("[onboarding] research in sample failed:", cause);
    }
  }

  const applied = await applyAnswers(profileId, funnel, brand.principles);
  const principles = { voice: applied.voice, visual: applied.visual, format: applied.format };
  const theme = brand.themes[0];

  const sample = (async () => {
    const idea =
      research?.opening.idea ??
      `A method from ${theme.title.toLowerCase()}: the steps this business follows, in the order that matters.`;
    const kind = research?.opening.kind ?? "framework";

    const text = await generateDraft({
      idea,
      kind,
      theme,
      principles,
      goal: applied.goal,
      siteUrl: brd.siteUrl,
      profileId,
    });

    const [row] = await db
      .insert(cardTable)
      .values({ boardId: brd.id, idea, kind, themeId: theme.id, draftText: text, state: "draft", position: 0 })
      .returning({ id: cardTable.id });

    const image = await generateImage({
      profileId,
      cardId: row.id,
      postText: text,
      visualPrinciple: principles.visual,
    });

    // A picture that failed leaves the card in Draft with its text, which is
    // still a post worth showing. The offer screen draws it without an image.
    if (image.ok) {
      await db
        .update(cardTable)
        .set({ state: "image", imageUrl: image.url, imageAlt: image.prompt, updatedAt: new Date() })
        .where(eq(cardTable.id, row.id));
    }
    return { cardId: row.id, image: image.ok };
  })();

  const plan = planWeek({
    boardId: brd.id,
    profileId,
    principles,
    themes: brand.themes,
    goal: applied.goal,
    siteUrl: brd.siteUrl,
    siteText: site.text,
  });

  const [sampled, planned] = await Promise.allSettled([sample, plan]);

  if (planned.status === "rejected") {
    // Not fatal. The ideas step writes them again if the column is empty.
    console.error("[onboarding] plan failed:", planned.reason);
  }

  if (sampled.status === "rejected") {
    console.error("[onboarding] sample failed:", sampled.reason);
    after(() =>
      track("sample_failed", { distinctId: actor.distinctId, memberId: actor.memberId }),
    );
    return Response.json(
      { error: "Your first post did not write. Try again, it takes about a minute." },
      { status: 502 },
    );
  }

  await updateFunnel(profileId, (f) =>
    advance({ ...f, sampleCardId: sampled.value.cardId }, "offer"),
  );

  after(() =>
    track("sample_ready", {
      distinctId: actor.distinctId,
      memberId: actor.memberId,
      seconds: Math.round((Date.now() - started) / 1000),
      image: sampled.value.image,
      ideas: planned.status === "fulfilled" ? planned.value : 0,
      goal: applied.goal,
    }),
  );

  return Response.json({ ok: true });
}
