import { cookies } from "next/headers";
import { auth } from "@/auth";
import { attachProfile } from "@/lib/onboarding";
import { loadAccess, ACTIVE_PROFILE_COOKIE } from "@/lib/profiles";
import { callbackUri, exchangeCode, fetchUserInfo } from "./oauth";
import { LINKEDIN_SCOPES } from "./config";

/**
 * The second half of the link flow. /api/linkedin/link sends the member to
 * LinkedIn; LinkedIn sends them back to /api/linkedin/callback, which hands
 * anything carrying this state prefix straight here.
 *
 * Every exit is a redirect to /settings with one query parameter, because the
 * person doing this is looking at the profile list and the answer belongs on
 * that list, not on a page of its own.
 */

export const LINK_STATE_COOKIE = "li_state";
export const LINK_STATE_PREFIX = "link.";

export function isLinkState(state: string): boolean {
  return state.startsWith(LINK_STATE_PREFIX);
}

export async function completeLink(
  request: Request,
  params: { code: string | null; state: string; error: string | null },
): Promise<Response> {
  const store = await cookies();

  // The state cookie is the CSRF check. Without it a link to LinkedIn's
  // callback with an attacker's code would attach their profile to whichever
  // account happened to be signed in.
  const expected = store.get(LINK_STATE_COOKIE)?.value;
  if (!expected || expected !== params.state) {
    return settings("stale");
  }

  if (params.error) {
    console.error("[link] LinkedIn refused:", params.error);
    return settings("refused");
  }
  if (!params.code) return settings("refused");

  const session = await auth();
  if (!session?.memberId) return signin();

  const access = await loadAccess(session.memberId);
  if (!access) return signin();

  const exchanged = await exchangeCode({
    code: params.code,
    redirectUri: callbackUri(request),
  });
  if (!exchanged.ok) {
    console.error("[link] token exchange failed:", exchanged.error);
    return settings("failed");
  }

  const who = await fetchUserInfo(exchanged.token.access_token);
  if (!who.ok) {
    console.error("[link] userinfo failed:", who.message);
    return settings("failed");
  }

  const attached = await attachProfile({
    accountId: access.account.id,
    seatLimit: access.account.seatLimit,
    memberId: who.data.sub,
    name: who.data.name,
    email: who.data.email,
    avatarUrl: who.data.picture,
    accessToken: exchanged.token.access_token,
    expiresAt:
      Math.floor(Date.now() / 1000) + exchanged.token.expires_in,
    scopes: exchanged.token.scope ?? LINKEDIN_SCOPES.join(","),
  });

  if (!attached.ok) {
    console.error("[link] refused:", attached.error);
    return settings(attached.error.startsWith("This plan") ? "full" : "taken");
  }

  // The board follows the profile that was just connected. Connecting one and
  // then looking at somebody else's board is nobody's intention.
  return settings(attached.reconnected ? "renewed" : "added", attached.profileId);
}

function settings(outcome: string, activeProfileId?: string): Response {
  const headers = new Headers({ location: `/settings?linked=${outcome}` });
  headers.append(
    "set-cookie",
    `${LINK_STATE_COOKIE}=; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=0`,
  );
  if (activeProfileId) {
    headers.append(
      "set-cookie",
      `${ACTIVE_PROFILE_COOKIE}=${activeProfileId}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=${60 * 60 * 24 * 365}`,
    );
  }
  return new Response(null, { status: 302, headers });
}

function signin(): Response {
  return new Response(null, { status: 302, headers: { location: "/signin" } });
}
