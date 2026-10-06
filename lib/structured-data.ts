import { FOUNDER_LINKEDIN, SUPPORT } from "@/lib/legal";
import { PLANS } from "@/lib/plans";
import { ORIGIN, SITE_NAME } from "@/lib/share";

/**
 * schema.org JSON-LD for the public pages. What a search engine or an answer
 * engine reads when it wants the company, the prices or where a page sits,
 * without parsing the layout. The prices come from PLANS, so the structured
 * data cannot quote a number the page does not.
 */

type Thing = Record<string, unknown>;

const ORG_ID = `${ORIGIN}/#organization`;

export function organization(): Thing {
  return {
    "@type": "Organization",
    "@id": ORG_ID,
    name: SITE_NAME,
    url: ORIGIN,
    logo: `${ORIGIN}/avatar-400.png`,
    email: SUPPORT,
    founder: founder(),
    sameAs: ["https://www.producthunt.com/products/goodsocials"],
  };
}

/** Pasha, named the way the site names him, linked the way the site links him. */
export function founder(): Thing {
  return {
    "@type": "Person",
    name: "Pasha",
    jobTitle: "Founder",
    url: FOUNDER_LINKEDIN,
    sameAs: [FOUNDER_LINKEDIN],
  };
}

export function software(): Thing {
  return {
    "@type": "SoftwareApplication",
    name: SITE_NAME,
    url: ORIGIN,
    applicationCategory: "BusinessApplication",
    operatingSystem: "Web",
    description:
      "AI social media manager for LinkedIn. Writes posts from research and your own data, you approve them on a board, it publishes 5 times a week.",
    publisher: { "@id": ORG_ID },
    offers: PLANS.map((plan) => ({
      "@type": "Offer",
      name: plan.name,
      description: plan.line,
      price: plan.price.replace(/[$,]/g, ""),
      priceCurrency: "USD",
      url: `${ORIGIN}/pricing`,
    })),
  };
}

/** Home, then each step to the page. `path` is "" for home. */
export function breadcrumbs(trail: { name: string; path: string }[]): Thing {
  return {
    "@type": "BreadcrumbList",
    itemListElement: trail.map((step, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: step.name,
      item: `${ORIGIN}${step.path}`,
    })),
  };
}

export function faq(items: { q: string; a: string }[]): Thing {
  return {
    "@type": "FAQPage",
    mainEntity: items.map((item) => ({
      "@type": "Question",
      name: item.q,
      acceptedAnswer: { "@type": "Answer", text: item.a },
    })),
  };
}

/**
 * One script body for any number of things. The copy is ours, but a "<" in a
 * title must not be able to close the tag.
 */
export function jsonLd(...things: Thing[]): string {
  const data =
    things.length === 1
      ? { "@context": "https://schema.org", ...things[0] }
      : { "@context": "https://schema.org", "@graph": things };
  return JSON.stringify(data).replace(/</g, "\\u003c");
}
