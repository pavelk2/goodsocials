"use server";

import { and, eq, notInArray } from "drizzle-orm";
import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import { getDb } from "@/db";
import { board as boardTable, brandPrinciple, card as cardTable } from "@/db/schema";
import { startCheckout } from "@/lib/billing";
import {
  NEXT_STEP,
  OTHER_MAX,
  QUESTIONS,
  REFINE_QUESTION,
  advance,
  answerLine,
  appendLine,
  isQuestionStep,
  readFunnel,
  updateFunnel,
  type Answer,
} from "@/lib/funnel";
import { funnelActor, readBrand } from "@/lib/funnel-context";
import { PLAN_COOKIE, planFromSlug } from "@/lib/plans";
import { anonId, track } from "@/lib/track";

/**
 * Everything a funnel screen does that is not a model call. Each action moves
 * the member one step and sends the event that says they took it, so the
 * PostHog funnel and the stored step can never disagree about where somebody
 * stopped.
 */

export type ActionResult = { ok: true } | { ok: false; error: string };

/** One answer to one question. The step is the question's own. */
export async function saveAnswer(step: string, answer: Answer): Promise<ActionResult> {
  const actor = await funnelActor();
  if (!actor) return { ok: false, error: "Sign in first." };
  if (!isQuestionStep(step)) return { ok: false, error: "That question does not exist." };

  const question = QUESTIONS[step];
  const valid =
    answer.choice === "other" || question.options.some((o) => o.id === answer.choice);
  if (!valid) return { ok: false, error: "Pick one of the options." };

  const text = answer.text?.trim().slice(0, OTHER_MAX);
  if (answer.choice === "other" && !text) {
    return { ok: false, error: "Write a few words, or pick one of the options." };
  }
  const clean: Answer = answer.choice === "other" ? { choice: "other", text } : { choice: answer.choice };

  await updateFunnel(actor.profile.id, (f) =>
    advance({ ...f, answers: { ...f.answers, [step]: clean } }, NEXT_STEP[step]),
  );

  // The refine answer lands after research and after the sample, so nothing
  // can overwrite it, and it goes straight into the visual principle. The
  // first three wait for the sample route, which writes them all at once.
  if (step === "refine") {
    const line = answerLine(REFINE_QUESTION, clean);
    if (line) {
      const { principles } = await readBrand(actor.profile.id);
      const visual = appendLine(principles.visual, line);
      await getDb()
        .update(brandPrinciple)
        .set({ text: visual, updatedAt: new Date() })
        .where(
          and(eq(brandPrinciple.profileId, actor.profile.id), eq(brandPrinciple.kind, "visual")),
        );
    }
  }

  await track("onboarding_step_completed", {
    distinctId: actor.distinctId,
    memberId: actor.memberId,
    step,
    choice: clean.choice,
  });
  return { ok: true };
}

/** A screen was shown. The difference between viewed and completed is the drop off. */
export async function trackView(step: string): Promise<void> {
  const actor = await funnelActor();
  if (step === "signin") {
    await track("signin_viewed", { distinctId: actor?.distinctId ?? (await anonId()) });
    return;
  }
  if (!actor) return;
  await track("onboarding_step_viewed", {
    distinctId: actor.distinctId,
    memberId: actor.memberId,
    step: step.slice(0, 32),
  });
}

/**
 * The paywall's one button. Stripe hosts the card form and comes back to the
 * next question, not to settings, so paying is a step in the funnel rather
 * than the end of it.
 */
export async function startTrial(): Promise<void> {
  const actor = await funnelActor();
  if (!actor) redirect("/signin");

  const plan = planFromSlug((await cookies()).get(PLAN_COOKIE)?.value);
  const result = await startCheckout({
    account: actor.account,
    plan: plan.slug,
    origin: await origin(),
    returnTo: {
      success: "/onboarding?checkout=done&session={CHECKOUT_SESSION_ID}",
      cancel: "/onboarding?checkout=cancelled",
    },
  });

  await track("checkout_started", {
    distinctId: actor.distinctId,
    memberId: actor.memberId,
    plan: plan.slug,
    ok: result.ok,
  });

  if (!result.ok) {
    redirect(`/onboarding?checkout=error&why=${encodeURIComponent(result.error.slice(0, 200))}`);
  }
  redirect(result.value);
}

/**
 * The quiet way past the paywall. The board still opens and nothing publishes
 * until a plan starts, which the board banner says. A member who leaves here
 * is still in the product; a member with no way past the paywall is gone.
 */
export async function skipOffer(): Promise<void> {
  const actor = await funnelActor();
  if (!actor) redirect("/signin");
  await updateFunnel(actor.profile.id, (f) => advance(f, "done"));
  await track("offer_skipped", { distinctId: actor.distinctId, memberId: actor.memberId });
  redirect("/board");
}

/**
 * The last question: which ideas to write first. The picked ones stay in Idea,
 * where the board drafts the top of the column without being asked. The rest
 * are rejected rather than deleted, so the log keeps what the member turned
 * down, which is what the next planning run should learn from.
 */
export async function pickIdeas(picked: string[], own: string): Promise<ActionResult> {
  const actor = await funnelActor();
  if (!actor) return { ok: false, error: "Sign in first." };

  const db = getDb();
  const [brd] = await db
    .select({ id: boardTable.id })
    .from(boardTable)
    .where(eq(boardTable.profileId, actor.profile.id))
    .limit(1);
  if (!brd) return { ok: false, error: "No board for this profile." };

  const funnel = await readFunnel(actor.profile.id);
  const keep = picked.filter((id) => typeof id === "string").slice(0, 20);
  const ownIdea = own.trim().slice(0, OTHER_MAX);
  if (keep.length === 0 && !ownIdea) {
    return { ok: false, error: "Pick at least one, or write your own." };
  }

  const protect = funnel?.sampleCardId ? [...keep, funnel.sampleCardId] : keep;
  await db
    .update(cardTable)
    .set({ state: "rejected", updatedAt: new Date() })
    .where(
      and(
        eq(cardTable.boardId, brd.id),
        eq(cardTable.state, "idea"),
        protect.length > 0 ? notInArray(cardTable.id, protect) : undefined,
      ),
    );

  if (ownIdea) {
    await db.insert(cardTable).values({ boardId: brd.id, idea: ownIdea, kind: "finding", position: 0 });
  }

  await updateFunnel(actor.profile.id, (f) => advance(f, "done"));
  await track("onboarding_finished", {
    distinctId: actor.distinctId,
    memberId: actor.memberId,
    picked: keep.length,
    own: Boolean(ownIdea),
  });
  redirect("/board");
}

async function origin(): Promise<string> {
  const head = await headers();
  const host = head.get("x-forwarded-host") ?? head.get("host");
  if (host) return `${head.get("x-forwarded-proto") ?? "https"}://${host}`;
  return process.env.AUTH_URL ?? "https://goodsocials.co";
}
