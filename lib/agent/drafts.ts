import { z } from "zod";
import { zodOutputFormat } from "@anthropic-ai/sdk/helpers/zod";
import { anthropic, MODEL, recordSpend } from "./client";
import { appendUtm } from "@/lib/utm";
import type { Principles } from "./principles";
import type { Goal, PostKind } from "./ideas";

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

/**
 * How each kind is built. The planner decided the shape; this decides the
 * sentences. A framework and a receipt open differently, end differently, and
 * fail differently, and a single draft prompt that tries to serve both writes
 * the same post every time.
 */
const KIND_BRIEF: Record<PostKind, string> = {
  framework:
    "Build it as a reference. Name the method in the first sentence, then the steps or parts, each one on its own line with a short name and a sentence saying what it is. Three to six of them. No narrative opener, no story about how you discovered it, no numbered lessons. It ends on the last step. The reader should be able to skim it, save it, and use it a month from now without the context.",
  data:
    "Lead with the finding and name where it came from in the same breath: the organisation, and the report or the year. Then exactly three things it means for the reader, each one a short paragraph of its own, each one a claim the finding supports rather than a restatement of it. If the source was not given to you, do not name one. End on the third takeaway.",
  receipt:
    "The number is the first sentence, with the period it covers. Then what you changed or what you learned from it, in plain language, with no lesson drawn for the reader that the number does not carry. This post is believed because it is specific and because it is theirs, so no rounding for effect and no second number that was not given to you. End where the evidence ends.",
  finding:
    "Open with the substance. The first sentence is the finding, not a tease of it.",
};

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

Never refer to an attached chart, image, graph, table, or screenshot. The picture beside a post is abstract and it is not always there, so a post that says "see the chart below" is a post that is wrong in the feed.

Obey the format principle on length, line breaks, and how the post ends. Obey the voice principle on register and sentence shape. If the two disagree, voice wins.

Never use em dashes. Never use "seamless", "leverage", "unlock", "supercharge", "effortless", or "game-changer". Never use "actually", "really", "simply", "just", or "basically". Never write "this is not X, this is Y".

Return the post text and nothing else. No preamble, no explanation, no quotation marks around it.`;

export async function generateDraft(opts: {
  idea: string;
  kind: PostKind;
  /** The theme this post sits under, for what it is about, not how it reads. */
  theme?: { title: string; description: string } | null;
  /** The number the idea asked the author for, if it asked for one. */
  needs?: string | null;
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
          opts.theme
            ? `Theme. ${opts.theme.title}. ${opts.theme.description}`
            : "",
          `Shape. ${KIND_BRIEF[opts.kind]}`,
          // The gap is handed over as a gap. Told what is missing, the model
          // writes the sentence around it and brackets the hole; not told, it
          // writes a number that looks right, which is the one failure this
          // kind of post cannot survive.
          opts.needs
            ? `The author has not given you this yet: ${opts.needs}. Write the sentence it belongs in and mark the gap with one bracket. Do not estimate it.`
            : "",
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
