import Link from "next/link";

import { HeroBoard } from "@/components/marketing/hero-board";
import { AGENCY_SEATS, PLANS, PRICE_SOLO } from "@/lib/legal";

/**
 * The landing page. The offer copy in CLAUDE.md is the source and is set here
 * verbatim. The hero is the real board, built from the real board components
 * rather than a screenshot, so it cannot fall out of date with the product.
 */
export default function Home() {
  return (
    <>
      <header className="mx-auto w-full max-w-[1100px] px-6 pt-8 font-semibold">
        GoodSocials
      </header>

      <main>
        <section className="mx-auto w-full max-w-[1100px] px-6 pt-20 sm:pt-28">
          <h1 className="type-hero max-w-[20ch]">
            <span>AI social media manager for LinkedIn.</span>{" "}
            <span className="cont">
              Writes high quality content, you approve it in a kanban board, it
              schedules so you post regularly, close to daily.
            </span>
          </h1>

          <Link href="/start" className="btn btn-accent mt-12">
            Start for {PRICE_SOLO}
          </Link>
        </section>

        {/* The one memorable thing on the page. Nothing else moves. */}
        <section className="mx-auto w-full max-w-[1100px] px-6 py-20 sm:py-28">
          <HeroBoard />
        </section>

        <section className="mx-auto w-full max-w-[1100px] px-6 pb-24">
          <h2 className="type-head max-w-[18ch]">
            <span>The agent writes, you approve, it posts.</span>{" "}
            <span className="cont">
              Three buttons on every card, and a comment box that changes every
              card after it.
            </span>
          </h2>

          <ul className="mt-16 grid gap-x-16 gap-y-10 sm:grid-cols-2">
            {FEATURES.map((feature) => (
              <li key={feature.name}>
                <h3 className="text-[20px] font-semibold leading-[1.3] tracking-[-0.01em]">
                  {feature.name}
                </h3>
                <p className="mt-1 max-w-[46ch] text-ink-2">{feature.body}</p>
              </li>
            ))}
          </ul>
        </section>

        <section className="mx-auto w-full max-w-[1100px] px-6 pb-24">
          <h2 className="type-head max-w-[18ch]">
            <span>Three prices.</span>{" "}
            <span className="cont">
              Pro for your own profile, Agency for {AGENCY_SEATS} of them,
              Consultant when you want Pavel on a call once a month.
            </span>
          </h2>

          {/*
            Three columns, no card chrome: no box, no border around the tier,
            no shadow, and no badge on a recommended one. A top hairline per
            column reads as a table and stacks into rows on a phone.
          */}
          <ul className="mt-12 grid gap-x-12 gap-y-10 sm:grid-cols-3">
            {PLANS.map((plan) => (
              <li key={plan.name} className="border-t border-hairline pt-4">
                <h3 className="font-semibold">{plan.name}</h3>
                <p className="mt-1 text-[28px] font-semibold leading-[1.1] tracking-[-0.02em]">
                  <span className="num">{plan.amount}</span>{" "}
                  <span className="text-[17px] font-normal text-ink-2">
                    {plan.period}
                  </span>
                </p>
                <p className="mt-2 text-ink-2">{plan.summary}</p>
              </li>
            ))}
          </ul>

          <Link href="/start" className="btn btn-ink mt-12">
            Start for {PRICE_SOLO}
          </Link>
        </section>
      </main>

      <footer className="mx-auto w-full max-w-[1100px] px-6 pb-20 text-ink-2">
        <p className="max-w-[46ch]">
          LinkedIn only. Personal profiles, not company pages. Cancel from
          settings, any month.
        </p>
        <p className="mt-6">Built by Pavel in Amsterdam.</p>
        <p className="mt-2 flex gap-6">
          <Link href="/privacy" className="underline underline-offset-4">
            Privacy
          </Link>
          <Link href="/terms" className="underline underline-offset-4">
            Terms
          </Link>
        </p>
      </footer>
    </>
  );
}

/**
 * Typographic rows, no icons and no cards. Each one names what the person does
 * or what appears, and every number in them is enforced somewhere in the code.
 */
const FEATURES = [
  {
    name: "Five columns.",
    body: "Idea, draft, image, scheduled, posted. The column a card sits in is its state, so the board is the whole status report.",
  },
  {
    name: "Three actions.",
    body: "Approve, revise, reject. There is no fourth button and no text editor, because the writing is the part you are paying to skip.",
  },
  {
    name: "A comment changes every card after it.",
    body: "Say you never write the word thrilled, and it stops writing thrilled. On this card, and on the ones it has not written yet.",
  },
  {
    name: "It posts while you are asleep.",
    body: "A scheduled card goes to your feed at the time on the card. You do not open LinkedIn to make it happen.",
  },
  {
    name: "Runway, not analytics.",
    body: "The board tells you how many days of approved posts are left, and writes more ideas before you run out. No follower counts.",
  },
  {
    name: "Twelve profiles, one login.",
    body: "Each client gets a board, a voice, and a queue of their own. You approve all of them in one sitting.",
  },
  {
    name: "200 images a month, per profile.",
    body: "The count sits in settings. At the cap the button tells you so and names the reset date, instead of failing quietly.",
  },
  {
    name: "Re-authorization is handled.",
    body: "A LinkedIn token dies after 60 days. We email you on day 50 and pause the queue on day 60, rather than dropping posts nobody notices.",
  },
];
