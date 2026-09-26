"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { skipOffer, startTrial, trackView } from "@/app/onboarding/actions";
import { QuestionScreen } from "@/components/onboarding/question-screen";
import { SKIP_QUESTION, type Answer } from "@/lib/funnel-steps";

/**
 * The right half of the offer: the price and its button, or, once "Not now"
 * is pressed, the one question about why. The post stays on the left the
 * whole time, so the member answers while looking at what they passed on.
 */
export function OfferChoice({
  cta,
  trialLine,
  checkoutError,
  cancelled,
}: {
  cta: string;
  trialLine: string;
  checkoutError: string | null;
  cancelled: boolean;
}) {
  const [asking, setAsking] = useState(false);
  const [pending, start] = useTransition();
  const question = useRef<HTMLDivElement>(null);

  // On a phone the post sits above this column, so the question would open
  // below the fold of whoever pressed the link.
  useEffect(() => {
    if (asking) question.current?.scrollIntoView({ block: "start", behavior: "smooth" });
  }, [asking]);

  const leave = (answer: Answer | null) => start(() => skipOffer(answer));

  if (asking) {
    return (
      <div ref={question} className="scroll-mt-6">
        <QuestionScreen question={SKIP_QUESTION} busy={pending} onAnswer={leave} />
        <button
          type="button"
          disabled={pending}
          onClick={() => leave(null)}
          className="mt-8 text-[13px] text-ink-2 underline"
        >
          Go to the board
        </button>
      </div>
    );
  }

  return (
    <section>
      <h1 className="text-[clamp(30px,4.2vw,44px)] font-semibold leading-[1.04] tracking-[-0.03em]">
        Your first post is ready.
      </h1>
      <p className="mt-4 text-ink-2">
        We write six more this week. You approve each one before it posts.
      </p>

      <form action={startTrial} className="mt-8">
        <button
          type="submit"
          className="pill btn-ink w-full bg-accent px-6 py-[16px] text-[17px] font-semibold text-accent-ink sm:w-auto"
        >
          {cta}
        </button>
        <p className="mt-3 text-[13px] text-ink-2">{trialLine}</p>
      </form>

      {checkoutError ? (
        <p role="alert" className="mt-4 text-[15px]">
          {checkoutError}
        </p>
      ) : null}
      {cancelled ? (
        <p className="mt-4 text-[15px]">Checkout closed. Nothing was charged.</p>
      ) : null}

      <button
        type="button"
        onClick={() => {
          setAsking(true);
          void trackView("offer_skip");
        }}
        className="mt-10 text-[13px] text-ink-2 underline"
      >
        Not now
      </button>
    </section>
  );
}
