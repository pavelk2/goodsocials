import { z } from "zod";
import { zodOutputFormat } from "@anthropic-ai/sdk/helpers/zod";
import { anthropic, MODEL, recordSpend } from "./client";
import type { Principles } from "./principles";
import { KIND_LABEL, type PostKind } from "@/lib/post-kind";
import { factsBrief, type FactRow } from "@/lib/integrations/facts";
import type { Theme } from "./themes";

export type { PostKind };

/**
 * Seven ideas, because seven is what a new board shows and roughly a week and a
 * half of near-daily posting. An idea is a sentence a writer could work from,
 * not a title and not a finished post.
 *
 * Each idea now carries two more decisions: the theme it sits under and the
 * shape it takes. Both are made here rather than in the draft, because a
 * framework and a receipt are different posts from the first sentence, and
 * deciding at draft time means the board cannot show what is coming.
 */

/**
 * The bias, in one array, because it is the thing most likely to be tuned.
 *
 * Seven slots, and the order is the order the board fills in, so the first two
 * cards a new user reads are the two kinds that are hardest to fake. Six of the
 * seven are frameworks, data breakdowns or receipts. A plain finding keeps one
 * slot so a board that is nothing but reference material still has a person in
 * it.
 *
 * Receipts are weighted equal to the other two rather than above them, which
 * they would deserve, for one reason: a receipt needs a number we do not hold.
 * Three of seven cards blocked on the user is a board nobody can approve.
 */
export const KIND_MIX: PostKind[] = [
  "framework",
  "receipt",
  "data",
  "framework",
  "receipt",
  "data",
  "finding",
];

export const IDEA_COUNT = KIND_MIX.length;

/**
 * What each kind is, written to the planner. The three biased ones are the
 * formats a reader saves, cites, or believes, and each one fails in its own
 * way, so each brief spends most of its words on the failure.
 */
const KIND_BRIEF: Record<PostKind, string> = {
  framework:
    "A method the reader can apply, in named steps or named parts, in an order that matters. It has to come from something the author has done more than once and can describe concretely, not from theory and not from what the internet already says about the subject. The test is whether a reader would come back to it a second time. If the steps would fit any company, it is not a framework, it is a listicle.",
  data:
    "One finding from outside the author's own business, and what it means for the reader. Name the source exactly: the organisation, the report, the year. If you cannot name a source you are certain of, do not invent one and do not soften it into 'research suggests'. Write the idea so the author supplies the source, and say in the needs field exactly what you need them to confirm.",
  receipt:
    "One real number from the author's own business. Revenue, conversion rate, an experiment result, churn, a cost, a price change and what happened after it. This is the most credible thing a founder can post, and it is credible only because it is theirs, so never guess at the number, never write a plausible one, and never use a rounded example. Write the sentence the number belongs in, and put in the needs field exactly which number the author has to give you, in the words they would use for it.",
  finding:
    "Something the author found out and can point to. A decision and what it cost, a number from their own data nobody else publishes, or something they measured that contradicted what they expected. Not a summary of received wisdom.",
};

export type Goal = "interesting" | "followers" | "traffic" | "leads";

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
  leads:
    "The goal is that the right buyer thinks of this person the week they have the problem this business solves. Favour ideas that show the work: a problem a customer brought, how it was diagnosed, what it cost them before and after. Each idea should make it obvious who the post is for without naming a product. Never a pitch, never a discount.",
};

const IdeasSchema = z.object({
  ideas: z
    .array(
      z.object({
        idea: z
          .string()
          .describe(
            "One or two sentences naming the specific claim or story the post makes. Concrete enough that two writers would produce a similar post from it.",
          ),
        kind: z
          .enum(["framework", "data", "receipt", "finding"])
          .describe("The shape assigned to this slot. Use the one you were given."),
        theme: z
          .string()
          .describe(
            "The title of the theme this idea sits under, copied exactly from the themes you were given.",
          ),
        needs: z
          .string()
          .nullable()
          .describe(
            "The one thing only the author can supply, named in their own words, for example 'your trial to paid conversion rate last quarter'. Required on a receipt. Null when the idea stands without anything from them.",
          ),
      }),
    )
    .length(IDEA_COUNT),
});

export type GeneratedIdea = z.infer<typeof IdeasSchema>["ideas"][number];

const SYSTEM = `You plan what someone should post on LinkedIn over the next week and a half.

You are given three brand principles, the themes this person posts under, a goal, and a slate: a numbered list saying what shape each idea has to take. Produce one idea per slot, in order, in the shape that slot asks for.

Every idea belongs to one of the themes you were given. Spread them: no theme takes more than two of the seven, and every theme is used at least once. Copy the theme title exactly as it was given to you.

The register is a researcher, not a seller. Each idea reports something the author found out and can point to. It informs; it does not persuade, and it never manipulates. No engagement bait, no rhetorical question used as a hook, no manufactured urgency, no claim larger than the evidence behind it.

An idea is the specific thing a post asserts. "Why hiring is hard" is not an idea. "We rejected 40 candidates before changing the job description, and the change was removing the years-of-experience line" is an idea.

Evidence rules, and they are not negotiable. This is published under a real person's name.

Prefer what the author can check themselves: their own numbers, their own customers, their own invoices, what happened in their own company, and anything stated on their own website.

You may point to an outside source only when you are certain it exists, you can name it exactly, and a reader could find it in one search. Name the organisation and what it said.

Never invent a statistic, a study, a percentage, a survey, a report title, or a quote. Never write "studies show", "research suggests", or "experts say" without naming who. If you want a number and do not have one you are sure of, write the idea so the author supplies it, and put in the needs field exactly which number they need to fill in.

The needs field is how a gap is declared. An idea with an invented number in it is a failure; an idea that names the number it is missing is correct and useful. Write needs as the author would say it out loud, not as a form field label.

Readings change that calculation. When readings from connected tools appear below, they were read from this person's own Stripe, analytics, repository or notes, and they are already true. A receipt whose number is among them is not a gap: build the idea on the actual figure, quote it exactly as given including the currency and the period, and leave needs null. Only ask for what is genuinely not there. An idea that asks the author to type a number we are already holding is a card they will reject, and rightly.

Seven ideas, seven different shapes. Do not write seven variations of one thought.

Do not write the posts. Do not write hooks. Do not number them.

Never use em dashes. Never use "seamless", "leverage", "unlock", "supercharge", "effortless", or "game-changer". Never use "actually", "really", "simply", "just", or "basically". Never write "this is not X, this is Y".`;

/** The slate: one line per slot, in the order the cards will sit on the board. */
function slate(): string {
  return KIND_MIX.map(
    (kind, i) => `${i + 1}. ${KIND_LABEL[kind]}. ${KIND_BRIEF[kind]}`,
  ).join("\n");
}

export async function generateIdeas(opts: {
  principles: Principles;
  themes: Theme[];
  goal: Goal;
  siteUrl: string;
  siteText: string;
  /**
   * What the connected sources last read. Empty for a profile with nothing
   * connected, which is every profile on day one, so this never becomes a
   * precondition for a board filling up.
   */
  facts?: FactRow[];
  profileId: string;
}): Promise<GeneratedIdea[]> {
  const readings = factsBrief(opts.facts ?? []);

  const response = await anthropic().messages.parse({
    model: MODEL,
    max_tokens: 12000,
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
          "Themes. Every idea sits under one of these, by its exact title:",
          ...opts.themes.map((t) => `${t.title}. ${t.description}`),
          "",
          // Readings before the slate, so the planner knows which receipts it
          // already has a number for before it is told to write two of them.
          ...(readings ? [readings, ""] : []),
          "The slate. One idea per slot, in this order:",
          slate(),
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

  // The slate is what was asked for, so it is what the board gets. A model that
  // returns the right seven ideas in the wrong order should not quietly change
  // the mix that was designed, and a kind the draft does not know is worse than
  // a card labelled slightly wrong.
  return response.parsed_output.ideas.map((idea, i) => ({
    ...idea,
    kind: KIND_MIX[i] ?? idea.kind,
    needs: idea.needs?.trim() ? idea.needs.trim() : null,
  }));
}
