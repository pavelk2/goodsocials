import type { Metadata } from "next";
import { shareMetadata } from "@/lib/share";
import {
  CloseBand,
  ContentPage,
  LinkRows,
  PageTitle,
  formatDate,
} from "@/components/marketing/content";
import { POSTS } from "@/lib/content/blog";

export const metadata: Metadata = shareMetadata({
  path: "/blog",
  title: "LinkedIn guides for founders and agencies | GoodSocials",
  description:
    "Practical notes on posting to LinkedIn and other networks in 2026: cadence, openings, formats, timing, themes and what to measure.",
});

export default function BlogIndex() {
  return (
    <ContentPage>
      <PageTitle
        eyebrow="Blog"
        title="Posting well in 2026."
        summary="What we learned running LinkedIn boards, written down so you can use it with or without us."
      />
      <div className="mx-auto mt-14 w-full max-w-[760px] px-6">
        <LinkRows
          rows={POSTS.map((post) => ({
            href: `/blog/${post.slug}`,
            title: post.title,
            line: post.description,
            meta: formatDate(post.date),
          }))}
        />
      </div>
      <CloseBand title="Post five times a week without writing five posts." />
    </ContentPage>
  );
}
