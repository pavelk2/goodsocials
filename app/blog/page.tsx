import type { Metadata } from "next";
import {
  CloseBand,
  ContentPage,
  LinkRows,
  PageTitle,
  formatDate,
} from "@/components/marketing/content";
import { plain } from "@/lib/content/types";
import { POSTS } from "@/lib/content/blog";

export const metadata: Metadata = {
  title: "Blog | GoodSocials",
  description:
    "Practical notes on posting to LinkedIn and other networks in 2026: cadence, openings, formats, timing, themes and what to measure.",
};

export default function BlogIndex() {
  return (
    <ContentPage>
      <PageTitle
        eyebrow="Blog"
        title="Posting well in 2026."
        summary="Notes on cadence, openings, formats, timing and measurement, each with its sources."
      />
      <div className="mx-auto mt-14 w-full max-w-[760px] px-6">
        <LinkRows
          rows={POSTS.map((post) => ({
            href: `/blog/${post.slug}`,
            title: post.title,
            line: plain(post.description),
            meta: formatDate(post.date),
          }))}
        />
      </div>
      <CloseBand title="Post five times a week without writing five posts." />
    </ContentPage>
  );
}
