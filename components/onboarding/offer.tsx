import { skipOffer, startTrial } from "@/app/onboarding/actions";
import { FunnelHeader } from "@/components/onboarding/funnel-header";
import { PostPreview } from "@/components/onboarding/post-preview";
import { TrackView } from "@/components/onboarding/track-view";
import { TRIAL_LINE, type Plan } from "@/lib/plans";

/**
 * The paywall is the post. Their first post as the feed will show it, one
 * sentence, one button with the price in it. Nothing to compare, nothing to
 * read before deciding: the post is the argument.
 */
export function Offer({
  name,
  avatarUrl,
  post,
  plan,
  checkoutError,
  cancelled,
}: {
  name: string;
  avatarUrl: string | null;
  post: { text: string; imageUrl: string | null; imageAlt: string | null };
  plan: Plan;
  checkoutError: string | null;
  cancelled: boolean;
}) {
  return (
    <>
      <TrackView step="offer" />
      <FunnelHeader />
      <main className="mx-auto grid w-full max-w-[1000px] items-center gap-12 px-6 pb-24 pt-12 lg:grid-cols-[minmax(0,460px)_minmax(0,1fr)] lg:gap-16">
        <PostPreview
          name={name}
          avatarUrl={avatarUrl}
          text={post.text}
          imageUrl={post.imageUrl}
          imageAlt={post.imageAlt}
        />

        <section>
          <h1 className="text-[clamp(30px,4.2vw,44px)] font-semibold leading-[1.04] tracking-[-0.03em]">
            Your first post is ready.
          </h1>
          <p className="mt-4 text-ink-2">Start and we write six more for this week.</p>

          <form action={startTrial} className="mt-8">
            <button
              type="submit"
              className="pill btn-ink w-full bg-accent px-6 py-[16px] text-[17px] font-semibold text-accent-ink sm:w-auto"
            >
              {plan.cta}
            </button>
            <p className="mt-3 text-[13px] text-ink-2">{TRIAL_LINE}</p>
          </form>

          {checkoutError ? (
            <p role="alert" className="mt-4 text-[15px]">
              {checkoutError}
            </p>
          ) : null}
          {cancelled ? (
            <p className="mt-4 text-[15px]">Checkout closed. Nothing was charged.</p>
          ) : null}

          <form action={skipOffer} className="mt-10">
            <button type="submit" className="text-[13px] text-ink-2 underline">
              Not now
            </button>
          </form>
        </section>
      </main>
    </>
  );
}
