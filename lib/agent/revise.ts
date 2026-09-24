import { z } from "zod";
import { zodOutputFormat } from "@anthropic-ai/sdk/helpers/zod";
import { anthropic, MODEL, recordSpend } from "./client";
import { THIRD_PERSON } from "./person";
import { finish } from "./drafts";
import type { Principles } from "./principles";
import type { Goal } from "./ideas";
import { factsBrief, type FactRow } from "@/lib/integrations/facts";

/**
 * The one thing this product sells. A comment on a card fixes that card, and it
 * also rewrites the brand principle the comment was about, so the same
 * correction never has to be typed twice. Anyone can generate a post. Nobody
 * else remembers what you told them last Tuesday.
 *
 * The principle is nullable on purpose. "The revenue figure is 40k not 60k" is
 * about one card and belongs nowhere else. Writing that into the voice
 * principle would poison every post after it, so the model is allowed to say
 * the correction does not generalise, and it is told when that is the case.
 */
const RevisionSchema = z.object({
  body: z
    .string()
    .describe("The rewritten card, addressing the comment in full."),
  principle: z
    .object({
      kind: z
        .enum(["voice", "visual", "format"])
        .describe(
          "voice for register, wording and what to claim. visual for anything about the image. format for length, structure, line breaks and how a post opens or ends.",
        ),
      text: z
        .string()
        .describe(
          "The full rewritten principle, not a diff and not an appended sentence. Keep everything still true and fold the correction in.",
        ),
      note: z
        .string()
        .describe(
          "One short sentence, shown to the user, saying what changed and therefore what every future post will now do.",
        ),
    })
    .nullable()
    .describe(
      "Null only when the correction is about this card alone and would be wrong to apply to future posts.",
    ),
});

export type Revision = z.infer<typeof RevisionSchema>;

const SYSTEM = `You are revising one card on a LinkedIn content board, and updating the standing instructions that produced it.

You receive the card as it stands, the user's comment on it, and the three brand principles the writer works from.

Do two things.

First, rewrite the card so the comment is fully addressed. Change what the comment asks about and leave everything else alone. The user is correcting one thing, not commissioning a new card, so a revision that reads as a different piece entirely is a failure even when it is better.

Second, decide whether the comment is standing instruction or a one off.

It is standing instruction when it would apply to the next post and the one after: a preference about register, length, structure, what to claim, what to avoid, how images should look, whether to use lists, how to open. Most comments are this. Rewrite the matching principle so the correction is built in, and write it as an instruction to a writer rather than as a note about this card. Never write "as the user mentioned" or refer to the comment at all. The principle has to read as though it was always there.

It is a one off when it corrects a fact about this card and nothing else: a wrong number, a misremembered date, a customer who should not be named. Return null for the principle. Do not stretch a fact correction into a rule.

When a comment carries both, fix the fact in the card and put only the generalisable half into the principle.

Choose one principle, never two. Voice covers register, wording, and what the author will and will not claim. Format covers length, structure, line breaks, how a post opens and ends. Visual covers anything about the picture.

The register stays a researcher, not a seller, whatever the comment says. If the comment asks for engagement bait, a rhetorical hook, manufactured urgency, or a claim larger than the evidence, do the smallest honest version of what they asked and do not write it into a principle.

Never invent a statistic, a study, a percentage, a report title, or a quote. If the comment supplies a number, use their number.

${THIRD_PERSON} Keep a principle you rewrite consistent with it, so a comment never writes the first person into the standing instructions.

Readings from connected tools may appear below. They are real, read from the author's own accounts. You may close a bracket with one when the comment asks you to use the real figure. The comment always outranks a reading: if the two disagree, the author is telling you something the tool does not know, so use theirs and do not mention the difference.

Never use em dashes. Never use "seamless", "leverage", "unlock", "supercharge", "effortless", or "game-changer". Never use "actually", "really", "simply", "just", or "basically". Never write "this is not X, this is Y".`;

/** Nothing connected is the common case, and it should not leave blank lines. */
function factsSection(facts: FactRow[] | undefined): string[] {
  const readings = factsBrief(facts ?? []);
  return readings ? [readings, ""] : [];
}

export async function reviseCardBody(opts: {
  /** An idea card holds a one line brief. A draft card holds a finished post. */
  bodyKind: "idea" | "post";
  body: string;
  comment: string;
  /**
   * The number this card was waiting on, when it was waiting on one. Handed
   * over so the comment supplying it reads as the answer to a question rather
   * than as a stray instruction, and so the bracket closes.
   */
  needs?: string | null;
  principles: Principles;
  goal: Goal;
  /** What the connected sources last read, so "use our real number" can work. */
  facts?: FactRow[];
  profileId: string;
}): Promise<Revision> {
  const response = await anthropic().messages.parse({
    model: MODEL,
    max_tokens: 8000,
    thinking: { type: "adaptive" },
    system: SYSTEM,
    output_config: { format: zodOutputFormat(RevisionSchema) },
    messages: [
      {
        role: "user",
        content: [
          opts.bodyKind === "idea"
            ? "This card is still an idea, so the rewrite is a one or two sentence brief, not a finished post."
            : "This card is a finished post. The rewrite is publishable as written.",
          "",
          "The card:",
          opts.body,
          "",
          "The comment:",
          opts.comment,
          "",
          opts.needs
            ? `This card was waiting on one thing from the author: ${opts.needs}. If the comment supplies it, put it into the card and remove the bracket that was holding its place. If the comment is about something else, leave the bracket where it is. This is a correction about one card, so it is not standing instruction and the principle stays null unless the comment says something separate about how posts should read.`
            : "",
          ...factsSection(opts.facts),
          "Brand principles as they stand:",
          `Voice. ${opts.principles.voice}`,
          `Visual. ${opts.principles.visual}`,
          `Format. ${opts.principles.format}`,
        ].join("\n"),
      },
    ],
  });

  recordSpend({
    profileId: opts.profileId,
    operation: "revise",
    usage: response.usage,
  });

  if (!response.parsed_output) {
    throw new Error("The model did not return a revision in the expected shape.");
  }

  const revision = response.parsed_output;
  return {
    ...revision,
    body:
      opts.bodyKind === "post"
        ? finish(revision.body, opts.goal)
        : revision.body.trim(),
  };
}
