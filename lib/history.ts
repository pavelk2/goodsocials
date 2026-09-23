/**
 * What this profile posted on LinkedIn before GoodSocials, read out of the
 * member's own data export.
 *
 * There is no API for this. Retrieving a member's posts needs r_member_social,
 * which LinkedIn closed to new applications, so the only route to a person's
 * own history is the archive they can download from their settings in a few
 * minutes. The file we want out of it is Shares.csv.
 *
 * Pure. No database and no React, because the browser parses the file before
 * anything is sent: an archive of ten years is megabytes, a server action body
 * is capped at 1MB, and the most recent few hundred posts are the only ones
 * that say anything about how this person writes now.
 */

/** LinkedIn's own ceiling on a post, which is also the ceiling on a row here. */
export const PAST_POST_MAX_TEXT = 2000;

/** Rows per call to the server, so no single request approaches the 1MB cap. */
export const IMPORT_CHUNK = 100;

export type PastPostInput = {
  /** ISO 8601, UTC. The export reports UTC without saying so. */
  postedAt: string;
  text: string;
  url: string | null;
};

export type ParsedHistory = {
  rows: PastPostInput[];
  /** Rows the file had that carried no text or no readable date. */
  skipped: number;
  /** Set when the file is not the one we asked for. Nothing was read. */
  error: string | null;
};

/**
 * One cell at a time, RFC 4180. A post's commentary contains commas, quotes
 * and line breaks as a matter of course, so splitting on commas reads half of
 * somebody's archive as gibberish and loses the other half.
 */
function parseRows(csv: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let cell = "";
  let quoted = false;

  const text = csv.charCodeAt(0) === 0xfeff ? csv.slice(1) : csv;

  for (let i = 0; i < text.length; i += 1) {
    const char = text[i];

    if (quoted) {
      if (char !== '"') {
        cell += char;
      } else if (text[i + 1] === '"') {
        cell += '"';
        i += 1;
      } else {
        quoted = false;
      }
      continue;
    }

    if (char === '"') {
      quoted = true;
    } else if (char === ",") {
      row.push(cell);
      cell = "";
    } else if (char === "\n" || char === "\r") {
      // \r\n is one break, not two empty rows.
      if (char === "\r" && text[i + 1] === "\n") i += 1;
      row.push(cell);
      rows.push(row);
      row = [];
      cell = "";
    } else {
      cell += char;
    }
  }

  if (cell.length > 0 || row.length > 0) {
    row.push(cell);
    rows.push(row);
  }

  return rows;
}

function normalise(name: string): string {
  return name.toLowerCase().replace(/[^a-z]/g, "");
}

/**
 * The export has changed its column names before and will again, so the header
 * is matched on the word rather than on the position. Anything unrecognised is
 * ignored: we want three fields out of a file that carries six.
 */
function columns(header: string[]): {
  date: number;
  text: number;
  link: number;
} | null {
  let date = -1;
  let text = -1;
  let link = -1;

  header.forEach((name, index) => {
    const key = normalise(name);
    if (date < 0 && (key === "date" || key === "createdat" || key === "shareddate")) date = index;
    if (text < 0 && (key === "sharecommentary" || key === "commentary" || key === "sharecomment")) {
      text = index;
    }
    if (link < 0 && (key === "sharelink" || key === "link" || key === "shareurl")) link = index;
  });

  if (date < 0 || text < 0) return null;
  return { date, text, link };
}

/**
 * LinkedIn writes `2025-03-04 09:12:33` with no zone. It is UTC, and a browser
 * left to its own devices would read it as local time and move a post a day
 * either way for anybody far enough east or west.
 */
function readDate(value: string): Date | null {
  const raw = value.trim();
  if (!raw) return null;

  const naive = /^(\d{4}-\d{2}-\d{2})[ T](\d{2}:\d{2}(:\d{2})?)$/.exec(raw);
  const stamp = naive ? `${naive[1]}T${naive[2]}Z` : raw;

  const when = new Date(stamp);
  if (Number.isNaN(when.getTime())) return null;
  // A date the archive could not have, which is a column we read wrong.
  if (when.getUTCFullYear() < 2003 || when.getTime() > Date.now() + 86_400_000) {
    return null;
  }
  return when;
}

/**
 * Two imports of overlapping archives are one set of rows. The permalink is
 * the identity when the export carries one; when it does not, the day and the
 * opening words are close enough that nobody sees the same post twice.
 */
export function sourceKey(row: PastPostInput): string {
  if (row.url) return row.url;
  return `${row.postedAt.slice(0, 10)}|${row.text.slice(0, 80)}`;
}

/**
 * `limit` is the caller's, so the browser can cap what it sends and the server
 * can cap what it stores without the number being written twice.
 */
export function parseShares(csv: string, limit: number): ParsedHistory {
  const rows = parseRows(csv).filter((row) => row.some((cell) => cell.trim()));
  if (rows.length === 0) {
    return { rows: [], skipped: 0, error: "That file is empty." };
  }

  const found = columns(rows[0]);
  if (!found) {
    return {
      rows: [],
      skipped: 0,
      error: "That is not Shares.csv. Look for it inside the archive LinkedIn emails you.",
    };
  }

  const parsed: PastPostInput[] = [];
  let skipped = 0;

  for (const row of rows.slice(1)) {
    const when = readDate(row[found.date] ?? "");
    const text = (row[found.text] ?? "").trim();
    // A reshare with nothing written on it says nothing about how this person
    // writes, and on the calendar it would be an empty cell with a border.
    if (!when || !text) {
      skipped += 1;
      continue;
    }

    const link = found.link >= 0 ? (row[found.link] ?? "").trim() : "";
    parsed.push({
      postedAt: when.toISOString(),
      text: text.slice(0, PAST_POST_MAX_TEXT),
      url: link.startsWith("https://") ? link : null,
    });
  }

  parsed.sort((a, b) => (a.postedAt < b.postedAt ? 1 : -1));

  const seen = new Set<string>();
  const unique = parsed.filter((row) => {
    const key = sourceKey(row);
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });

  return { rows: unique.slice(0, limit), skipped, error: null };
}
