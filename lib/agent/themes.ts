import { z } from "zod";
import { zodOutputFormat } from "@anthropic-ai/sdk/helpers/zod";
import { anthropic, MODEL, recordSpend } from "./client";
import type { SiteText } from "./site";

/**
 * Four themes, written once from the site and edited by hand after.
 *
 * The principles fix how a post sounds. Nothing until now fixed what it is
 * about, so every idea started from the same homepage and the board drifted
 * back to the same three thoughts by week three. A theme is the column the
 * ideas are dealt into, which is what stops that.
 *
 * Four rather than three. Three is the cap on principles because principles
 * argue with each other; themes do not, they divide. Four covers seven ideas
 * without repeating a theme three times, and it is still few enough that a
 * reader could name what this person posts about.
 */
const THEME_COUNT = 4;

const ThemesSchema = z.object({
  themes: z
    .array(
      z.object({
        title: z
          .string()
          .describe(
            "Two to four words. What a reader would say this person posts about. A subject, not a slogan.",
          ),
        description: z
          .string()
          .describe(
            "One or two sentences, written to the writer. What this person can say under this theme that nobody else can, and where the evidence for it comes from.",
          ),
      }),
    )
    .length(THEME_COUNT),
});

export type Theme = z.infer<typeof ThemesSchema>["themes"][number];

const SYSTEM = `You decide what one person should become known for on LinkedIn.

You are reading one page from a company's website, and the brand principles written from it. Produce four themes: the recurring subjects this person posts under.

A theme is earned, not chosen. It has to be something this business has first hand evidence for: their own customers, their own numbers, their own decisions, the work they do every day. If you cannot say where a year of posts on that theme would come from, it is not a theme.

The four must divide, not overlap. A reader should be able to tell which theme a post belongs to without being told. Four posts that could each sit under any of the four means you have written one theme four times.

At least one theme has to be narrow enough to be uncomfortable. "Leadership" is not a theme. "What we charge and why we changed it" is a theme. Broad themes produce the posts everyone else already wrote.

Do not write a theme about the company's product features. Nobody follows a person for that, and the posts it produces are adverts.

Write each description as an instruction to a writer, not a summary of the company. "Every post here names a number from our own billing data and what we changed because of it" is useful. "Thought leadership on pricing strategy" is not.

Never use em dashes. Never use "seamless", "leverage", "unlock", "supercharge", "effortless", or "game-changer". Never use "actually", "really", "simply", "just", or "basically". Never write "this is not X, this is Y".`;

export async function generateThemes(opts: {
  site: Extract<SiteText, { ok: true }>;
  profileId: string;
  personName?: string | null;
}): Promise<Theme[]> {
  const response = await anthropic().messages.parse({
    model: MODEL,
    max_tokens: 8000,
    thinking: { type: "adaptive" },
    system: SYSTEM,
    output_config: { format: zodOutputFormat(ThemesSchema) },
    messages: [
      {
        role: "user",
        content: [
          opts.personName ? `The person posting is ${opts.personName}.` : "",
          `Website: ${opts.site.url}`,
          `Page title: ${opts.site.title}`,
          "",
          "Page text:",
          opts.site.text,
        ]
          .filter(Boolean)
          .join("\n"),
      },
    ],
  });

  recordSpend({
    profileId: opts.profileId,
    operation: "themes",
    usage: response.usage,
  });

  if (!response.parsed_output) {
    throw new Error("The model did not return themes in the expected shape.");
  }
  return response.parsed_output.themes;
}
