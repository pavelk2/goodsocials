import type Anthropic from "@anthropic-ai/sdk";
import { anthropic, MODEL, recordSpend } from "./client";
import type { PostKind } from "@/lib/post-kind";

/**
 * Where a research post and an explainer get their facts.
 *
 * Nothing in this file asks the model what it knows. It runs one web search
 * call, reads the citations off the answer, and hands back both the brief and
 * the URLs the brief was built from. A claim with no citation behind it does
 * not survive this function, which is the whole reason it exists: the model is
 * a good writer and an unreliable witness, and the board is where that
 * difference has to be caught.
 *
 * The search runs on the draft call and never on onboarding. Onboarding has a
 * 90 second budget and a search pass would spend it.
 */

/** One cited page. `citedText` is the sentence the model actually leaned on. */
export type Source = {
  url: string;
  title: string | null;
  citedText: string | null;
};

export type ResearchResult = {
  /** What was found, in the model's words, for the draft call to write from. */
  brief: string;
  /** Deduplicated by URL, in the order they were first cited. */
  sources: Source[];
};

/**
 * Six searches is enough for one post and small enough to bound the bill. Web
 * search is billed per search on top of tokens, so an unbounded tool is a line
 * item nobody chose.
 */
const MAX_SEARCHES = 6;

/**
 * Sites that publish nothing of their own. A citation to one of these is a
 * citation to a list of other people's links, and a post that rests on it is
 * the slop this product is built to not produce.
 */
const BLOCKED_DOMAINS = [
  "pinterest.com",
  "quora.com",
  "reddit.com",
  "medium.com",
  "linkedin.com",
];

const SYSTEM = `You research one claim for a LinkedIn post that will publish under a real person's name. You do not write the post.

Search the web. Read what comes back. Report only what a named source says.

Every factual sentence you write has to come from a page you found in this session. If you cannot find a source for something, leave it out and say what you could not find. An honest gap is useful; a plausible sentence with nothing behind it is the failure this whole step exists to prevent.

Prefer primary sources: the organisation that ran the study, the company that published the numbers, the regulator that wrote the rule, the documentation of the product itself. A news article about a report is second best, and an aggregator summarising the news article is not a source at all.

Name the year. A 2019 figure presented as current is wrong even when it was right, and the person posting this will be the one corrected in the comments.

When sources disagree, say so and give both. Do not average them and do not pick the more interesting one.

Report in this order:
1. The single strongest finding, in one sentence, with the organisation and the year in it.
2. The evidence behind it: the numbers, the method, the sample, the date, whatever the source actually says.
3. Anything that qualifies it. What the source does not claim, what the sample excludes, where it disagrees with another source.
4. What you looked for and could not find.

Write for the person who will draft the post. No headline, no hook, no opinion about what it means for the reader.

Never use em dashes. Never use "seamless", "leverage", "unlock", "supercharge", "effortless", or "game-changer". Never use "actually", "really", "simply", "just", or "basically". Never write "this is not X, this is Y".`;

/** What each kind needs the search to go and get. */
const BRIEF: Record<"research" | "explainer", string> = {
  research:
    "This is a research post. Go deep on one question and come back with the strongest published evidence on it, including the numbers and who produced them. Breadth is not the goal; a single finding a reader can check is.",
  explainer:
    "This is an explainer. The reader wants to understand how something works or why it is the way it is. Find the authoritative description of the mechanism, from whoever defined, built, or regulates it, and the documented facts that make the explanation correct rather than plausible.",
};

/**
 * How many times a paused turn is resumed before we give up. A server tool
 * that runs long enough to pause is normal; one that pauses three times is a
 * loop, and a loop here spends money while the user watches a button.
 */
const MAX_RESUMES = 2;

export async function research(opts: {
  kind: "research" | "explainer";
  /** The idea, verbatim, because it is the question being researched. */
  idea: string;
  theme?: { title: string; description: string } | null;
  profileId: string;
}): Promise<ResearchResult> {
  const client = anthropic();
  const messages: Anthropic.MessageParam[] = [
    {
      role: "user",
      content: [
        BRIEF[opts.kind],
        "",
        "The claim to research:",
        opts.idea,
        opts.theme
          ? `\nThe author writes about ${opts.theme.title}. ${opts.theme.description}`
          : "",
      ]
        .filter(Boolean)
        .join("\n"),
    },
  ];

  const turns: Anthropic.Message[] = [];
  for (let resume = 0; resume <= MAX_RESUMES; resume += 1) {
    const response = await client.messages.create({
      model: MODEL,
      max_tokens: 8000,
      thinking: { type: "adaptive" },
      system: SYSTEM,
      tools: [
        {
          type: "web_search_20260209",
          name: "web_search",
          max_uses: MAX_SEARCHES,
          blocked_domains: BLOCKED_DOMAINS,
        },
      ],
      messages,
    });

    recordSpend({
      profileId: opts.profileId,
      operation: `research:${opts.kind}`,
      usage: response.usage,
      searches: response.usage.server_tool_use?.web_search_requests ?? 0,
    });

    turns.push(response);

    // The server tool was still working when the turn ended. Handing the whole
    // content array back is what resumes it; handing back only the text would
    // throw away the searches already paid for.
    if (response.stop_reason !== "pause_turn") break;
    messages.push({ role: "assistant", content: response.content });
  }

  // A tool that failed is our problem and reads differently from a subject
  // nobody has written about. Raised rather than returned empty so the card
  // does not tell the user their idea is unresearchable when the search was
  // simply unavailable.
  const failure = toolError(turns);
  if (failure) throw new SearchUnavailableError(failure);

  return {
    brief: turns.map(textOf).filter(Boolean).join("\n\n"),
    sources: citedSources(turns),
  };
}

/**
 * The error code from a failed search, if one failed and nothing was cited.
 *
 * A search that errors after others succeeded is not a failure of the pass: the
 * brief still rests on what the working ones returned, and stopping there would
 * throw away good research over a rate limit on the sixth query.
 */
function toolError(turns: Anthropic.Message[]): string | null {
  let code: string | null = null;
  for (const response of turns) {
    for (const block of response.content) {
      if (block.type !== "web_search_tool_result") continue;
      // A success is a list of results; a failure is a single error object.
      if (!Array.isArray(block.content)) code = block.content.error_code;
    }
  }
  return code && citedSources(turns).length === 0 ? code : null;
}

/** Every text block joined. Tool result and thinking blocks are not the answer. */
function textOf(response: Anthropic.Message): string {
  return response.content
    .filter((block): block is Anthropic.TextBlock => block.type === "text")
    .map((block) => block.text)
    .join("")
    .trim();
}

/** Reads as the failure it is: ours, not the idea's, and worth another press. */
export class SearchUnavailableError extends Error {
  constructor(public readonly code: string) {
    super(`Web search failed: ${code}`);
    this.name = "SearchUnavailableError";
  }
}

/**
 * The citations the model attached to its own sentences, not the list of pages
 * the search returned.
 *
 * The difference is the point. A search result is a page that came back; a
 * citation is a page a sentence was written from. Taking the search results
 * would let a post cite ten pages it never read, which reads more diligent and
 * is less true.
 */
function citedSources(turns: Anthropic.Message[]): Source[] {
  const byUrl = new Map<string, Source>();

  for (const response of turns) {
    for (const block of response.content) {
      if (block.type !== "text" || !block.citations) continue;
      for (const citation of block.citations) {
        if (citation.type !== "web_search_result_location") continue;
        if (byUrl.has(citation.url)) continue;
        byUrl.set(citation.url, {
          url: citation.url,
          title: citation.title,
          citedText: citation.cited_text?.trim() || null,
        });
      }
    }
  }

  return [...byUrl.values()];
}

/**
 * The line the draft call reads. Numbered, because the draft is told to name
 * its sources in the post and a number is how it refers to one without the
 * prompt turning into a bibliography.
 */
export function sourceList(sources: Source[]): string {
  return sources
    .map((s, i) => `${i + 1}. ${s.title ?? s.url} (${s.url})`)
    .join("\n");
}

/** Reads as the failure it is, wherever it surfaces. */
export class NoSourcesError extends Error {
  constructor(public readonly kind: PostKind) {
    super(`A ${kind} post found no source it could cite.`);
    this.name = "NoSourcesError";
  }
}
