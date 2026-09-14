import Link from "next/link";
import { Footer } from "@/components/footer";

/**
 * The offer copy is verbatim from CLAUDE.md. Do not improve it, derive from it.
 *
 * This is fuller than a launch holding page needs to be, on purpose. A domain
 * whose only working feature is an OAuth login and whose homepage says nothing
 * reads as phishing to Safe Browsing, which is what happened. Real content
 * about what the product does, who runs it, and what we ask for is the fix.
 *
 * The board screenshot replaces the type-led hero on Day 4, once there is a
 * real board with real cards to photograph.
 */
export default function Home() {
  return (
    <>
      <main className="mx-auto max-w-[900px] px-6 py-24">
        <h1 className="max-w-[18ch] text-[clamp(40px,7vw,88px)] font-semibold leading-[0.98] tracking-[-0.035em]">
          <span>AI social media manager for LinkedIn.</span>{" "}
          <span className="text-ink-3">
            Writes high quality content, you approve it in a kanban board, it
            schedules so you post regularly, close to daily.
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

        <section className="mt-24">
          <h2 className="max-w-[22ch] text-[clamp(28px,4vw,48px)] font-semibold leading-[1.05] tracking-[-0.03em]">
            <span>You already know you should post.</span>{" "}
            <span className="text-ink-3">
              A ghostwriter costs 1500 to 3000 USD a month to fix that. This
              costs 100.
            </span>
          </h2>

          <ul className="mt-12 grid gap-10 sm:grid-cols-2">
            <li>
              <h3 className="text-[20px] font-semibold tracking-[-0.01em]">
                It writes, you approve
              </h3>
              <p className="mt-2 text-ink-2">
                Posts arrive on a board as cards. Three actions on each one:
                approve, revise, reject. Nothing publishes without you.
              </p>
            </li>
            <li>
              <h3 className="text-[20px] font-semibold tracking-[-0.01em]">
                Corrections stick
              </h3>
              <p className="mt-2 text-ink-2">
                Comment on a card and it rewrites that card and updates your
                brand principles, so you never give the same note twice.
              </p>
            </li>
            <li>
              <h3 className="text-[20px] font-semibold tracking-[-0.01em]">
                Three brand principles
              </h3>
              <p className="mt-2 text-ink-2">
                Voice, visual, format. Three, not thirty. The cap is what keeps
                the writing consistent.
              </p>
            </li>
            <li>
              <h3 className="text-[20px] font-semibold tracking-[-0.01em]">
                Cadence is the number
              </h3>
              <p className="mt-2 text-ink-2">
                Posts published this month, and your current streak. Not
                followers, not impressions. We sell showing up.
              </p>
            </li>
            <li>
              <h3 className="text-[20px] font-semibold tracking-[-0.01em]">
                The queue warns you
              </h3>
              <p className="mt-2 text-ink-2">
                If the board runs low on approved posts, it tells you how many
                days of runway are left and writes more ideas.
              </p>
            </li>
            <li>
              <h3 className="text-[20px] font-semibold tracking-[-0.01em]">
                Agencies get one dashboard
              </h3>
              <p className="mt-2 text-ink-2">
                A board per client, up to twelve. Each client authorizes their
                own LinkedIn profile. Approve for them or send an approval link.
              </p>
            </li>
          </ul>
        </section>

        <section className="mt-24">
          <h2 className="max-w-[20ch] text-[clamp(28px,4vw,48px)] font-semibold leading-[1.05] tracking-[-0.03em]">
            <span>Two prices.</span>{" "}
            <span className="text-ink-3">Both of them on this page.</span>
          </h2>
          <ul className="mt-10 max-w-[620px]">
            <li className="flex items-baseline justify-between border-b border-hairline py-[14px]">
              <span>One LinkedIn profile</span>
              <span className="num text-ink-2">100 USD a month</span>
            </li>
            <li className="flex items-baseline justify-between border-b border-hairline py-[14px]">
              <span>Up to 12 profiles, for agencies</span>
              <span className="num text-ink-2">1000 USD a month</span>
            </li>
          </ul>
        </section>

        <section className="mt-24">
          <h2 className="max-w-[24ch] text-[clamp(28px,4vw,48px)] font-semibold leading-[1.05] tracking-[-0.03em]">
            <span>What we ask LinkedIn for.</span>{" "}
            <span className="text-ink-3">
              Your name and email, and permission to post as you. That is the
              whole list.
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
          <div className="mt-10">
            <Link
              href="/signin"
              className="inline-block rounded-[14px] bg-ink px-6 py-[14px] text-[17px] font-semibold text-paper"
            >
              Start for 100 USD a month
            </Link>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
