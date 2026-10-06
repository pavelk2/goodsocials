/**
 * Bold and italic for LinkedIn, which has no formatting in a post. What people
 * paste instead are letters from Unicode's mathematical sans-serif alphabets,
 * which look bold or italic in any font. The free formatter at
 * /tools/linkedin-text-formatter is built on this file.
 *
 * Screen readers read these as letters with a prefix, or skip them, so the
 * tool page says to keep them to a word or a heading.
 */

export type TextStyle = "bold" | "italic" | "boldItalic";

/** First code point of each alphabet. Italic has no digits, so they stay plain. */
const STARTS: Record<TextStyle, { upper: number; lower: number; digit?: number }> = {
  bold: { upper: 0x1d5d4, lower: 0x1d5ee, digit: 0x1d7ec },
  italic: { upper: 0x1d608, lower: 0x1d622 },
  boldItalic: { upper: 0x1d63c, lower: 0x1d656 },
};

function styleChar(ch: string, style: TextStyle): string {
  const code = ch.charCodeAt(0);
  const start = STARTS[style];
  if (code >= 65 && code <= 90) return String.fromCodePoint(start.upper + code - 65);
  if (code >= 97 && code <= 122) return String.fromCodePoint(start.lower + code - 97);
  if (start.digit !== undefined && code >= 48 && code <= 57) {
    return String.fromCodePoint(start.digit + code - 48);
  }
  return ch;
}

/** Back to plain ASCII, so restyling never stacks one alphabet on another. */
export function plain(text: string): string {
  let out = "";
  for (const ch of text) {
    const code = ch.codePointAt(0)!;
    let mapped = ch;
    for (const start of Object.values(STARTS)) {
      if (code >= start.upper && code < start.upper + 26) {
        mapped = String.fromCharCode(65 + code - start.upper);
      } else if (code >= start.lower && code < start.lower + 26) {
        mapped = String.fromCharCode(97 + code - start.lower);
      } else if (start.digit !== undefined && code >= start.digit && code < start.digit + 10) {
        mapped = String.fromCharCode(48 + code - start.digit);
      }
    }
    out += mapped;
  }
  return out;
}

export function applyStyle(text: string, style: TextStyle): string {
  return Array.from(plain(text), (ch) => styleChar(ch, style)).join("");
}

/** LinkedIn's limit for a post. */
export const POST_LIMIT = 3000;

/**
 * Characters in UTF-16 units, where a styled letter or an emoji counts as two.
 * Not checked against how LinkedIn's composer counts them, so this errs high:
 * a post under the limit here is under it there.
 */
export function postLength(text: string): number {
  return text.length;
}
