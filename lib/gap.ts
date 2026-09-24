/**
 * A draft marks the number only the author has as a bracket, for example
 * "[your number here]", per the draft prompt in lib/agent/drafts.ts. Short and
 * lower-case so a bracketed product name or citation does not read as a gap.
 */
const GAP = /\[[a-z][a-z ,'-]{2,60}\]/;

export function hasGap(text: string): boolean {
  return GAP.test(text);
}
