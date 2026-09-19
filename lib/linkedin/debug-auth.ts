/**
 * Day 1 de-risking only. This pair of routes exists to prove the four scopes
 * and the publish path before the product has a database or a session. It is
 * gated on LINKEDIN_DEBUG_SECRET and is deleted once Day 1 is signed off.
 */
import { requiredEnv } from "./config";

export function assertDebugSecret(url: URL): string | null {
  const expected = process.env.LINKEDIN_DEBUG_SECRET;
  if (!expected) return "LINKEDIN_DEBUG_SECRET is not set on this deployment.";
  if (url.searchParams.get("k") !== expected) return "Wrong or missing key.";
  return null;
}

/** The same URI the product flow uses, so one registration covers both. */
export { callbackUri as debugRedirectUri } from "./oauth";

export function htmlPage(title: string, bodyHtml: string): Response {
  return new Response(
    `<!doctype html><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>${title}</title>
<style>
  :root{--paper:#F4F4F4;--surface:#fff;--ink:#000;--ink-2:#6E6E73;--hairline:#E6E6E6;--accent:#E8590C}
  body{margin:0;background:var(--paper);color:var(--ink);font:17px/1.5 -apple-system,BlinkMacSystemFont,"Inter Tight",sans-serif;padding:64px 24px}
  main{max-width:760px;margin:0 auto}
  h1{font-size:40px;font-weight:600;letter-spacing:-.035em;line-height:1;margin:0 0 32px}
  .row{display:flex;justify-content:space-between;gap:24px;padding:14px 0;border-bottom:1px solid var(--hairline)}
  .row span:first-child{color:var(--ink-2)}
  .row span:last-child{font-variant-numeric:tabular-nums;text-align:right;word-break:break-all}
  .ok{color:var(--accent);font-weight:600}
  pre{background:var(--surface);border:1px solid var(--hairline);border-radius:14px;padding:16px;overflow:auto;font-size:13px}
  a.btn{display:inline-block;margin-top:32px;background:var(--ink);color:#fff;text-decoration:none;padding:14px 24px;border-radius:14px;font-weight:600;font-size:17px}
</style>
<main>${bodyHtml}</main>`,
    { status: 200, headers: { "content-type": "text/html; charset=utf-8" } },
  );
}

export { requiredEnv };
