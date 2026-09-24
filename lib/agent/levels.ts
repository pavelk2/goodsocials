import { z } from "zod";
import { zodOutputFormat } from "@anthropic-ai/sdk/helpers/zod";
import { anthropic, MODEL, recordSpend } from "./client";
import { THIRD_PERSON } from "./person";
import type { Principles } from "./principles";

/**
 * The three model calls behind the level steps. Each one runs when a member
 * answers a step, never on a page load, so a member reading /levels costs
 * nothing.
 */

const RULES = `Never use em dashes. Never use "seamless", "leverage", "unlock", "supercharge", "effortless", or "game-changer". Never use "actually", "really", "simply", "just", or "basically". Never write "this is not X, this is Y".`;

/** Level 2. What the member gave us, and whose words they are. */
export type VoiceSource = "archive" | "own" | "admired" | "described";

const VoiceSchema = z.object({
  voice: z
    .string()
    .describe(
      "The full rewritten voice principle. Three or four sentences, as instructions to a writer. Name the register, the sentence length, what evidence gets cited, and the words and moves this person never uses.",
    ),
  note: z
    .string()
    .describe("One sentence shown to the member saying what changed about how their posts will sound."),
});

const VOICE_SYSTEM = `You maintain the voice principle a LinkedIn ghostwriter works from: a few sentences that tell a writer how one person's posts should sound.

Until now it was written from a company homepage. You now have writing that shows how the person sounds, and your job is to rewrite the principle from it.

Read for what can be copied: sentence length, how they open, how plain or technical the words are, whether they use numbers, how they end, what they would never say. Ignore the topics; themes decide those elsewhere. Keep anything in the current principle the samples do not contradict.

When the samples are posts the member admires rather than their own, treat them as where the member wants to go, not as how they sound today.

When the member describes their voice in their own words instead, take the description at its word and make it specific enough for a writer to follow.

The samples are often first person. The posts are not: ${THIRD_PERSON} Describe the register and rhythm, never tell the writer to speak as "I" or "we".

${RULES}`;

const SOURCE_LINE: Record<VoiceSource, string> = {
  archive: "These are posts this person published on LinkedIn, newest first.",
  own: "These are things this person wrote, pasted by them.",
  admired: "These are posts by other people this person wishes they had written.",
  described: "This is how the person describes the way they want to sound.",
};

export async function rewriteVoice(opts: {
  current: string;
  source: VoiceSource;
  samples: string[];
  profileId: string;
}): Promise<z.infer<typeof VoiceSchema>> {
  const response = await anthropic().messages.parse({
    model: MODEL,
    max_tokens: 6000,
    thinking: { type: "adaptive" },
    system: VOICE_SYSTEM,
    output_config: { format: zodOutputFormat(VoiceSchema) },
    messages: [
      {
        role: "user",
        content: [
          "Current voice principle:",
          opts.current || "None yet.",
          "",
          SOURCE_LINE[opts.source],
          "",
          ...opts.samples.map((s, i) => `Sample ${i + 1}:\n${s}\n`),
        ].join("\n"),
      },
    ],
  });

  recordSpend({ profileId: opts.profileId, operation: "level_voice", usage: response.usage });
  if (!response.parsed_output) {
    throw new Error("The model did not return a voice in the expected shape.");
  }
  return response.parsed_output;
}

/** Level 3. Three readers the member picks from. */
const ReadersSchema = z.object({
  readers: z
    .array(
      z.object({
        title: z
          .string()
          .describe("The reader in six words or fewer, such as 'Heads of growth at small SaaS'."),
        text: z
          .string()
          .describe(
            "The reader principle a writer would follow: who they are, the company they work in, the problem they have that these posts answer, and what they already know so posts do not explain it. Two or three sentences.",
          ),
      }),
    )
    .length(3),
});

export type ReaderOption = z.infer<typeof ReadersSchema>["readers"][number];

const READERS_SYSTEM = `You name who a person's LinkedIn posts should be written for.

From the brand principles and the themes, work out three different readers who would stop scrolling for these posts. Three real choices, not three wordings of one: for example the buyer, the peer doing the same job, and the person the author wants to hire or be hired by.

Each reader is specific enough that a writer knows what to leave out. "Business leaders" is useless. "Founders of 10 to 50 person B2B software companies who run sales themselves" is useful.

${RULES}`;

export async function suggestReaders(opts: {
  principles: Principles;
  themes: { title: string; description: string }[];
  siteUrl: string | null;
  profileId: string;
}): Promise<ReaderOption[]> {
  const response = await anthropic().messages.parse({
    model: MODEL,
    max_tokens: 6000,
    thinking: { type: "adaptive" },
    system: READERS_SYSTEM,
    output_config: { format: zodOutputFormat(ReadersSchema) },
    messages: [
      {
        role: "user",
        content: [
          ...(opts.siteUrl ? [`Website: ${opts.siteUrl}`] : []),
          `Voice. ${opts.principles.voice}`,
          `Format. ${opts.principles.format}`,
          "",
          "Themes:",
          ...opts.themes.map((t) => `${t.title}. ${t.description}`),
        ].join("\n"),
      },
    ],
  });

  recordSpend({ profileId: opts.profileId, operation: "level_readers", usage: response.usage });
  if (!response.parsed_output) {
    throw new Error("The model did not return readers in the expected shape.");
  }
  return response.parsed_output.readers;
}

/** Level 5. The corrections that keep coming back, as standing rules. */
const RulesSchema = z.object({
  rules: z
    .array(
      z.object({
        rule: z
          .string()
          .describe("One instruction to a writer, one sentence, such as 'Never open a post with a question.'"),
        kind: z
          .enum(["voice", "visual", "format", "reader"])
          .describe("The principle this rule belongs in."),
        seen: z.number().int().describe("How many of the comments this rule answers."),
      }),
    )
    .max(3),
});

export type ProposedRule = z.infer<typeof RulesSchema>["rules"][number];

const RULES_SYSTEM = `You read the corrections a person made to their LinkedIn drafts over the last weeks, and find the ones they keep making.

Return up to three rules, most repeated first. A rule has to answer at least two comments. A comment that corrected one fact on one post is not a rule; leave it out. If nothing repeats, return no rules.

Skip anything the principles already say. The point is to catch what the standing instructions still miss.

Write each rule as one instruction to a writer. Keep it consistent with this: ${THIRD_PERSON}

${RULES}`;

export async function proposeRules(opts: {
  comments: string[];
  principles: Principles;
  profileId: string;
}): Promise<ProposedRule[]> {
  const response = await anthropic().messages.parse({
    model: MODEL,
    max_tokens: 6000,
    thinking: { type: "adaptive" },
    system: RULES_SYSTEM,
    output_config: { format: zodOutputFormat(RulesSchema) },
    messages: [
      {
        role: "user",
        content: [
          "Principles as they stand:",
          `Voice. ${opts.principles.voice}`,
          `Visual. ${opts.principles.visual}`,
          `Format. ${opts.principles.format}`,
          ...(opts.principles.reader ? [`Reader. ${opts.principles.reader}`] : []),
          "",
          "Revise comments, newest first:",
          ...opts.comments.map((c) => `- ${c}`),
        ].join("\n"),
      },
    ],
  });

  recordSpend({ profileId: opts.profileId, operation: "level_rules", usage: response.usage });
  if (!response.parsed_output) {
    throw new Error("The model did not return rules in the expected shape.");
  }
  return response.parsed_output.rules.filter((r) => r.seen >= 2);
}
