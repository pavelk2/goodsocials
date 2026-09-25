import Link from "next/link";
import { SiteNav } from "@/components/marketing/site-nav";
import { SiteFooter } from "@/components/marketing/site-footer";
import { SectionHead } from "@/components/marketing/section-head";
import { Streak } from "@/components/marketing/streak";
import { HeroBoard } from "@/components/marketing/hero-board";
import { Reveal } from "@/components/marketing/reveal";
import { CorrectionLoop } from "@/components/marketing/correction-loop";
import { SOON_AGENTS, SourceTag } from "@/components/marketing/data-sources";
import { AGENCY_SEATS, SUPPORT } from "@/lib/legal";
import {
  PLANS,
  DEFAULT_PLAN,
  HERO_CTA,
  HIRE_CTA,
  SIGNED_IN_CTA,
  TRIAL_CTA,
  TRIAL_DAYS,
  TRIAL_LINE,
  planHref,
} from "@/lib/plans";
import type { SourceKind } from "@/lib/integrations/types";
import { isSignedIn } from "@/lib/viewer";
import { TrackLanding } from "@/components/marketing/track-landing";

/**
 * The Product Hunt page. One idea per screen, and the picture carries it.
 *
 * Seven screens: the board in motion with its steps named under it, slop beside
 * a real post, a note becoming a rule, 3 posts against 20, who it is for as
 * rows, the three prices, and the close against a $3,000 manager.
 *
 * Each screen arrives in order: its claim first, then what backs it. The hero
 * runs on `.intro` from first paint, the rest on <Reveal> as it scrolls in.
 *
 * Every example on the page is TimeTuna's board, written the way the agent is
 * meant to write: third person, a sample size and a caveat on every claim, no
 * absolutes. The figures are illustrative until TimeTuna's own replace them.
 */

const wrap = "mx-auto w-full max-w-[1160px] px-6";

/** The band between two section heads. */
const band = "py-[110px]";

const anchor = "scroll-mt-[calc(var(--nav-h)+40px)]";

/** Product Hunt's featured badge for this launch, without the theme. */
const PH_BADGE =
  "https://api.producthunt.com/widgets/embed-image/v1/featured.svg?post_id=1260932&t=1790333158988";

/**
 * The three kinds of post. Research and deep dives cite what they read, so a
 * member with no data of their own still gets posts with something under them.
 * `lib/agent/ideas.ts` is where the mix is set.
 */
const KIND_NAMES = ["Market research", "Deep dive", "Your numbers"];

/**
 * Section two is one contrast: the post a generic AI tool writes, beside the
 * one this writes. The slop is written to be recognised in a second, and it
 * breaks every rule in the house voice on purpose.
 */
const SLOP = `🚀 Nobody talks about this, but scheduling is broken.

I spent 10 years in SaaS. Here is what I learned:

It's not about the tool. It's about the mindset.

Agree? 👇`;

const REAL =
  "TimeTuna reschedules fell from 18% in May to 7% in August. One change in between: the invite shows the guest's timezone first. n = 9,412 meetings. Seasonality could explain part of it, so a holdout runs in October.";

/** How many rules Voice holds by week 1, 4 and 12. Each one came from a note. */
const LEVELS = [
  { week: "Week 1", rules: 1 },
  { week: "Week 4", rules: 2 },
  { week: "Week 12", rules: 5 },
];

/**
 * Who it is for, one row each: who they are, what it reads, and the opening of
 * a post it would write for them. The eye runs down the first column and the
 * reader finds their own row.
 */
const WHO: { who: string; source: SourceKind; post: string }[] = [
  {
    who: "Founders",
    source: "stripe",
    post: "31% of August signups chose annual, up from 19% in July.",
  },
  {
    who: "Consultants",
    source: "notion",
    post: "Most retainers end in month four. Across 38 client engagements, one meeting shows up in 29 of the exits.",
  },
  {
    who: "Operators",
    source: "github",
    post: "Failed deploys per release fell about 62% after one CI rule. Small sample, 11 releases.",
  },
];

/**
 * The close. Only the rows where a $3,000 manager and this differ. A table of
 * matching ticks read as "the same thing" to anyone skimming it.
 */
const COMPARE: { row: string; manager: string; us: string }[] = [
  { row: "Posts", manager: "Most weeks", us: "Every weekday" },
  { row: "First drafts", manager: "After a week of onboarding", us: "In 90 seconds" },
  { row: "When you are on holiday", manager: "Stops", us: "Posts what you queued" },
];

/** The one mark in a feature list. Plum is spent on time, so this is ink. */
function Check() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 18 18"
      aria-hidden="true"
      className="mt-[3px] shrink-0"
    >
      <circle cx="9" cy="9" r="9" fill="currentColor" opacity="0.08" />
      <path
        d="M5.4 9.2l2.3 2.3 4.9-4.9"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/** A month as dots, seven to a row. Used twice in the cadence section. */
function Month({
  days,
  posted,
  size,
  gap,
  columns = 7,
  today,
}: {
  days: number;
  posted: (day: number) => boolean;
  size: number;
  gap: number;
  columns?: number;
  today?: number;
}) {
  return (
    <div
      aria-hidden="true"
      className="grid w-max"
      style={{ gridTemplateColumns: `repeat(${columns}, ${size}px)`, gap }}
    >
      {Array.from({ length: days }, (_, day) => (
        <span
          key={day}
          className="rounded-full"
          style={{
            width: size,
            height: size,
            background:
              day === today
                ? "var(--accent)"
                : posted(day)
                  ? "var(--ink)"
                  : "var(--hairline)",
          }}
        />
      ))}
    </div>
  );
}

/**
 * The page reads the session cookie, so it renders per request rather than at
 * build. Everything that changes is a label and an href, so a stranger sees
 * the page unchanged.
 */
export default async function Home() {
  const signedIn = await isSignedIn();
  const start = planHref(DEFAULT_PLAN.slug, signedIn);
  const startLabel = signedIn ? SIGNED_IN_CTA : HERO_CTA;

  return (
    <>
      <SiteNav signedIn={signedIn} />
      {signedIn ? null : <TrackLanding />}

      <main className="bg-paper">
        {/* 1. The hero. The claim, then the board doing the whole job in a
            loop, so the first screen answers what this is without a paragraph. */}
        <section className={`${wrap} pb-[96px] pt-[40px] text-center sm:pt-[48px]`}>
          {/* The Product Hunt badge. Their own image, served by them, in the
              theme that matches the reader's: the light badge on paper and the
              dark one on the dark ground. */}
          <a
            href="https://www.producthunt.com/products/goodsocials?embed=true&utm_source=badge-featured&utm_medium=badge&utm_campaign=badge-goodsocials"
            target="_blank"
            rel="noopener noreferrer"
            className="intro intro-3 mb-8 inline-block"
          >
            <picture>
              <source
                media="(prefers-color-scheme: dark)"
                srcSet={`${PH_BADGE}&theme=dark`}
              />
              {/* A plain img: an SVG Product Hunt redraws with the live vote
                  count, so it loads from them rather than through next/image. */}
              <img
                alt="GoodSocials - AI social media manager for LinkedIn | Product Hunt"
                width={250}
                height={54}
                src={`${PH_BADGE}&theme=light`}
              />
            </picture>
          </a>
          <h1 className="intro mx-auto max-w-[20ch] text-balance text-[clamp(40px,5.2vw,62px)] font-semibold leading-[1.02] tracking-[-0.045em]">
            AI social media manager for your{" "}
            <span className="text-accent-text">LinkedIn.</span>
          </h1>
          <p className="intro intro-1 mx-auto mt-4 max-w-[60ch] text-balance text-[clamp(17px,1.5vw,19px)] leading-[1.4] text-ink-2">
            Posts only from deep research or your own data, 5 times a week,
            after you approve.
          </p>
          <div className="intro intro-2 mt-7 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link
              href={start}
              className="pill btn-accent inline-block w-full px-7 py-[14px] text-center text-[16px] sm:w-auto"
            >
              {startLabel}
            </Link>
            <Link
              href="#pricing"
              className="pill btn-outline num inline-block w-full border border-hairline bg-surface px-7 py-[14px] text-center text-[16px] sm:w-auto"
            >
              {HIRE_CTA}
            </Link>
          </div>
          {signedIn ? null : (
            <p className="intro intro-2 num mt-3 font-mono text-[12px] text-ink-2">
              Sign in with LinkedIn, paste your website, 7 posts in 90 seconds.
              {" "}{TRIAL_DAYS} days free, then {DEFAULT_PLAN.priceLine}.
            </p>
          )}

          <div className="intro intro-4 mt-8 text-left">
            <HeroBoard />
          </div>
        </section>

        {/* 2. What it writes. One contrast: the post a generic tool writes
            beside the one this writes. The three kinds sit under it as labels. */}
        <Reveal id="writes" className={anchor}>
          <div className={`${wrap} ${band} pt-0`}>
            <SectionHead
              eyebrow="No AI slop"
              title="Research, deep dives, your numbers. Nothing else."
            />

            <div className="mx-auto mt-16 grid max-w-[920px] gap-4 md:grid-cols-2">
              <div className="rv rv-2 flex flex-col rounded-[var(--r-xl)] border border-hairline p-6">
                <p className="font-mono text-[12px] text-ink-2">
                  <span aria-hidden="true">✕ </span>What it will not write
                </p>
                <p className="mt-5 grow whitespace-pre-line text-[15px] leading-[1.5] text-ink-3">
                  {SLOP}
                </p>
                <p className="mt-6 border-t border-hairline pt-4 font-mono text-[11.5px] leading-[1.6] text-ink-2">
                  No cringe. No &ldquo;no one talks about this&rdquo;. No
                  &ldquo;it&rsquo;s not X, it&rsquo;s Y&rdquo;.
                </p>
              </div>
              <div className="rv rv-3 card-lift flex flex-col rounded-[var(--r-xl)] p-6">
                <p className="font-mono text-[12px] text-ink-2">
                  <span aria-hidden="true">✓ </span>What it writes
                </p>
                <p className="mt-5 grow text-[17px] leading-[1.5] tracking-[-0.01em]">
                  {REAL}
                </p>
                <p className="mt-6 flex flex-wrap items-center gap-[6px] border-t border-hairline pt-4 font-mono text-[11.5px] text-ink-2">
                  Your numbers, read from <SourceTag kind="posthog" />
                </p>
              </div>
            </div>

            <div className="rv rv-4 mt-8 flex flex-wrap items-center justify-center gap-2">
              <span className="mr-1 font-mono text-[12px] text-ink-2">
                Every post is one of three kinds:
              </span>
              {KIND_NAMES.map((name) => (
                <span
                  key={name}
                  className="rounded-full border border-hairline bg-surface px-3 py-[5px] text-[13px]"
                >
                  {name}
                </span>
              ))}
            </div>

            <div className="rv rv-5 mt-14 text-center">
              <Link
                href={start}
                className="pill btn-accent inline-block px-7 py-[14px] text-[16px]"
              >
                {startLabel}
              </Link>
              <p className="mt-4 font-mono text-[12px] text-ink-2">
                Coming soon: {SOON_AGENTS.slice(0, -1).join(", ")} and{" "}
                {SOON_AGENTS[SOON_AGENTS.length - 1]} integrations.
              </p>
            </div>
          </div>
        </Reveal>

        {/* 3. Corrections stick, which is how it works. One note played
            through once: typed on a draft, turned into a rule, followed by the
            next post. Under it, one line of how the rules add up. */}
        <Reveal id="how" className={anchor}>
          <div className={`${wrap} ${band} pt-0`}>
            <SectionHead
              eyebrow="Corrections stick"
              title="Correct it once. Every post after follows."
            >
              A note on a card rewrites that card and becomes a rule in your
              voice. The rules add up, week by week.
            </SectionHead>

            <div className="mt-16">
              <CorrectionLoop />
            </div>

            <p className="rv rv-5 num mt-10 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 font-mono text-[12px] text-ink-2">
              {LEVELS.map((step, i) => {
                const last = i === LEVELS.length - 1;
                return (
                  <span key={step.week} className="flex items-center gap-2">
                    {step.week}:
                    <span aria-hidden="true" className="flex gap-1">
                      {Array.from({ length: step.rules }, (_, k) => (
                        <span
                          key={k}
                          className="size-[7px] rounded-full"
                          style={{ background: last ? "var(--accent)" : "var(--ink)" }}
                        />
                      ))}
                    </span>
                    <span className={last ? "text-ink" : undefined}>
                      {step.rules} {step.rules === 1 ? "rule" : "rules"}
                      {last ? ", every one from a note of yours" : ""}
                    </span>
                  </span>
                );
              })}
            </p>
          </div>
        </Reveal>

        {/* 4. What cadence does, as one number: the posts in the last three
            months against the posts next month. The calendars sit under the
            numbers as proof. */}
        <Reveal>
          <div className={`${wrap} ${band} pt-0`}>
            <SectionHead
              eyebrow="Cadence"
              title="Show up every weekday. The rest follows."
            />
            <div className="mt-16 grid items-start justify-center gap-10 text-center md:grid-cols-[1fr_auto_1fr]">
              <div className="rv rv-2 flex flex-col items-center">
                <p className="num text-[clamp(96px,12vw,160px)] font-semibold leading-[0.9] tracking-[-0.06em] text-ink-3">
                  3
                </p>
                <p className="mt-4 font-mono text-[12px] text-ink-2">
                  posts in your last 3 months
                </p>
                <div className="mt-6 opacity-80">
                  <Month
                    days={91}
                    columns={13}
                    size={8}
                    gap={5}
                    posted={(day) => day === 4 || day === 40 || day === 71}
                  />
                </div>
              </div>
              <p
                aria-hidden="true"
                className="rv rv-3 text-[clamp(40px,5vw,64px)] leading-[1.6] text-ink-3"
              >
                <span className="hidden md:inline">→</span>
                <span className="md:hidden">↓</span>
              </p>
              <div className="rv rv-3 flex flex-col items-center">
                <p className="num text-[clamp(96px,12vw,160px)] font-semibold leading-[0.9] tracking-[-0.06em]">
                  20
                </p>
                <p className="mt-4 font-mono text-[12px] text-ink-2">posts next month</p>
                <div className="mt-6">
                  <Month
                    days={30}
                    size={12}
                    gap={6}
                    today={29}
                    posted={(day) => day % 7 < 5}
                  />
                </div>
              </div>
            </div>
            <p className="rv rv-4 mx-auto mt-12 max-w-[52ch] text-center text-[15px] text-ink-2">
              Profile views, followers and inbound leads follow a steady month.
            </p>
          </div>
        </Reveal>

        {/* 5. Who it is for. Rows, not cards: who, what it reads, how a post
            for them opens. Agencies are the last row. */}
        <Reveal id="who" className={anchor}>
          <div className={`${wrap} ${band} pt-0`}>
            <SectionHead
              eyebrow="Who it is for"
              title="Built for the person whose name is on the profile."
            />
            <div className="mx-auto mt-16 max-w-[920px]">
              <p
                aria-hidden="true"
                className="hidden grid-cols-[170px_150px_1fr] gap-6 pb-3 font-mono text-[11px] uppercase text-ink-3 sm:grid"
              >
                <span>Who</span>
                <span>Reads</span>
                <span>A post opens</span>
              </p>
              <ul>
                {WHO.map((row, i) => (
                  <li
                    key={row.who}
                    className={`rv ${["rv-2", "rv-3", "rv-4"][i]} grid gap-2 border-t border-hairline py-5 sm:grid-cols-[170px_150px_1fr] sm:items-baseline sm:gap-6`}
                  >
                    <p className="text-[19px] font-semibold tracking-[-0.02em]">{row.who}</p>
                    <p>
                      <SourceTag kind={row.source} />
                    </p>
                    <p className="text-[16px] leading-[1.5]">{row.post}</p>
                  </li>
                ))}
                <li className="rv rv-5 grid gap-2 border-y border-hairline py-5 sm:grid-cols-[170px_150px_1fr] sm:items-baseline sm:gap-6">
                  <p className="text-[19px] font-semibold tracking-[-0.02em]">Agencies</p>
                  <p className="font-mono text-[12px] text-ink-2">Each client&rsquo;s own</p>
                  <p className="num text-[16px] leading-[1.5]">
                    Up to {AGENCY_SEATS} clients, {PLANS[1].priceLine}.{" "}
                    <Link href="#pricing" className="font-mono text-[12px] text-accent-text">
                      See the agency plan →
                    </Link>
                  </p>
                </li>
              </ul>
            </div>
          </div>
        </Reveal>

        {/* 6. Pricing. Three plans, the recommended one on ink. */}
        <Reveal id="pricing" className={anchor}>
          <div className={`${wrap} ${band} pt-0`}>
            <SectionHead
              eyebrow="A social media manager costs $3,000 a month"
              title={
                <>
                  Three prices.{" "}
                  <span className="whitespace-nowrap">{TRIAL_DAYS} days</span> free
                  on each.
                </>
              }
            >
              {PLANS[0].price} for you. {PLANS[1].price} for {AGENCY_SEATS} clients.{" "}
              {PLANS[2].price} and Pasha sets it up.
            </SectionHead>

            {/* Stretch, not items-start: three plans are three versions of one
                object, so the prices sit on one baseline and the buttons on
                another. */}
            <ul className="mt-16 grid gap-4 md:grid-cols-3">
              {PLANS.map((plan, i) => (
                <li
                  key={plan.slug}
                  className={`rv ${["rv-2", "rv-3", "rv-4"][i]} flex flex-col rounded-[var(--r-xl)] p-8 ${
                    plan.featured ? "panel" : "card-lift"
                  }`}
                >
                  <h3 className="text-[17px] font-semibold tracking-[-0.01em]">
                    {plan.name}
                  </h3>
                  <p
                    className="mt-2 min-h-[44px] text-[15px] leading-[1.45]"
                    style={{
                      color: plan.featured ? "var(--panel-ink-2)" : "var(--ink-2)",
                    }}
                  >
                    {plan.line}
                  </p>

                  <p className="num mt-7 flex items-baseline gap-2">
                    <span className="text-[46px] font-semibold leading-none tracking-[-0.04em]">
                      {plan.price}
                    </span>
                    <span
                      className="font-mono text-[13px]"
                      style={{
                        color: plan.featured ? "var(--panel-ink-2)" : "var(--ink-3)",
                      }}
                    >
                      a month
                    </span>
                  </p>

                  <ul
                    className="mt-8 grow space-y-3 border-t pt-8 text-[15px] leading-[1.45]"
                    style={{
                      borderColor: plan.featured ? "var(--panel-hairline)" : "var(--hairline)",
                      color: plan.featured ? "var(--panel-ink-2)" : "var(--ink-2)",
                    }}
                  >
                    {plan.highlights.map((feature) => (
                      <li key={feature} className="flex gap-3">
                        <Check />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>

                  {/* Signed in, every button would open the same board, so
                      the buttons go and the line under the grid says what to
                      do instead. */}
                  {signedIn ? null : (
                    <>
                      <Link
                        href={planHref(plan.slug, signedIn)}
                        className={`pill num mt-9 block px-5 py-[13px] text-center text-[15px] ${
                          plan.featured
                            ? "btn-paper"
                            : "btn-outline border border-hairline bg-surface"
                        }`}
                      >
                        {TRIAL_CTA}
                      </Link>
                      <p
                        className="num mt-3 text-center font-mono text-[12px]"
                        style={{
                          color: plan.featured ? "var(--panel-ink-2)" : "var(--ink-3)",
                        }}
                      >
                        {TRIAL_LINE}
                      </p>
                    </>
                  )}
                </li>
              ))}
            </ul>

            <p className="rv rv-5 mt-8 text-center font-mono text-[12px] text-ink-2">
              No setup fee, and you cancel from the settings screen.
            </p>

            {signedIn ? (
              <p className="mt-4 text-center text-[15px] text-ink-2">
                You are signed in. To change plan, email{" "}
                <a href={`mailto:${SUPPORT}`} className="underline">
                  {SUPPORT}
                </a>
                .
              </p>
            ) : null}
          </div>
        </Reveal>

        {/* 7. The close. The month on ink and the button on the left, and on
            the right only the rows where a $3,000 manager and this differ. */}
        <Reveal className={`${wrap} pb-[110px]`}>
          <div className="grid overflow-hidden rounded-[var(--r-2xl)] border border-hairline lg:grid-cols-[1fr_1.25fr]">
            <div className="panel flex flex-col items-center justify-center px-6 py-16 text-center sm:py-20">
              <div className="rv">
                <Streak
                  posted={20}
                  today={false}
                  size={130}
                  ink="var(--panel-ink)"
                  empty="var(--panel-hairline)"
                />
              </div>
              <h2 className="rv mx-auto mt-10 max-w-[16ch] text-balance text-[clamp(30px,3.6vw,42px)] font-semibold leading-[1.06] tracking-[-0.035em]">
                {signedIn ? "Your board is waiting." : "Your board is full in 90 seconds."}
              </h2>
              <div className="rv rv-1">
                <Link
                  href={start}
                  className="pill btn-accent mt-8 inline-block px-7 py-[14px] text-[16px]"
                >
                  {startLabel}
                </Link>
              </div>
              {signedIn ? null : (
                <p
                  className="rv rv-1 num mt-4 font-mono text-[12px]"
                  style={{ color: "var(--panel-ink-2)" }}
                >
                  {TRIAL_LINE}
                </p>
              )}
            </div>

            <div className="bg-paper px-6 py-14 sm:px-12">
              <h2 className="rv rv-2 text-[clamp(26px,2.6vw,32px)] font-semibold leading-[1.1] tracking-[-0.03em]">
                Against a $3,000 manager.
              </h2>
              <table className="rv rv-3 mt-8 w-full border-collapse text-left text-[15px]">
                <thead>
                  <tr className="font-mono text-[11px] uppercase text-ink-2">
                    <th className="pb-3 font-normal">
                      <span className="sr-only">What</span>
                    </th>
                    <th className="pb-3 font-normal">$3,000 manager</th>
                    <th className="pb-3 font-normal text-accent-text">GoodSocials</th>
                  </tr>
                </thead>
                <tbody>
                  {COMPARE.map((row) => (
                    <tr key={row.row} className="border-t border-hairline">
                      <td className="py-[14px] pr-4">{row.row}</td>
                      <td className="pr-4 text-ink-2">{row.manager}</td>
                      <td className="font-semibold">{row.us}</td>
                    </tr>
                  ))}
                  <tr className="num border-t border-hairline font-semibold">
                    <td className="py-[14px] pr-4">Price</td>
                    <td className="pr-4 text-ink-2">$3,000 a month</td>
                    <td>{DEFAULT_PLAN.priceLine}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </Reveal>
      </main>

      <SiteFooter signedIn={signedIn} />
    </>
  );
}
