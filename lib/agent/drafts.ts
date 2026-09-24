import { z } from "zod";
import { zodOutputFormat } from "@anthropic-ai/sdk/helpers/zod";
import { anthropic, MODEL, recordSpend } from "./client";
import { appendUtm } from "@/lib/utm";
import { factsBrief, type FactRow } from "@/lib/integrations/facts";
import type { Principles } from "./principles";
import type { Goal, PostKind } from "./ideas";
import type { Research } from "./competitors";
import { THIRD_PERSON } from "./person";

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
    "The number is the first sentence, with the period it covers. Then what the company changed or what the number showed, in plain language, with no lesson drawn for the reader that the number does not carry. This post is believed because it is specific and because the number belongs to the business it names, so no rounding for effect and no second number that was not given to you. End where the evidence ends.",
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
  engagement:
    "Write so a practitioner in the field has something to add. State the finding plainly enough to agree or disagree with. The last line is one specific question the reader can answer from their own work, such as which of these they use or what the number is for them. Never a generic question like what do you think, never a request to like or share. No link unless the format principle asks for one.",
  leads:
    "Write for the one reader who has this problem right now. The last line says, in one plain sentence, who the business helps with this, named by its name, and that messages are welcome. No link unless the format principle asks for one, no offer, no urgency, and never a question asking for comments.",
};

const SYSTEM = `You write one LinkedIn post from one idea, in the voice of the person whose brand principles you are given.

The register is a researcher, not a seller. The post reports something true that a reader can check. It informs, it does not persuade, and it never manipulates.

Banned outright, because they are what makes LinkedIn unreadable:
Opening with a one line hook followed by a blank line. Rhetorical questions as openers. "Here's the thing". "Let that sink in". "Unpopular opinion". Counting down a list of lessons. Manufactured urgency. Fake vulnerability. A closing question asking for comments, unless the goal asks for one specific question. Anything that would read as a template.

Open with the substance. The first sentence is the finding, not a tease of the finding.

${THIRD_PERSON}

Evidence rules, not negotiable, because this publishes under a real person's name.

Never invent a statistic, a study, a percentage, a survey, a report title, a customer name, or a quote. Never write "studies show", "research suggests", or "experts say" without naming exactly who said it and where.

If the idea calls for a number that only the author has, write the sentence around the number and mark the gap in square brackets, for example [your number here], and keep it to one bracket in the whole post. Everything else must be true as written or general enough to be uncontroversial.

Readings are the exception to the bracket. When readings from connected tools appear below, they were read from the author's own accounts and they are already true. Use the figure exactly as it is written, with the period it covers, and never write a bracket for a number that is sitting in front of you. Do not round one for effect, do not convert a currency, and do not put a second number beside one that was not given to you.

Never refer to an attached chart, image, graph, table, or screenshot. The picture beside a post is abstract and it is not always there, so a post that says "see the chart below" is a post that is wrong in the feed.

Obey the format principle on length, line breaks, and how the post ends. Obey the voice principle on register and sentence shape. If the two disagree, voice wins.

Never use em dashes. Never use "seamless", "leverage", "unlock", "supercharge", "effortless", or "game-changer". Never use "actually", "really", "simply", "just", or "basically". Never write "this is not X, this is Y".

Return the post text and nothing else. No preamble, no explanation, no quotation marks around it.`;

/** Nothing connected is the common case, and it should not leave a blank line. */
function factsSection(facts: FactRow[] | undefined): string[] {
  const readings = factsBrief(facts ?? []);
  return readings ? [readings, ""] : [];
}

export async function generateDraft(opts: {
  idea: string;
  kind: PostKind;
  /** The theme this post sits under, for what it is about, not how it reads. */
  theme?: { title: string; description: string } | null;
  /** The number the idea asked the author for, if it asked for one. */
  needs?: string | null;
  /** What the connected sources last read. Empty when nothing is connected. */
  facts?: FactRow[];
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
          // Readings sit above the principles, because the first question this
          // prompt answers is what is true, and the second is how to say it.
          // Spread rather than a bare call: the array is filtered for empties,
          // so an unconditional blank line after it would not survive anyway.
          ...factsSection(opts.facts),
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

const MARKET_BRIEF = `Build it as a map of the field. One opening sentence naming the field and that this is what customers say about the companies in it. Then one short block per company, the author's own company included, named by its name and written about in the same plain register as the others: the name, what it offers, what customers like, what they dislike, and where that was said. Where a company has no reviews, say only what it offers and nothing about opinion. Report the reviews as reviews, never as your own verdict, and never rank the companies. End on the last company, or on one sentence saying what the list shows about the field as a whole. No brackets, because nothing here needs a number from the author.`;

const JOBS_BRIEF = `Build it as the jobs customers hire a product in this field to do. One opening sentence naming the field and that this is why people buy in it, as they said it themselves. Then one short block per job: the progress the customer wanted, what they used before where they said it, and where it was said. Write each job as a situation and an outcome, never as a feature, and never claim the author's product does any of them. Report what customers wrote as what customers wrote, never as your own verdict. End on the last job, or on one sentence saying which job comes up most often in what customers wrote. No brackets, because nothing here needs a number from the author.`;

const HISTORY_BRIEF = `Build it as a short history of the field. One opening sentence naming the field and when it started. Then the moments in order, one short line each: when, what happened, and who did it. Use only the dates and names given, never add one, and never round a date to make it tidier. The author's company is part of the story only if it is in the list. End on where the field is now, in one sentence, without predicting where it goes next. No brackets, because nothing here needs a number from the author.`;

/** The idea behind each sample, as the card shows it. */
export function sampleIdea(content: SampleContent, field: string): string {
  if (content === "jobs") return `Why people buy in ${field}, in their own words.`;
  if (content === "history") return `How ${field} started, and what changed since.`;
  return `Who operates in ${field}, and what their customers say about each.`;
}

export type SampleContent = "competitors" | "jobs" | "history";

/**
 * The research a sample is written from, laid out for the model, or null
 * when the research found nothing of that kind. A null here is the route's
 * cue to write the market map instead, which every research result can.
 */
function sampleFacts(content: SampleContent, research: Research): string | null {
  if (content === "jobs") {
    if (research.jobs.length === 0) return null;
    return [
      "The jobs, as customers described them in public. Use nothing else:",
      research.jobs
        .map((j) =>
          [`Job: ${j.job}`, j.before ? `Before: ${j.before}` : "", `Said on: ${j.source}`]
            .filter(Boolean)
            .join("\n"),
        )
        .join("\n\n"),
    ].join("\n");
  }
  if (content === "history") {
    if (research.history.length === 0) return null;
    return [
      "The moments, as read in public sources. Use nothing else:",
      research.history.map((m) => `${m.when}. ${m.what} (${m.source})`).join("\n"),
    ].join("\n");
  }
  const companies = research.companies.map((c) =>
    [
      `${c.name}${c.own ? " (the author's own company)" : ""}. Offers: ${c.offers}`,
      c.praised ? `Customers like: ${c.praised}` : "",
      c.criticised ? `Customers dislike: ${c.criticised}` : "",
      c.source && (c.praised || c.criticised) ? `Said on: ${c.source}` : "",
      !c.praised && !c.criticised ? "No reviews found. Say nothing about opinion." : "",
    ]
      .filter(Boolean)
      .join("\n"),
  );
  return [
    "The companies, as read from their sites and from public reviews. Use nothing else:",
    companies.join("\n\n"),
  ].join("\n");
}

const BRIEF: Record<SampleContent, string> = {
  competitors: MARKET_BRIEF,
  jobs: JOBS_BRIEF,
  history: HISTORY_BRIEF,
};

/** Which sample the research can write: the one asked for, or the market map. */
export function sampleContent(asked: SampleContent, research: Research): SampleContent {
  return sampleFacts(asked, research) ? asked : "competitors";
}

/**
 * The onboarding sample. At that point we know the member's website and
 * nothing they have done, so the post is built only from what the research
 * read in public: the companies in the field, the jobs customers hire them
 * for, or how the field started, whichever the member picked.
 *
 * No thinking. The facts arrive laid out and the job is to set them in the
 * member's voice, and on the waiting screen every second is counted.
 */
export async function generateSamplePost(opts: {
  content: SampleContent;
  research: Research;
  principles: Principles;
  goal: Goal;
  siteUrl: string | null;
  profileId: string;
}): Promise<string> {
  const content = sampleContent(opts.content, opts.research);
  const facts = sampleFacts(content, opts.research);

  const response = await anthropic().messages.parse({
    model: MODEL,
    max_tokens: 2000,
    thinking: { type: "disabled" },
    system: SYSTEM,
    output_config: { format: zodOutputFormat(DraftSchema) },
    messages: [
      {
        role: "user",
        content: [
          `Idea: ${sampleIdea(content, opts.research.field)}`,
          "",
          `Shape. ${BRIEF[content]}`,
          "",
          facts,
          "",
          "Brand principles:",
          `Voice. ${opts.principles.voice}`,
          `Format. ${opts.principles.format}`,
          "",
          `Goal. ${GOAL_BRIEF[opts.goal]}`,
          opts.siteUrl ? `The website to link to is ${opts.siteUrl}` : "",
        ]
          .filter((line) => line !== null)
          .join("\n"),
      },
    ],
  });

  recordSpend({
    profileId: opts.profileId,
    // draft_market predates the other two and is kept, so spend charts stay continuous.
    operation: content === "competitors" ? "draft_market" : `draft_${content}`,
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
  const text = goal === "traffic" || goal === "leads" ? appendUtm(post.trim()) : post.trim();
  return text.length > MAX_COMMENTARY ? text.slice(0, MAX_COMMENTARY) : text;
}
