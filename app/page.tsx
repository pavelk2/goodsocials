import Link from "next/link";
import { SiteNav } from "@/components/marketing/site-nav";
import { HeroVideo } from "@/components/marketing/hero-video";
import { SiteFooter } from "@/components/marketing/site-footer";
import { Eyebrow, SectionHead } from "@/components/marketing/section-head";
import { Streak, StepDots } from "@/components/marketing/streak";
import { Reactions } from "@/components/marketing/reactions";
import { BoardPreview } from "@/components/board/board-preview";
import { CardShell, CardComment } from "@/components/board/card-shell";
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
import { isSignedIn } from "@/lib/viewer";

/**
 * The offer copy is verbatim from CLAUDE.md. Do not improve it, derive from it.
 *
 * DESIGN.md section 6 has the full history. Short version: pass one was
 * notion.com with our hex codes in it, pass two stripped every borrowed part
 * and left an unfinished page, and this one takes its shapes from the
 * reference Pavel picked while keeping the material that is ours.
 *
 * What the reference gives us: one warm ground the whole way down instead of
 * alternating bands, pill controls, a centred eyebrow and claim above every
 * section, white cards lifted off the paper, one ink panel for the plan we
 * recommend and one to close on.
 *
 * What stays ours: plum, and only on the live edge of time. The streak grid,
 * which is the dashboard metric drawn at logo size and the only thing on this
 * page that is drawn at all. Geist Mono on every count, price and date. And a
 * board preview that is the real component rendering an example board rather
 * than a picture of one.
 */

const wrap = "mx-auto w-full max-w-[1160px] px-6";

/** The band between two section heads. */
const band = "py-[110px]";

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
 * The five columns as five tiles. The plate on each one is StepDots: the
 * columns behind this one in ink, this one in plum, the ones ahead hairline.
 * It occupies the slot a coloured icon square would and says something the
 * square could not, which is where in a card's life that column sits.
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
 * Three audiences as three cards, each holding a real card from a real board.
 * Weight from structure, not from a colour field standing in for an argument.
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
  {
    head: "We never see your password",
    line: "LinkedIn handles sign in. You approve the connection on their site and we get a token, never a credential.",
  },
  {
    head: "We never read your feed",
    line: "Not your inbox, not your connections, not who looked at your profile. The app asks for permission to post and nothing else.",
  },
  {
    head: "We never post what you have not approved",
    line: "A card publishes because you moved it to Scheduled. Nothing leaves the board any other way.",
  },
  {
    head: "Access lasts 60 days",
    line: "LinkedIn gives out no refresh token, so you reconnect every 60 days. We email you on day 50 and pause the queue rather than fail post by post.",
  },
];

/**
 * The hero's pair, on footage. The primary is the same plum it is everywhere
 * else: plum means now, and nothing is more now than a board that has not been
 * started. The secondary cannot be .btn-outline here, because a hairline in
 * --hairline over dark water is not a border, so it separates by a white edge
 * and a blur instead.
 */
const heroPrimary =
  "pill btn-accent num inline-block w-full text-balance px-7 py-[14px] text-center text-[16px] leading-[1.3] sm:w-auto";
const heroSecondary =
  "pill btn-glass inline-block w-full px-7 py-[14px] text-center text-[16px] sm:w-auto";

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

/**
 * The page reads the session cookie, so it renders per request rather than at
 * build. One cookie read and no query: the price of a member never being shown
 * a button that offers them a trial they are already past. Everything that
 * changes is a label and an href, so a stranger sees the page unchanged.
 */
export default async function Home() {
  const signedIn = await isSignedIn();

  return (
    <>
      <SiteNav overlay signedIn={signedIn} />
      <main className="bg-paper">
        {/* The hero is one screen of footage and nothing else. DESIGN.md
            section 8: the page a stranger lands on has to say what this is in
            one breath, and the argument, the board and the prices all live a
            scroll below where a reader who is still deciding will not meet
            them. The type is pinned white because the ground is dark in both
            system themes, and the plum stays where it always is, on the one
            control that starts a board. */}
        <section
          className="relative isolate -mt-[var(--nav-h)] flex min-h-[600px] flex-col items-center justify-center px-6 pt-[var(--nav-h)] text-center"
          style={{ height: "100svh", color: "#ffffff" }}
        >
          <HeroVideo />

          <h1 className="mx-auto max-w-[20ch] text-balance text-[clamp(40px,6.6vw,78px)] font-semibold leading-[1.02] tracking-[-0.045em]">
            Hire a social media manager for LinkedIn for {DEFAULT_PLAN.price}{" "}
            instead of $3,000.
          </h1>

          <p className="mx-auto mt-6 max-w-[44ch] text-balance text-[clamp(18px,1.9vw,24px)] leading-[1.35]">
            Publishes for you{" "}
            {/* The one coloured phrase on the site, and it is the cadence,
                which is the outcome sold. On footage the plum has to be the
                lighter one, the same swap --accent-text makes in dark mode,
                because #a61e4d on a dark frame is 2.3:1. */}
            <span className="whitespace-nowrap font-semibold" style={{ color: "var(--accent-panel)" }}>
              5 times a week
            </span>{" "}
            after your approval.
          </p>

          <div className="mt-9 flex w-full flex-col items-center justify-center gap-3 sm:w-auto sm:flex-row">
            <Link
              href={planHref(DEFAULT_PLAN.slug, signedIn)}
              className={heroPrimary}
            >
              {signedIn ? SIGNED_IN_CTA : HERO_CTA}
            </Link>
            <Link href="#how" className={heroSecondary}>
              See how it works
            </Link>
          </div>
          {/* The trial line is what makes a stranger press the button. A
              member who is signed in has spent it, so the slot closes rather
              than repeating an offer that has already been taken. */}
          {signedIn ? null : (
            <p
              className="num mt-4 font-mono text-[12px]"
              style={{ color: "rgba(255, 255, 255, 0.8)" }}
            >
              {TRIAL_LINE}
            </p>
          )}

          {/* A full screen of video says nothing about what is under it, so
              the hero has to. One arrow, 6px of travel, and it is a real link
              to the first section rather than a decoration. */}
          <Link
            href="#how"
            aria-label="Skip to how it works"
            className="absolute bottom-8 left-1/2 -translate-x-1/2"
            style={{ color: "rgba(255, 255, 255, 0.8)" }}
          >
            <svg
              width="22"
              height="22"
              viewBox="0 0 22 22"
              fill="none"
              aria-hidden="true"
              className="scroll-cue"
            >
              <path
                d="M5.5 8.5L11 14l5.5-5.5"
                stroke="currentColor"
                strokeWidth="1.7"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </Link>
        </section>

        {/* The page proper starts here, and it starts the way the rest of the
            site reads: ragged left, black first clause, grey remainder. The
            hero sold the idea in six words; this is the first screen that owes
            the reader a mechanism. */}
        <section className={`${wrap} relative pt-[104px] pb-[56px]`}>
          <Reactions />
          <h2 className="max-w-[20ch] text-[clamp(34px,4.6vw,62px)] font-semibold leading-[1.04] tracking-[-0.04em]">
            An agent writes the posts. You approve them on a board.
          </h2>
          <p className="mt-6 max-w-[56ch] text-[clamp(17px,1.5vw,21px)] leading-[1.45] text-ink-2">
            It publishes at the time you set, five times a week, and every
            correction you make sticks to the card after it. Five minutes a
            week, and the month fills in.
          </p>

          <ul className="mt-12 flex flex-wrap items-center gap-x-10 gap-y-3 text-[14px] text-ink-2">
            {PROOF.map((fact) => (
              <li key={fact} className="num">
                {fact}
              </li>
            ))}
          </ul>
        </section>

        {/* The board, in the one panel on the page that carries a wash. The
            reference floats its product shot on a soft gradient; ours is the
            accent at the only weight a whole surface can hold it, so the panel
            is still plum rather than a second hue. */}
        <div className={wrap}>
          <div
            className="overflow-hidden rounded-[var(--r-2xl)] px-4 py-10 sm:px-10 sm:py-14"
            style={{
              background:
                "linear-gradient(170deg, var(--accent-wash) 0%, var(--paper) 62%)",
            }}
          >
            <BoardPreview />
          </div>
        </div>

        <section id="how" className="scroll-mt-[calc(var(--nav-h)+40px)]">
          <div className={`${wrap} ${band}`}>
            <SectionHead
              eyebrow="The board"
              title="Five columns. Three actions."
            >
              Approve, revise, reject. There is no fourth one and no editor to
              get lost in. A card crosses the board and comes back with the
              address it was published at.
            </SectionHead>

            <ul className="mt-16 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
              {COLUMNS.map((column, i) => (
                <li
                  key={column.name}
                  className="card-lift rounded-[var(--r-lg)] p-6"
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
        <section>
          <div className={`${wrap} ${band} pt-0`}>
            <SectionHead eyebrow="Corrections stick" title="Tell it once.">
              A comment on one card changes the principle above it, so every
              card after it already knows. Three principles hold everything you
              have ever corrected, and you can edit them by hand any time.
            </SectionHead>

            <div className="mt-16 grid gap-6 lg:grid-cols-2 lg:items-stretch">
              <div className="card-lift flex flex-col rounded-[var(--r-xl)] p-7 sm:p-9">
                <p className="font-mono text-[12px] text-ink-3">
                  Your three principles
                </p>
                <ul className="mt-5 grow">
                  {PRINCIPLES.map((principle) => (
                    <li
                      key={principle.kind}
                      className="flex flex-col gap-1 border-b border-hairline py-[16px] first:pt-0 last:border-b-0 sm:flex-row sm:items-baseline sm:justify-between sm:gap-8"
                    >
                      <span className="font-medium">{principle.kind}</span>
                      <span className="text-[15px] text-ink-2 sm:text-right">
                        {principle.line}
                      </span>
                    </li>
                  ))}
                </ul>
                <p className="mt-8 text-[15px] leading-[1.5] text-ink-2">
                  Every tool writes posts. The part that matters is what happens
                  after you say no.
                </p>
              </div>

              <div className="card-lift rounded-[var(--r-xl)] bg-paper p-5 sm:p-7">
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
                  <p className="text-accent-text">Updated</p>
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

        <section id="who" className="scroll-mt-[calc(var(--nav-h)+40px)]">
          <div className={`${wrap} ${band} pt-0`}>
            <SectionHead
              eyebrow="Who it is for"
              title="Built for people who have to post, not for people who want to write."
            >
              Three jobs where being known for something is part of the work,
              and writing about it never makes the top of the list.
            </SectionHead>

            <ul className="mt-16 grid gap-4 lg:grid-cols-3">
              {AUDIENCES.map((audience) => (
                <li
                  key={audience.who}
                  className="card-lift flex flex-col rounded-[var(--r-xl)] p-7"
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

        <section id="pricing" className="scroll-mt-[calc(var(--nav-h)+40px)]">
          <div className={`${wrap} ${band} pt-0`}>
            <SectionHead
              eyebrow="Pricing"
              title="A ghostwriter costs $1,500 to $3,000 a month."
            >
              Three prices, all of them on this page, each free for the first{" "}
              {TRIAL_DAYS} days. No setup fee, and you cancel from the settings
              screen.
            </SectionHead>

            {/* Stretch, not items-start: three plans are three versions of one
                object, and a card that is a different size from the one beside
                it reads as a different kind of thing. The plan's one line and
                the feature list both hold their height across the row, so the
                prices sit on one baseline and the buttons on another. */}
            <ul className="mt-16 grid gap-4 md:grid-cols-3">
              {PLANS.map((plan) => (
                <li
                  key={plan.slug}
                  className={`flex flex-col rounded-[var(--r-xl)] p-8 ${
                    plan.featured ? "panel" : "card-lift"
                  }`}
                >
                  {/* No badge on the recommended plan. It cost a whole row
                      on every card, since the other two had to hold the space
                      to keep the prices on one baseline, and the ink ground,
                      the glow and the white button already say which plan the
                      page is pointing at. */}
                  <h3 className="text-[17px] font-semibold tracking-[-0.01em]">
                    {plan.name}
                  </h3>
                  <p
                    className="mt-2 min-h-[44px] text-[15px] leading-[1.45]"
                    style={{
                      color: plan.featured
                        ? "var(--panel-ink-2)"
                        : "var(--ink-2)",
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
                        color: plan.featured
                          ? "var(--panel-ink-2)"
                          : "var(--ink-3)",
                      }}
                    >
                      a month
                    </span>
                  </p>

                  <ul
                    className="mt-8 grow space-y-3 border-t pt-8 text-[15px] leading-[1.45]"
                    style={{
                      borderColor: plan.featured
                        ? "var(--panel-hairline)"
                        : "var(--hairline)",
                      color: plan.featured
                        ? "var(--panel-ink-2)"
                        : "var(--ink-2)",
                    }}
                  >
                    {plan.features.map((feature) => (
                      <li key={feature} className="flex gap-3">
                        <Check />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>

                  {/* The prices stay on the card for a signed in reader,
                      because this is the price list and it is what they came
                      back to check. The buttons go. All three would have to
                      say the same thing, since every one of them opens the
                      same board, and three identical buttons under three
                      different prices reads as a fault. The one line under the
                      grid says what to do instead. */}
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
                          color: plan.featured
                            ? "var(--panel-ink-2)"
                            : "var(--ink-3)",
                        }}
                      >
                        {TRIAL_LINE}
                      </p>
                    </>
                  )}
                </li>
              ))}
            </ul>

            {/* Changing plan is a mail to us until Stripe is wired. Saying so
                beats a button that opens a board the reader is already on. */}
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

        <section id="permissions" className="scroll-mt-[calc(var(--nav-h)+40px)]">
          <div className={`${wrap} ${band} pt-0`}>
            <SectionHead
              eyebrow="What we ask LinkedIn for"
              title="Your name and email, and permission to post as you."
            >
              Four scopes, granted once, and you can see them on your LinkedIn
              settings page at any time. Here is what each one does not let us
              do.
            </SectionHead>

            <ul className="mt-16 grid gap-4 md:grid-cols-2">
              {PERMISSIONS.map((permission) => (
                <li
                  key={permission.head}
                  className="card-lift flex gap-4 rounded-[var(--r-lg)] p-6"
                >
                  <Check />
                  <div>
                    <h3 className="text-[16px] font-semibold tracking-[-0.01em]">
                      {permission.head}
                    </h3>
                    <p className="mt-2 text-[15px] leading-[1.5] text-ink-2">
                      {permission.line}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* The close. One ink panel with the accent glowing off its corner, and
            a full month of the mark inside it. A last screen with one thing to
            press has no second column to rag against. */}
        <section className={`${wrap} pb-[110px]`}>
          <div className="panel rounded-[var(--r-2xl)] px-6 py-[100px] text-center">
            <Eyebrow live onPanel>
              Ready when you are
            </Eyebrow>

            {/* The close is the one place the copy has to change with the
                reader and not only the button. A member who is signed in has
                already done the 90 seconds, and a panel that sells them the
                sign up under a button that opens their board reads as a page
                that does not know who it is talking to. */}
            <h2 className="mx-auto mt-8 max-w-[22ch] text-balance text-[clamp(34px,5vw,58px)] font-semibold leading-[1.04] tracking-[-0.04em]">
              {signedIn
                ? "Your board is waiting."
                : "Your board is full in 90 seconds."}
            </h2>
            <p
              className="mx-auto mt-6 max-w-[54ch] text-balance text-[17px] leading-[1.5]"
              style={{ color: "var(--panel-ink-2)" }}
            >
              {signedIn
                ? "Approve what you like, revise what you do not, and the queue publishes at the time you set."
                : "Sign in with LinkedIn, paste your website, and seven posts are waiting before you have paid anything."}
            </p>

            <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Link
                href={planHref(DEFAULT_PLAN.slug, signedIn)}
                className="pill btn-paper num inline-block w-full px-7 py-[14px] text-center text-[16px] sm:w-auto"
              >
                {signedIn ? SIGNED_IN_CTA : DEFAULT_PLAN.cta}
              </Link>
              <Link
                href="#pricing"
                className="pill btn-outline inline-block w-full border px-7 py-[14px] text-center text-[16px] sm:w-auto"
                style={{
                  borderColor: "var(--panel-hairline)",
                  color: "var(--panel-ink)",
                }}
              >
                See all three prices
              </Link>
            </div>
            {signedIn ? null : (
              <p
                className="num mt-4 font-mono text-[12px]"
                style={{ color: "var(--panel-ink-2)" }}
              >
                {TRIAL_LINE}
              </p>
            )}

            {/* A full month, drawn on ink. The cells the page has been filling
                the whole way down, finished. */}
            <div className="mt-16">
              <Streak
                posted={25}
                today={false}
                size={110}
                className="mx-auto h-auto w-[92px] opacity-90 lg:w-[110px]"
                ink="var(--panel-ink)"
                empty="var(--panel-hairline)"
              />
              <p
                className="mt-5 font-mono text-[12px]"
                style={{ color: "var(--panel-ink-2)" }}
              >
                One cell per day. A month at the cadence we sell.
              </p>
            </div>
          </div>
        </section>
      </main>
      <SiteFooter signedIn={signedIn} />
    </>
  );
}
