/**
 * The shape of a post, on its own, with no imports.
 *
 * It lives apart from lib/agent/ideas.ts because a card on the board has to
 * print the name of its kind, and a client component that imported it from
 * there would pull the Anthropic SDK into the browser bundle to read four
 * strings.
 */

export type PostKind = "framework" | "data" | "receipt" | "finding";

export const POST_KINDS: PostKind[] = [
  "framework",
  "data",
  "receipt",
  "finding",
];

/** What each kind is called on a card. Sentence case, like everything else. */
export const KIND_LABEL: Record<PostKind, string> = {
  framework: "Framework",
  data: "Data",
  receipt: "Receipt",
  finding: "Finding",
};

/**
 * The card's meta line: what this post is and what it is about. The theme
 * carries the meaning, so it goes second where the eye lands after the kind,
 * and a card whose theme was deleted still says what shape it is.
 */
export function cardLabel(
  kind: PostKind,
  themeTitle?: string | null,
): string {
  return themeTitle ? `${KIND_LABEL[kind]}. ${themeTitle}` : KIND_LABEL[kind];
}
