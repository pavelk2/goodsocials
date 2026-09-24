import Anthropic from "@anthropic-ai/sdk";
import { z } from "zod";
import { zodOutputFormat } from "@anthropic-ai/sdk/helpers/zod";
import { anthropic, MODEL, recordSpend } from "./client";
import type { SiteText } from "./site";

/**
 * The market this member sells into, read from public reviews: who operates in
 * the field, the member's own company among them, and what customers of each
 * say they like and dislike. Also the jobs customers hire these products to
 * do and how the field started, because the member picks which of the three
 * the sample is about while this runs. Runs during onboarding while the
 * member answers three questions, so it has well under a minute.
 *
 * It is the whole of the sample post. At onboarding we know the member's
 * website and nothing they have done, so the only true post we can write is
 * one about what other people have said in public. A post about their own
 * results waits until a connected source gives us the numbers.
 *
 * Web search first, the model's own knowledge if search fails. Without search
 * the praise, the complaints, the jobs and the history are dropped here in code, not left to the
 * prompt, because a review we did not read is a review we would be inventing
 * under a real person's name. Citations and structured output cannot share a
 * request, so the searched call returns JSON in text and is validated here.
 */

const CompanySchema = z.object({
  name: z.string().describe("The company, as it is known."),
  own: z.boolean().describe("True for the company whose website you were given."),
  offers: z
    .string()
    .describe("What it sells and to whom, in one plain sentence, as its own site puts it."),
  praised: z
    .string()
    .nullable()
    .describe(
      "What customers say they like, paraphrased from reviews you read. Null if you found none.",
    ),
  criticised: z
    .string()
    .nullable()
    .describe(
      "What customers say they dislike, paraphrased from reviews you read. Null if you found none.",
    ),
  source: z
    .string()
    .nullable()
    .describe("Where those reviews were, for example G2, Capterra, Trustpilot or a Reddit thread."),
});

const JobSchema = z.object({
  job: z
    .string()
    .describe(
      "What a customer hired a product in this field to do, as the progress they wanted in their own situation, paraphrased from what they wrote.",
    ),
  before: z
    .string()
    .nullable()
    .describe("What they used or did before, if they said. Null if they did not."),
  source: z.string().describe("Where it was said, for example G2, a Reddit thread or an app store."),
});

const MilestoneSchema = z.object({
  when: z.string().describe("The year, or the decade if no year is given."),
  what: z.string().describe("What happened, naming the company or person, in one plain sentence."),
  source: z.string().describe("Where you read it, for example Wikipedia or the company's own history page."),
});

const ResearchSchema = z.object({
  field: z
    .string()
    .describe("The field these companies operate in, in a few plain words, lower case."),
  companies: z.array(CompanySchema).max(5),
  jobs: z.array(JobSchema).max(5),
  history: z.array(MilestoneSchema).max(6),
});

export type Company = z.infer<typeof CompanySchema>;
export type Job = z.infer<typeof JobSchema>;
export type Milestone = z.infer<typeof MilestoneSchema>;
export type Research = z.infer<typeof ResearchSchema> & { searched: boolean };

const SYSTEM = `You map the market one company sells into, for a LinkedIn post its founder will publish under their own name.

List three to five companies operating in the same field and selling to the same buyers. The company whose website you are given is always one of them, marked own. Only name a company you found or are certain exists. Fewer real ones beats more invented ones.

For each company, say in one plain sentence what it sells and to whom. Then what its customers say they like and what they say they dislike, paraphrased from reviews you read: review sites, forums, app stores, public threads. Name where the reviews were. If you found no reviews for a company, praised and criticised are null. Never infer an opinion from a company's own marketing, never write one you did not read, and never soften or sharpen what a reviewer said. This includes the own company: if its reviews say something unflattering, report it as written.

Then the jobs: up to five distinct things customers say they hired a product in this field to do, read from the same reviews and threads. Write each as the progress the customer wanted in their situation, not as a feature. Say what they used before only if they said it. An empty list beats an invented job.

Then the history of the field: up to six dated moments from its start to now, such as the first company, the change that made it grow and the arrival of the current leaders. Only dates and names you read. An empty list beats an invented date.

Search efficiently. One search for the field and its alternatives, then searches for reviews that cover several companies at once, such as comparison pages and review site category listings, then one search for the history of the field.

Never use em dashes. Never use "seamless", "leverage", "unlock", "supercharge", "effortless", or "game-changer". Never use "actually", "really", "simply", "just", or "basically".`;

const JSON_INSTRUCTION = `When you have finished searching, reply with one JSON object and nothing else, in this shape:
{"field":"...","companies":[{"name":"...","own":true,"offers":"...","praised":"..." or null,"criticised":"..." or null,"source":"..." or null}],"jobs":[{"job":"...","before":"..." or null,"source":"..."}],"history":[{"when":"...","what":"...","source":"..."}]}`;

function brief(site: Extract<SiteText, { ok: true }>, personName?: string | null): string {
  return [
    personName ? `The person posting is ${personName}.` : "",
    site.url ? `Website: ${site.url}` : "They have no website. This is how they describe what they do.",
    `Title: ${site.title}`,
    "",
    site.text.slice(0, 6000),
  ]
    .filter(Boolean)
    .join("\n");
}

export async function researchCompetitors(opts: {
  site: Extract<SiteText, { ok: true }>;
  profileId: string;
  personName?: string | null;
}): Promise<Research> {
  try {
    return await searched(opts);
  } catch (cause) {
    console.error("[competitors] searched call failed, using model knowledge:", cause);
    return await unsearched(opts);
  }
}

async function searched(opts: {
  site: Extract<SiteText, { ok: true }>;
  profileId: string;
  personName?: string | null;
}): Promise<Research> {
  const response = await anthropic().messages.create(
    {
      model: MODEL,
      max_tokens: 8000,
      thinking: { type: "adaptive" },
      // Low effort: the work here is reading search results, not reasoning
      // about them, and every second spent is a second on the waiting screen.
      output_config: { effort: "low" },
      system: SYSTEM,
      tools: [{ type: "web_search_20260209", name: "web_search", max_uses: 5 }],
      messages: [
        {
          role: "user",
          content: `${brief(opts.site, opts.personName)}\n\n${JSON_INSTRUCTION}`,
        },
      ],
    },
    // The member is answering questions while this runs. Past this it is
    // cheaper to fall back than to keep them waiting on the sample screen.
    { timeout: 45_000, maxRetries: 0 },
  );

  recordSpend({ profileId: opts.profileId, operation: "competitors", usage: response.usage });

  if (response.stop_reason !== "end_turn") {
    throw new Error(`Search stopped with ${response.stop_reason}.`);
  }

  return withOwn({ ...parse(response.content), searched: true }, opts.site);
}

/**
 * A searched answer that skips the jobs or the history, or overruns a list,
 * keeps its companies. The reviews took most of the search and are the one
 * part every sample shape can fall back to.
 */
const LenientResearch = ResearchSchema.extend({
  jobs: ResearchSchema.shape.jobs.catch([]),
  history: ResearchSchema.shape.history.catch([]),
});

function parse(content: Anthropic.ContentBlock[]): z.infer<typeof ResearchSchema> {
  const text = content
    .filter((block): block is Anthropic.TextBlock => block.type === "text")
    .map((block) => block.text)
    .join("");
  const start = text.indexOf("{");
  const end = text.lastIndexOf("}");
  if (start < 0 || end <= start) throw new Error("No JSON in the research answer.");
  return LenientResearch.parse(JSON.parse(text.slice(start, end + 1)));
}

async function unsearched(opts: {
  site: Extract<SiteText, { ok: true }>;
  profileId: string;
  personName?: string | null;
}): Promise<Research> {
  const response = await anthropic().messages.parse({
    model: MODEL,
    max_tokens: 4000,
    thinking: { type: "disabled" },
    output_config: { format: zodOutputFormat(ResearchSchema) },
    system: `${SYSTEM}\n\nYou cannot search, so you have read no reviews. Name a company only if you are certain it exists and sells to these buyers, and leave praised, criticised and source null for every one. Leave jobs and history empty.`,
    messages: [{ role: "user", content: brief(opts.site, opts.personName) }],
  });

  recordSpend({ profileId: opts.profileId, operation: "competitors", usage: response.usage });

  if (!response.parsed_output) {
    throw new Error("The model did not return research in the expected shape.");
  }
  // Enforced here as well as asked for: an opinion nobody read is not written.
  const companies = response.parsed_output.companies.map((c) => ({
    ...c,
    praised: null,
    criticised: null,
    source: null,
  }));
  return withOwn(
    { ...response.parsed_output, companies, jobs: [], history: [], searched: false },
    opts.site,
  );
}

/**
 * The member's company is on the list whatever the model returned, because a
 * market map that leaves out the author reads as a post about somebody else.
 */
function withOwn(research: Research, site: Extract<SiteText, { ok: true }>): Research {
  if (research.companies.some((c) => c.own)) return research;
  const name = site.url ? hostOf(site.url) : site.title;
  return {
    ...research,
    companies: [
      { name, own: true, offers: site.title, praised: null, criticised: null, source: null },
      ...research.companies.slice(0, 4),
    ],
  };
}

function hostOf(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return url;
  }
}

/**
 * Research written before the market map had a different shape. Research from
 * before the content question has no jobs or history, and is read as having
 * found none, so the sample falls back to the market map.
 */
export function isResearch(value: unknown): value is Research {
  return Boolean(value && Array.isArray((value as Research).companies));
}

export function withDefaults(research: Research): Research {
  return { ...research, jobs: research.jobs ?? [], history: research.history ?? [] };
}
