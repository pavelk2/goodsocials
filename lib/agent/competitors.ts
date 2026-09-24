import Anthropic from "@anthropic-ai/sdk";
import { z } from "zod";
import { zodOutputFormat } from "@anthropic-ai/sdk/helpers/zod";
import { anthropic, MODEL, recordSpend } from "./client";
import type { SiteText } from "./site";

/**
 * Who else is posting to this member's readers, what they post, and the gap
 * none of them fill. Runs during onboarding while the member answers three
 * questions, so it has about a minute and spends it on at most three searches.
 *
 * Two outputs matter. The competitors are what the waiting screen shows, which
 * is the first proof that we read their market and not only their homepage.
 * The opening idea is the post the sample is written from, so the first thing
 * a member reads from us is aimed at the gap rather than at the middle.
 *
 * Web search first, the model's own knowledge if search fails. A small
 * business may have no competitor the model has heard of, and search is the
 * only way to name real ones. Citations and structured output cannot share a
 * request, so the searched call returns JSON in text and is validated here.
 */

const ResearchSchema = z.object({
  competitors: z
    .array(
      z.object({
        name: z.string().describe("The company or the person, as they are known."),
        posts: z
          .string()
          .describe(
            "What they post about on LinkedIn or in public, in one sentence of plain words.",
          ),
      }),
    )
    .max(3),
  gap: z
    .string()
    .describe(
      "One or two sentences. What none of them say that this business has the evidence to say.",
    ),
  opening: z.object({
    idea: z
      .string()
      .describe(
        "The first post, as a sentence a writer could work from. Aimed at the gap. It must not need a number only the author has.",
      ),
    kind: z.enum(["framework", "finding"]),
  }),
});

export type Research = z.infer<typeof ResearchSchema> & { searched: boolean };

const SYSTEM = `You research the market one person posts into on LinkedIn, before a ghostwriter writes their first post.

Find up to three competitors: companies or people selling to the same buyers, who publish. For each, say in one plain sentence what they post about. Only name a competitor you found or are certain exists. Fewer than three real ones beats three invented ones, and an empty list is an acceptable answer.

Then name the gap: what none of them say that this business has first hand evidence to say.

Then write the opening idea: one post that sits in that gap. It is a framework (a method in named steps) or a finding (something the author found out and can point to). It must be writable without a number only the author has, because it is written before they have told us anything.

Never use em dashes. Never use "seamless", "leverage", "unlock", "supercharge", "effortless", or "game-changer". Never use "actually", "really", "simply", "just", or "basically".`;

const JSON_INSTRUCTION = `When you have finished searching, reply with one JSON object and nothing else, in this shape:
{"competitors":[{"name":"...","posts":"..."}],"gap":"...","opening":{"idea":"...","kind":"framework"}}`;

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
      max_tokens: 16000,
      thinking: { type: "adaptive" },
      output_config: { effort: "medium" },
      system: SYSTEM,
      tools: [{ type: "web_search_20260209", name: "web_search", max_uses: 3 }],
      messages: [
        {
          role: "user",
          content: `${brief(opts.site, opts.personName)}\n\n${JSON_INSTRUCTION}`,
        },
      ],
    },
    // The member is answering questions while this runs. Past this it is
    // cheaper to fall back than to keep them waiting on the sample screen.
    { timeout: 55_000, maxRetries: 0 },
  );

  recordSpend({ profileId: opts.profileId, operation: "competitors", usage: response.usage });

  if (response.stop_reason !== "end_turn") {
    throw new Error(`Search stopped with ${response.stop_reason}.`);
  }

  return { ...parse(response.content), searched: true };
}

function parse(content: Anthropic.ContentBlock[]): z.infer<typeof ResearchSchema> {
  const text = content
    .filter((block): block is Anthropic.TextBlock => block.type === "text")
    .map((block) => block.text)
    .join("");
  const start = text.indexOf("{");
  const end = text.lastIndexOf("}");
  if (start < 0 || end <= start) throw new Error("No JSON in the research answer.");
  return ResearchSchema.parse(JSON.parse(text.slice(start, end + 1)));
}

async function unsearched(opts: {
  site: Extract<SiteText, { ok: true }>;
  profileId: string;
  personName?: string | null;
}): Promise<Research> {
  const response = await anthropic().messages.parse({
    model: MODEL,
    max_tokens: 8000,
    thinking: { type: "adaptive" },
    output_config: { effort: "medium", format: zodOutputFormat(ResearchSchema) },
    system: `${SYSTEM}\n\nYou cannot search. Name a competitor only if you are certain it exists and sells to these buyers.`,
    messages: [{ role: "user", content: brief(opts.site, opts.personName) }],
  });

  recordSpend({ profileId: opts.profileId, operation: "competitors", usage: response.usage });

  if (!response.parsed_output) {
    throw new Error("The model did not return research in the expected shape.");
  }
  return { ...response.parsed_output, searched: false };
}
