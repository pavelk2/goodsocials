import { and, asc, eq } from "drizzle-orm";
import Script from "next/script";
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

const openAiAdsPixelId = process.env.NEXT_PUBLIC_OPENAI_ADS_PIXEL_ID;

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
  let trialStartedEventId: string | null = null;

  let funnel: Funnel = parseFunnel(view.board.funnel) ?? (await updateFunnel(profileId, () => emptyFunnel()));

  // Stripe is the source of truth for the trial. Only emit the OpenAI
  // conversion after Stripe confirms this checkout session is complete.
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
      trialStartedEventId = params.session;
      if (actor) {
        await track("checkout_completed", {
          distinctId: actor.distinctId,
          memberId: actor.memberId,
          plan: session.value.metadata?.plan ?? null,
        });
      }
    }
  }

  if (funnel.step === "offer" && canPublish(access.account)) {
    funnel = await updateFunnel(profileId, (f) => advance(f, "refine"));
  }

  if (funnel.step === "done") redirect("/board");

  const name = seatName(seat);
  const db = getDb();
  const measurement = trialStartedEventId && openAiAdsPixelId ? (
    <Script id="openai-ads-trial-started">
      {`window.oaiq&&window.oaiq("measure","trial_started",{type:"plan_enrollment",plan_id:"pro_trial"},{event_id:${JSON.stringify(trialStartedEventId)}});`}
    </Script>
  ) : null;

  if (funnel.step === "offer" || funnel.step === "refine") {
    const [sample] = funnel.sampleCardId
      ? await db.select().from(cardTable).where(eq(cardTable.id, funnel.sampleCardId)).limit(1)
      : [];

    if (sample?.draftText && funnel.step === "offer") {
      if (params.checkout === "cancelled" && actor) {
        await track("checkout_cancelled", { distinctId: actor.distinctId, memberId: actor.memberId });
      }

      return (
        <>
          <Offer
            name={name}
            avatarUrl={seat.profile.avatarUrl}
            post={{ text: sample.draftText, imageUrl: sample.imageUrl, imageAlt: sample.imageAlt }}
            plan={planFromSlug((await cookies()).get(PLAN_COOKIE)?.value)}
            checkoutError={params.checkout === "error" ? params.why ?? "Checkout did not open." : null}
            cancelled={params.checkout === "cancelled"}
          />
          {measurement}
        </>
      );
    }

    if (!sample && funnel.step === "offer") {
      funnel = await updateFunnel(profileId, (f) => ({ ...f, sampleCardId: undefined }));
    }

    if (funnel.step === "refine") {
      return (
        <>
          {measurement}
          <TrackView step="refine" />
          <Refine
            name={name}
            avatarUrl={seat.profile.avatarUrl}
            text={sample?.draftText ?? null}
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
        {measurement}
        <TrackView step="ideas" />
        <PickIdeas ideas={ideas} />
      </>
    );
  }

  const step = funnel.step === "offer" ? "sample" : funnel.step;
  const brandReady = view.brandWritten && view.themes.length > 0;

  return (
    <>
      {measurement}
      <FunnelFlow
        initial={{ ...funnel, step }}
        emailDomain={domainFromEmail(seat.profile.email ?? access.account.email)}
        brandReady={brandReady}
      />
    </>
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
