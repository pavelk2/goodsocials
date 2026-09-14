import { randomBytes } from "node:crypto";
import { authorizeUrl } from "@/lib/linkedin/oauth";
import { LINKEDIN_SCOPES } from "@/lib/linkedin/config";
import {
  assertDebugSecret,
  debugRedirectUri,
  htmlPage,
} from "@/lib/linkedin/debug-auth";

/**
 * Day 1 only. Kicks off a real authorization so we can prove the scopes and
 * the publish path. Deleted once Auth.js owns this flow.
 *
 *   /api/linkedin/start?k=SECRET             four production scopes
 *   /api/linkedin/start?k=SECRET&probe=1     the isolated offline_access test
 */
export async function GET(request: Request) {
  const url = new URL(request.url);

  const denied = assertDebugSecret(url);
  if (denied) return htmlPage("Blocked", `<h1>Blocked</h1><p>${denied}</p>`);

  const probe = url.searchParams.get("probe") === "1";
  const scopes = probe
    ? [...LINKEDIN_SCOPES, "offline_access"]
    : LINKEDIN_SCOPES;

  const state = `${probe ? "probe" : "main"}.${randomBytes(16).toString("hex")}`;

  let target: string;
  try {
    target = authorizeUrl({
      redirectUri: debugRedirectUri(request),
      state,
      scopes,
    });
  } catch (cause) {
    const message = cause instanceof Error ? cause.message : String(cause);
    return htmlPage(
      "Not configured",
      `<h1>Not configured</h1><p>${message}</p>`,
    );
  }

  return new Response(null, {
    status: 302,
    headers: {
      location: target,
      "set-cookie": `li_state=${state}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=600`,
    },
  });
}
