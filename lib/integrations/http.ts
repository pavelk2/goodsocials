/**
 * One fetch for all five adapters, for the same reason every LinkedIn call goes
 * through lib/linkedin/client.ts: one place that sets a timeout, one place that
 * turns somebody else's error envelope into a sentence a user can act on.
 *
 * A sync runs on a cron with no user watching, so a hung socket is worse than a
 * failure. Everything is bounded.
 */

const TIMEOUT_MS = 12_000;

export type HttpResult<T> =
  | { ok: true; data: T }
  | { ok: false; status: number | null; error: string };

/**
 * The five APIs disagree about where an error message lives. Reading the body
 * matters: "Stripe refused it" is useless next to "This key does not have the
 * required permissions to access subscriptions."
 */
function messageFrom(body: unknown): string | null {
  if (typeof body === "string" && body.trim()) return body.trim().slice(0, 300);
  if (!body || typeof body !== "object") return null;
  const b = body as Record<string, unknown>;

  // Stripe nests it; GitHub and Notion put it at the top; PostHog uses detail;
  // Plausible uses error.
  const nested = b.error;
  if (nested && typeof nested === "object") {
    const inner = (nested as Record<string, unknown>).message;
    if (typeof inner === "string" && inner.trim()) return inner.trim().slice(0, 300);
  }

  for (const field of ["message", "detail", "error", "error_description"]) {
    const value = b[field];
    if (typeof value === "string" && value.trim()) return value.trim().slice(0, 300);
  }
  return null;
}

export async function request<T>(
  url: string,
  init: RequestInit = {},
): Promise<HttpResult<T>> {
  let response: Response;
  try {
    response = await fetch(url, {
      ...init,
      signal: AbortSignal.timeout(TIMEOUT_MS),
      cache: "no-store",
    });
  } catch (cause) {
    const timedOut = cause instanceof Error && cause.name === "TimeoutError";
    return {
      ok: false,
      status: null,
      error: timedOut
        ? "The request took longer than 12 seconds and was dropped."
        : "Could not reach the API.",
    };
  }

  const text = await response.text();
  let body: unknown = text;
  try {
    body = text ? JSON.parse(text) : null;
  } catch {
    // Left as text. An HTML error page is still worth reporting.
  }

  if (!response.ok) {
    return {
      ok: false,
      status: response.status,
      error: messageFrom(body) ?? `${response.status} ${response.statusText}`.trim(),
    };
  }

  return { ok: true, data: body as T };
}

/**
 * The sentence a user reads when a credential is refused.
 *
 * Verified against all five live APIs with a deliberately wrong key, because
 * they disagree about the status code: Stripe, Notion and Plausible answer 401,
 * PostHog answers 403. So the code cannot tell "wrong key" from "key without
 * permission", and guessing produces the worst possible message, which is the
 * one that sends someone to fix a permission on a key they mistyped.
 *
 * Their own sentence can tell the difference and it is the one that leads. All
 * four say something usable: "Invalid API Key provided", "API token is
 * invalid", "Personal API key found in request Authorization header is
 * invalid", "Invalid API key or site ID".
 */
export function credentialError(
  product: string,
  status: number | null,
  detail: string,
): string {
  if (status === 401 || status === 403) {
    return detail
      ? `${product} refused that key. ${detail}`
      : `${product} refused that key. Check you pasted all of it.`;
  }
  if (status === 404) return `${product} has nothing at that address. ${detail}`;
  if (status === 429) return `${product} is rate limiting us. Try again in a few minutes.`;
  return `${product} refused it. ${detail}`;
}
