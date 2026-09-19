import Link from "next/link";
import { Footer } from "@/components/footer";
import { BoardPreview } from "@/components/board/board-preview";
import { AGENCY_SEATS } from "@/lib/legal";
import { PLANS, DEFAULT_PLAN, TRIAL_DAYS, TRIAL_LINE } from "@/lib/plans";

/**
 * The offer copy is verbatim from CLAUDE.md. Do not improve it, derive from it.
 *
 * The board carries this page, per DESIGN.md section 2. Everything else stays
 * quiet: one sentence at hero scale, features as typographic rows, three prices
 * as three plain cards, and exactly one element in the accent, which is the
 * runway figure inside the board.
 *
 * One section per screen. Each one is at least a viewport tall and holds its
 * content in the vertical middle, so a scroll lands on one idea at a time.
 */
const section =
  "mx-auto flex min-h-svh w-full max-w-[1200px] flex-col justify-center px-6 py-24";

/**
 * The hero answers the job, not the category: a visitor wants to be posting on
 * LinkedIn every weekday and does not want to write the posts. These three rows
 * say what arrives, what it costs the reader in time, and what it costs in
 * money, in that order.
 *
 * The price row is the whole price against the whole job, a social media
 * manager for 100 a month. No per post arithmetic: a number that small invites
 * a comparison with a cheap generator rather than with a hire. The ghostwriter
 * figure belongs to the pricing section, where it is stated once.
 *
 * The middle row is a week, not a day. Cards are scheduled ahead, so the work
 * is one sitting that clears the week, and a daily figure would sell a daily
 * chore the product exists to remove.
 */
const HERO_FACTS = [
  {
    fact: "20 posts a month",
    detail: "Written in your voice, with an image, scheduled.",
  },
  {
    fact: "Five minutes a week",
    detail: "Approve a week of cards in one sitting.",
  },
  {
    fact: "$100 a month",
    detail: "A social media manager for your LinkedIn profile.",
  },
];

const buttonPrimary =
  "btn-ink inline-block rounded-[14px] bg-ink px-6 py-[14px] text-[17px] font-semibold text-paper";

export default function Home() {
  return (
    <>
      <main>
        <section className={section}>
          <h1 className="max-w-[24ch] text-[clamp(36px,5.2vw,68px)] font-semibold leading-[1.0] tracking-[-0.035em]">
            <span>A LinkedIn post every weekday, and you never write one.</span>{" "}
            <span className="text-ink-3">
              The agent writes it in your voice, you approve a week of them on
              a board in one sitting, it publishes at the time you set.
            </span>
          </h1>

          <ul className="mt-14 max-w-[720px]">
            {HERO_FACTS.map((row) => (
              <li
                key={row.fact}
                className="flex flex-col gap-1 border-b border-hairline py-[14px] sm:flex-row sm:items-baseline sm:justify-between sm:gap-8"
              >
                <span className="num font-medium">{row.fact}</span>
                <span className="num text-ink-2 sm:text-right">
                  {row.detail}
                </span>
              </li>
            ))}
          </ul>

          <div className="mt-12 flex flex-wrap items-center gap-6">
            <Link
              href={`/signin?plan=${DEFAULT_PLAN.slug}`}
              className={buttonPrimary}
            >
              {DEFAULT_PLAN.cta}
            </Link>
            <Link href="#pricing" className="text-ink-2 underline">
              Running accounts for clients
            </Link>
          </div>
        </section>

        <section className={section}>
          <BoardPreview />
        </section>

        <section className={section}>
          <h2 className="max-w-[24ch] text-[clamp(28px,4vw,48px)] font-semibold leading-[1.05] tracking-[-0.03em]">
            <span>Tell it once.</span>{" "}
            <span className="text-ink-3">
              A comment on a card rewrites that card and changes the principle
              above it, so the next seven posts already know.
            </span>
          </h2>
          <p className="mt-6 max-w-[60ch] text-ink-2">
            Every tool writes posts. The part that matters is what happens after
            you say no. Give a note once and you never give it again.
          </p>

          <ul className="mt-20 grid gap-10 sm:grid-cols-2">
            <li>
              <h3 className="text-[20px] font-semibold tracking-[-0.01em]">
                Three actions
              </h3>
              <p className="mt-2 text-ink-2">
                Approve, revise, reject. There is no fourth one and no editor to
                get lost in.
              </p>
            </li>
            <li>
              <h3 className="text-[20px] font-semibold tracking-[-0.01em]">
                Three principles
              </h3>
              <p className="mt-2 text-ink-2">
                Voice, visual, format. Three, not thirty. Edit them by hand any
                time.
              </p>
            </li>
            <li>
              <h3 className="text-[20px] font-semibold tracking-[-0.01em]">
                Days of runway
              </h3>
              <p className="mt-2 text-ink-2">
                The board says how long your approved queue lasts, and writes
                more ideas before it runs dry.
              </p>
            </li>
            <li>
              <h3 className="text-[20px] font-semibold tracking-[-0.01em]">
                Posts published, and your streak
              </h3>
              <p className="mt-2 text-ink-2">
                The two numbers on the dashboard. Not followers, not
                impressions.
              </p>
            </li>
            <li>
              <h3 className="text-[20px] font-semibold tracking-[-0.01em]">
                Seven posts in 90 seconds
              </h3>
              <p className="mt-2 text-ink-2">
                Sign in, paste your website, and the board is full before you
                have paid anything.
              </p>
            </li>
            <li>
              <h3 className="text-[20px] font-semibold tracking-[-0.01em]">
                One board per client
              </h3>
              <p className="mt-2 text-ink-2">
                For agencies. Up to {AGENCY_SEATS}. Each client authorises their
                own LinkedIn profile.
              </p>
            </li>
          </ul>
        </section>

        <section id="pricing" className={section}>
          <h2 className="max-w-[26ch] text-[clamp(28px,4vw,48px)] font-semibold leading-[1.05] tracking-[-0.03em]">
            <span>A ghostwriter costs $1,500 to $3,000 a month.</span>{" "}
            <span className="text-ink-3">
              Three prices, all of them on this page, each one free for the
              first {TRIAL_DAYS} days.
            </span>
          </h2>
          {/* Each plan starts its own flow from its own card. No shared button
              below the three, because the price in the button has to be the
              price the visitor picked. */}
          <ul className="mt-12 grid gap-4 md:grid-cols-3">
            {PLANS.map((plan) => (
              <li
                key={plan.slug}
                className="flex flex-col rounded-[20px] border border-hairline bg-surface p-6"
              >
                <h3 className="text-[15px] font-semibold tracking-[-0.01em]">
                  {plan.name}
                </h3>
                <p className="num mt-6 text-[34px] font-semibold leading-none tracking-[-0.03em]">
                  {plan.price}
                </p>
                <p className="mt-2 text-[15px] text-ink-3">a month</p>
                <p className="mt-6 grow border-t border-hairline pt-6 text-[15px] text-ink-2">
                  {plan.line}
                </p>
                <Link
                  href={`/signin?plan=${plan.slug}`}
                  className="btn-ink num mt-8 block rounded-[14px] bg-ink px-5 py-3 text-center text-[15px] font-semibold text-paper"
                >
                  {plan.cta}
                </Link>
                <p className="num mt-3 text-center text-[13px] text-ink-3">
                  {TRIAL_LINE}
                </p>
              </li>
            ))}
          </ul>
        </section>

        <section className={section}>
          <h2 className="max-w-[24ch] text-[clamp(28px,4vw,48px)] font-semibold leading-[1.05] tracking-[-0.03em]">
            <span>What we ask LinkedIn for.</span>{" "}
            <span className="text-ink-3">
              Your name and email, and permission to post as you.
            </span>
          </h2>
          <ul className="mt-10 max-w-[620px]">
            {[
              "We never see your LinkedIn password. LinkedIn handles sign in.",
              "We never read your inbox, your connections, or your feed.",
              "We never post anything you have not approved.",
              "Access lasts 60 days, then you reconnect. We email you first.",
            ].map((line) => (
              <li
                key={line}
                className="border-b border-hairline py-[14px] text-ink-2"
              >
                {line}
              </li>
            ))}
          </ul>
        </section>
      </main>
      <Footer />
    </>
  );
}
