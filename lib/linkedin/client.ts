import { LINKEDIN_API_BASE, LINKEDIN_VERSION } from "./config";
import { claimCalls } from "./budget";

/**
 * The only place in the repo that calls LinkedIn's API. Every call carries
 * LinkedIn-Version and X-Restli-Protocol-Version, because every versioned
 * endpoint requires both, and every call is counted against the member's 150
 * a day before it is made.
 */

export type LinkedInOk<T> = {
  ok: true;
  status: number;
  data: T;
  /** Posts API returns the created post URN in this header, not in the body. */
  restliId: string | null;
};

export type LinkedInErr = {
  ok: false;
  status: number;
  /** LinkedIn's own error code, for example REVOKED_ACCESS_TOKEN. */
  code: string | null;
  message: string;
  raw: string;
};

export type LinkedInResult<T> = LinkedInOk<T> | LinkedInErr;

type CallOptions = {
  accessToken: string;
  method?: "GET" | "POST" | "DELETE";
  path: string;
  body?: unknown;
  /** Some endpoints (userinfo) are unversioned and reject the version header. */
  versioned?: boolean;
  /**
   * The member whose daily budget this call spends. Required rather than
   * optional, and nullable rather than absent, so a call site has to say which
   * one it is. null means "we do not know the member yet", which is true for
   * exactly one call: the userinfo request that tells us who they are.
   */
  memberId: string | null;
};

export async function linkedinCall<T = unknown>({
  accessToken,
  method = "GET",
  path,
  body,
  versioned = true,
  memberId,
}: CallOptions): Promise<LinkedInResult<T>> {
  if (memberId) {
    const { ok, budget } = await claimCalls(memberId);
    if (!ok) {
      // Not LinkedIn's 429. This is ours, raised before the call, so the
      // member never reaches the state where their own next action is refused.
      return {
        ok: false,
        status: 429,
        code: "DAILY_BUDGET_SPENT",
        message: `This profile has used all ${budget.limit} LinkedIn calls for ${budget.day}. The count resets at midnight UTC.`,
        raw: "",
      };
    }
  }

  const headers: Record<string, string> = {
    Authorization: `Bearer ${accessToken}`,
    "X-Restli-Protocol-Version": "2.0.0",
  };
  if (versioned) headers["LinkedIn-Version"] = LINKEDIN_VERSION;
  if (body !== undefined) headers["Content-Type"] = "application/json";

  let response: Response;
  try {
    response = await fetch(`${LINKEDIN_API_BASE}${path}`, {
      method,
      headers,
      body: body === undefined ? undefined : JSON.stringify(body),
      cache: "no-store",
    });
  } catch (cause) {
    return {
      ok: false,
      status: 0,
      code: "NETWORK",
      message: cause instanceof Error ? cause.message : "Network failure",
      raw: "",
    };
  }

  const raw = await response.text();

  if (!response.ok) {
    let code: string | null = null;
    let message = raw.slice(0, 500);
    try {
      const parsed = JSON.parse(raw) as {
        code?: string;
        serviceErrorCode?: number;
        message?: string;
      };
      code = parsed.code ?? (parsed.serviceErrorCode?.toString() || null);
      message = parsed.message ?? message;
    } catch {
      // LinkedIn returns HTML for some gateway errors. Keep the raw text.
    }
    return { ok: false, status: response.status, code, message, raw };
  }

  let data = null as T;
  if (raw.length > 0) {
    try {
      data = JSON.parse(raw) as T;
    } catch {
      // 201 Created from /rest/posts has an empty body. That is expected.
    }
  }

  return {
    ok: true,
    status: response.status,
    data,
    restliId: response.headers.get("x-restli-id"),
  };
}
