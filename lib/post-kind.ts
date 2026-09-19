/**
 * The three kinds of post this product will write, on their own, with no
 * imports.
 *
 * Three, and no fourth without DECISIONS.md changing first. Every kind here
 * rests on something outside the model: a page someone else published, or a
 * number out of the author's own business. A kind that rests on neither is a
 * post the model made up, and a board full of those is what every other
 * LinkedIn generator ships.
 *
 * It lives apart from lib/agent/ideas.ts because a card on the board has to
 * print the name of its kind, and a client component that imported it from
 * there would pull the Anthropic SDK into the browser bundle to read three
 * strings.
 */

export type PostKind = "research" | "explainer" | "personal";

export const POST_KINDS: PostKind[] = ["research", "explainer", "personal"];

/** What each kind is called on a card. Sentence case, like everything else. */
export const KIND_LABEL: Record<PostKind, string> = {
  research: "Research",
  explainer: "Explainer",
  personal: "Personal",
};

/**
 * Whether this kind has to carry sources before it can move off Draft.
 *
 * Both of these report on something published elsewhere, so both are checkable
 * and neither is allowed to publish unchecked. `personal` is exempt because its
 * evidence is the author's own number, which no URL can corroborate; what holds
 * that one honest is `needs` on the card.
 */
export function needsSources(kind: PostKind): boolean {
  return kind === "research" || kind === "explainer";
}

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

/** A source shown on a card, and the row behind it. */
export type CardSource = {
  url: string;
  title: string | null;
};

/**
 * What a reader recognises a source by at a glance, which is the publisher
 * rather than the headline. Used on the card, where there is room for one line
 * and not for three titles.
 */
export function sourceHost(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return url;
  }
}
