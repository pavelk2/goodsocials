import type { Metadata } from "next";
import { shareMetadata } from "@/lib/share";
import { notFound } from "next/navigation";
import {
  Blocks,
  CloseBand,
  ContentPage,
  LinkRows,
  PageTitle,
  formatDate,
} from "@/components/marketing/content";
import { POSTS } from "@/lib/content/blog";

/** Every post is known at build time. Anything else is a 404. */
export const dynamicParams = false;

export function generateStaticParams() {
  return POSTS.map((post) => ({ slug: post.slug }));
}

function find(slug: string) {
  return POSTS.find((post) => post.slug === slug);
}

export async function generateMetadata({
  params,
}: PageProps<"/blog/[slug]">): Promise<Metadata> {
  const post = find((await params).slug);
  if (!post) return {};
  return shareMetadata({
    path: `/blog/${post.slug}`,
    title: `${post.title} | GoodSocials`,
    description: post.description,
    openGraph: { type: "article", publishedTime: post.date },
  });
}

export default async function BlogPost({ params }: PageProps<"/blog/[slug]">) {
  const post = find((await params).slug);
  if (!post) notFound();

  const more = POSTS.filter((p) => p.slug !== post.slug).slice(0, 3);

  return (
    <ContentPage>
      <article>
        <PageTitle
          eyebrow={
            <span className="num">
              {formatDate(post.date)}, {post.readMinutes} min read
            </span>
          }
          title={post.title}
        >
          <p className="mt-6 text-[clamp(17px,1.5vw,20px)] leading-[1.5] text-ink-2">
            {post.description}
          </p>
        </PageTitle>
        <div className="mx-auto mt-12 w-full max-w-[760px] px-6">
          <Blocks blocks={post.blocks} />
        </div>
      </article>

      <div className="mx-auto mt-20 w-full max-w-[760px] px-6">
        <h2 className="font-mono text-[11px] uppercase tracking-[0.12em] text-ink-3">
          Read next
        </h2>
        <div className="mt-4">
          <LinkRows
            rows={more.map((p) => ({
              href: `/blog/${p.slug}`,
              title: p.title,
              meta: formatDate(p.date),
            }))}
          />
        </div>
      </div>

      <CloseBand title="Let the board keep the cadence for you." />
    </ContentPage>
  );
}
