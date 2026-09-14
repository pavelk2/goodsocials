import { z } from "zod";
import { zodOutputFormat } from "@anthropic-ai/sdk/helpers/zod";
import { anthropic, MODEL, recordSpend } from "./client";
import type { Principles } from "./principles";

/**
 * Seven ideas, because seven is what a new board shows and roughly a week and a
 * half of near-daily posting. An idea is a sentence a writer could work from,
 * not a title and not a finished post.
 */
const IdeasSchema = z.object({
  ideas: z
    .array(
      z.object({
        idea: z
          .string()
          .describe(
            "One or two sentences naming the specific claim or story the post makes. Concrete enough that two writers would produce a similar post from it.",
          ),
      }),
    )
    .length(7),
});

export type Goal = "interesting" | "followers" | "traffic";

/**
 * The goal changes what gets written, not a setting appended to the end of it.
 */
const GOAL_BRIEF: Record<Goal, string> = {
  interesting:
    "The goal is that people find the writing worth reading. Favour a specific opinion, a decision and what it cost, a number nobody else publishes, or something the author changed their mind about. Avoid anything that reads as a summary of received wisdom.",
  followers:
    "The goal is growing the audience. Favour ideas with a clear point of view that a stranger can follow without context, and that a reader might disagree with out loud. Broader than the day to day, still specific enough to be true.",
  traffic:
    "The goal is sending readers to the website. Each idea should leave a reader with a reason to go and look at something, and should name what they would find there. Do not make the post an advert; the post has to stand alone whether or not anyone clicks.",
};

const SYSTEM = `You plan what someone should post on LinkedIn over the next week and a half.

You are given three brand principles and a goal. Produce seven post ideas that could only come from this person and this business.

An idea is the specific thing a post asserts. "Why hiring is hard" is not an idea. "We rejected 40 candidates before changing the job description, and the change was removing the years-of-experience line" is an idea.

Seven ideas, seven different shapes. Do not write seven variations of one thought.

Do not write the posts. Do not write hooks. Do not number them.

Never use em dashes. Never use "seamless", "leverage", "unlock", "supercharge", "effortless", or "game-changer". Never use "actually", "really", "simply", "just", or "basically". Never write "this is not X, this is Y".`;

export async function generateIdeas(opts: {
  principles: Principles;
  goal: Goal;
  siteUrl: string;
  siteText: string;
  profileId: string;
}): Promise<string[]> {
  const response = await anthropic().messages.parse({
    model: MODEL,
    max_tokens: 8000,
    thinking: { type: "adaptive" },
    system: SYSTEM,
    output_config: { format: zodOutputFormat(IdeasSchema) },
    messages: [
      {
        role: "user",
        content: [
          `Goal: ${GOAL_BRIEF[opts.goal]}`,
          "",
          "Brand principles:",
          `Voice. ${opts.principles.voice}`,
          `Visual. ${opts.principles.visual}`,
          `Format. ${opts.principles.format}`,
          "",
          `Website: ${opts.siteUrl}`,
          "What the business does, from its own page:",
          opts.siteText.slice(0, 6000),
        ].join("\n"),
      },
    ],
  });

  recordSpend({
    profileId: opts.profileId,
    operation: "ideas",
    usage: response.usage,
  });

  if (!response.parsed_output) {
    throw new Error("The model did not return ideas in the expected shape.");
  }
  return response.parsed_output.ideas.map((i) => i.idea);
}
