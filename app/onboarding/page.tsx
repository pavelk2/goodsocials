import { and, asc, eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { getDb } from "@/db";
import { card as cardTable, theme as themeTable } from "@/db/schema";
import { PickIdeas, Refine } from "@/components/onboarding/after-payment";
import { FunnelFlow } from "@/components/onboarding/funnel-flow";
import { Offer } from "@/components/onboarding/offer";
import { TrackView } from "@/components/onboarding/track-view";
import { canPublish } from "@/lib/billing";
import { resolveEntry, signInHref } from "@/lib/entry";
import {
  advance,
  domainFromEmail,
  emptyFunnel,
  parseFunnel,
  updateFunnel,
  type Funnel,
} from "@/lib/funnel";
import { funnelActor, readBrand, siteFor } from "@/lib/funnel-context";
import { planWeek } from "@/lib/funnel-plan";
import { goalFor } from "@/lib/funnel-steps";
import { PLAN_COOKIE, planFromSlug } from "@/lib/plans";
import { seatName } from "@/lib/profiles";
import { callStripe } from "@/lib/stripe/client";
import { track } from "@/lib/track";

export const metadata = { title: "Your first post" };
export const maxDuration = 120;

/**
 * The funnel, one screen at a time. The step is stored on the board, so this
 * page is where a member lands whether they are new, came back tomorrow, or
 * came back from Stripe, and it opens the screen they are on.
 */
export default async function OnboardingPage({
  searchParams,
}: {
  searchParams: Promise<{ checkout?: string; session?: string; why?: string }>;
}) {
  const entry = await resolveEntry();

  if (entry.at === "signed-out") redirect(signInHref("signed-out"));
  if (entry.at === "no-account") redirect(signInHref("no-account"));
  if (entry.at === "no-board") redirect(signInHref("no-board"));
  if (entry.at === "no-seat") redirect("/settings");
  if (entry.at === "board") redirect("/board");

  const { access, seat, view } = entry;
  const profileId = seat.profile.id;
  const params = await searchParams;
  const actor = await funnelActor();

  let funnel: Funnel = parseFunnel(view.board.funnel) ?? (await updateFunnel(profileId, () => emptyFunnel()));

  // Back from Stripe. The webhook owns the subscription; this only asks
  // Stripe whether the checkout it came back from completed, to move the
  // member on and to count the payment where the funnel can see it.
  if (params.checkout === "done" && params.session && funnel.step === "offer") {
    const session = await callStripe("checkout.sessions.retrieve", (stripe) =>
      stripe.checkout.sessions.retrieve(params.session as string),
    );
    if (
      session.ok &&
      session.value.status === "complete" &&
      session.value.client_reference_id === access.account.id
    ) {
      funnel = await updateFunnel(profileId, (f) => advance(f, "refine"));
      if (actor) {
        await track("checkout_completed", {
          distinctId: actor.distinctId,
          memberId: actor.memberId,
          plan: session.value.metadata?.plan ?? null,
        });
      }
    }
  }

  // An account that already pays, an agency adding a client or a member who
  // subscribed before, has nothing to buy. The paywall is skipped, not shown.
  if (funnel.step === "offer" && canPublish(access.account)) {
    funnel = await updateFunnel(profileId, (f) => advance(f, "refine"));
  }

  if (funnel.step === "done") redirect("/board");

  const name = seatName(seat);
  const db = getDb();

  if (funnel.step === "offer" || funnel.step === "refine") {
    const [sample] = funnel.sampleCardId
      ? await db.select().from(cardTable).where(eq(cardTable.id, funnel.sampleCardId)).limit(1)
      : [];

    if (sample?.draftText && funnel.step === "offer") {
      if (params.checkout === "cancelled" && actor) {
        await track("checkout_cancelled", { distinctId: actor.distinctId, memberId: actor.memberId });
      }

      return (
        <Offer
          name={name}
          avatarUrl={seat.profile.avatarUrl}
          post={{ text: sample.draftText, imageUrl: sample.imageUrl, imageAlt: sample.imageAlt }}
          plan={planFromSlug((await cookies()).get(PLAN_COOKIE)?.value)}
          checkoutError={params.checkout === "error" ? params.why ?? "Checkout did not open." : null}
          cancelled={params.checkout === "cancelled"}
        />
      );
    }

    // The card the sample lived on is gone, so the flow writes a new one.
    if (!sample && funnel.step === "offer") {
      funnel = await updateFunnel(profileId, (f) => ({ ...f, sampleCardId: undefined }));
    }

    if (funnel.step === "refine") {
      return (
        <>
          <TrackView step="refine" />
          <Refine
            imageUrl={sample?.imageUrl ?? null}
            imageAlt={sample?.imageAlt ?? null}
            initial={funnel.answers.refine}
          />
        </>
      );
    }
  }

  if (funnel.step === "ideas") {
    let ideas = await ideaRows(view.board.id);

    // The plan is written beside the sample. If that run failed, it is written
    // here, once, so the last question never opens on an empty list.
    if (ideas.length === 0) {
      const brand = await readBrand(profileId);
      const site = await siteFor(funnel.site, seat.profile.name);
      if (site.ok && brand.themes.length > 0) {
        try {
          await planWeek({
            boardId: view.board.id,
            profileId,
            principles: brand.principles,
            themes: brand.themes,
            goal: goalFor(funnel.answers.goal),
            siteUrl: view.board.siteUrl,
            siteText: site.text,
          });
          ideas = await ideaRows(view.board.id);
        } catch (cause) {
          console.error("[onboarding] plan on the ideas step failed:", cause);
        }
      }
    }

    return (
      <>
        <TrackView step="ideas" />
        <PickIdeas ideas={ideas} />
      </>
    );
  }

  // Everything before the offer, and an offer whose sample went missing,
  // which the flow writes again.
  const step = funnel.step === "offer" ? "sample" : funnel.step;
  const brandReady = view.brandWritten && view.themes.length > 0;

  return (
    <FunnelFlow
      initial={{ ...funnel, step }}
      emailDomain={domainFromEmail(seat.profile.email ?? access.account.email)}
      brandReady={brandReady}
    />
  );
}

async function ideaRows(boardId: string) {
  return getDb()
    .select({
      id: cardTable.id,
      idea: cardTable.idea,
      title: cardTable.title,
      kind: cardTable.kind,
      theme: themeTable.title,
      needs: cardTable.needs,
    })
    .from(cardTable)
    .leftJoin(themeTable, eq(themeTable.id, cardTable.themeId))
    .where(and(eq(cardTable.boardId, boardId), eq(cardTable.state, "idea")))
    .orderBy(asc(cardTable.position));
}
