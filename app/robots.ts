import type { MetadataRoute } from "next";
import { ORIGIN } from "@/lib/share";

/**
 * The marketing pages are for search engines. The screens behind sign in and
 * the API are not: they redirect a crawler to sign in, and an index full of
 * sign in pages is what a launch week crawl would otherwise leave behind.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/api/", "/admin", "/board", "/settings", "/onboarding", "/integrations", "/auth-error"],
    },
    sitemap: `${ORIGIN}/sitemap.xml`,
    host: ORIGIN,
  };
}
