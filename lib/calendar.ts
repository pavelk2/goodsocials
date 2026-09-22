import type { BoardCard, Column } from "@/lib/board";
import { cardLabel } from "@/lib/post-kind";
import {
  addDays,
  dayKey,
  dayOfMonth,
  formatDay,
  formatMonth,
  isWeekend,
  publishSlot,
  todayKey,
  weekdayIndex,
  type DayKey,
} from "@/lib/time";

/**
 * The board's cards, arranged by the day they go out instead of by the column
 * they are in. Same rows, same states, one more reading: the columns say how
 * far along a post is, and this says whether next Thursday has one.
 *
 * Derived on every render from the cards the board already loaded. Nothing here
 * is stored, for the same reason queue_runway is not stored: a second copy of
 * the schedule is a second thing that can be wrong.
 */

export type DayPost = {
  cardId: string;
  body: string;
  label: string | null;
  imageUrl: string | null;
  at: Date;
  state: Extract<Column, "scheduled" | "posted">;
};

export type CalendarDay = {
  key: DayKey;
  /** The number in the corner. */
  number: number;
  /** False for the days either side that fill the first and last weeks. */
  inMonth: boolean;
  weekend: boolean;
  today: boolean;
  /** This day's slot has gone, so nothing can be dropped on it. */
  past: boolean;
  post: DayPost | null;
};

export type CalendarMonth = {
  /** `YYYY-MM`, what the url carries. */
  month: string;
  heading: string;
  weeks: CalendarDay[][];
  previous: string;
  next: string;
  /** Inside this month only, which is what the heading line counts. */
  posted: number;
  scheduled: number;
  /**
   * Weekdays in this month with no post, in the future, that could take one.
   * Weekends are not counted: an empty Saturday is a choice, not a gap.
   */
  open: number;
  /**
   * The last day the queue covers, anywhere, already written out. Formatted
   * here rather than in the component because the component renders on both
   * sides of hydration and Node and the browser ship different ICU data: the
   * same options give "Fri, 25 Sept" on one and "Fri 25 Sept" on the other.
   */
  dryAfter: string | null;
};

const WEEK = 7;

function postFrom(
  card: BoardCard,
  state: DayPost["state"],
  themeTitle: Map<string, string>,
): DayPost | null {
  if (!card.scheduledAt) return null;
  return {
    cardId: card.id,
    body: card.draftText ?? card.idea,
    label: cardLabel(
      card.kind,
      card.themeId ? themeTitle.get(card.themeId) : null,
    ),
    imageUrl: card.imageUrl,
    at: card.scheduledAt,
    state,
  };
}

/** `YYYY-MM` for the month a day sits in, and the first day of that month. */
function firstOfMonth(month: string): DayKey {
  return `${month}-01`;
}

function shiftMonth(month: string, by: number): string {
  const year = Number(month.slice(0, 4));
  const index = Number(month.slice(5, 7)) - 1 + by;
  const moved = new Date(Date.UTC(year, index, 1));
  return `${moved.getUTCFullYear()}-${String(moved.getUTCMonth() + 1).padStart(2, "0")}`;
}

/** True when the string is a `YYYY-MM` this calendar can draw. */
export function isMonthKey(value: string): boolean {
  if (!/^\d{4}-(0[1-9]|1[0-2])$/.test(value)) return false;
  const year = Number(value.slice(0, 4));
  return year >= 2000 && year <= 2999;
}

export function buildMonth(opts: {
  cards: Record<Column, BoardCard[]>;
  themes: { id: string; title: string }[];
  zone: string;
  /** `YYYY-MM`. Defaults to the month it is now, where the profile lives. */
  month?: string;
  now?: Date;
}): CalendarMonth {
  const now = opts.now ?? new Date();
  const zone = opts.zone;
  const today = todayKey(zone, now);
  const month = opts.month && isMonthKey(opts.month) ? opts.month : today.slice(0, 7);

  const themeTitle = new Map(opts.themes.map((t) => [t.id, t.title]));

  // One post per day is the shape of the queue, so a map keyed by day is the
  // whole index. A second post landing on a taken day would be a bug upstream
  // in lib/schedule.ts, and the last one written wins rather than the cell
  // silently holding two.
  const byDay = new Map<DayKey, DayPost>();
  let dryKey: DayKey | null = null;

  for (const state of ["scheduled", "posted"] as const) {
    for (const card of opts.cards[state]) {
      const post = postFrom(card, state, themeTitle);
      if (!post) continue;
      const key = dayKey(post.at, zone);
      byDay.set(key, post);
      if (state === "scheduled" && (!dryKey || key > dryKey)) dryKey = key;
    }
  }

  const first = firstOfMonth(month);
  const start = addDays(first, -weekdayIndex(first));
  const lastOfMonth = addDays(firstOfMonth(shiftMonth(month, 1)), -1);
  const end = addDays(lastOfMonth, 6 - weekdayIndex(lastOfMonth));

  const weeks: CalendarDay[][] = [];
  let week: CalendarDay[] = [];
  let posted = 0;
  let scheduled = 0;
  let open = 0;

  for (let key = start; key <= end; key = addDays(key, 1)) {
    const inMonth = key.slice(0, 7) === month;
    const post = byDay.get(key) ?? null;
    const weekend = isWeekend(key);
    const past =
      key < today ||
      (key === today && publishSlot(key, zone).getTime() <= now.getTime());

    if (inMonth && post?.state === "posted") posted += 1;
    if (inMonth && post?.state === "scheduled") scheduled += 1;
    if (inMonth && !post && !weekend && !past) open += 1;

    week.push({
      key,
      number: dayOfMonth(key),
      inMonth,
      weekend,
      today: key === today,
      past,
      post,
    });

    if (week.length === WEEK) {
      weeks.push(week);
      week = [];
    }
  }

  return {
    month,
    heading: formatMonth(first, zone),
    weeks,
    previous: shiftMonth(month, -1),
    next: shiftMonth(month, 1),
    posted,
    scheduled,
    open,
    dryAfter: dryKey ? formatDay(dryKey, zone) : null,
  };
}
