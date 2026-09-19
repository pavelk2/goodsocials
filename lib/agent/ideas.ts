import { z } from "zod";
import { zodOutputFormat } from "@anthropic-ai/sdk/helpers/zod";
import { anthropic, MODEL, recordSpend } from "./client";
import type { Principles } from "./principles";
import { KIND_LABEL, POST_KINDS, type PostKind } from "@/lib/post-kind";
import type { Theme } from "./themes";

export type { PostKind };

/**
 * Seven ideas, because seven is what a new board shows and roughly a week and a
 * half of near-daily posting. An idea is a sentence a writer could work from,
 * not a title and not a finished post.
 *
 * Each idea carries two more decisions: the theme it sits under and the kind it
 * is. Both are made here rather than in the draft, because research and a
 * personal number are different posts from the first sentence, and deciding at
 * draft time means the board cannot show what is coming.
 */

/**
 * The mix, in one array, because it is the thing most likely to be tuned.
 *
 * Seven slots across three kinds and nothing else. Research takes three because
 * it is the kind that survives a stranger reading it; explainer and personal
 * take two each.
 *
 * Personal is held to two rather than raised, which its credibility would
 * deserve, for one reason: a personal post needs a number we do not hold. Three
 * of seven cards blocked on the author is a board nobody can approve.
 */
export const KIND_MIX: PostKind[] = [
  "research",
  "personal",
  "explainer",
  "research",
  "personal",
  "explainer",
  "research",
];

export const IDEA_COUNT = KIND_MIX.length;

/**
 * What each kind is, written to the planner. Each one fails in its own way, so
 * each brief spends most of its words on the failure.
 *
 * Research and explainer are both researched and cited at draft time, which is
 * why neither brief asks the planner to name a source: a source named here
 * would be one the model remembered rather than one it read, and that is the
 * exact failure the search pass exists to catch. The planner's job on those two
 * is to pose a question the search can answer.
 */
const KIND_BRIEF: Record<PostKind, string> = {
  research:
    "A question the author wants a real answer to, which someone outside their company has published evidence on. Write the question, not the answer: the draft stage searches the web and reports what it finds, so an idea that already contains the finding is an idea that has prejudged it. The test is whether a search could come back and contradict you. If the only possible answer is the one everybody assumes, it is not worth researching. Do not name a study, a statistic, a percentage, or an organisation here.",
  explainer:
    "One thing in the author's field that is widely used and badly understood, and the mechanism behind it. How it actually works, why it was built that way, what the documentation or the standard or the regulation says. Name the thing precisely enough that a search can find its authoritative description. Not a definition anybody could write from memory, and not a list of tips: the reader should finish it understanding a mechanism they could not have guessed at.",
  personal:
    "One real thing out of the author's own business: a number, an experiment and its result, a decision and what it cost, something they measured that contradicted what they expected. This is the most credible thing a founder can post, and it is credible only because it is theirs, so never guess at the number, never write a plausible one, and never use a rounded example. Write the sentence the number belongs in, and put in the needs field exactly which number the author has to give you, in the words they would use for it. Every idea in this kind has a needs.",
};

export type Goal = "interesting" | "followers" | "traffic";

/**
 * The goal changes what gets written, not a setting appended to the end of it.
 */
const GOAL_BRIEF: Record<Goal, string> = {
  interesting:
    "The goal is that people find the writing worth reading. Favour the question whose answer would change how the reader works, and the number the author has that nobody else publishes. Avoid anything that reads as a summary of received wisdom.",
  followers:
    "The goal is growing the audience. Favour questions and mechanisms a stranger can follow without context, put plainly enough that a reader could disagree with the evidence rather than the tone. Broader than the day to day, still specific enough to be checkable.",
  traffic:
    "The goal is sending readers to the website. Each idea should name something specific the reader would find there, usually the fuller version of what the post reports. The post has to stand on its own whether or not anyone clicks, and it is never an advert.",
};

const IdeasSchema = z.object({
  ideas: z
    .array(
      z.object({
        idea: z
          .string()
          .describe(
            "One or two sentences naming the specific question, mechanism, or claim this post is about. Concrete enough that two writers would produce a similar post from it.",
          ),
        kind: z
          .enum(POST_KINDS as [PostKind, ...PostKind[]])
          .describe("The kind assigned to this slot. Use the one you were given."),
        theme: z
          .string()
          .describe(
            "The title of the theme this idea sits under, copied exactly from the themes you were given.",
          ),
        needs: z
          .string()
          .nullable()
          .describe(
            "The one thing only the author can supply, named in their own words, for example 'your trial to paid conversion rate last quarter'. Required on every personal idea. Null on research and explainer, which get their evidence from the web instead.",
          ),
      }),
    )
    .length(IDEA_COUNT),
});

export type GeneratedIdea = z.infer<typeof IdeasSchema>["ideas"][number];

const SYSTEM = `You plan what someone should post on LinkedIn over the next week and a half.

You are given three brand principles, the themes this person posts under, a goal, and a slate: a numbered list saying what kind each idea has to be. Produce one idea per slot, in order, in the kind that slot asks for.

There are three kinds of post and there is no fourth. Research and explainer are both researched against the live web before they are written, and neither publishes without a source. Personal comes out of the author's own business and names the number it needs. An idea that is none of these three is an idea nobody can check, which is the one thing this board does not carry.

Every idea belongs to one of the themes you were given. Spread them: no theme takes more than two of the seven, and every theme is used at least once. Copy the theme title exactly as it was given to you.

The register is a researcher, not a seller. Each idea reports something checkable. It informs; it does not persuade, and it never manipulates. No engagement bait, no rhetorical question used as a hook, no manufactured urgency, no claim larger than the evidence behind it.

An idea is the specific thing a post asserts or asks. "Why hiring is hard" is not an idea. "We rejected 40 candidates before changing the job description, and the change was removing the years-of-experience line" is an idea. "Does requiring a degree in a job posting change who applies, and by how much" is an idea.

Evidence rules, and they are not negotiable. This is published under a real person's name.

Never invent a statistic, a study, a percentage, a survey, a report title, or a quote, and that includes here, in the idea. Never write "studies show", "research suggests", or "experts say". On a research or explainer idea, do not name a source at all: the draft stage searches the web and cites what it actually reads, and a source named from memory here is a source the writer will be tempted to keep.

On a personal idea, the needs field is how the gap is declared. An idea with an invented number in it is a failure; an idea that names the number it is missing is correct and useful. Write needs as the author would say it out loud, not as a form field label.

Seven ideas, seven different subjects. Do not write seven variations of one thought.

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
  profileId: string;
}): Promise<GeneratedIdea[]> {
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
  //
  // needs is forced to match the kind for the same reason. A research card that
  // arrived carrying a needs would ask the author for a number the search is
  // about to go and find, and a personal card without one is a card whose
  // draft will invent the number rather than bracket it.
  return response.parsed_output.ideas.map((idea, i) => {
    const kind = KIND_MIX[i] ?? idea.kind;
    const needs = idea.needs?.trim() ? idea.needs.trim() : null;
    return { ...idea, kind, needs: kind === "personal" ? needs : null };
  });
}
