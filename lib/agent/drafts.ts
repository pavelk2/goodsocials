import { z } from "zod";
import { zodOutputFormat } from "@anthropic-ai/sdk/helpers/zod";
import { anthropic, MODEL, recordSpend } from "./client";
import { appendUtm } from "@/lib/utm";
import type { Principles } from "./principles";
import type { Goal } from "./ideas";

/**
 * One idea becomes one finished post. The draft is publishable as written: no
 * placeholders the user has to fill in, no bracketed instructions, no title.
 * If the idea needed a number the author has and we do not, the draft says so
 * in plain language and the user fixes it with a revise comment.
 */
const DraftSchema = z.object({
  post: z
    .string()
    .describe(
      "The finished LinkedIn post, exactly as it should appear in the feed. Line breaks where they belong. No title, no hashtags unless the format principle asks for them, no sign off.",
    ),
});

/** LinkedIn truncates the feed preview near here and hard limits at 3000. */
const MAX_COMMENTARY = 3000;

const GOAL_BRIEF: Record<Goal, string> = {
  interesting:
    "The post has to be worth the reader's minute on its own. End where the finding ends. Do not add a call to action.",
  followers:
    "Write so a stranger who has never heard of this person can follow the whole thing without context. Still no call to action.",
  traffic:
    "The post ends with one link to the website, on its own line, introduced by a sentence saying what is on the other side of it. The post has to be worth reading whether or not anyone clicks. One link, never more.",
};

const SYSTEM = `You write one LinkedIn post from one idea, in the voice of the person whose brand principles you are given.

The register is a researcher, not a seller. The post reports something the author found out and can point to. It informs, it does not persuade, and it never manipulates.

Banned outright, because they are what makes LinkedIn unreadable:
Opening with a one line hook followed by a blank line. Rhetorical questions as openers. "Here's the thing". "Let that sink in". "Unpopular opinion". Counting down a list of lessons. Manufactured urgency. Fake vulnerability. A closing question asking for comments. Anything that would read as a template.

Open with the substance. The first sentence is the finding, not a tease of the finding.

Evidence rules, not negotiable, because this publishes under a real person's name.

Never invent a statistic, a study, a percentage, a survey, a report title, a customer name, or a quote. Never write "studies show", "research suggests", or "experts say" without naming exactly who said it and where.

If the idea calls for a number that only the author has, write the sentence around the number and mark the gap in square brackets, for example [your number here], and keep it to one bracket in the whole post. Everything else must be true as written or general enough to be uncontroversial.

Obey the format principle on length, line breaks, and how the post ends. Obey the voice principle on register and sentence shape. If the two disagree, voice wins.

Never use em dashes. Never use "seamless", "leverage", "unlock", "supercharge", "effortless", or "game-changer". Never use "actually", "really", "simply", "just", or "basically". Never write "this is not X, this is Y".

Return the post text and nothing else. No preamble, no explanation, no quotation marks around it.`;

export async function generateDraft(opts: {
  idea: string;
  principles: Principles;
  goal: Goal;
  siteUrl: string | null;
  profileId: string;
}): Promise<string> {
  const response = await anthropic().messages.parse({
    model: MODEL,
    max_tokens: 8000,
    thinking: { type: "adaptive" },
    system: SYSTEM,
    output_config: { format: zodOutputFormat(DraftSchema) },
    messages: [
      {
        role: "user",
        content: [
          "Idea:",
          opts.idea,
          "",
          "Brand principles:",
          `Voice. ${opts.principles.voice}`,
          `Format. ${opts.principles.format}`,
          "",
          `Goal. ${GOAL_BRIEF[opts.goal]}`,
          opts.siteUrl ? `The website to link to is ${opts.siteUrl}` : "",
        ]
          .filter(Boolean)
          .join("\n"),
      },
    ],
  });

  recordSpend({
    profileId: opts.profileId,
    operation: "draft",
    usage: response.usage,
  });

  if (!response.parsed_output) {
    throw new Error("The model did not return a draft in the expected shape.");
  }
  return finish(response.parsed_output.post, opts.goal);
}

/**
 * Everything that happens to a draft after the model and before the database,
 * shared by generation and revision so a revised post is tagged and trimmed the
 * same way the first one was.
 */
export function finish(post: string, goal: Goal): string {
  const text = goal === "traffic" ? appendUtm(post.trim()) : post.trim();
  return text.length > MAX_COMMENTARY ? text.slice(0, MAX_COMMENTARY) : text;
}
