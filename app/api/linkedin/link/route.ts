import { randomBytes } from "node:crypto";
import { auth } from "@/auth";
import { authorizeUrl, callbackUri } from "@/lib/linkedin/oauth";
import { loadAccess } from "@/lib/profiles";
import { LINK_STATE_COOKIE, LINK_STATE_PREFIX } from "@/lib/linkedin/link";

/**
 * Adds a LinkedIn profile to the account that is already signed in, or renews
 * one whose 60 days are running out. Not Auth.js: signing in again would swap
 * the session to the new member and hand them the account, and an agency needs
 * one login that owns every seat on its plan.
 *
 * It lands on the same /api/linkedin/callback URI the Day 1 flow registered, so
 * there is one redirect URI to keep registered rather than two. The state
 * prefix is what tells the two apart.
 */
export const runtime = "nodejs";

export async function GET(request: Request) {
  const session = await auth();
  if (!session?.memberId) return back("/signin");

  const access = await loadAccess(session.memberId);
  if (!access) return back("/signin");
  if (access.seatsLeft <= 0) return back("/settings?linked=full");

  const state = `${LINK_STATE_PREFIX}${randomBytes(16).toString("hex")}`;

  let target: string;
  try {
    target = authorizeUrl({ redirectUri: callbackUri(request), state });
  } catch (cause) {
    console.error("[link] cannot build the authorization URL:", cause);
    return back("/settings?linked=misconfigured");
  }

  return new Response(null, {
    status: 302,
    headers: {
      location: target,
      "set-cookie": `${LINK_STATE_COOKIE}=${state}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=600`,
    },
  });
}

function back(path: string): Response {
  return new Response(null, { status: 302, headers: { location: path } });
}
