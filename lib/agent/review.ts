import { z } from "zod";
import { zodOutputFormat } from "@anthropic-ai/sdk/helpers/zod";
import { anthropic, MODEL, recordSpend } from "./client";
import { THIRD_PERSON } from "./person";
import type { Principles } from "./principles";
import type { PostKind } from "./ideas";
import { factsBrief, type FactRow } from "@/lib/integrations/facts";
import type { QualityIssue } from "@/lib/quality";

/**
 * The editor who reads a post the moment before it takes a slot. The rules in
 * lib/quality.ts catch what a pattern can see; this catches what it cannot: a
 * number nobody gave the writer, a claim about a named company stated as fact,
 * a post that says nothing, an opening that teases instead of reporting.
 *
 * It holds for failures, never for taste. A gate that holds good posts is a
 * gate the member learns to fight, and every hold costs a day of cadence, so
 * the bar is "would this embarrass the person whose name is on it", not
 * "could this be better".
 */
const ReviewSchema = z.object({
  issues: z
    .array(
      z.object({
        problem: z
          .string()
          .describe(
            "What is wrong, in one plain sentence addressed to the author, quoting the words at fault.",
          ),
        fix: z
          .string()
          .describe(
            "A revise comment that would fix it, written as the author would type it to the writer. One or two sentences.",
          ),
      }),
    )
    .max(3)
    .describe(
      "Empty when the post is fit to publish. At most three, the most serious first.",
    ),
});

const SYSTEM = `You are the last editor before a LinkedIn post is scheduled to publish under a real person's name. You decide one thing: is it fit to publish as written.

Hold it only for one of these failures:

Invented evidence. A statistic, percentage, study, survey, report, customer, quote or dollar figure that is not in the readings, not in the author's comments, and not general knowledge a reader in the field would accept without a source. "Studies show" or "research suggests" without naming who and where.
An unsupported claim about a named company, product or person, stated as fact, that would embarrass the author if it were wrong.
It says nothing. A reader in the field would learn nothing from it: generic advice, a restated truism, or filler that would fit any company.
It does not hold together. It contradicts itself, stops mid thought, drifts off the idea it was written for, or its steps and points do not follow from the opening.
It manipulates. A tease instead of a finding in the first sentence, a rhetorical question as the opener, manufactured urgency, fake vulnerability, or engagement bait.

Do not hold it for style, length, word choice or structure the principles allow. Do not hold it because it could be better. If you are unsure whether something is a failure, it is not one. Most posts that reach you are fit to publish, and returning no issues is the common answer.

The posts are written in the third person by design. ${THIRD_PERSON} That is correct and never an issue.

For each issue, write the problem as the author would want to hear it, quoting the words at fault, and the fix as a revise comment the author could send to the writer as it stands.

Never use em dashes. Never use "seamless", "leverage", "unlock", "supercharge", "effortless", or "game-changer". Never use "actually", "really", "simply", "just", or "basically".`;

export async function reviewPost(opts: {
  post: string;
  idea: string;
  kind: PostKind;
  /** The number the idea asked for, if it asked for one. */
  needs: string | null;
  /**
   * Everything the author told the writer in revise comments, oldest first.
   * A number supplied there is the author's own and is not invented, and
   * without these the editor would hold every receipt the member completed.
   */
  comments: string[];
  facts: FactRow[];
  principles: Principles;
  profileId: string;
}): Promise<QualityIssue[]> {
  const readings = factsBrief(opts.facts);

  const response = await anthropic().messages.parse({
    model: MODEL,
    max_tokens: 4000,
    // Low effort thinking, because telling an invented number from a supplied
    // one means reading the post against the readings line by line, and the
    // member waits on this with the Schedule button pressed.
    thinking: { type: "adaptive" },
    output_config: { effort: "low", format: zodOutputFormat(ReviewSchema) },
    system: SYSTEM,
    messages: [
      {
        role: "user",
        content: [
          "The post:",
          "<post>",
          opts.post,
          "</post>",
          "",
          `The idea it was written for: ${opts.idea}`,
          `The shape it was meant to take: ${opts.kind}.`,
          opts.needs
            ? `The idea asked the author for: ${opts.needs}.`
            : "",
          "",
          readings
            ? readings
            : "No tools are connected, so there are no readings. Any specific figure must come from the author's comments or be general knowledge.",
          "",
          opts.comments.length > 0
            ? [
                "What the author told the writer, oldest first. Anything stated here is the author's own and is not invented:",
                ...opts.comments.map((c) => `- ${c}`),
              ].join("\n")
            : "The author has not commented on this post.",
          "",
          "Brand principles:",
          `Voice. ${opts.principles.voice}`,
          `Format. ${opts.principles.format}`,
        ]
          .filter((line) => line !== "")
          .join("\n"),
      },
    ],
  });

  recordSpend({
    profileId: opts.profileId,
    operation: "review",
    usage: response.usage,
  });

  if (!response.parsed_output) {
    throw new Error("The review did not come back in the expected shape.");
  }

  return response.parsed_output.issues.map((i) => ({
    rule: "editor",
    problem: i.problem.trim(),
    fix: i.fix.trim(),
  }));
}
