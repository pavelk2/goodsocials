/**
 * Local time, without a date library.
 *
 * Every slot this product claims is a wall clock time in somebody's own zone:
 * 09:00 on a Tuesday means 09:00 where the person posting lives, not 09:00 UTC.
 * Postgres stores instants, the cron reads instants, and the only place the two
 * meet is here.
 *
 * A day is a string, `YYYY-MM-DD`, read in a zone. That is deliberate: adding a
 * day to an instant is wrong twice a year, and adding a day to a calendar key
 * is never wrong. Instants are produced at the edges, from a key plus an hour
 * plus a zone, and nowhere else.
 */

export type DayKey = string;

/** The hour a post goes out, in the profile's own zone. */
export const PUBLISH_HOUR = 9;

const CACHE = new Map<string, Intl.DateTimeFormat>();

function partsFormatter(zone: string): Intl.DateTimeFormat {
  const cached = CACHE.get(zone);
  if (cached) return cached;

  const made = new Intl.DateTimeFormat("en-US", {
    timeZone: zone,
    hourCycle: "h23",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
  CACHE.set(zone, made);
  return made;
}

type Wall = { y: number; m: number; d: number; h: number; mi: number; s: number };

function wallIn(instant: Date, zone: string): Wall {
  const parts = partsFormatter(zone).formatToParts(instant);
  const read = (type: Intl.DateTimeFormatPartTypes): number => {
    const found = parts.find((p) => p.type === type);
    return found ? Number(found.value) : 0;
  };
  return {
    y: read("year"),
    m: read("month"),
    d: read("day"),
    h: read("hour"),
    mi: read("minute"),
    s: read("second"),
  };
}

/**
 * The zone's offset from UTC, in milliseconds, at that instant. Positive east
 * of Greenwich. Derived by formatting the instant in the zone and reading the
 * result back as if it were UTC, which is the only route Intl gives us.
 */
function offsetAt(instant: Date, zone: string): number {
  const w = wallIn(instant, zone);
  const asUtc = Date.UTC(w.y, w.m - 1, w.d, w.h, w.mi, w.s);
  // formatToParts has no milliseconds, so compare against a floored instant or
  // every offset comes back a few hundred milliseconds short.
  return asUtc - Math.floor(instant.getTime() / 1000) * 1000;
}

/** True when Intl recognises the name. Everything stored goes through this. */
export function isZone(name: string): boolean {
  if (!name) return false;
  try {
    new Intl.DateTimeFormat("en-US", { timeZone: name });
    return true;
  } catch {
    return false;
  }
}

/** Every IANA zone this runtime knows, for the settings select. */
export function allZones(): string[] {
  const supported = Intl.supportedValuesOf?.("timeZone");
  return supported && supported.length > 0 ? [...supported] : ["UTC"];
}

function pad(n: number): string {
  return String(n).padStart(2, "0");
}

/** The calendar day an instant falls on, read in a zone. */
export function dayKey(instant: Date, zone: string): DayKey {
  const w = wallIn(instant, zone);
  return `${w.y}-${pad(w.m)}-${pad(w.d)}`;
}

export function todayKey(zone: string, now: Date = new Date()): DayKey {
  return dayKey(now, zone);
}

function parseKey(key: DayKey): { y: number; m: number; d: number } | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(key);
  if (!match) return null;
  const y = Number(match[1]);
  const m = Number(match[2]);
  const d = Number(match[3]);
  if (m < 1 || m > 12 || d < 1 || d > 31) return null;
  // Round trips through UTC so 2026-02-31 fails instead of becoming 3 March.
  const probe = new Date(Date.UTC(y, m - 1, d));
  if (probe.getUTCFullYear() !== y || probe.getUTCMonth() !== m - 1) return null;
  if (probe.getUTCDate() !== d) return null;
  return { y, m, d };
}

/** True when the string is a real calendar day. */
export function isDayKey(key: string): boolean {
  return parseKey(key) !== null;
}

/**
 * Calendar arithmetic on the key itself, so a week is seven days whatever the
 * clocks did in between. Never do this by adding milliseconds to an instant.
 */
export function addDays(key: DayKey, days: number): DayKey {
  const parsed = parseKey(key);
  if (!parsed) return key;
  const moved = new Date(Date.UTC(parsed.y, parsed.m - 1, parsed.d));
  moved.setUTCDate(moved.getUTCDate() + days);
  return `${moved.getUTCFullYear()}-${pad(moved.getUTCMonth() + 1)}-${pad(
    moved.getUTCDate(),
  )}`;
}

/** Monday is 0, Sunday is 6. The calendar grid starts on Monday. */
export function weekdayIndex(key: DayKey): number {
  const parsed = parseKey(key);
  if (!parsed) return 0;
  const day = new Date(Date.UTC(parsed.y, parsed.m - 1, parsed.d)).getUTCDay();
  return (day + 6) % 7;
}

/** Saturday or Sunday. Drawn differently, and never counted as a missed day. */
export function isWeekend(key: DayKey): boolean {
  return weekdayIndex(key) >= 5;
}

/** The day of the month, for the number in the corner of a cell. */
export function dayOfMonth(key: DayKey): number {
  return parseKey(key)?.d ?? 1;
}

/**
 * The instant at which it is `hour`:00 on that day in that zone.
 *
 * Two passes. The first guesses with the offset near the wall time, the second
 * settles it with the offset that actually applies at the guess, which is what
 * makes a day either side of a clock change land on the right hour. On the one
 * day a year an hour does not exist, a slot inside the gap comes out an hour
 * either side of it, which is the right answer to a question with none.
 */
export function slotAt(key: DayKey, hour: number, zone: string): Date {
  const parsed = parseKey(key);
  if (!parsed) return new Date(NaN);

  const wall = Date.UTC(parsed.y, parsed.m - 1, parsed.d, hour, 0, 0);
  const firstGuess = wall - offsetAt(new Date(wall), zone);
  return new Date(wall - offsetAt(new Date(firstGuess), zone));
}

/** The publish slot for a day, which is the only slot this product claims. */
export function publishSlot(key: DayKey, zone: string): Date {
  return slotAt(key, PUBLISH_HOUR, zone);
}

/**
 * How the clock reads on a card, in the profile's zone. One formatter for the
 * board, the calendar, and the confirmation a server action sends back, so a
 * time never appears in two shapes on the same screen.
 */
export function formatSlot(instant: Date, zone: string): string {
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: zone,
  }).format(instant);
}

/** Just the clock, for a calendar cell that already says which day it is. */
export function formatTime(instant: Date, zone: string): string {
  return new Intl.DateTimeFormat("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
    timeZone: zone,
  }).format(instant);
}

/** "Tuesday at 09:00", for the sentence a server action returns. */
export function formatDayAndTime(instant: Date, zone: string): string {
  return new Intl.DateTimeFormat("en-GB", {
    weekday: "long",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: zone,
  }).format(instant);
}

/** "Fri 25 Sep", a day named in full. Server side only, like formatMonth. */
export function formatDay(key: DayKey, zone: string): string {
  return new Intl.DateTimeFormat("en-GB", {
    weekday: "short",
    day: "numeric",
    month: "short",
    timeZone: zone,
  }).format(publishSlot(key, zone));
}

/** "September 2026", the calendar's own heading. */
export function formatMonth(key: DayKey, zone: string): string {
  const parsed = parseKey(key);
  if (!parsed) return "";
  return new Intl.DateTimeFormat("en-GB", {
    month: "long",
    year: "numeric",
    timeZone: zone,
  }).format(new Date(Date.UTC(parsed.y, parsed.m - 1, parsed.d, 12)));
}

/**
 * "UTC+02:00" for a zone right now. Settings shows it next to the posting hour,
 * because a zone name alone does not tell somebody whether 09:00 there is the
 * morning they are picturing.
 */
export function offsetLabel(zone: string, now: Date = new Date()): string {
  const minutes = offsetAt(now, zone) / 60000;
  const sign = minutes < 0 ? "-" : "+";
  const abs = Math.abs(minutes);
  return `UTC${sign}${pad(Math.floor(abs / 60))}:${pad(abs % 60)}`;
}
