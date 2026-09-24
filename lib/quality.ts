import { hasGap } from "@/lib/gap";

/**
 * The rules a post has to pass before it takes a slot, checked in code.
 *
 * Two layers stand between a draft and somebody's feed. This one is free,
 * instant and certain: every rule here is something the drafting prompt
 * already forbids, so a post that breaks one is a post the model got wrong,
 * not a matter of taste. The second layer is lib/agent/review.ts, an editor
 * pass for what a pattern cannot see. This file runs first so the editor is
 * never paid to point out a bracket.
 *
 * Pure, no database and no React, so the gate, the cron and the card can all
 * read the same verdict.
 */

export type QualityIssue = {
  /** Stable key, for the log and for PostHog. Never shown. */
  rule: string;
  /** What is wrong, in one sentence addressed to the member. */
  problem: string;
  /** A revise comment that would fix it, ready to send as written. */
  fix: string;
};

/**
 * What the gate last decided about one exact text. Stored on the card, so a
 * held post says why on the board until somebody changes it, and a post that
 * passed is never paid for twice. The hash is what makes it exact: any change
 * to the text is a different post and gets a fresh verdict.
 */
export type QualityVerdict = {
  textHash: string;
  passed: boolean;
  issues: QualityIssue[];
  checkedAt: string;
};

export function isVerdict(value: unknown): value is QualityVerdict {
  if (!value || typeof value !== "object") return false;
  const v = value as Record<string, unknown>;
  return (
    typeof v.textHash === "string" &&
    typeof v.passed === "boolean" &&
    Array.isArray(v.issues)
  );
}

/** The issues to show on a card, or null when there is nothing held. */
export function heldIssues(value: unknown): QualityIssue[] | null {
  return isVerdict(value) && !value.passed && value.issues.length > 0
    ? value.issues
    : null;
}

/**
 * Shorter than this and a post has no room to carry a finding and the thing
 * it means. The sample posts and the shortest framework land well above it.
 */
export const MIN_LENGTH = 200;

/** LinkedIn's hard limit. `finish()` cuts at it, so a post this long was cut. */
export const MAX_LENGTH = 3000;

/** The writing rules in CLAUDE.md, word for word. */
const BANNED_WORDS = [
  "seamless",
  "seamlessly",
  "leverage",
  "unlock",
  "supercharge",
  "effortless",
  "effortlessly",
  "game-changer",
  "game changer",
  "actually",
  "really",
  "simply",
  "just",
  "basically",
];

const BANNED_PHRASES = [
  "here's the thing",
  "here is the thing",
  "let that sink in",
  "unpopular opinion",
];

/**
 * THIRD_PERSON in lib/agent/person.ts. "I" and "US" are matched with their
 * case, so the country passes, and "War I" is let through by name.
 */
const FIRST_PERSON = /\b((?<!War )I|I'm|I've|I'd|I'll|me|my|mine|we|we're|we've|we'd|we'll|us|our|ours)\b/;
const FIRST_PERSON_CAPITALISED = /(^|[.!?]\s+|\n\s*)(Me|My|Mine|We|We're|We've|We'd|We'll|Us|Our|Ours)\b/;

/** The picture beside a post is abstract and not always there. */
const POINTS_AT_PICTURE =
  /\b(see|in|on) the (chart|graph|image|picture|table|screenshot|diagram)\b|\b(chart|graph|image|picture|table|screenshot|diagram) (below|above|attached)\b/i;

const URL_PATTERN = /https?:\/\/\S+/g;

function words(text: string, list: string[]): string[] {
  const lower = text.toLowerCase();
  return list.filter((w) =>
    new RegExp(`(^|[^a-z-])${w.replace(/[-\s]/g, "[-\\s]")}($|[^a-z-])`).test(lower),
  );
}

function quoted(list: string[]): string {
  return list.map((w) => `"${w}"`).join(", ");
}

/**
 * The opening of a post, flattened, for telling whether two posts start the
 * same way. The first 80 characters: long enough that two different posts
 * never share it, short enough that a changed ending does not hide a repeat.
 */
export function opening(text: string): string {
  return text
    .replace(/\*\*/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim()
    .slice(0, 80);
}

/**
 * Every rule a pattern can decide. `queued` is the text of the posts already
 * scheduled or published on this board, so the same post cannot go out twice
 * in a month under two cards.
 */
export function checkPost(text: string, queued: string[] = []): QualityIssue[] {
  const issues: QualityIssue[] = [];
  const body = text.trim();
  const prose = body.replace(URL_PATTERN, " ");

  if (hasGap(body)) {
    issues.push({
      rule: "gap",
      problem: "The post still has a bracket waiting for a number only you have.",
      fix: "Here is the number for the bracket: ",
    });
  }

  if (body.length < MIN_LENGTH) {
    issues.push({
      rule: "too_short",
      problem: `The post is ${body.length} characters, too short to say something and what it means.`,
      fix: "Say what the finding means for the reader, in two or three more sentences.",
    });
  }

  if (body.length >= MAX_LENGTH) {
    issues.push({
      rule: "cut_off",
      problem: "The post hit LinkedIn's 3,000 character limit and was cut mid sentence.",
      fix: "Cut it to half the length. Keep the opening finding and the three strongest points.",
    });
  }

  if (/[—–]/.test(body)) {
    issues.push({
      rule: "dash",
      problem: "The post uses a long dash, which the writing rules do not allow.",
      fix: "Replace every long dash with a full stop or a comma.",
    });
  }

  const banned = [...words(prose, BANNED_WORDS), ...words(prose, BANNED_PHRASES)];
  if (banned.length > 0) {
    issues.push({
      rule: "banned_words",
      problem: `The post uses ${quoted(banned)}, on the list of words that make a post read like a template.`,
      fix: `Rewrite the sentences with ${quoted(banned)} without those words.`,
    });
  }

  if (FIRST_PERSON.test(prose) || FIRST_PERSON_CAPITALISED.test(prose)) {
    issues.push({
      rule: "first_person",
      problem:
        "The post speaks in the first person, claiming somebody did or saw something nobody did.",
      fix: "Rewrite it in the third person. Name the company, the source or the customers instead.",
    });
  }

  if (POINTS_AT_PICTURE.test(prose)) {
    issues.push({
      rule: "points_at_picture",
      problem: "The post refers to a chart or picture, and the image beside it shows no data.",
      fix: "Remove the reference to the chart and say the number in the text.",
    });
  }

  const start = opening(body);
  if (start.length >= 40 && queued.some((other) => opening(other) === start)) {
    issues.push({
      rule: "repeat",
      problem: "A post already scheduled or published opens with the same words.",
      fix: "Open with a different finding, so it does not read as the same post twice.",
    });
  }

  return issues;
}

/**
 * The rules the publish cron enforces on its own, for a post that reached the
 * queue some other way or before the gate existed. Only the ones that make a
 * post false or broken in the feed: pulling a post off a client's feed at
 * 09:00 over a word choice would cost the cadence the product is sold on.
 */
const BROKEN = new Set(["gap", "cut_off", "too_short", "points_at_picture"]);

export function brokenIssues(text: string): QualityIssue[] {
  return checkPost(text).filter((i) => BROKEN.has(i.rule));
}
