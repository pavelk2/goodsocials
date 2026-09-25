import Link from "next/link";
import { SiteNav } from "@/components/marketing/site-nav";
import { SiteFooter } from "@/components/marketing/site-footer";
import { SectionHead } from "@/components/marketing/section-head";
import { Streak } from "@/components/marketing/streak";
import { HeroBoard } from "@/components/marketing/hero-board";
import { TryBoard } from "@/components/marketing/try-board";
import {
  CONNECTED,
  RefTag,
  SOON_AGENTS,
  SourceTag,
} from "@/components/marketing/data-sources";
import { AGENCY_SEATS, SUPPORT } from "@/lib/legal";
import {
  PLANS,
  DEFAULT_PLAN,
  HERO_CTA,
  SIGNED_IN_CTA,
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
 * Eight screens: the board in motion, the three kinds of post, the one job the
 * reader has (drag a card), twelve weeks of learning, what cadence does, who it
 * is for, the three prices, and the close set against a $3,000 manager.
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
const KINDS: {
  name: string;
  line: string;
  post: string;
  refs?: string[];
  /** Your numbers: the tools it can read, the one this post came from lit. */
  from?: SourceKind;
}[] = [
  {
    name: "Market research",
    line: "What competitors and the market are doing, with the source named.",
    post: "Of 12 scheduling tools compared this month, 9 put round-robin behind a paid tier. Two moved it there last quarter. Snapshot of public pricing pages, 24 September.",
    refs: ["12 pricing pages"],
  },
  {
    name: "Deep dive",
    line: "One question, explained to the bottom, with the references.",
    post: "Why TimeTuna shows 3 slots. Iyengar and Lepper found 6 jams sold about 10x better than 24. A meta-analysis of 50 experiments puts the average effect near zero. The setting decides.",
    refs: ["Iyengar & Lepper, 2000", "Scheibehenne et al., 2010"],
  },
  {
    name: "Your numbers",
    line: "Read from the tools you connect, with the caveat attached.",
    post: "31% of August signups chose annual, up from 19% in July. Two candidate causes, neither confirmed.",
    from: "stripe",
  },
];

/** Week 1, 4 and 12 of one Voice principle. Each week adds what a revise taught it. */
const LEVELS = [
  {
    week: "Week 1",
    level: 1,
    head: "Knows the website.",
    voice: ["Reports, does not sell."],
  },
  {
    week: "Week 4",
    level: 5,
    head: "Knows the voice.",
    voice: ["Reports, does not sell.", "Opens on the number."],
  },
  {
    week: "Week 12",
    level: 10,
    head: "Knows the author.",
    voice: [
      "Reports, does not sell.",
      "Opens on the number.",
      "Every claim carries its sample size.",
      "Names the caveat before a reader does.",
      "Closes on the next question.",
    ],
  },
];

const OUTCOMES = [
  { head: "More profile views", line: "People look the author up before they reply." },
  { head: "More followers", line: "A post every weekday is a reason to follow." },
  { head: "More inbound leads", line: "The goal picked on day one. The board writes toward it." },
];

/** The last screen. What a $3,000 manager does, and the one row where it slips. */
const COMPARE: { row: string; manager: string; us: string }[] = [
  { row: "Posts 5 times a week", manager: "Most weeks", us: "Every week" },
  { row: "No AI slop", manager: "✓", us: "✓" },
  { row: "Written to your taste", manager: "✓", us: "✓" },
  { row: "Nothing goes out without your approval", manager: "✓", us: "✓" },
  { row: "Optimises for one metric you pick", manager: "✓", us: "✓" },
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
            className="mb-8 inline-block"
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
          <h1 className="mx-auto max-w-[20ch] text-balance text-[clamp(40px,5.2vw,62px)] font-semibold leading-[1.02] tracking-[-0.045em]">
            AI social media manager for your{" "}
            <span className="text-accent-text">LinkedIn.</span>
          </h1>
          <p className="mx-auto mt-4 max-w-[60ch] text-balance text-[clamp(17px,1.5vw,19px)] leading-[1.4] text-ink-2">
            Posts only from deep research or your own data, 5 times a week,
            after you approve.
          </p>
          <p className="mx-auto mt-3 max-w-[80ch] font-mono text-[12.5px] text-ink-3">
            No cringe. No &ldquo;no one talks about this&rdquo;. No &ldquo;it&rsquo;s
            not X, it&rsquo;s Y&rdquo;.
          </p>
          <div className="mt-7 flex flex-col items-center justify-center gap-3 sm:flex-row">
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
              {DEFAULT_PLAN.priceLine}
            </Link>
          </div>
          {signedIn ? null : (
            <p className="num mt-3 font-mono text-[12px] text-ink-2">
              Sign in with LinkedIn, paste your website, 7 posts in 90 seconds.
            </p>
          )}

          <div className="mt-8 text-left">
            <HeroBoard />
          </div>
        </section>

        {/* 2. What it writes. Three kinds and nothing else, which is the whole
            answer to AI slop. */}
        <section id="writes" className={anchor}>
          <div className={`${wrap} ${band} pt-0`}>
            <SectionHead eyebrow="No AI slop" title="Three kinds of posts. Nothing else." />

            <div className="relative mt-16">
              {/* The line the three dots sit on. Behind the columns, and only
                  where there are three columns side by side. */}
              <span
                aria-hidden="true"
                className="absolute left-[16.6%] right-[16.6%] top-[13px] hidden h-[2px] bg-ink md:block"
              />
              <ul className="relative grid gap-12 md:grid-cols-3 md:gap-8">
                {KINDS.map((kind, i) => (
                  <li key={kind.name} className="flex flex-col items-center text-center">
                    <span
                      aria-hidden="true"
                      className="size-[28px] rounded-full"
                      style={{
                        background: i === KINDS.length - 1 ? "var(--accent)" : "var(--ink)",
                        boxShadow: "0 0 0 8px var(--paper)",
                      }}
                    />
                    <h3 className="mt-6 text-[24px] font-semibold tracking-[-0.02em]">
                      {kind.name}
                    </h3>
                    <p className="mt-2 max-w-[30ch] text-[15px] leading-[1.45] text-ink-2">
                      {kind.line}
                    </p>
                    <article className="mt-6 w-full max-w-[330px] rounded-[14px] border border-hairline bg-surface px-4 py-[14px] text-left text-[14px] leading-[1.45]">
                      {kind.post}
                      <p className="mt-2 flex flex-wrap items-center gap-[6px] font-mono text-[10.5px] text-ink-3">
                        {kind.name}
                        {kind.refs?.map((label) => <RefTag key={label} label={label} />)}
                        {kind.from ? <SourceTag kind={kind.from} /> : null}
                      </p>
                    </article>
                    {kind.from ? (
                      <ul
                        aria-label="Tools it reads"
                        className="mt-4 flex max-w-[330px] flex-wrap justify-center gap-[6px]"
                      >
                        {CONNECTED.map((source) => (
                          <li
                            key={source.kind}
                            className="rounded-full"
                            style={
                              source.kind === kind.from
                                ? { boxShadow: "0 0 0 1.5px var(--accent)" }
                                : undefined
                            }
                          >
                            <SourceTag kind={source.kind} />
                          </li>
                        ))}
                      </ul>
                    ) : null}
                  </li>
                ))}
              </ul>
            </div>

            <div className="mt-14 text-center">
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
        </section>

        {/* 3. The one job. The reader drags a card, or presses Approve. */}
        <section id="how" className={anchor}>
          <div className={`${wrap} ${band} pt-0`}>
            <SectionHead eyebrow="Try it" title="Drag a card to Scheduled.">
              That is the whole job. It publishes at 09:00 in your timezone.
            </SectionHead>
            <div className="mt-16">
              <TryBoard />
            </div>
          </div>
        </section>

        {/* 4. It learns the author. One Voice principle at week 1, 4 and 12,
            each week's new lines in plum. The persistence is the product. */}
        <section>
          <div className={`${wrap} ${band} pt-0`}>
            <SectionHead
              eyebrow="Corrections stick"
              title="From level 1 to level 10 in 12 weeks."
            >
              Each note you give becomes a rule. The rules become your voice.
            </SectionHead>
            <ul className="mt-16 grid gap-4 md:grid-cols-3">
              {LEVELS.map((step, i) => {
                const learned = i === 0 ? 0 : LEVELS[i - 1].voice.length;
                const last = i === LEVELS.length - 1;
                return (
                  <li
                    key={step.week}
                    className="card-lift rounded-[var(--r-xl)] p-7"
                    style={last ? { boxShadow: "var(--shadow)" } : undefined}
                  >
                    <p className="num flex justify-between font-mono text-[12px] text-ink-2">
                      <span>{step.week}</span>
                      <span style={last ? { color: "var(--accent-text)" } : undefined}>
                        Level {step.level}
                      </span>
                    </p>
                    <div aria-hidden="true" className="mt-3 flex gap-1">
                      {Array.from({ length: 10 }, (_, k) => (
                        <span
                          key={k}
                          className="h-[5px] flex-1 rounded-full"
                          style={{
                            background:
                              k < step.level
                                ? last
                                  ? "var(--accent)"
                                  : "var(--ink)"
                                : "var(--hairline)",
                          }}
                        />
                      ))}
                    </div>
                    <h3 className="mt-6 text-[22px] font-semibold tracking-[-0.02em]">
                      {step.head}
                    </h3>
                    <p className="mt-5 font-mono text-[11px] text-ink-3">VOICE</p>
                    <p className="mt-2 text-[15px] leading-[1.55]">
                      {step.voice.map((line, k) => (
                        <span key={line}>
                          {k >= learned && i > 0 ? (
                            <span className="rounded-[4px] bg-[var(--accent-wash)] px-[3px] text-accent-text">
                              {line}
                            </span>
                          ) : (
                            line
                          )}{" "}
                        </span>
                      ))}
                    </p>
                  </li>
                );
              })}
            </ul>
          </div>
        </section>

        {/* 5. What cadence does. The last three months beside the next one,
            and the three things a steady month is for. No figures until there
            are real ones to show. */}
        <section>
          <div className={`${wrap} ${band} pt-0`}>
            <SectionHead
              eyebrow="Cadence"
              title="Show up every weekday. The rest follows."
            />
            <div className="mt-16 grid gap-4 lg:grid-cols-[minmax(0,360px)_1fr]">
              <div className="card-lift rounded-[var(--r-xl)] p-7 opacity-80">
                <p className="num flex justify-between font-mono text-[12px] text-ink-2">
                  <span>Your last 3 months</span>
                  <span>3 posts</span>
                </p>
                <div className="mt-6">
                  <Month
                    days={91}
                    columns={13}
                    size={11}
                    gap={6}
                    posted={(day) => day === 4 || day === 40 || day === 71}
                  />
                </div>
              </div>
              <div className="card-lift grid gap-8 rounded-[var(--r-xl)] p-7 sm:grid-cols-[auto_1fr] sm:items-center">
                <div>
                  <p className="num flex justify-between gap-8 font-mono text-[12px] text-ink-2">
                    <span>Your next month</span>
                    <span className="text-accent-text">20 posts</span>
                  </p>
                  <div className="mt-6">
                    <Month
                      days={30}
                      size={26}
                      gap={11}
                      today={29}
                      posted={(day) => day % 7 < 5}
                    />
                  </div>
                </div>
                <ul>
                  {OUTCOMES.map((outcome) => (
                    <li
                      key={outcome.head}
                      className="border-b border-hairline py-4 first:pt-0 last:border-b-0"
                    >
                      <p className="text-[19px] font-semibold tracking-[-0.02em]">
                        <span className="text-accent-text" aria-hidden="true">
                          ↑{" "}
                        </span>
                        {outcome.head}
                      </p>
                      <p className="mt-1 text-[14px] text-ink-2">{outcome.line}</p>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* 6. Who it is for. Four fifths of the row for the person whose name
            is on the profile, one fifth for the agency that runs twelve. */}
        <section id="who" className={anchor}>
          <div className={`${wrap} ${band} pt-0`}>
            <SectionHead
              eyebrow="Who it is for"
              title="Built for the person whose name is on the profile."
            />
            <div className="mt-16 grid gap-4 lg:grid-cols-[4fr_1fr]">
              <div className="card-lift rounded-[var(--r-xl)] p-7 sm:p-9">
                <div className="flex flex-wrap items-baseline justify-between gap-3">
                  <h3 className="text-[24px] font-semibold tracking-[-0.02em]">
                    For founders, consultants and operators
                  </h3>
                  <p className="num font-mono text-[15px]">
                    {DEFAULT_PLAN.price}
                    <span className="text-ink-3"> / mo</span>
                  </p>
                </div>
                <p className="mt-2 text-[17px] text-ink-2">
                  You know things worth posting. You have no hours to write them up.
                </p>
                <ul className="mt-8 grid gap-3 md:grid-cols-3">
                  {[
                    { who: "Founders", post: KINDS[2].post, source: "stripe" as const },
                    {
                      who: "Consultants",
                      post: "Most retainers end in month four. Across 38 client engagements, one meeting shows up in 29 of the exits.",
                      source: "notion" as const,
                    },
                    {
                      who: "Operators",
                      post: "Failed deploys per release fell about 62% after one CI rule. Small sample, 11 releases. Encouraging so far.",
                      source: "github" as const,
                    },
                  ].map((example) => (
                    <li key={example.who}>
                      <p className="mb-2 font-mono text-[12px] text-ink-2">{example.who}</p>
                      <article className="h-full rounded-[14px] border border-hairline bg-surface px-4 py-[14px] text-[14px] leading-[1.45]">
                        {example.post}
                        <p className="mt-2 flex items-center gap-[6px] font-mono text-[10.5px] text-ink-3">
                          <SourceTag kind={example.source} />
                        </p>
                      </article>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="flex flex-col rounded-[var(--r-xl)] border border-hairline p-6">
                <h3 className="text-[17px] font-semibold">Agencies</h3>
                <p className="mt-2 text-[14px] leading-[1.45] text-ink-2">
                  Up to {AGENCY_SEATS} client profiles. Each client connects their own LinkedIn.
                </p>
                <div className="mt-6 lg:mt-auto">
                  <p className="num font-mono text-[15px]">
                    {PLANS[1].price}
                    <span className="text-ink-3"> / mo</span>
                  </p>
                  <Link href="#pricing" className="mt-2 inline-block font-mono text-[12px] text-accent-text">
                    See the agency plan →
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 7. Pricing. Three plans, the recommended one on ink. */}
        <section id="pricing" className={anchor}>
          <div className={`${wrap} ${band} pt-0`}>
            <SectionHead
              eyebrow="A social media manager costs $3,000 a month"
              title={`Three prices. ${TRIAL_DAYS} days free on each.`}
            >
              No setup fee, and you cancel from the settings screen.
            </SectionHead>

            {/* Stretch, not items-start: three plans are three versions of one
                object, so the prices sit on one baseline and the buttons on
                another. */}
            <ul className="mt-16 grid gap-4 md:grid-cols-3">
              {PLANS.map((plan) => (
                <li
                  key={plan.slug}
                  className={`flex flex-col rounded-[var(--r-xl)] p-8 ${
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
                    {plan.features.map((feature) => (
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
                        {plan.cta}
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

            {signedIn ? (
              <p className="mt-8 text-center text-[15px] text-ink-2">
                You are signed in. To change plan, email{" "}
                <a href={`mailto:${SUPPORT}`} className="underline">
                  {SUPPORT}
                </a>
                .
              </p>
            ) : null}
          </div>
        </section>

        {/* 8. The close. The month on ink and the button on the left, and on
            the right what a $3,000 manager does, set against what this does.
            They differ on one row, and it is the row that is sold. */}
        <section className={`${wrap} pb-[110px]`}>
          <div className="grid overflow-hidden rounded-[var(--r-2xl)] border border-hairline lg:grid-cols-[1fr_1.25fr]">
            <div className="panel flex flex-col items-center justify-center px-6 py-16 text-center sm:py-20">
              <Streak
                posted={20}
                today={false}
                size={130}
                ink="var(--panel-ink)"
                empty="var(--panel-hairline)"
              />
              <h2 className="mx-auto mt-10 max-w-[16ch] text-balance text-[clamp(30px,3.6vw,42px)] font-semibold leading-[1.06] tracking-[-0.035em]">
                {signedIn ? "Your board is waiting." : "Your board is full in 90 seconds."}
              </h2>
              <Link
                href={start}
                className="pill btn-accent mt-8 inline-block px-7 py-[14px] text-[16px]"
              >
                {startLabel}
              </Link>
              {signedIn ? null : (
                <p
                  className="num mt-4 font-mono text-[12px]"
                  style={{ color: "var(--panel-ink-2)" }}
                >
                  {TRIAL_LINE}
                </p>
              )}
            </div>

            <div className="bg-paper px-6 py-14 sm:px-12">
              <h2 className="text-[clamp(26px,2.6vw,32px)] font-semibold leading-[1.1] tracking-[-0.03em]">
                What a $3,000 manager does, every week.
              </h2>
              <table className="mt-8 w-full border-collapse text-left text-[15px]">
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
                  {COMPARE.map((row, i) => (
                    <tr key={row.row} className="border-t border-hairline">
                      <td className="py-[14px] pr-4">{row.row}</td>
                      <td className={`pr-4 ${i === 0 ? "text-ink-2" : ""}`}>{row.manager}</td>
                      <td className={i === 0 ? "font-semibold" : ""}>{row.us}</td>
                    </tr>
                  ))}
                  <tr className="num border-t border-hairline font-semibold">
                    <td className="py-[14px] pr-4">Price</td>
                    <td className="pr-4">$3,000 a month</td>
                    <td>{DEFAULT_PLAN.priceLine}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </section>
      </main>

      <SiteFooter signedIn={signedIn} />
    </>
  );
}
