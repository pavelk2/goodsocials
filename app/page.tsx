import Link from "next/link";
import { SiteNav } from "@/components/marketing/site-nav";
import { SiteFooter } from "@/components/marketing/site-footer";
import { Streak, StreakMark, StepDots } from "@/components/marketing/streak";
import { BoardPreview } from "@/components/board/board-preview";
import { CardShell, CardComment } from "@/components/board/card-shell";
import { AGENCY_SEATS } from "@/lib/legal";
import {
  PLANS,
  DEFAULT_PLAN,
  HERO_CTA,
  TRIAL_DAYS,
  TRIAL_LINE,
} from "@/lib/plans";

/**
 * The offer copy is verbatim from CLAUDE.md. Do not improve it, derive from it.
 *
 * DESIGN.md section 6. The first pass at this page took Notion's decorations,
 * which is why it read as somebody else's page with our colours in it. This
 * one takes the page's structure from the thing we already own: the streak
 * grid, twenty-five cells, one per day, drawn at three scales.
 *
 * - Hero: the grid at poster size, a month at the cadence we sell.
 * - Every section: the same grid at the count that section has reached, so
 *   reading down the page is watching a month fill. It is the section's whole
 *   ornament. No eyebrow, no icon, no tinted plate.
 * - Footer: twelve of them, a year.
 *
 * Nothing else on this page is drawn. Type, hairlines, the two greys, and one
 * real screenshot of the real board carry the rest, which is the house style
 * doing what it was always going to do once the borrowed parts came out.
 *
 * Plum appears on today's cell and on the button that starts one, and nowhere
 * else. Numbers, counts and dates are Geist Mono, which ships in the repo and
 * was not being used for anything.
 */

const wrap = "mx-auto w-full max-w-[1160px] px-6";

/** 30px is the mark's dot pitch, so the page's rhythm is the mark's. */
const band = "py-[120px]";

const sectionHeading =
  "text-[clamp(30px,4.2vw,46px)] font-semibold leading-[1.06] tracking-[-0.035em]";

/**
 * Four facts on one line, under the buttons. This is the slot a logo wall
 * occupies on a page that has customers to name. We do not yet, and inventing
 * them is the one thing the house style ends the discussion on, so the row
 * holds things that are true instead.
 */
const PROOF = [
  "20 posts a month",
  "Five minutes a week",
  `Up to ${AGENCY_SEATS} client boards`,
  `${TRIAL_DAYS} days free`,
];

/**
 * The five columns as rows with a mono index. The board is the dense surface
 * and the page around it is the airy one, so the page describes the board in
 * the calmest form there is rather than restaging it as five tiles.
 */
const COLUMNS = [
  {
    name: "Idea",
    line: "Four themes decide what your board is about, so week four does not read like week one.",
  },
  {
    name: "Draft",
    line: "A framework, a data breakdown, a receipt or a finding. The shape is picked with the idea, not at draft time.",
  },
  {
    name: "Image",
    line: "Generated at the card's full width, because nobody approves a picture at thumbnail size.",
  },
  {
    name: "Scheduled",
    line: "You set the time. LinkedIn has no scheduler, so the publish loop is ours and it runs every 15 minutes.",
  },
  {
    name: "Posted",
    line: "It went out. The post comes back with its LinkedIn address, and one more cell on your month turns to ink.",
  },
];

const PRINCIPLES = [
  { kind: "Voice", line: "How a post sounds. Reports, does not sell." },
  { kind: "Visual", line: "What the picture may be. Never stock photography." },
  { kind: "Format", line: "How it is built. Opening line carries the number." },
];

/**
 * Three audiences as three columns of type under a hairline. Not the tinted
 * panels the first pass shipped: a flat colour field behind a paragraph is
 * decoration standing in for an argument, and the argument is the card.
 */
const AUDIENCES = [
  {
    who: "Founders",
    line: "You have the receipts. The card asks you for the number in your own words, then writes the post around it.",
    card: {
      body: "Three years of invoices in one spreadsheet. Our pricing was wrong for one customer size.",
      label: "Receipt. What we charge and why",
    },
  },
  {
    who: "Agencies",
    line: `One board per client, up to ${AGENCY_SEATS}. Each client authorises their own profile, and you never hold a password.`,
    card: {
      body: "We ran the same campaign twice, six months apart. The second one cost 40 percent less.",
      label: "Data. What we learned running ads",
    },
  },
  {
    who: "Consultants",
    line: "Being known for something beats being seen. Four themes hold the line, and the board says how many days of runway are left.",
    card: {
      body: "Most retainers die in month four. Here is the meeting that kills them.",
      label: "Framework. How retainers work",
    },
  },
];

const PERMISSIONS = [
  "We never see your LinkedIn password. LinkedIn handles sign in.",
  "We never read your inbox, your connections, or your feed.",
  "We never post anything you have not approved.",
  "Access lasts 60 days, then you reconnect. We email you first.",
];

/* The hero's label is a sentence, so on a phone it wraps. Balanced rather
   than ragged, or the break lands after the price and leaves "/ month" alone
   on the second line. */
const primary =
  "btn-accent num inline-block w-full text-balance rounded-[var(--r-btn)] px-6 py-[13px] text-center text-[16px] font-semibold leading-[1.3] sm:w-auto";
const secondary =
  "btn-outline inline-block w-full rounded-[var(--r-btn)] border border-hairline px-6 py-[13px] text-center text-[16px] font-semibold sm:w-auto";
const soft =
  "btn-soft inline-block w-full rounded-[var(--r-btn)] px-6 py-[13px] text-center text-[16px] font-semibold sm:w-auto";

/** Heading left, the month so far right. Every section, same shape. */
function SectionHead({
  posted,
  children,
}: {
  posted: number;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-8 border-t border-hairline pt-8 sm:flex-row sm:items-start sm:justify-between sm:gap-16">
      {children}
      <StreakMark posted={posted} />
    </div>
  );
}

export default function Home() {
  return (
    <>
      <SiteNav />
      <main className="bg-surface">
        {/* Hero. Centred, which is the one place the page gives up the left
            rag: a claim this short reads as a statement in the middle of the
            window and as a column of text against the edge. It is also the
            only headline on the site that puts the accent on a word, and the
            word is cadence, which is the thing being sold. Every other
            heading is the fading sentence, ragged left. */}
        <section className={`${wrap} pt-[90px] pb-[70px] text-center`}>
          <h1 className="mx-auto max-w-[17ch] text-[clamp(44px,7.4vw,86px)] font-semibold leading-[1.02] tracking-[-0.045em]">
            Post on LinkedIn{" "}
            <span
              className="relative inline-flex items-center rounded-full pl-[0.78em] pr-[0.34em] leading-[0.96]"
              style={{
                background: "var(--accent-wash)",
                color: "var(--accent-on-wash)",
              }}
            >
              {/* Out of the flex flow on purpose. An empty span as the first
                  flex item would hand the inline-flex box its own bottom edge
                  as a baseline and the word would sit below the line. The dot
                  is today's cell, at headline size. */}
              <span className="absolute left-[0.3em] top-1/2 h-[0.2em] w-[0.2em] -translate-y-1/2 rounded-full bg-current" />
              daily
            </span>{" "}
            without writing any of it.
          </h1>

          <p className="mx-auto mt-7 max-w-[56ch] text-balance text-[clamp(17px,1.5vw,21px)] leading-[1.45] text-ink-2">
            An agent writes the posts. You approve them on a board. It publishes
            at the time you set.
          </p>

          <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link href={`/signin?plan=${DEFAULT_PLAN.slug}`} className={primary}>
              {HERO_CTA}
            </Link>
            <Link href="#how" className={soft}>
              See how it works
            </Link>
          </div>
          <p className="num mt-4 font-mono text-[12px] text-ink-2">
            {TRIAL_LINE}
          </p>

          <ul className="mt-16 flex flex-wrap items-center justify-center gap-x-10 gap-y-3 text-[14px] text-ink-2">
            {PROOF.map((fact) => (
              <li key={fact} className="num">
                {fact}
              </li>
            ))}
          </ul>
        </section>

        {/* The board, across the seam of two grounds. */}
        <div
          style={{
            background:
              "linear-gradient(to bottom, var(--surface) 0 50%, var(--paper) 50% 100%)",
          }}
        >
          <div className={wrap}>
            <BoardPreview />
          </div>
        </div>

        <section id="how" className="scroll-mt-[var(--nav-h)] bg-paper">
          <div className={`${wrap} ${band}`}>
            <SectionHead posted={1}>
              <div className="max-w-[640px]">
                <h2 className={sectionHeading}>
                  <span>Five columns. Three actions.</span>{" "}
                  <span className="text-ink-3">
                    Approve, revise, reject. There is no fourth one and no
                    editor to get lost in.
                  </span>
                </h2>
              </div>
            </SectionHead>

            <ul className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
              {COLUMNS.map((column, i) => (
                <li
                  key={column.name}
                  className="rounded-[var(--r-lg)] border border-hairline bg-surface p-6"
                >
                  <StepDots index={i} total={COLUMNS.length} />
                  <h3 className="mt-5 text-[17px] font-semibold tracking-[-0.01em]">
                    {column.name}
                  </h3>
                  <p className="mt-2 text-[15px] leading-[1.45] text-ink-2">
                    {column.line}
                  </p>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* The differentiator. The still on the right is the loop in one frame:
            the comment, then the principle it moved. */}
        <section className="bg-surface">
          <div className={`${wrap} ${band}`}>
            <SectionHead posted={4}>
              <div className="max-w-[640px]">
                <h2 className={sectionHeading}>
                  <span>Tell it once.</span>{" "}
                  <span className="text-ink-3">
                    A comment on one card changes the principle above it, so
                    every card after it already knows.
                  </span>
                </h2>
              </div>
            </SectionHead>

            <div className="mt-14 grid gap-14 lg:grid-cols-[1fr_1fr] lg:items-start lg:gap-20">
              <div>
                <p className="max-w-[54ch] text-[17px] text-ink-2">
                  Every tool writes posts. The part that matters is what happens
                  after you say no. Three principles hold everything you have
                  ever corrected, and you can edit them by hand any time.
                </p>
                <ul className="mt-10">
                  {PRINCIPLES.map((principle) => (
                    <li
                      key={principle.kind}
                      className="flex flex-col gap-1 border-b border-hairline py-[14px] sm:flex-row sm:items-baseline sm:justify-between sm:gap-8"
                    >
                      <span className="font-medium">{principle.kind}</span>
                      <span className="text-ink-2 sm:text-right">
                        {principle.line}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="rounded-[var(--r-xl)] bg-paper p-5 sm:p-7">
                <p className="font-mono text-[12px] text-ink-3">A card in Draft</p>
                <div className="mt-3">
                  <CardShell
                    body="Ever wondered why hiring is slow? Let's dive into the key factors that make all the difference."
                    label="Framework. How we hire"
                  >
                    <CardComment comment="Opens with a question and says nothing. Lead with the number." />
                  </CardShell>
                </div>

                <div className="mt-6 flex items-baseline justify-between gap-4 font-mono text-[12px]">
                  <p className="text-ink-3">Voice, one second later</p>
                  <p className="text-accent">Updated</p>
                </div>
                <p className="mt-2 rounded-[var(--r-md)] border border-hairline bg-surface px-4 py-[14px] text-[15px] leading-[1.45]">
                  Reports, does not sell. Short sentences, plain words. Open on
                  the number, never on a question.
                </p>
                <p className="mt-4 text-[13px] leading-[1.45] text-ink-3">
                  Every card written after this one obeys the last line, and you
                  never give that note again.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section id="who" className="scroll-mt-[var(--nav-h)] bg-paper">
          <div className={`${wrap} ${band}`}>
            <SectionHead posted={11}>
              <div className="max-w-[640px]">
                <h2 className={sectionHeading}>
                  <span>Built for people who have to post,</span>{" "}
                  <span className="text-ink-3">
                    not for people who want to write.
                  </span>
                </h2>
              </div>
            </SectionHead>

            <ul className="mt-14 grid gap-4 lg:grid-cols-3">
              {AUDIENCES.map((audience) => (
                <li
                  key={audience.who}
                  className="flex flex-col rounded-[var(--r-xl)] border border-hairline bg-surface p-7"
                >
                  <p className="font-medium">{audience.who}</p>
                  <p className="mt-3 grow text-[15px] leading-[1.5] text-ink-2">
                    {audience.line}
                  </p>
                  <div className="mt-8">
                    <CardShell
                      body={audience.card.body}
                      label={audience.card.label}
                    />
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section id="pricing" className="scroll-mt-[var(--nav-h)] bg-surface">
          <div className={`${wrap} ${band}`}>
            <SectionHead posted={18}>
              <div className="max-w-[640px]">
                <h2 className={sectionHeading}>
                  <span>A ghostwriter costs $1,500 to $3,000 a month.</span>{" "}
                  <span className="text-ink-3">
                    Three prices, all of them on this page, each free for the
                    first {TRIAL_DAYS} days.
                  </span>
                </h2>
              </div>
            </SectionHead>

            <ul className="mt-14 grid gap-4 md:grid-cols-3">
              {PLANS.map((plan, i) => (
                <li
                  key={plan.slug}
                  className="flex flex-col rounded-[var(--r-lg)] border border-hairline bg-surface p-7"
                >
                  <h3 className="text-[15px] font-semibold tracking-[-0.01em]">
                    {plan.name}
                  </h3>
                  <p className="num mt-6 text-[40px] font-semibold leading-none tracking-[-0.04em]">
                    {plan.price}
                  </p>
                  <p className="mt-2 font-mono text-[12px] text-ink-3">
                    a month
                  </p>
                  <p className="mt-6 grow border-t border-hairline pt-6 text-[15px] leading-[1.45] text-ink-2">
                    {plan.line}
                  </p>
                  <Link
                    href={`/signin?plan=${plan.slug}`}
                    className={`num mt-8 block rounded-[var(--r-btn)] border px-5 py-3 text-center text-[15px] font-semibold ${
                      i === 0
                        ? "btn-accent border-transparent"
                        : "btn-outline border-hairline"
                    }`}
                  >
                    {plan.cta}
                  </Link>
                  <p className="num mt-3 text-center font-mono text-[12px] text-ink-3">
                    {TRIAL_LINE}
                  </p>
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section id="permissions" className="scroll-mt-[var(--nav-h)] bg-paper">
          <div className={`${wrap} ${band}`}>
            <SectionHead posted={22}>
              <div className="max-w-[640px]">
                <h2 className={sectionHeading}>
                  <span>What we ask LinkedIn for.</span>{" "}
                  <span className="text-ink-3">
                    Your name and email, and permission to post as you.
                  </span>
                </h2>
              </div>
            </SectionHead>

            <ul className="mt-14 max-w-[720px]">
              {PERMISSIONS.map((line) => (
                <li
                  key={line}
                  className="border-b border-hairline py-[14px] text-ink-2"
                >
                  {line}
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* The close. Centred, because a last screen with one thing to press
            has no second column to rag against, and on the page's one wash of
            the accent. The month above the heading is full, which is the only
            argument left to make. */}
        <section style={{ background: "var(--accent-wash)" }}>
          <div className={`${wrap} ${band} text-center`}>
            <Streak
              posted={25}
              today={false}
              size={150}
              className="mx-auto h-auto w-[120px] lg:w-[150px]"
            />
            <h2 className={`mx-auto mt-10 max-w-[26ch] text-balance ${sectionHeading}`}>
              Your board is full in 90 seconds.
            </h2>
            <p className="mx-auto mt-5 max-w-[56ch] text-balance text-[17px] text-ink-2">
              Sign in with LinkedIn, paste your website, and seven posts are
              waiting before you have paid anything.
            </p>
            <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Link
                href={`/signin?plan=${DEFAULT_PLAN.slug}`}
                className={primary}
              >
                {DEFAULT_PLAN.cta}
              </Link>
              <Link href="#pricing" className={secondary}>
                See all three prices
              </Link>
            </div>
            <p className="num mt-4 font-mono text-[12px] text-ink-2">
              {TRIAL_LINE}
            </p>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
