import { z } from "zod";
import { zodOutputFormat } from "@anthropic-ai/sdk/helpers/zod";
import { anthropic, MODEL, recordSpend } from "./client";
import type { SiteText } from "./site";

/**
 * Three principles, no more. The cap is the feature: ten principles argue with
 * each other and the writing goes grey. Voice and format are what a reader
 * notices; visual is what the image prompt reads on Day 3.
 */
const PrinciplesSchema = z.object({
  voice: z
    .string()
    .describe(
      "How this person sounds when they write. Two or three sentences. Name the register, the sentence length, what evidence they will cite, and one thing they would never say.",
    ),
  visual: z
    .string()
    .describe(
      "What an image for one of their posts should look like. Two or three sentences. Subject matter, treatment, and what to avoid.",
    ),
  format: z
    .string()
    .describe(
      "How their posts are built. Two or three sentences. Typical length, how a post opens, whether it uses line breaks or lists, how it ends.",
    ),
});

export type Principles = z.infer<typeof PrinciplesSchema>;

const SYSTEM = `You write the brand principles that a LinkedIn ghostwriter would keep pinned above their desk.

You are reading one page from a company's website. From it, work out who posts on LinkedIn for this business and how they should sound.

The register is a researcher, not a seller. This person informs, they do not persuade. They report what they found, they name where it came from, and they let the reader draw the conclusion. They never manipulate: no engagement bait, no manufactured urgency, no rhetorical questions used as hooks, no claims that sound bigger than the evidence behind them. Credibility is built by being checkable, not by being confident.

Write the principles as instructions to a writer, not as a description of the company. "Short declarative sentences, no hedging, willing to name a number and say where it came from" is useful. "Professional yet approachable" is not.

Be specific to this business. If the principles you write would fit any company in the same industry, they are too general and you should look harder at the page.

Never use em dashes. Never use "seamless", "leverage", "unlock", "supercharge", "effortless", or "game-changer". Never use "actually", "really", "simply", "just", or "basically". Never write "this is not X, this is Y".`;

export async function generatePrinciples(opts: {
  site: Extract<SiteText, { ok: true }>;
  profileId: string;
  personName?: string | null;
}): Promise<Principles> {
  const response = await anthropic().messages.parse({
    model: MODEL,
    max_tokens: 8000,
    thinking: { type: "adaptive" },
    system: SYSTEM,
    output_config: { format: zodOutputFormat(PrinciplesSchema) },
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
    operation: "principles",
    usage: response.usage,
  });

  if (!response.parsed_output) {
    throw new Error("The model did not return principles in the expected shape.");
  }
  return response.parsed_output;
}
