/**
 * Bold in a post. LinkedIn's commentary has no formatting, so the only bold a
 * feed shows is the Unicode mathematical sans-serif bold letters. We store the
 * draft with **double asterisks** instead and convert at the last moment,
 * because the stored text is read by the revise prompt, the principles update
 * and the board, and every one of them handles plain letters better than
 * lookalike glyphs.
 *
 * Kept to short labels on purpose. A screen reader spells some of these
 * glyphs out and LinkedIn search does not match them, so a whole sentence in
 * bold is a sentence nobody can find or hear.
 */

const PAIR = /\*\*([^*\n]+?)\*\*/g;

/** Sans-serif bold, so the letters sit beside LinkedIn's own face. */
function boldChar(ch: string): string {
  const c = ch.codePointAt(0)!;
  if (c >= 65 && c <= 90) return String.fromCodePoint(0x1d5d4 + c - 65);
  if (c >= 97 && c <= 122) return String.fromCodePoint(0x1d5ee + c - 97);
  if (c >= 48 && c <= 57) return String.fromCodePoint(0x1d7ec + c - 48);
  return ch;
}

/** The text LinkedIn receives: pairs become bold letters, strays are dropped. */
export function toLinkedInText(text: string): string {
  return text
    .replace(PAIR, (_, inner: string) => Array.from(inner, boldChar).join(""))
    .replace(/\*\*/g, "");
}

export type BoldPart = { text: string; bold: boolean };

/** The text in runs, for a component to draw. An unpaired marker is dropped. */
export function boldParts(text: string): BoldPart[] {
  const parts: BoldPart[] = [];
  let last = 0;
  for (const m of text.matchAll(PAIR)) {
    if (m.index > last) parts.push({ text: text.slice(last, m.index), bold: false });
    parts.push({ text: m[1], bold: true });
    last = m.index + m[0].length;
  }
  if (last < text.length) parts.push({ text: text.slice(last), bold: false });
  return parts.map((p) => (p.bold ? p : { ...p, text: p.text.replace(/\*\*/g, "") }));
}
