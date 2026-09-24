import { addDays, weekdayIndex, type DayKey } from "@/lib/time";

/**
 * Ten levels, and what it takes to reach each one. docs/LEVELS.md is the
 * reasoning; this file is the rule.
 *
 * Every threshold and every floor is in LEVELS, the way KIND_MIX holds the idea
 * bias, so recalibrating after the first twenty profiles is one edit. Nothing
 * here touches the database: lib/levels-store.ts gathers the evidence and this
 * file decides what it adds up to.
 *
 * A level needs three things: the step answered, the evidence met, and the
 * floor passed. The floor is days since the profile was created, and it is what
 * makes week 4 and week 12 real: a member who does every step on day one still
 * waits for the posts to exist.
 *
 * Levels 6 to 10 are listed so the ladder is whole on screen, and have no gates
 * yet. `open` says which levels can be reached with what is built.
 */

export type Stage = "Foundation" | "Calibration" | "Audience" | "Authority";

export type LevelDef = {
  level: number;
  name: string;
  stage: Stage;
  /** One line under the level on /levels. What being here means. */
  meaning: string;
  /** Days since the profile was created before this level can be reached. */
  floorDays: number;
  /** Posts published through GoodSocials. */
  minPosts: number;
  /** The next step, as the board header says it. Lower case, no full stop. */
  next: string;
  /** False while the level has no step built. It shows, and cannot be reached. */
  open: boolean;
};

export const LEVELS: LevelDef[] = [
  {
    level: 1,
    name: "Set up",
    stage: "Foundation",
    meaning: "The board runs on your website and four answers.",
    floorDays: 0,
    minPosts: 0,
    next: "",
    open: true,
  },
  {
    level: 2,
    name: "Your voice",
    stage: "Foundation",
    meaning: "Posts are written from your own writing, not from a homepage.",
    floorDays: 1,
    minPosts: 0,
    next: "give us writing that sounds like you",
    open: true,
  },
  {
    level: 3,
    name: "Your reader",
    stage: "Foundation",
    meaning: "Every post is written for one named reader, about four themes you chose.",
    floorDays: 3,
    minPosts: 3,
    next: "name who your posts are for",
    open: true,
  },
  {
    level: 4,
    name: "Your proof",
    stage: "Calibration",
    meaning: "Posts are built on numbers only you have.",
    floorDays: 10,
    minPosts: 8,
    next: "tell us where your numbers live",
    open: true,
  },
  {
    level: 5,
    name: "Runs itself",
    stage: "Calibration",
    meaning: "The board fills, you approve, the feed stays regular.",
    floorDays: 28,
    minPosts: 15,
    next: "keep your corrections as rules",
    open: true,
  },
  {
    level: 6,
    name: "Measured",
    stage: "Audience",
    meaning: "We know which of your posts worked and why.",
    floorDays: 35,
    minPosts: 20,
    next: "show us how your posts did",
    open: false,
  },
  {
    level: 7,
    name: "Your real audience",
    stage: "Audience",
    meaning: "We write for the people who read you.",
    floorDays: 49,
    minPosts: 25,
    next: "choose who to write for",
    open: false,
  },
  {
    level: 8,
    name: "What works",
    stage: "Audience",
    meaning: "Your format is tested, not guessed.",
    floorDays: 63,
    minPosts: 35,
    next: "pick the next thing to test",
    open: false,
  },
  {
    level: 9,
    name: "Expert",
    stage: "Authority",
    meaning: "You post what nobody else could have written.",
    floorDays: 77,
    minPosts: 45,
    next: "choose a series you are known for",
    open: false,
  },
  {
    level: 10,
    name: "Reference",
    stage: "Authority",
    meaning: "The name people send when someone asks who knows this.",
    floorDays: 84,
    minPosts: 55,
    next: "",
    open: false,
  },
];

export const MAX_LEVEL = LEVELS.length;

/** Level 4 counts this many receipts built on the member's own number. */
export const RECEIPTS_FOR_PROOF = 3;
/** Level 5 reads this many of the most recent drafts. */
export const FIRST_DRAFT_WINDOW = 10;
/** And wants this many of them approved without a revision. */
export const FIRST_DRAFT_NEEDED = 7;
/** Level 5 wants this many whole weeks in a row at the board's cadence. */
export const WEEKS_AT_CADENCE = 2;

export function levelDef(level: number): LevelDef {
  return LEVELS[Math.min(Math.max(level, 1), MAX_LEVEL) - 1];
}

/** Everything the gates read, gathered by lib/levels-store.ts. */
export type Evidence = {
  /** Whole days since the profile was created. */
  days: number;
  /** Posts published through GoodSocials. */
  published: number;
  /** Levels whose step has been answered. */
  steps: ReadonlySet<number>;
  /** A read-only source connected and last read without an error. */
  sourceActive: boolean;
  /** Posted receipts that no longer wait on a number. */
  receiptsWithNumber: number;
  /** Of the most recent drafts, how many went out without a revision. */
  firstDraft: { approved: number; of: number };
  /** Whole weeks in a row at the board's cadence, this week included once met. */
  weeksAtCadence: number;
};

export type Gate = {
  label: string;
  done: boolean;
  /** 0 to 1, for the bar. */
  progress: number;
  /** What the right hand side of the row says. */
  value: string;
};

/**
 * The gates between `level - 1` and `level`, in the order the screen lists
 * them. The step is always first: it is the one row the member can move today.
 */
export function gatesFor(level: number, e: Evidence, startedAt: Date): Gate[] {
  const def = levelDef(level);
  const gates: Gate[] = [];

  gates.push({
    label: "Step above",
    done: e.steps.has(level),
    progress: e.steps.has(level) ? 1 : 0,
    value: e.steps.has(level) ? "Done" : "Not yet",
  });

  if (def.minPosts > 0) gates.push(count("Posts published", e.published, def.minPosts));

  if (level === 4) {
    const done = e.sourceActive || e.receiptsWithNumber >= RECEIPTS_FOR_PROOF;
    gates.push({
      label: "Your own numbers in posts",
      done,
      progress: done ? 1 : e.receiptsWithNumber / RECEIPTS_FOR_PROOF,
      value: e.sourceActive
        ? "Source connected"
        : `${Math.min(e.receiptsWithNumber, RECEIPTS_FOR_PROOF)} of ${RECEIPTS_FOR_PROOF} receipts`,
    });
  }

  if (level === 5) {
    // Too few drafts yet is not a failure, and the bar says how far along.
    const { approved, of } = e.firstDraft;
    const done = of >= FIRST_DRAFT_WINDOW && approved >= FIRST_DRAFT_NEEDED;
    gates.push({
      label: "Approved on first draft",
      done,
      progress: Math.min(approved / FIRST_DRAFT_NEEDED, 1),
      value:
        of < FIRST_DRAFT_WINDOW
          ? `${of} of ${FIRST_DRAFT_WINDOW} drafts so far`
          : `${approved} of the last ${of}`,
    });
    gates.push(count("Weeks in a row at your cadence", e.weeksAtCadence, WEEKS_AT_CADENCE));
  }

  if (def.floorDays > 0) {
    const done = e.days >= def.floorDays;
    gates.push({
      label: "Earliest date",
      done,
      progress: Math.min(e.days / def.floorDays, 1),
      value: done ? "Passed" : formatDate(addWholeDays(startedAt, def.floorDays)),
    });
  }

  return gates;
}

function count(label: string, have: number, need: number): Gate {
  return {
    label,
    done: have >= need,
    progress: Math.min(have / need, 1),
    value: `${Math.min(have, need)} of ${need}`,
  };
}

/**
 * The level this evidence has earned, never lower than the one already held.
 * Climbs one at a time and stops at the first level whose gates are not all
 * met, so a member cannot skip the reader step by having published 20 posts.
 */
export function earnedLevel(current: number, e: Evidence, startedAt: Date): number {
  let level = Math.max(current, 1);
  while (level < MAX_LEVEL) {
    const next = levelDef(level + 1);
    if (!next.open) break;
    if (!gatesFor(next.level, e, startedAt).every((g) => g.done)) break;
    level += 1;
  }
  return level;
}

/**
 * Of the most recent cards that got past Draft, how many did so without a
 * revision after their draft was written. A card's first approve is the one
 * that wrote its draft, so a revise before it corrected an idea and does not
 * count against the draft.
 *
 * `cards` is newest first; each card's actions are oldest first. Pass more
 * than the window: cards without an approve are skipped before it is cut.
 */
export function firstDraftRate(
  cards: { actions: ("approve" | "revise" | "reject")[] }[],
  window = FIRST_DRAFT_WINDOW,
): { approved: number; of: number } {
  // A card that was dragged past Draft without an approve never had a draft
  // anybody judged, so it is not a draft here either.
  const recent = cards.filter((c) => c.actions.includes("approve")).slice(0, window);
  let approved = 0;
  for (const c of recent) {
    const drafted = c.actions.indexOf("approve");
    if (!c.actions.slice(drafted + 1).includes("revise")) approved += 1;
  }
  return { approved, of: recent.length };
}

/**
 * Whole weeks in a row, Monday to Sunday in the board's zone, with at least
 * `cadence` posts. Counted back from last week, because this week is not over
 * and cannot have failed yet. This week adds one once it has already met the
 * cadence.
 */
export function weeksAtCadence(
  postedDays: DayKey[],
  today: DayKey,
  cadence: number,
): number {
  if (cadence <= 0) return 0;
  const perWeek = new Map<DayKey, number>();
  for (const day of postedDays) {
    const week = weekOf(day);
    perWeek.set(week, (perWeek.get(week) ?? 0) + 1);
  }

  const thisWeek = weekOf(today);
  let weeks = (perWeek.get(thisWeek) ?? 0) >= cadence ? 1 : 0;
  for (let week = addDays(thisWeek, -7); ; week = addDays(week, -7)) {
    if ((perWeek.get(week) ?? 0) < cadence) break;
    weeks += 1;
  }
  return weeks;
}

function weekOf(day: DayKey): DayKey {
  return addDays(day, -weekdayIndex(day));
}

function addWholeDays(from: Date, days: number): Date {
  return new Date(from.getTime() + days * 86_400_000);
}

function formatDate(instant: Date): string {
  return new Intl.DateTimeFormat("en-GB", {
    weekday: "short",
    day: "numeric",
    month: "short",
  }).format(instant);
}

export function daysSince(from: Date, now: Date = new Date()): number {
  return Math.floor((now.getTime() - from.getTime()) / 86_400_000);
}
