import Link from "next/link";
import { Footer } from "@/components/footer";
import { BoardPreview } from "@/components/board/board-preview";
import { AGENCY_SEATS } from "@/lib/legal";

/**
 * The offer copy is verbatim from CLAUDE.md. Do not improve it, derive from it.
 *
 * The board carries this page, per DESIGN.md section 2. Everything else stays
 * quiet: one sentence at hero scale, features as typographic rows, two prices
 * as hairline rows, and exactly one element in the accent, which is the runway
 * figure inside the board.
 *
 * One section per screen. Each one is at least a viewport tall and holds its
 * content in the vertical middle, so a scroll lands on one idea at a time.
 */
const section =
  "mx-auto flex min-h-svh w-full max-w-[1200px] flex-col justify-center px-6 py-24";

/**
 * Three plans, three cards, no badge on a recommended one. The price is the
 * only thing set large, the seat count comes from lib/legal.ts so the landing
 * page and the terms page cannot state different numbers.
 */
const PLANS = [
  { name: "Pro", price: "100 USD", line: "One LinkedIn profile." },
  {
    name: "Agency",
    price: "1000 USD",
    line: `Up to ${AGENCY_SEATS} profiles, one board per client.`,
  },
  {
    name: "Consultancy",
    price: "2000 USD",
    line: `Up to ${AGENCY_SEATS} profiles, and a call with the founder every week.`,
  },
];

export default function Home() {
  return (
    <>
      <main>
        <section className={section}>
          <h1 className="max-w-[26ch] text-[clamp(36px,5.2vw,68px)] font-semibold leading-[1.0] tracking-[-0.035em]">
            <span>AI social media manager for LinkedIn.</span>{" "}
            <span className="text-ink-3">
              It writes, you approve in a kanban board, it schedules so you post
              close to daily.
            </span>
          </h1>

          <div className="mt-12">
            <Link
              href="/signin"
              className="inline-block rounded-[14px] bg-ink px-6 py-[14px] text-[17px] font-semibold text-paper"
            >
              Start for 100 USD a month
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
                For agencies. Up to ten. Each client authorises their own
                LinkedIn profile.
              </p>
            </li>
          </ul>
        </section>

        <section className={section}>
          <h2 className="max-w-[26ch] text-[clamp(28px,4vw,48px)] font-semibold leading-[1.05] tracking-[-0.03em]">
            <span>A ghostwriter costs 1500 to 3000 a month.</span>{" "}
            <span className="text-ink-3">
              Three prices, all of them on this page.
            </span>
          </h2>
          <ul className="mt-12 grid gap-4 md:grid-cols-3">
            {PLANS.map((plan) => (
              <li
                key={plan.name}
                className="rounded-[20px] border border-hairline bg-surface p-6"
              >
                <h3 className="text-[15px] font-semibold tracking-[-0.01em]">
                  {plan.name}
                </h3>
                <p className="num mt-6 text-[34px] font-semibold leading-none tracking-[-0.03em]">
                  {plan.price}
                </p>
                <p className="mt-2 text-[15px] text-ink-3">a month</p>
                <p className="mt-6 border-t border-hairline pt-6 text-[15px] text-ink-2">
                  {plan.line}
                </p>
              </li>
            ))}
          </ul>
          <div className="mt-10">
            <Link
              href="/signin"
              className="inline-block rounded-[14px] bg-ink px-6 py-[14px] text-[17px] font-semibold text-paper"
            >
              Start for 100 USD a month
            </Link>
          </div>
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
