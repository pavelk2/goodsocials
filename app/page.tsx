import Link from "next/link";
import type { ReactNode } from "react";
import { SiteNav } from "@/components/marketing/site-nav";
import { SiteFooter } from "@/components/marketing/site-footer";
import { BoardPreview } from "@/components/board/board-preview";
import { CardShell, CardComment } from "@/components/board/card-shell";
import { AGENCY_SEATS } from "@/lib/legal";
import { PLANS, DEFAULT_PLAN, TRIAL_DAYS, TRIAL_LINE } from "@/lib/plans";

/**
 * The offer copy is verbatim from CLAUDE.md. Do not improve it, derive from it.
 *
 * Layout is DESIGN.md section 6: Notion's page skeleton on our palette. Bands
 * of alternating ground rather than one continuous page, a centred hero, the
 * product photographed across the seam of the first two bands, a tile grid, and
 * a closing call to action above a footer that names who built this.
 *
 * What stays ours: plum instead of Notion blue, Geist instead of their grotesk,
 * the real board component instead of a rendered marketing image, tabular
 * numerals on anything that counts, the price in every buying button, and the
 * fading sentence, which survives in the two section headings where the second
 * clause is genuinely a continuation rather than a subheading.
 */

const wrap = "mx-auto w-full max-w-[1200px] px-6";

/** Notion sets section headings around 40px, well under the hero. */
const sectionHeading =
  "text-[clamp(30px,4.2vw,46px)] font-semibold leading-[1.08] tracking-[-0.035em]";

/** For a heading that shares its row with something, where the full size wraps
    to four lines and stops being a heading. */
const sectionHeadingSm =
  "text-[clamp(26px,3.2vw,36px)] font-semibold leading-[1.1] tracking-[-0.03em]";

/**
 * Four facts where Notion puts a wall of customer logos. We have no customer
 * logos worth printing yet, and inventing them is the one thing the house style
 * ends the discussion on. The geometry is the same, the content is true.
 */
const PROOF = [
  "20 posts a month",
  "Five minutes a week",
  `Up to ${AGENCY_SEATS} client boards`,
  `${TRIAL_DAYS} days free`,
];

type Tint = "plum" | "amber" | "sage" | "slate" | "clay";

function tintStyle(tint: Tint) {
  return {
    background: `var(--tint-${tint}-bg)`,
    color: `var(--tint-${tint}-fg)`,
  };
}

/**
 * The five columns of the real board, as the tile grid Notion runs under its
 * hero. Each one says what that column decides, because a column name on its
 * own is a label and this row has to be an argument.
 */
const COLUMNS: {
  name: string;
  tint: Tint;
  line: string;
  icon: ReactNode;
}[] = [
  {
    name: "Idea",
    tint: "plum",
    line: "Four themes decide what your board is about, so week four does not read like week one.",
    icon: (
      <>
        <path d="M12 3.6a5.8 5.8 0 0 0-3.4 10.5c.5.4.9 1 .9 1.7h5a2 2 0 0 1 .9-1.7A5.8 5.8 0 0 0 12 3.6Z" />
        <path d="M9.6 18.4h4.8M10.6 21h2.8" />
      </>
    ),
  },
  {
    name: "Draft",
    tint: "amber",
    line: "A framework, a data breakdown, a receipt or a finding. The shape is picked with the idea, not at draft time.",
    icon: (
      <>
        <path d="M3.5 16.5 14 6a2.1 2.1 0 0 1 3 3L6.5 19.5 3 20.5Z" />
      </>
    ),
  },
  {
    name: "Image",
    tint: "sage",
    line: "Generated at the card's full width, because nobody approves a picture at thumbnail size.",
    icon: (
      <>
        <rect x="3" y="4.5" width="18" height="15" rx="3" />
        <path d="m4 16 4.5-4.5 4 4 3-3L20 17" />
        <circle cx="8.5" cy="9" r="1.4" />
      </>
    ),
  },
  {
    name: "Scheduled",
    tint: "slate",
    line: "You set the time. LinkedIn has no scheduler, so the publish loop is ours and it runs every 15 minutes.",
    icon: (
      <>
        <circle cx="12" cy="12" r="8.5" />
        <path d="M12 7v5.2l3.4 2" />
      </>
    ),
  },
  {
    name: "Posted",
    tint: "clay",
    line: "It went out. The post comes back with its LinkedIn address and the streak on your dashboard moves.",
    icon: (
      <>
        <path d="M4 12.6 9.3 18 20 6.6" />
      </>
    ),
  },
];

/** The three principles, which are what a revise comment actually edits. */
const PRINCIPLES = [
  {
    kind: "Voice",
    line: "How a post sounds. Reports, does not sell.",
  },
  {
    kind: "Visual",
    line: "What the picture may be. Never stock photography.",
  },
  {
    kind: "Format",
    line: "How it is built. Opening line carries the number.",
  },
];

/**
 * Three audiences where Notion runs three customer stories. Same geometry, a
 * flat tint panel instead of a duotone photograph, and a real card at the
 * bottom of each rather than a face we do not have permission to use.
 */
const AUDIENCES: {
  who: string;
  tint: Tint;
  line: string;
  card: { body: string; label: string };
}[] = [
  {
    who: "Founders",
    tint: "plum",
    line: "You have the receipts. The card asks you for the number in your own words, then writes the post around it.",
    card: {
      body: "Three years of invoices in one spreadsheet. Our pricing was wrong for one customer size.",
      label: "Receipt. What we charge and why",
    },
  },
  {
    who: "Agencies",
    tint: "slate",
    line: `One board per client, up to ${AGENCY_SEATS}. Each client authorises their own profile, and you never hold a password.`,
    card: {
      body: "We ran the same campaign twice, six months apart. The second one cost 40 percent less.",
      label: "Data. What we learned running ads",
    },
  },
  {
    who: "Consultants",
    tint: "sage",
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

export default function Home() {
  return (
    <>
      <SiteNav />
      <main className="bg-surface">
        {/* Hero. Centred, which is Notion's and not ours, and the one place the
            page gives up the left rag in exchange for a headline that reads as
            a claim rather than as a column of text. */}
        <section className={`${wrap} pt-20 pb-16 text-center sm:pt-28`}>
          <h1 className="mx-auto max-w-[17ch] text-[clamp(44px,7.4vw,86px)] font-semibold leading-[1.02] tracking-[-0.045em]">
            Post on LinkedIn{" "}
            {/* The one lozenge. Notion puts a tinted pill with a dot around the
                word its whole page turns on, and ours is cadence. Baseline
                nudged so the pill sits on the line rather than under it. */}
            <span
              className="relative inline-flex items-center rounded-full pl-[0.78em] pr-[0.34em] leading-[0.96]"
              style={tintStyle("plum")}
            >
              {/* Out of the flex flow on purpose. An empty span as the first
                  flex item would hand the inline-flex box its own bottom edge
                  as a baseline, and the word would sit below the line. */}
              <span className="absolute left-[0.3em] top-1/2 h-[0.2em] w-[0.2em] -translate-y-1/2 rounded-full bg-current" />
              daily
            </span>{" "}
            without writing any of it.
          </h1>

          <p className="mx-auto mt-7 max-w-[56ch] text-balance text-[clamp(17px,1.5vw,21px)] leading-[1.45] text-ink-2">
            An agent writes the posts. You approve them on a board. It publishes
            at the time you set.
          </p>

          <div className="mt-9 flex flex-wrap items-center justify-center gap-3">
            <Link
              href={`/signin?plan=${DEFAULT_PLAN.slug}`}
              className="btn-accent num w-full rounded-[var(--r-btn)] px-6 py-[13px] text-center text-[16px] font-semibold sm:w-auto"
            >
              {DEFAULT_PLAN.cta}
            </Link>
            <Link
              href="#how"
              className="btn-soft w-full rounded-[var(--r-btn)] px-6 py-[13px] text-center text-[16px] font-semibold sm:w-auto"
            >
              See how it works
            </Link>
          </div>
          <p className="num mt-4 text-[14px] text-ink-3">{TRIAL_LINE}</p>

          {/* Where Notion runs the logo wall. */}
          <ul className="mt-16 flex flex-wrap items-center justify-center gap-x-10 gap-y-3 text-[14px] text-ink-2">
            {PROOF.map((fact) => (
              <li key={fact} className="num">
                {fact}
              </li>
            ))}
          </ul>
        </section>

        {/* The product, across the seam of two bands. Notion crops its
            screenshot on the fold; ours sits on the join so the board is the
            thing that connects the claim above it to the explanation below. */}
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

        {/* Five columns. */}
        <section id="how" className="scroll-mt-[var(--nav-h)] bg-paper">
          <div className={`${wrap} py-24`}>
            <h2 className={`max-w-[20ch] ${sectionHeading}`}>
              Five columns. Three actions.
            </h2>
            <p className="mt-4 max-w-[60ch] text-[17px] text-ink-2">
              Approve, revise, reject. There is no fourth one, no editor to get
              lost in, and nothing to configure before the board fills.
            </p>

            <ul className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
              {COLUMNS.map((column) => (
                <li
                  key={column.name}
                  className="tile rounded-[var(--r-lg)] border border-hairline bg-surface p-5"
                >
                  <span
                    className="flex h-10 w-10 items-center justify-center rounded-[12px]"
                    style={tintStyle(column.tint)}
                  >
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      aria-hidden="true"
                      className="h-[22px] w-[22px]"
                    >
                      {column.icon}
                    </svg>
                  </span>
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

        {/* The differentiator, and the one place the fading sentence survives
            at full strength: the second clause is the same sentence, not a
            subheading under a headline. */}
        <section className="bg-surface">
          <div className={`${wrap} py-24`}>
            <div className="grid gap-14 lg:grid-cols-[1.1fr_1fr] lg:items-start lg:gap-20">
              <div>
                <h2 className={`max-w-[22ch] ${sectionHeading}`}>
                  <span>Tell it once.</span>{" "}
                  <span className="text-ink-3">
                    A comment on one card changes the principle above it, so
                    every card after it already knows.
                  </span>
                </h2>
                <p className="mt-6 max-w-[54ch] text-[17px] text-ink-2">
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

              {/* The loop in one still: the comment, then the principle it
                  moved. Same card component the board draws. */}
              <div className="rounded-[var(--r-xl)] bg-paper p-5 sm:p-7 lg:sticky lg:top-[calc(var(--nav-h)+32px)]">
                <p className="text-[13px] font-medium text-ink-2">
                  A card in Draft
                </p>
                <div className="mt-3">
                  <CardShell
                    body="Ever wondered why hiring is slow? Let's dive into the key factors that make all the difference."
                    label="Framework. How we hire"
                  >
                    <CardComment comment="Opens with a question and says nothing. Lead with the number." />
                  </CardShell>
                </div>

                <div className="mt-6 flex items-baseline justify-between gap-4">
                  <p className="text-[13px] font-medium text-ink-2">
                    Voice, one second later
                  </p>
                  <p className="text-[13px] font-medium text-accent">Updated</p>
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

        {/* Who it is for. Notion's customer story row, without the faces. */}
        <section id="who" className="scroll-mt-[var(--nav-h)] bg-paper">
          <div className={`${wrap} py-24`}>
            <h2 className={`max-w-[24ch] ${sectionHeading}`}>
              Built for people who have to post, not people who want to write.
            </h2>

            <ul className="mt-12 grid gap-4 lg:grid-cols-3">
              {AUDIENCES.map((audience) => (
                <li
                  key={audience.who}
                  className="flex flex-col rounded-[var(--r-2xl)] p-7"
                  style={{ background: `var(--tint-${audience.tint}-bg)` }}
                >
                  <p
                    className="text-[15px] font-semibold"
                    style={{ color: `var(--tint-${audience.tint}-fg)` }}
                  >
                    {audience.who}
                  </p>
                  <p className="mt-4 grow text-[20px] leading-[1.3] tracking-[-0.015em] text-ink">
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

        {/* Pricing. Centred like Notion's, three plain cards like ours. One
            filled button marks the entry plan; no badge, no checkmark lists. */}
        <section id="pricing" className="scroll-mt-[var(--nav-h)] bg-surface">
          <div className={`${wrap} py-24 text-center`}>
            <h2 className={`mx-auto max-w-[26ch] text-balance ${sectionHeading}`}>
              Three prices, all of them on this page.
            </h2>
            <p className="mx-auto mt-4 max-w-[62ch] text-balance text-[17px] text-ink-2">
              A ghostwriter costs $1,500 to $3,000 a month and still needs you
              in a weekly call.
            </p>

            <ul className="mt-12 grid gap-4 text-left md:grid-cols-3">
              {PLANS.map((plan, i) => (
                <li
                  key={plan.slug}
                  className="tile flex flex-col rounded-[var(--r-xl)] border border-hairline bg-surface p-7"
                >
                  <h3 className="text-[15px] font-semibold tracking-[-0.01em]">
                    {plan.name}
                  </h3>
                  <p className="num mt-6 text-[40px] font-semibold leading-none tracking-[-0.04em]">
                    {plan.price}
                  </p>
                  <p className="mt-2 text-[15px] text-ink-3">a month</p>
                  <p className="mt-6 grow border-t border-hairline pt-6 text-[15px] leading-[1.45] text-ink-2">
                    {plan.line}
                  </p>
                  <Link
                    href={`/signin?plan=${plan.slug}`}
                    className={`num mt-8 block rounded-[var(--r-btn)] px-5 py-3 text-center text-[15px] font-semibold ${
                      i === 0
                        ? "btn-accent border border-transparent"
                        : "btn-outline border border-hairline"
                    }`}
                  >
                    {plan.cta}
                  </Link>
                  <p className="num mt-3 text-center text-[13px] text-ink-3">
                    {TRIAL_LINE}
                  </p>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* What LinkedIn is asked for. Rows, no tiles, no tint: the one section
            on the page where the design gets out of the way, because this is
            the part a cautious visitor actually reads. */}
        <section
          id="permissions"
          className="scroll-mt-[var(--nav-h)] border-t border-hairline bg-surface"
        >
          <div className={`${wrap} py-24`}>
            <div className="grid gap-10 lg:grid-cols-[1fr_1.1fr] lg:gap-20">
              <h2 className={`max-w-[22ch] ${sectionHeadingSm}`}>
                <span>What we ask LinkedIn for.</span>{" "}
                <span className="text-ink-3">
                  Your name and email, and permission to post as you.
                </span>
              </h2>
              <ul className="lg:pt-2">
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
          </div>
        </section>

        {/* Closing call to action, on the quiet band. Notion's last screen. */}
        <section className="bg-paper">
          <div className={`${wrap} py-28 text-center`}>
            <h2 className={`mx-auto max-w-[26ch] text-balance ${sectionHeading}`}>
              Your board is full in 90 seconds.
            </h2>
            <p className="mx-auto mt-4 max-w-[56ch] text-balance text-[17px] text-ink-2">
              Sign in with LinkedIn, paste your website, and seven posts are
              waiting before you have paid anything.
            </p>
            <div className="mt-9 flex flex-wrap items-center justify-center gap-3">
              <Link
                href={`/signin?plan=${DEFAULT_PLAN.slug}`}
                className="btn-accent num w-full rounded-[var(--r-btn)] px-6 py-[13px] text-center text-[16px] font-semibold sm:w-auto"
              >
                {DEFAULT_PLAN.cta}
              </Link>
              <Link
                href="#pricing"
                className="btn-soft w-full rounded-[var(--r-btn)] px-6 py-[13px] text-center text-[16px] font-semibold sm:w-auto"
              >
                Running accounts for clients
              </Link>
            </div>
            <p className="num mt-4 text-[14px] text-ink-3">{TRIAL_LINE}</p>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
