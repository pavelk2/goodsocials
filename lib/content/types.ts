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

export type BlogPost = {
  slug: string;
  title: string;
  /** One sentence, used as the meta description and the line on the index. */
  description: string;
  /** ISO date, YYYY-MM-DD. */
  date: string;
  /** ISO date of the last edit worth telling a reader about. Left out until there is one. */
  updated?: string;
  readMinutes: number;
  blocks: Block[];
  /**
   * Paths this post links to under "Read next", `/blog/{slug}` or
   * `/compare/{slug}`, in order. Keeps posts on one topic linked to each other
   * rather than to whatever sits first in the list. Unknown paths are dropped.
   */
  related?: string[];
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
};
