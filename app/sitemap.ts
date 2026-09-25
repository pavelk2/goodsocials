import type { MetadataRoute } from "next";
import { COMPARISONS } from "@/lib/content/compare";
import { POSTS } from "@/lib/content/blog";

/**
 * The public pages, for search engines. goodsocials.co is the one host that
 * appears anywhere a stranger reads, so it is the one this file names.
 */
const ORIGIN = "https://goodsocials.co";

export default function sitemap(): MetadataRoute.Sitemap {
  const pages = ["", "/compare", "/blog", "/docs", "/privacy", "/terms"];
  return [
    ...pages.map((path) => ({ url: `${ORIGIN}${path}` })),
    ...COMPARISONS.map((c) => ({ url: `${ORIGIN}/compare/${c.slug}` })),
    ...POSTS.map((post) => ({
      url: `${ORIGIN}/blog/${post.slug}`,
      lastModified: post.date,
    })),
  ];
}
