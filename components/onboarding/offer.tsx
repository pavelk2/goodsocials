import { FunnelHeader } from "@/components/onboarding/funnel-header";
import { OfferChoice } from "@/components/onboarding/offer-choice";
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

        <OfferChoice
          cta={plan.cta}
          trialLine={TRIAL_LINE}
          checkoutError={checkoutError}
          cancelled={cancelled}
        />
      </main>
    </>
  );
}
