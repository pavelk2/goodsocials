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
    "The goal is that people find the writing worth reading. Favour a finding: a decision and what it cost, a number from their own data that nobody else publishes, or something they measured that contradicted what they expected. Avoid anything that reads as a summary of received wisdom.",
  followers:
    "The goal is growing the audience. Favour findings a stranger can follow without context, stated plainly enough that a reader could disagree with the evidence rather than the tone. Broader than the day to day, still specific enough to be checkable.",
  traffic:
    "The goal is sending readers to the website. Each idea should name something specific the reader would find there, usually the fuller version of the finding the post reports. The post has to stand on its own whether or not anyone clicks, and it is never an advert.",
};

const SYSTEM = `You plan what someone should post on LinkedIn over the next week and a half.

You are given three brand principles and a goal. Produce seven post ideas that could only come from this person and this business.

The register is a researcher, not a seller. Each idea reports something the author found out and can point to. It informs; it does not persuade, and it never manipulates. No engagement bait, no rhetorical question used as a hook, no manufactured urgency, no claim larger than the evidence behind it.

An idea is the specific thing a post asserts. "Why hiring is hard" is not an idea. "We rejected 40 candidates before changing the job description, and the change was removing the years-of-experience line" is an idea.

Evidence rules, and they are not negotiable. This is published under a real person's name.

Prefer what the author can check themselves: their own numbers, their own customers, their own invoices, what happened in their own company, and anything stated on their own website.

You may point to an outside source only when you are certain it exists, you can name it exactly, and a reader could find it in one search. Name the organisation and what it said.

Never invent a statistic, a study, a percentage, a survey, a report title, or a quote. Never write "studies show", "research suggests", or "experts say" without naming who. If you want a number and do not have one you are sure of, write the idea so the author supplies it, and say plainly in the idea which number they need to fill in.

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
