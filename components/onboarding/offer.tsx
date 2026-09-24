import { skipOffer, startTrial } from "@/app/onboarding/actions";
import { FunnelHeader } from "@/components/onboarding/funnel-header";
import { PostPreview } from "@/components/onboarding/post-preview";
import { TrackView } from "@/components/onboarding/track-view";
import { KIND_LABEL, type PostKind } from "@/lib/post-kind";
import { TRIAL_DAYS, type Plan } from "@/lib/plans";

/**
 * The paywall, built around the thing the member came for. Their post sits on
 * the left exactly as it will sit in the feed. On the right, the week it
 * starts: day one is this post, days two to seven are planned and named by
 * shape and theme, and the button that writes them says the price.
 *
 * The six are named and not shown. The shapes and the themes are real, and
 * they are what a member is deciding on; the finished text is what they pay
 * for, and it is written on the board the moment they do.
 */
export type OfferDay = { kind: PostKind; theme: string | null };

export function Offer({
  name,
  avatarUrl,
  post,
  week,
  competitors,
  gap,
  plan,
  checkoutError,
  cancelled,
}: {
  name: string;
  avatarUrl: string | null;
  post: { text: string; imageUrl: string | null; imageAlt: string | null };
  week: OfferDay[];
  competitors: { name: string; posts: string }[];
  gap: string | null;
  plan: Plan;
  checkoutError: string | null;
  cancelled: boolean;
}) {
  const days = nextDays(7);

  return (
    <>
      <TrackView step="offer" />
      <FunnelHeader label="Your first post" />
      <main className="mx-auto grid w-full max-w-[1080px] gap-12 px-6 pb-24 pt-12 lg:grid-cols-[minmax(0,480px)_minmax(0,1fr)] lg:gap-16">
        <div className="lg:sticky lg:top-8 lg:self-start">
          <PostPreview
            name={name}
            avatarUrl={avatarUrl}
            text={post.text}
            imageUrl={post.imageUrl}
            imageAlt={post.imageAlt}
          />
        </div>

        <section>
          <h1 className="max-w-[20ch] text-[clamp(30px,4.2vw,44px)] font-semibold leading-[1.04] tracking-[-0.03em]">
            <span>Your first post is ready.</span>{" "}
            <span className="text-ink-3">
              Six more are planned for the next seven days.
            </span>
          </h1>

          <ul className="mt-10">
            {days.map((day, i) => {
              const planned = i === 0 ? null : week[i - 1];
              return (
                <li
                  key={day}
                  className="flex items-baseline justify-between gap-6 border-b border-hairline py-[12px] first:border-t"
                >
                  <span className="num w-[92px] shrink-0 text-[13px] text-ink-2">{day}</span>
                  <span className="min-w-0 flex-1">
                    {i === 0 ? (
                      <span className="font-medium">This post</span>
                    ) : planned ? (
                      <>
                        <span className="font-medium">{KIND_LABEL[planned.kind]}</span>
                        {planned.theme ? (
                          <span className="text-ink-2"> · {planned.theme}</span>
                        ) : null}
                      </>
                    ) : (
                      <span className="text-ink-2">Planned when you start</span>
                    )}
                  </span>
                  {i === 0 ? (
                    <span className="shrink-0 text-[13px] text-ink-2">Ready</span>
                  ) : null}
                </li>
              );
            })}
          </ul>

          <p className="mt-4 text-[15px] text-ink-2">
            Start and we write the six. You approve each one and it publishes at 09:00.
          </p>

          <form action={startTrial} className="mt-8">
            <button
              type="submit"
              className="pill btn-ink w-full bg-accent px-6 py-[16px] text-[17px] font-semibold text-accent-ink sm:w-auto"
            >
              {plan.cta}
            </button>
            <p className="num mt-3 text-[13px] text-ink-2">
              {TRIAL_DAYS} days free. Cancel before day {TRIAL_DAYS} and you pay nothing, no
              questions asked.
            </p>
          </form>

          {checkoutError ? (
            <p role="alert" className="mt-4 text-[15px]">
              {checkoutError}
            </p>
          ) : null}
          {cancelled ? (
            <p className="mt-4 text-[15px]">Checkout closed. Nothing was charged.</p>
          ) : null}

          <ul className="mt-12 text-[15px]">
            <li className="border-t border-hairline py-[12px]">
              <span className="font-medium">You approve every post.</span>{" "}
              <span className="text-ink-2">Nothing reaches your feed until you do.</span>
            </li>
            <li className="border-t border-hairline py-[12px]">
              <span className="font-medium">Corrections stick.</span>{" "}
              <span className="text-ink-2">
                A comment on one post rewrites it and changes every post after it.
              </span>
            </li>
            <li className="border-y border-hairline py-[12px]">
              <span className="font-medium">Close to daily.</span>{" "}
              <span className="text-ink-2">
                Approved posts go out at 09:00 your time, close to daily, for {plan.priceLine}.
              </span>
            </li>
          </ul>

          {competitors.length ? (
            <div className="mt-12">
              <h2 className="text-[13px] font-medium text-ink-2">Who else writes to your buyers</h2>
              <ul className="mt-2 text-[15px]">
                {competitors.map((c) => (
                  <li key={c.name} className="border-b border-hairline py-[12px]">
                    <span className="font-medium">{c.name}</span>{" "}
                    <span className="text-ink-2">{c.posts}</span>
                  </li>
                ))}
              </ul>
              {gap ? (
                <p className="mt-4 text-[15px]">
                  <span className="font-medium">Your post is aimed here.</span>{" "}
                  <span className="text-ink-2">{gap}</span>
                </p>
              ) : null}
            </div>
          ) : null}

          <form action={skipOffer} className="mt-12">
            <button type="submit" className="text-[13px] text-ink-2 underline">
              Not now, show me the board
            </button>
          </form>
        </section>
      </main>
    </>
  );
}

/** "Thu 25 Sep", starting tomorrow, because nothing publishes today. */
function nextDays(count: number): string[] {
  const format = new Intl.DateTimeFormat("en-GB", {
    weekday: "short",
    day: "numeric",
    month: "short",
    timeZone: "UTC",
  });
  const start = Date.now();
  return Array.from({ length: count }, (_, i) =>
    format.format(new Date(start + (i + 1) * 24 * 60 * 60 * 1000)),
  );
}
