import type { Goal } from "@/lib/agent/ideas";
import type { Research } from "@/lib/agent/competitors";

/**
 * The onboarding funnel, as data.
 *
 * One question per screen, three or four options on each, and a way to say
 * something else. Every screen is a step here, every step is tracked, and the
 * step is stored on the board so a member who leaves comes back to the screen
 * they left rather than to the start.
 *
 * The order is the order the page walks:
 *
 *   website   Which website is yours. Research starts the moment it is answered.
 *   image     Which pictures fit you.        } answered while the research runs,
 *   voice     How should you sound.          } so the minute it takes is spent
 *   goal      What should posts get you.     } on the member's own choices.
 *   sample    Their first post, drawn the way LinkedIn draws it.
 *   offer     The same post, the week it starts, and the price.
 *   refine    After paying: what to change about the pictures.
 *   ideas     After paying: which ideas to write first.
 *   done      The board.
 *
 * Answers are kept here and written into the principles once, by the sample
 * route, rather than as each one lands. Research writes the principles too,
 * and an answer appended while research is still running would be overwritten
 * by it.
 *
 * This file is data and pure functions, so the funnel screens can import the
 * questions without pulling the database into the browser. lib/funnel.ts is
 * the half that reads and writes.
 */

export const STEPS = [
  "website",
  "image",
  "voice",
  "goal",
  "sample",
  "offer",
  "refine",
  "ideas",
  "done",
] as const;

export type Step = (typeof STEPS)[number];

/** What a member picked on one screen. `other` carries their own words. */
export type Answer = { choice: string; text?: string };

export type Funnel = {
  step: Step;
  /** The website, or the two sentences written instead of one. */
  site?: { url: string | null; description?: string };
  answers: {
    image?: Answer;
    voice?: Answer;
    goal?: Answer;
    refine?: Answer;
  };
  /** Competitors, the gap between them, and the post that opens the gap. */
  research?: Research | null;
  /** The card the sample post lives on once it is written. */
  sampleCardId?: string;
  /** Times the site was read. Capped, because each read costs model calls. */
  reads?: number;
};

export const MAX_READS = 3;

export function emptyFunnel(): Funnel {
  return { step: "website", answers: {} };
}

export function parseFunnel(value: unknown): Funnel | null {
  if (!value || typeof value !== "object") return null;
  const raw = value as Partial<Funnel>;
  if (!raw.step || !STEPS.includes(raw.step)) return null;
  return { ...raw, step: raw.step, answers: raw.answers ?? {} };
}

export function stepIndex(step: Step): number {
  return STEPS.indexOf(step);
}

/** Moves forward only. A late request from an earlier screen cannot rewind. */
export function advance(funnel: Funnel, to: Step): Funnel {
  return stepIndex(to) > stepIndex(funnel.step) ? { ...funnel, step: to } : funnel;
}

/* ------------------------------------------------------------------------ */
/* The questions. Every word a member reads in the funnel is in this block.  */
/* ------------------------------------------------------------------------ */

export type Option = {
  id: string;
  label: string;
  /** A few words under the label, when the label alone does not decide it. */
  detail?: string;
  /** What the choice becomes in the principle it feeds. */
  principle?: string;
  /** A picture for the option, where a picture decides it faster than words. */
  preview?: string;
};

export type Question = {
  step: Step;
  title: string;
  options: Option[];
  /** The label on the free text option, and its placeholder. */
  other: { label: string; placeholder: string };
};

export const IMAGE_QUESTION: Question = {
  step: "image",
  title: "What visual content do you like?",
  options: [
    {
      id: "abstract",
      label: "Abstract",
      principle:
        "Images are abstract compositions: bold colour fields, simple geometric shapes, paper and paint textures. Nothing that pretends to be a literal scene.",
      preview: "/onboarding/abstract.jpg",
    },
    {
      id: "nature",
      label: "Nature",
      principle:
        "Images are natural scenes and close textures: sunlight through leaves, stone, water, wood grain. Muted, low contrast, outdoor light, unusual crops.",
      preview: "/onboarding/nature.jpg",
    },
    {
      id: "real",
      label: "Photos of your work",
      principle:
        "Images are documentary photographs of the real objects and places behind the work: tools, desks, products, workshops, screens with no readable text. Natural light, nothing staged.",
      preview: "/onboarding/real.jpg",
    },
  ],
  other: { label: "Other", placeholder: "Black and white photos of cities" },
};

export const VOICE_QUESTION: Question = {
  step: "voice",
  title: "How should your posts read?",
  options: [
    {
      id: "researcher",
      label: "Numbers first",
      detail: "“We looked at 212 calls. Churn tracked one thing.”",
      principle:
        "Sounds like a researcher: leads with the number and where it came from, short declarative sentences, no adjectives doing the selling.",
    },
    {
      id: "operator",
      label: "What we did and what happened",
      detail: "“We moved invoices to day 3. Churn fell.”",
      principle:
        "Sounds like an operator: what we did, what it cost, what happened next. First person plural, plain verbs, ends where the evidence ends.",
    },
    {
      id: "teacher",
      label: "Step by step",
      detail: "“Three steps to a first invoice in a week.”",
      principle:
        "Sounds like a teacher: names a method, then the steps in order, each one usable on its own. Second person, warm, no jargon.",
    },
  ],
  other: { label: "Other", placeholder: "Short, dry, no jargon" },
};

export const GOAL_QUESTION: Question = {
  step: "goal",
  title: "What are your posts for?",
  options: [
    {
      id: "followers",
      label: "Followers",
    },
    {
      id: "traffic",
      label: "Visits to your website",
    },
    {
      id: "leads",
      label: "Leads",
    },
  ],
  other: { label: "Other", placeholder: "Hiring engineers" },
};

export const REFINE_QUESTION: Question = {
  step: "refine",
  title: "How should the next pictures look?",
  options: [
    {
      id: "keep",
      label: "Like this one",
    },
    {
      id: "calmer",
      label: "Calmer",
      principle: "Calmer than the first attempt: softer colours, more empty space, one subject.",
    },
    {
      id: "literal",
      label: "Closer to the post",
      principle: "Closer to the post: show the specific object the post is about, never a metaphor for it.",
    },
  ],
  other: { label: "Other", placeholder: "Use our brand green, #1F6F4A" },
};

export const QUESTIONS = {
  image: IMAGE_QUESTION,
  voice: VOICE_QUESTION,
  goal: GOAL_QUESTION,
  refine: REFINE_QUESTION,
} as const;

export type QuestionStep = keyof typeof QUESTIONS;

export function isQuestionStep(value: string): value is QuestionStep {
  return value in QUESTIONS;
}

/** The step after a question, which is where saving an answer moves the member. */
export const NEXT_STEP: Record<QuestionStep, Step> = {
  image: "voice",
  voice: "goal",
  goal: "sample",
  refine: "ideas",
};

/** What a free text answer is allowed to be. Long enough for a sentence. */
export const OTHER_MAX = 280;

/**
 * An answer as a line in a principle. A picked option is our sentence; an
 * `other` answer is theirs, quoted, because a member's own words are the one
 * instruction the model should never paraphrase.
 */
export function answerLine(question: Question, answer: Answer | undefined): string | null {
  if (!answer) return null;
  if (answer.choice === "other") {
    const text = answer.text?.trim();
    return text ? `The author asked for this in their own words: "${text}".` : null;
  }
  return question.options.find((o) => o.id === answer.choice)?.principle ?? null;
}

/** The board goal an answer maps to. `other` keeps the default and is noted. */
export function goalFor(answer: Answer | undefined): Goal {
  const id = answer?.choice;
  return id === "followers" || id === "traffic" || id === "leads" ? id : "interesting";
}

export function appendLine(text: string, line: string | null): string {
  if (!line || text.includes(line)) return text;
  return text.trim() ? `${text.trim()} ${line}` : line;
}

/**
 * A website the member probably owns, read off their email. Free mail is
 * nobody's website, so those return null and the question opens on a blank
 * field instead of a wrong guess.
 */
const FREE_MAIL = new Set([
  "gmail.com",
  "googlemail.com",
  "outlook.com",
  "hotmail.com",
  "live.com",
  "msn.com",
  "yahoo.com",
  "icloud.com",
  "me.com",
  "mac.com",
  "proton.me",
  "protonmail.com",
  "aol.com",
  "gmx.com",
  "gmx.de",
  "web.de",
  "mail.ru",
  "yandex.ru",
  "hey.com",
  "fastmail.com",
  "zoho.com",
]);

export function domainFromEmail(email: string | null | undefined): string | null {
  const domain = email?.split("@")[1]?.trim().toLowerCase();
  if (!domain || !domain.includes(".") || FREE_MAIL.has(domain)) return null;
  return domain;
}
