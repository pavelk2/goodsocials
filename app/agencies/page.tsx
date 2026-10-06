import type { Metadata } from "next";
import Link from "next/link";
import {
  Blocks,
  ContentPage,
  LinkRows,
  PageTitle,
  formatDate,
} from "@/components/marketing/content";
import { JsonLd } from "@/components/marketing/json-ld";
import { POSTS } from "@/lib/content/blog";
import type { Block } from "@/lib/content/types";
import { AGENCY_SEATS, IMAGE_CAP_PER_MONTH } from "@/lib/legal";
import { PLANS, TRIAL_LINE } from "@/lib/plans";
import { SITE_NAME, shareMetadata } from "@/lib/share";
import { breadcrumbs, jsonLd } from "@/lib/structured-data";

const agency = PLANS[1];

export const metadata: Metadata = shareMetadata({
  path: "/agencies",
  title: "LinkedIn ghostwriting software for agencies | GoodSocials",
  description: `Run up to ${AGENCY_SEATS} clients' LinkedIn profiles from one account for ${agency.priceLine}. A board per client, posts the client approves, and an email before any client's access runs out.`,
});

/** The agency posts on the blog, in the order a new agency reads them. */
const READING = [
  "start-a-linkedin-ghostwriting-business",
  "linkedin-ghostwriting-pricing",
  "manage-multiple-linkedin-accounts",
  "client-approval-workflow-for-social-posts",
  "linkedin-ghostwriter-vs-ai",
];

const BLOCKS: Block[] = [
  { type: "h2", text: "One board per client" },
  {
    type: "p",
    text: `The ${agency.name} plan holds up to ${AGENCY_SEATS} LinkedIn profiles. Each one has its own board, four themes, three brand principles, image count and connection, and you switch between them from the profile picker. A client's board never draws on another client's voice.`,
  },
  { type: "h2", text: "The client connects their own profile" },
  {
    type: "p",
    text: "Each client signs in with LinkedIn once to connect their profile. You never hold a password. Posts go to the client's personal profile; company pages are out of scope because LinkedIn gates that permission.",
  },
  { type: "h2", text: "Corrections stick per client" },
  {
    type: "p",
    text: "A revise comment rewrites the card and updates that client's brand principles, so a note like 'no questions in the opening line' applies to every later post for that client and to nobody else's. The corrections add up, so the board asks for fewer edits as the weeks go on.",
  },
  { type: "h2", text: "Nobody's feed goes quiet without you knowing" },
  {
    type: "p",
    text: "LinkedIn access lasts 60 days and cannot be renewed in the background. We email you 10 days before a client's connection expires, the board shows a banner 5 days before, and if it lapses, that client's schedule pauses with every post kept in its slot. Reconnecting puts them back on the calendar.",
  },
  { type: "h2", text: "What a client gets" },
  {
    type: "list",
    items: [
      "One post a day at 09:00 in the client's own timezone.",
      "A quality gate before anything is scheduled, which holds posts with invented numbers or unsupported claims.",
      "Posts that cite the client's own numbers from Stripe, GitHub, PostHog, Plausible or Notion, when connected.",
      `Up to ${IMAGE_CAP_PER_MONTH} generated images a month per profile.`,
    ],
  },
  { type: "h2", text: "The arithmetic" },
  {
    type: "p",
    text: `${agency.priceLine} for ${AGENCY_SEATS} profiles is about $83 a profile, against $1,200 for twelve Pro plans. ${TRIAL_LINE}`,
  },
];

export default function Agencies() {
  const reading = READING.flatMap((slug) => {
    const post = POSTS.find((p) => p.slug === slug);
    return post
      ? [{ href: `/blog/${post.slug}`, title: post.title, meta: formatDate(post.date) }]
      : [];
  });

  return (
    <ContentPage>
      <JsonLd
        data={jsonLd(
          breadcrumbs([
            { name: SITE_NAME, path: "" },
            { name: "Agencies", path: "/agencies" },
          ]),
        )}
      />
      <PageTitle
        eyebrow="For agencies"
        title={`Run ${AGENCY_SEATS} clients' LinkedIn from one board.`}
        summary={`The agent writes, you approve, it publishes. ${agency.priceLine}.`}
      >
        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <Link
            href={`/signin?plan=${agency.slug}`}
            className="pill btn-accent num px-6 py-3 text-center text-[16px]"
          >
            {agency.cta}
          </Link>
          <Link
            href="/pricing"
            className="pill btn-outline border border-hairline bg-surface px-6 py-3 text-center text-[16px]"
          >
            Compare the three plans
          </Link>
        </div>
      </PageTitle>

      <div className="mx-auto mt-14 w-full max-w-[760px] px-6">
        <Blocks blocks={BLOCKS} />
      </div>

      <div className="mx-auto mt-20 w-full max-w-[760px] px-6 pb-24">
        <h2 className="font-mono text-[11px] uppercase tracking-[0.12em] text-ink-3">
          Running a LinkedIn agency
        </h2>
        <div className="mt-4">
          <LinkRows rows={reading} />
        </div>
      </div>
    </ContentPage>
  );
}
