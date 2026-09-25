import { z } from "zod";
import { zodOutputFormat } from "@anthropic-ai/sdk/helpers/zod";
import { anthropic, MODEL, recordSpend } from "./client";
import { appendUtm } from "@/lib/utm";
import { factsBrief, type FactRow } from "@/lib/integrations/facts";
import type { Principles } from "./principles";
import type { Goal, PostKind } from "./ideas";
import type { Research } from "./competitors";
import { THIRD_PERSON } from "./person";
import { checkPost } from "@/lib/quality";

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
    "Build it as a reference. Name the method in the first sentence, then the steps or parts, each one on its own line with a short bold name and a sentence saying what it is. Three to six of them. No narrative opener, no story about how you discovered it, no numbered lessons. It ends on the last step. The reader should be able to skim it, save it, and use it a month from now without the context.",
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

The register is a researcher, not a seller. The post reports something true that a reader can check, and it never manipulates. A researcher also has a finding: every post makes one point the evidence supports, specific enough that someone in the field could disagree with it, and says it plainly. A post with no point is a directory, and nobody follows a directory. The point is what the evidence shows, never a taste or a sales claim.

Banned outright, because they are what makes LinkedIn unreadable:
Opening with a one line hook followed by a blank line. Rhetorical questions as openers. "Here's the thing". "Let that sink in". "Unpopular opinion". Counting down a list of lessons. Manufactured urgency. Fake vulnerability. A closing question asking for comments, unless the goal asks for one specific question. Anything that would read as a template.

Open with the substance. The first sentence is the finding, not a tease of the finding.

${THIRD_PERSON}

Evidence rules, not negotiable, because this publishes under a real person's name.

Never invent a statistic, a study, a percentage, a survey, a report title, a customer name, or a quote. Never write "studies show", "research suggests", or "experts say" without naming exactly who said it and where.

If the idea calls for a number that only the author has, write the sentence around the number and mark the gap in square brackets, for example [your number here], and keep it to one bracket in the whole post. Everything else must be true as written or general enough to be uncontroversial.

Readings are the exception to the bracket. When readings from connected tools appear below, they were read from the author's own accounts and they are already true. Use the figure exactly as it is written, with the period it covers, and never write a bracket for a number that is sitting in front of you. Do not round one for effect, do not convert a currency, and do not put a second number beside one that was not given to you.

Bold, so a reader skimming the feed sees the structure. Wrap the short name that opens a block in double asterisks, for example **Calendly** or **Avoid double bookings**: a company, a step, a job, a year. Two to six words, at most one per paragraph, never a whole sentence, and nothing else in the post uses asterisks. A post with no blocks has no bold. LinkedIn shows these as bold letters that search cannot read, which is why they stay short.

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

/**
 * What every sample shares, whatever it is about. The first version of these
 * briefs asked for a neutral catalog, one block per entry in the same
 * register, and a content writer who tested it called the result boring and
 * said they would not post it. They were right: a list with no point gives the
 * reader no reason to finish it. So the post leads with one observation the
 * material supports, and the entries become the evidence for it.
 */
const POINT = `The first sentence is the point: one observation the material below supports, in plain words, specific enough that a practitioner in the field could disagree with it. It names what it is about. It is never a tease, a question or a sentence about the post itself, and it never announces what the list is. The reader sees about two lines before the feed cuts the post, and those two lines have to be worth stopping for.

A count in the point, such as three of the five, is a count of the entries below and has to be exactly right. Say what the sources show, never what the author thinks: "four of the five get the same complaint in reviews" is a finding, "the market is broken" is an opinion nobody gave you.`;

const CLOSE = `Close the body with one sentence saying what the point means for someone choosing, buying or building in this field. Plain, no lesson list, no call to action beyond what the goal asks for. No brackets, because nothing here needs a number from the author.`;

const MARKET_BRIEF = `${POINT}

Then the companies that carry it, one short block each, the author's own company always among them and written about in the same plain register as the others: the name in bold, then in one or two sentences what it offers and the specific thing customers said that bears on the point, and where it was said. Leave out a company that says nothing about the point, except the author's own. Report reviews as reviews. Comparing the companies on one named thing, such as price, who they serve or what customers complain about, is fine; calling one better is not. Never write that reviews are missing, thin or hard to find, and never mention searching.

${CLOSE}`;

/**
 * The market map when too few reviews were read to compare: what each company
 * sells, from its own site. A post saying nobody reviewed Calendly would be
 * false, and the reader would know it. The point is where the offers differ.
 */
const OFFERS_BRIEF = `${POINT} Here the material is what each company sells, as its own site puts it, so the point is about the offers: where they split, who each one is for, what only one of them does.

Then the companies that carry it, one short block each, the author's own company always among them and written about in the same plain register as the others: the name in bold, then what it sells and to whom, as its own site puts it. Never say what customers think of any of them, never mention reviews, never mention searching, and never call one better.

${CLOSE}`;

/**
 * What the research opened, for the one sentence that tells the reader how
 * much was read and where. Counted in code, so the number in the post is the
 * number of pages, not the model's impression of it. Null when nothing was
 * counted, which leaves the sentence out rather than guessing it.
 *
 * It closes the post rather than opening it: it is where the post comes from,
 * and the two lines before the feed cuts it belong to the point.
 */
function readingLine(research: Research): string | null {
  const read = research.read;
  if (!read || read.pages < 3) return null;
  return [
    `What was read for this post: ${read.pages} public pages. The sites opened most often: ${read.sites.join(", ")}.`,
    "Say this in one short plain sentence after the closing sentence, as the source line, and before anything the goal puts last: the number of pages exactly as given, and the sites among those a reader would recognise as sources, such as review sites, forums and reference sites, named as people know them (G2, not g2.com). Leave out the companies' own sites. No judgement of the sources, no word like thorough or comprehensive.",
  ].join("\n");
}

/** Reviewed companies below this, and the market map compares offers instead. */
const MIN_REVIEWED = 2;

function reviewed(c: Research["companies"][number]): boolean {
  return Boolean(c.praised || c.criticised);
}

function marketBrief(research: Research): string {
  return research.companies.filter(reviewed).length >= MIN_REVIEWED ? MARKET_BRIEF : OFFERS_BRIEF;
}

const JOBS_BRIEF = `${POINT} Here the material is why customers say they bought, so the point is about that: the job that comes up most, the job no company advertises, or what people were using before they switched.

Then the jobs that carry it, one short block each: the job as a bold label of a few words, then the situation the customer was in, what they used before where they said it, and where it was said. A job is a situation and an outcome, never a feature, and never claim the author's product does any of them. Report what customers wrote as what customers wrote.

${CLOSE}`;

const HISTORY_BRIEF = `${POINT} Here the material is how the field started and changed, so the point is about that: the turn that made the field what it is, how old a supposedly new idea is, or who got there first.

Then the moments that carry it, in order, one short line each: when, in bold, then what happened and who did it. Use only the dates and names given, never add one, and never round a date to make it tidier. The author's company is part of the story only if it is in the list. Do not predict where the field goes next.

${CLOSE}`;

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
  // With enough reviews read, a company nobody reviewed is left out, the
  // author's own excepted, because the post is about what customers said.
  const withOpinions = research.companies.filter(reviewed).length >= MIN_REVIEWED;
  const listed = withOpinions
    ? research.companies.filter((c) => c.own || reviewed(c))
    : research.companies;
  const companies = listed.map((c) =>
    [
      `${c.name}${c.own ? " (the author's own company)" : ""}. Offers: ${c.offers}`,
      withOpinions && c.praised ? `Customers like: ${c.praised}` : "",
      withOpinions && c.criticised ? `Customers dislike: ${c.criticised}` : "",
      withOpinions && c.source && reviewed(c) ? `Said on: ${c.source}` : "",
    ]
      .filter(Boolean)
      .join("\n"),
  );
  return [
    withOpinions
      ? "The companies, as read from their sites and from public reviews. Use nothing else:"
      : "The companies, as read from their own sites. Use nothing else:",
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
 * Three ways into the same material. One draft finds the first point that
 * comes to mind, which for a list of reviews is the most common one; three
 * drafts, each told where to look, give the pick something to choose between.
 */
const ANGLES = [
  "Look for what repeats: the thing that shows up in more than one entry below, and that a practitioner would not expect to be shared.",
  "Look for the contrast: the two entries below that differ most on one thing, and what that difference is.",
  "Look for the surprise: the single detail below that a practitioner in this field would least expect. The standout, if one is given, is a good place to start.",
] as const;

/**
 * The editor who reads the three and picks the one to show. A stranger decides
 * on this post whether to pay, so the pick is for the post a demanding content
 * writer would publish under their own name, with the evidence rules first.
 */
const PickSchema = z.object({
  best: z
    .number()
    .int()
    .describe("The number of the post to publish, as numbered in the message."),
  reason: z.string().describe("Why, in one plain sentence."),
});

const PICK_SYSTEM = `You are a demanding LinkedIn content editor choosing which of several drafts publishes under a real person's name. You have the material they were written from.

First rule out any draft that states something the material does not support: a count that does not match the entries, a claim about a company nobody made in the material, a number that is not there. Of the rest, pick the one a picky content writer would post as it stands: the first sentence makes a specific point worth stopping for, the rest proves it, and nothing is filler. A draft that reads like a directory loses to one that says something.`;

/**
 * The onboarding sample. At that point we know the member's website and
 * nothing they have done, so the post is built only from what the research
 * read in public: the companies in the field, the jobs customers hire them
 * for, or how the field started, whichever the member picked.
 *
 * It is the post a stranger decides to pay on, so it gets more than any other
 * draft: three written in parallel from three angles, with low effort
 * thinking to find a point in the material, then one editor call to pick.
 * About one draft's worth of waiting more than a single shot, and about five
 * cents, against a 100 USD subscription.
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
  const brief = content === "competitors" ? marketBrief(opts.research) : BRIEF[content];
  // The offers map is written because the reviews were too thin to compare,
  // and it never mentions reviews, so it never points at review sites or
  // carries a standout that was probably a review either.
  const offers = brief === OFFERS_BRIEF;
  const read = offers ? null : readingLine(opts.research);
  const standout = offers ? null : standoutLine(opts.research);
  // draft_market predates the other two and is kept, so spend charts stay continuous.
  const operation = content === "competitors" ? "draft_market" : `draft_${content}`;

  const material = [
    `Idea: ${sampleIdea(content, opts.research.field)}`,
    "",
    `Shape. ${brief}`,
    "",
    facts,
    ...(standout ? ["", standout] : []),
    "",
    ...(read ? [read, ""] : []),
  ];

  const drafts = await Promise.allSettled(
    ANGLES.map(async (angle) => {
      const response = await anthropic().messages.parse({
        model: MODEL,
        max_tokens: 6000,
        thinking: { type: "adaptive" },
        // Low effort: finding one point in a page of material is a short
        // think, and the member is watching a countdown.
        output_config: { effort: "low", format: zodOutputFormat(DraftSchema) },
        system: SYSTEM,
        messages: [
          {
            role: "user",
            content: [
              ...material,
              `Where to find the point. ${angle}`,
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
      recordSpend({ profileId: opts.profileId, operation, usage: response.usage });
      if (!response.parsed_output) {
        throw new Error("The model did not return a draft in the expected shape.");
      }
      return finish(response.parsed_output.post, opts.goal);
    }),
  );

  const written = drafts.flatMap((d) => (d.status === "fulfilled" ? [d.value] : []));
  if (written.length === 0) {
    const first = drafts.find((d) => d.status === "rejected");
    throw first?.reason ?? new Error("No draft was written.");
  }
  // A draft that breaks a rule a pattern can see never reaches the editor,
  // unless all of them do, in which case the editor still picks the best.
  const clean = written.filter((post) => checkPost(post).length === 0);
  const candidates = clean.length > 0 ? clean : written;
  if (candidates.length === 1) return candidates[0];

  try {
    return await pickSample({
      candidates,
      material: material.filter((line) => line !== null).join("\n"),
      profileId: opts.profileId,
    });
  } catch (cause) {
    // The pick is an improvement, not a requirement. Any of the drafts is
    // true to the material, so a failed pick shows the first one.
    console.error("[drafts] sample pick failed, showing the first draft:", cause);
    return candidates[0];
  }
}

/** The standout from the research, laid out as material. Null when there is none. */
function standoutLine(research: Research): string | null {
  const standout = research.standout;
  if (!standout?.what) return null;
  return `One detail that stood out in the reading, usable as the point if it fits this post: ${standout.what} (said on ${standout.source}).`;
}

async function pickSample(opts: {
  candidates: string[];
  material: string;
  profileId: string;
}): Promise<string> {
  const response = await anthropic().messages.parse({
    model: MODEL,
    max_tokens: 1000,
    // No thinking: reading three short posts against a page of material is
    // what the editor is for, and this is the last wait before the offer.
    thinking: { type: "disabled" },
    output_config: { format: zodOutputFormat(PickSchema) },
    system: PICK_SYSTEM,
    messages: [
      {
        role: "user",
        content: [
          "The material the drafts were written from:",
          "<material>",
          opts.material,
          "</material>",
          "",
          ...opts.candidates.map((post, i) => `<draft number="${i + 1}">\n${post}\n</draft>`),
        ].join("\n"),
      },
    ],
  });
  recordSpend({ profileId: opts.profileId, operation: "draft_pick", usage: response.usage });

  const best = response.parsed_output?.best;
  if (!best || best < 1 || best > opts.candidates.length) {
    throw new Error(`The pick came back as ${best}.`);
  }
  return opts.candidates[best - 1];
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
