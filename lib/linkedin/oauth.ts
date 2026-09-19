import {
  LINKEDIN_OAUTH_AUTHORIZE,
  LINKEDIN_OAUTH_TOKEN,
  LINKEDIN_SCOPES,
  requiredEnv,
} from "./config";
import { linkedinCall } from "./client";

export type TokenResponse = {
  access_token: string;
  expires_in: number;
  scope?: string;
  /** Present only for apps approved into LinkedIn's refresh token program. */
  refresh_token?: string;
  refresh_token_expires_in?: number;
};

export type UserInfo = {
  /** The member id. The author URN is urn:li:person:{sub}. */
  sub: string;
  name?: string;
  email?: string;
  picture?: string;
};

/**
 * The redirect URI must match one registered in the LinkedIn app exactly, and
 * LinkedIn rejects anything that is not HTTPS. Derived from the request so a
 * preview deployment authorizes against itself, overridable for the case where
 * the only registered URI is the production domain.
 */
export function callbackUri(request: Request): string {
  const override =
    process.env.LINKEDIN_REDIRECT_URI ??
    process.env.LINKEDIN_DEBUG_REDIRECT_URI;
  if (override) return override;
  return `https://${new URL(request.url).host}/api/linkedin/callback`;
}

export function authorizeUrl(opts: {
  redirectUri: string;
  state: string;
  /** Override for the isolated offline_access test. */
  scopes?: readonly string[];
}): string {
  const scopes = opts.scopes ?? LINKEDIN_SCOPES;
  const url = new URL(LINKEDIN_OAUTH_AUTHORIZE);
  url.searchParams.set("response_type", "code");
  url.searchParams.set("client_id", requiredEnv("LINKEDIN_CLIENT_ID"));
  url.searchParams.set("redirect_uri", opts.redirectUri);
  url.searchParams.set("state", opts.state);
  url.searchParams.set("scope", scopes.join(" "));
  return url.toString();
}

export async function exchangeCode(opts: {
  code: string;
  redirectUri: string;
}): Promise<
  { ok: true; token: TokenResponse } | { ok: false; error: string }
> {
  const body = new URLSearchParams({
    grant_type: "authorization_code",
    code: opts.code,
    redirect_uri: opts.redirectUri,
    client_id: requiredEnv("LINKEDIN_CLIENT_ID"),
    client_secret: requiredEnv("LINKEDIN_CLIENT_SECRET"),
  });

  const response = await fetch(LINKEDIN_OAUTH_TOKEN, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body,
    cache: "no-store",
  });

  const raw = await response.text();
  if (!response.ok) {
    return { ok: false, error: `${response.status} ${raw.slice(0, 500)}` };
  }
  return { ok: true, token: JSON.parse(raw) as TokenResponse };
}

/** The OIDC userinfo endpoint is unversioned. Sending LinkedIn-Version fails it. */
export function fetchUserInfo(accessToken: string) {
  return linkedinCall<UserInfo>({
    accessToken,
    // The one call that cannot name a member: this is the call that
    // tells us which member it is.
    memberId: null,
    path: "/v2/userinfo",
    versioned: false,
  });
}
