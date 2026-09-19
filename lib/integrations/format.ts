/**
 * How a reading becomes a phrase a post can contain.
 *
 * This runs in the adapter rather than in the prompt, because the currency, the
 * period and the minor-unit convention are all in scope here and none of them
 * are in scope for a model looking at the number 421000.
 */

/** Stripe reports minor units, except in the currencies that have none. */
const ZERO_DECIMAL = new Set([
  "bif", "clp", "djf", "gnf", "jpy", "kmf", "krw", "mga", "pyg",
  "rwf", "ugx", "vnd", "vuv", "xaf", "xof", "xpf",
]);

export function minorUnitsPerMajor(currency: string): number {
  return ZERO_DECIMAL.has(currency.toLowerCase()) ? 1 : 100;
}

/**
 * "4,210 EUR" rather than "€4,210". The code is unambiguous in a sentence
 * written by someone in Amsterdam about customers in three countries, and a
 * symbol the model has to guess the placement of is a symbol in the wrong place.
 */
export function money(minor: number, currency: string): string {
  const major = minor / minorUnitsPerMajor(currency);
  const whole = Math.abs(major) >= 100 || Number.isInteger(major);
  return `${new Intl.NumberFormat("en-GB", {
    minimumFractionDigits: whole ? 0 : 2,
    maximumFractionDigits: whole ? 0 : 2,
  }).format(major)} ${currency.toUpperCase()}`;
}

export function count(n: number): string {
  return new Intl.NumberFormat("en-GB").format(n);
}

/** A count the API truncated. 100 exactly and more behind it is not 100. */
export function atLeast(n: number, more: boolean): string {
  return more ? `${count(n)} or more` : count(n);
}

export function percent(fraction: number): string {
  return `${Math.round(fraction * 100)}%`;
}

/** "2m 14s". Plausible gives seconds and nobody reads 134 as a visit length. */
export function duration(seconds: number): string {
  const whole = Math.round(seconds);
  const minutes = Math.floor(whole / 60);
  return minutes > 0 ? `${minutes}m ${whole % 60}s` : `${whole}s`;
}

/** "4 September 2026". A date in a post is read, not sorted. */
export function day(value: Date | string): string {
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return "an unknown date";
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(date);
}

/** "yesterday", "6 days ago". Recency is the point of a Notion note. */
export function ago(value: Date | string, now = new Date()): string {
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return "at an unknown time";
  const days = Math.floor((now.getTime() - date.getTime()) / 86_400_000);
  if (days <= 0) return "today";
  if (days === 1) return "yesterday";
  if (days < 30) return `${days} days ago`;
  return day(date);
}

/** "/pricing, /, /blog/why-we-moved". A short series, comma joined, no "and". */
export function series(items: string[], limit = 3): string {
  return items.slice(0, limit).join(", ");
}

/** The window every adapter reads, so every fact agrees about "recently". */
export const WINDOW_DAYS = 30;
export const WINDOW_LABEL = "last 30 days";

export function windowStart(now: Date, days = WINDOW_DAYS): Date {
  return new Date(now.getTime() - days * 86_400_000);
}

/** YYYY-MM-DD, which is what GitHub search and Notion filters expect. */
export function isoDay(date: Date): string {
  return date.toISOString().slice(0, 10);
}
