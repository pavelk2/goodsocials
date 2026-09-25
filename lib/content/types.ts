/**
 * The long-form pages outside the product: comparisons, the blog and the docs.
 * Written as data rather than MDX so the copy sits in the repo as plain
 * strings, the writing rules can be checked against it in one pass, and no
 * markdown pipeline is added for thirty pages.
 */
export type Block =
  | { type: "h2"; text: string }
  | { type: "p"; text: string }
  | { type: "list"; items: string[] }
  | { type: "steps"; items: string[] };

/**
 * A source a page cites. The text carries the marker as [1], [2], matching the
 * position in `references`, and the page prints the list at the end. Every
 * entry is a public page someone can open and check.
 */
export type Reference = {
  /** Author or publisher, title, year. Written the way a paper would list it. */
  title: string;
  url: string;
};

export type BlogPost = {
  slug: string;
  title: string;
  /** One sentence, used as the meta description and the line on the index. */
  description: string;
  /** ISO date, YYYY-MM-DD. */
  date: string;
  readMinutes: number;
  blocks: Block[];
  references: Reference[];
};

export type Comparison = {
  /** The competitor's name in kebab-case. The route is /compare/{slug}. */
  slug: string;
  name: string;
  /** Their domain, shown as text and linked. */
  site: string;
  /** What kind of tool they are, in three to six words. */
  category: string;
  /** One sentence on what they do well, fair to them. */
  summary: string;
  /** Who should pick which, in one or two sentences. */
  verdict: string;
  /** Six to eight rows, label left, them and us right. */
  rows: { label: string; them: string; us: string }[];
  chooseThem: string[];
  chooseUs: string[];
  blocks: Block[];
  references: Reference[];
};

/** A string without its citation markers, for meta descriptions and link lines. */
export function plain(text: string): string {
  return text.replace(/\s*\[\d+\]/g, "");
}
