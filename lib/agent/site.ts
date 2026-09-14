/**
 * Turns a pasted URL into enough text to describe a business. Deliberately
 * crude: one page, no crawl, no JS rendering. A founder's homepage says who
 * they are in the first screen, and a crawler is a day of work we do not have.
 */

const MAX_CHARS = 12_000;

export type SiteText =
  | { ok: true; url: string; title: string; text: string }
  | { ok: false; error: string };

export function normalizeUrl(input: string): string | null {
  const trimmed = input.trim();
  if (!trimmed) return null;
  const withScheme = /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
  try {
    const url = new URL(withScheme);
    if (!/^https?:$/.test(url.protocol)) return null;
    // No internal hosts. This URL is fetched by our server, not the browser.
    if (/^(localhost|127\.|0\.|10\.|192\.168\.|169\.254\.)/i.test(url.hostname)) {
      return null;
    }
    return url.toString();
  } catch {
    return null;
  }
}

export async function fetchSiteText(rawUrl: string): Promise<SiteText> {
  const url = normalizeUrl(rawUrl);
  if (!url) return { ok: false, error: "That does not look like a website address." };

  let response: Response;
  try {
    response = await fetch(url, {
      redirect: "follow",
      headers: { "user-agent": "GoodSocials/1.0 (+https://goodsocials.co)" },
      signal: AbortSignal.timeout(15_000),
    });
  } catch {
    return { ok: false, error: "We could not reach that address. Check it and try again." };
  }

  if (!response.ok) {
    return {
      ok: false,
      error: `That address answered with ${response.status}. Try the homepage instead.`,
    };
  }

  const html = await response.text();
  const title =
    html.match(/<title[^>]*>([^<]*)<\/title>/i)?.[1]?.trim() ?? new URL(url).hostname;

  const text = html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<noscript[\s\S]*?<\/noscript>/gi, " ")
    .replace(/<svg[\s\S]*?<\/svg>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&#39;|&apos;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/\s+/g, " ")
    .trim();

  if (text.length < 200) {
    return {
      ok: false,
      error:
        "There was almost no text on that page. Paste a page that describes what you do.",
    };
  }

  return { ok: true, url, title, text: text.slice(0, MAX_CHARS) };
}
