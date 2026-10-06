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
import { COMPARISONS } from "@/lib/content/compare";
import type { BlogPost } from "@/lib/content/types";
import { ORIGIN, SITE_NAME } from "@/lib/share";
import { FOUNDER_LINKEDIN } from "@/lib/legal";
import { JsonLd } from "@/components/marketing/json-ld";
import { breadcrumbs, founder, jsonLd } from "@/lib/structured-data";

/** Every post is known at build time. Anything else is a 404. */
export const dynamicParams = false;

export function generateStaticParams() {
  return POSTS.map((post) => ({ slug: post.slug }));
}

function find(slug: string) {
  return POSTS.find((post) => post.slug === slug);
}

type Row = { href: string; title: string; meta?: string };

/** A `related` path as a row, or nothing when the path names no page. */
function row(path: string): Row | undefined {
  const [, section, slug] = path.split("/");
  if (section === "blog") {
    const post = find(slug);
    return post
      ? { href: path, title: post.title, meta: formatDate(post.date) }
      : undefined;
  }
  if (section === "compare") {
    const c = COMPARISONS.find((item) => item.slug === slug);
    return c
      ? { href: path, title: `GoodSocials vs ${c.name}`, meta: "Compare" }
      : undefined;
  }
  return undefined;
}

/**
 * Three rows: the post's own `related` paths first, so a post links to the
 * others on its topic, then the newest posts to fill any gap.
 */
function readNext(post: BlogPost): Row[] {
  const rows = (post.related ?? []).flatMap((path) => row(path) ?? []);
  for (const p of POSTS) {
    if (rows.length >= 3) break;
    const href = `/blog/${p.slug}`;
    if (p.slug === post.slug || rows.some((r) => r.href === href)) continue;
    rows.push({ href, title: p.title, meta: formatDate(p.date) });
  }
  return rows.slice(0, 4);
}

/**
 * Article structured data, so search results can show the date and the person
 * who wrote it, and a breadcrumb back to the blog.
 */
function articleLd(post: BlogPost) {
  const url = `${ORIGIN}/blog/${post.slug}`;
  return jsonLd(
    {
      "@type": "BlogPosting",
      headline: post.title,
      description: post.description,
      datePublished: post.date,
      dateModified: post.updated ?? post.date,
      url,
      mainEntityOfPage: url,
      image: `${ORIGIN}/opengraph-image.png`,
      author: founder(),
      publisher: { "@type": "Organization", name: SITE_NAME, url: ORIGIN },
    },
    breadcrumbs([
      { name: SITE_NAME, path: "" },
      { name: "Blog", path: "/blog" },
      { name: post.title, path: `/blog/${post.slug}` },
    ]),
  );
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
    openGraph: {
      type: "article",
      publishedTime: post.date,
      modifiedTime: post.updated ?? post.date,
    },
  });
}

export default async function BlogPost({ params }: PageProps<"/blog/[slug]">) {
  const post = find((await params).slug);
  if (!post) notFound();

  const more = readNext(post);

  return (
    <ContentPage>
      <JsonLd data={articleLd(post)} />
      <article>
        <PageTitle
          eyebrow={
            <span className="num">
              {formatDate(post.date)}, {post.readMinutes} min read, by{" "}
              <a
                href={FOUNDER_LINKEDIN}
                rel="author noopener"
                className="underline underline-offset-4"
              >
                Pasha
              </a>
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
          <LinkRows rows={more} />
        </div>
      </div>

      <CloseBand title="Let the board keep the cadence for you." />
    </ContentPage>
  );
}
