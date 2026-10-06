import type { Metadata } from "next";
import Link from "next/link";
import {
  Blocks,
  CloseBand,
  ContentPage,
  PageTitle,
} from "@/components/marketing/content";
import { JsonLd } from "@/components/marketing/json-ld";
import { AGENCY_SEATS, IMAGE_CAP_PER_MONTH } from "@/lib/legal";
import { PLANS, TRIAL_DAYS, TRIAL_LINE } from "@/lib/plans";
import { SITE_NAME, shareMetadata } from "@/lib/share";
import { breadcrumbs, faq, jsonLd, software } from "@/lib/structured-data";

const [pro, agency, consultancy] = PLANS;

export const metadata: Metadata = shareMetadata({
  path: "/pricing",
  title: `GoodSocials pricing: ${pro.priceLine} per LinkedIn profile`,
  description: `${pro.name} is ${pro.priceLine} for one LinkedIn profile. ${agency.name} is ${agency.priceLine} for up to ${AGENCY_SEATS}. ${consultancy.name} is ${consultancy.priceLine} with the founder setting it up. ${TRIAL_DAYS} days free on each.`,
});

/**
 * The questions people ask before they pay, answered from what the product
 * enforces. Each answer is also on the docs page or the plan card; this page
 * is where a search for the price lands.
 */
const QUESTIONS = [
  {
    q: "What does the price include?",
    a: `Writing, revisions, images and publishing. The agent writes the posts, you approve them on a board, and it publishes one a day at 09:00 in your timezone. Up to ${IMAGE_CAP_PER_MONTH} generated images a month per profile. No setup fee.`,
  },
  {
    q: "Is there a free trial?",
    a: `${TRIAL_DAYS} days free on every plan. You see seven posts written for your profile before you are asked for a card.`,
  },
  {
    q: "How does the agency plan work?",
    a: `${agency.priceLine} holds up to ${AGENCY_SEATS} LinkedIn profiles, about $83 each when all are in use. Each client gets a board, four themes and three brand principles of their own, and connects their own profile, so you never hold a password.`,
  },
  {
    q: "How do I cancel?",
    a: "From settings, which opens the Stripe billing portal. Publishing stops at the end of the period you paid for. Plan and card changes happen in the same place.",
  },
  {
    q: "What happens if a payment fails?",
    a: "Posts keep publishing while Stripe retries the card, which takes about three weeks. Most retries succeed.",
  },
  {
    q: "Does it post to company pages or other networks?",
    a: "No. LinkedIn personal profiles only. LinkedIn gates the company page permission, and every other network is out of scope.",
  },
];

export default function Pricing() {
  return (
    <ContentPage>
      <JsonLd
        data={jsonLd(
          software(),
          faq(QUESTIONS),
          breadcrumbs([
            { name: SITE_NAME, path: "" },
            { name: "Pricing", path: "/pricing" },
          ]),
        )}
      />
      <PageTitle
        eyebrow="Pricing"
        title="Three prices."
        summary={`${TRIAL_DAYS} days free on each. A social media manager costs $3,000 a month.`}
      />

      <div className="mx-auto mt-14 w-full max-w-[1080px] px-6">
        <ul className="grid gap-4 md:grid-cols-3">
          {PLANS.map((plan) => (
            <li
              key={plan.slug}
              className={`flex flex-col rounded-[var(--r-xl)] p-8 ${
                plan.featured ? "panel" : "card-lift"
              }`}
            >
              <h2 className="text-[17px] font-semibold tracking-[-0.01em]">
                {plan.name}
              </h2>
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
                className="mt-8 grow space-y-3 border-t pt-8 pl-5 text-[15px] leading-[1.45] [list-style:disc]"
                style={{
                  borderColor: plan.featured
                    ? "var(--panel-hairline)"
                    : "var(--hairline)",
                  color: plan.featured ? "var(--panel-ink-2)" : "var(--ink-2)",
                }}
              >
                {plan.features.map((feature) => (
                  <li key={feature}>{feature}</li>
                ))}
              </ul>
              <Link
                href={`/signin?plan=${plan.slug}`}
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
            </li>
          ))}
        </ul>
        <p className="mt-8 text-center text-[15px] text-ink-2">
          Running clients&rsquo; profiles?{" "}
          <Link href="/agencies" className="underline underline-offset-4">
            How the agency plan works
          </Link>
          .
        </p>
      </div>

      <div className="mx-auto mt-20 w-full max-w-[760px] px-6">
        <Blocks
          blocks={QUESTIONS.flatMap((item) => [
            { type: "h2" as const, text: item.q },
            { type: "p" as const, text: item.a },
          ])}
        />
      </div>

      <CloseBand title="See seven posts before you pay." />
    </ContentPage>
  );
}
