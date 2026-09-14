/**
 * The traffic goal promises UTM parameters on every link, and that is the only
 * measurement we promise at all. Tagging happens here rather than in the model
 * prompt so every link is tagged the same way every time, and so a model that
 * forgets cannot break the one number a customer checks.
 */

const PARAMS: Record<string, string> = {
  utm_source: "linkedin",
  utm_medium: "social",
  utm_campaign: "goodsocials",
};

/** Deliberately conservative. A URL in a LinkedIn post is bare, not markdown. */
const URL_PATTERN = /https?:\/\/[^\s<>"']+/g;

/** Trailing punctuation belongs to the sentence, not to the address. */
const TRAILING = /[.,;:!?)\]]+$/;

export function appendUtm(text: string): string {
  return text.replace(URL_PATTERN, (match) => {
    const trailing = match.match(TRAILING)?.[0] ?? "";
    const bare = trailing ? match.slice(0, -trailing.length) : match;
    try {
      const url = new URL(bare);
      for (const [key, value] of Object.entries(PARAMS)) {
        // A link the user tagged themselves keeps their tag.
        if (!url.searchParams.has(key)) url.searchParams.set(key, value);
      }
      return url.toString() + trailing;
    } catch {
      return match;
    }
  });
}
