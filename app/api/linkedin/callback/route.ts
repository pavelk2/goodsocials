import { exchangeCode, fetchUserInfo } from "@/lib/linkedin/oauth";
import { publishTextPost, personUrn, postPermalink } from "@/lib/linkedin/posts";
import { LINKEDIN_VERSION } from "@/lib/linkedin/config";
import { debugRedirectUri, htmlPage } from "@/lib/linkedin/debug-auth";
import { completeLink, isLinkState } from "@/lib/linkedin/link";

/**
 * Day 1 only. Exchanges the code, reads the member id, and publishes one
 * hardcoded post, then reports every fact we need on screen. Nothing sensitive
 * leaves this page: the access token is never rendered or logged.
 *
 * The post text carries parentheses and an apostrophe on purpose, to settle
 * whether LinkedIn's commentary field needs those characters escaped.
 */
const TEST_POST_TEXT =
  "Testing a publishing pipeline (day one). If you're reading this, it worked.";

function row(label: string, value: string) {
  return `<div class="row"><span>${label}</span><span>${value}</span></div>`;
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state") ?? "";
  const oauthError = url.searchParams.get("error");

  // The product flow shares this URI so there is one redirect URI registered
  // with LinkedIn rather than two. It owns its own errors and its own exits.
  if (isLinkState(state)) {
    return completeLink(request, { code, state, error: oauthError });
  }

  if (oauthError) {
    const description =
      url.searchParams.get("error_description") ?? "no description";
    return htmlPage(
      "Authorization refused",
      `<h1>Authorization refused</h1>
       ${row("error", oauthError)}
       ${row("description", description)}
       <p style="margin-top:32px;color:#6E6E73">
       unauthorized_scope_error on the probe run is the expected answer if the
       app was never approved for a refresh token. Record it in CLAUDE.md.</p>`,
    );
  }

  if (!code) {
    return new Response(
      JSON.stringify({ error: "missing_code", hint: "Start at /api/linkedin/start" }),
      { status: 400, headers: { "content-type": "application/json" } },
    );
  }

  const isProbe = state.startsWith("probe.");

  const exchanged = await exchangeCode({
    code,
    redirectUri: debugRedirectUri(request),
  });
  if (!exchanged.ok) {
    return htmlPage(
      "Token exchange failed",
      `<h1>Token exchange failed</h1>${row("response", exchanged.error)}`,
    );
  }

  const token = exchanged.token;
  const grantedScopes = token.scope ?? "(not returned)";
  const expiryDays = Math.round(token.expires_in / 86400);
  const refreshAnswer = token.refresh_token
    ? `yes, expires in ${Math.round((token.refresh_token_expires_in ?? 0) / 86400)} days`
    : "no refresh token returned";

  const facts = [
    row("run", isProbe ? "offline_access probe" : "four production scopes"),
    row("scopes granted", grantedScopes),
    row("access token lifetime", `${expiryDays} days`),
    row("refresh token", refreshAnswer),
    row("LinkedIn-Version", LINKEDIN_VERSION),
  ];

  // The probe run exists to answer one question. Do not post twice.
  if (isProbe) {
    return htmlPage(
      "Probe result",
      `<h1>offline_access probe</h1>${facts.join("")}
       <p style="margin-top:32px;color:#6E6E73">Send these lines to the repo. They go into CLAUDE.md.</p>`,
    );
  }

  const who = await fetchUserInfo(token.access_token);
  if (!who.ok) {
    return htmlPage(
      "userinfo failed",
      `<h1>userinfo failed</h1>${facts.join("")}
       ${row("status", String(who.status))}
       ${row("code", who.code ?? "none")}
       ${row("message", who.message)}`,
    );
  }

  const author = personUrn(who.data.sub);
  const published = await publishTextPost({
    accessToken: token.access_token,
    authorUrn: author,
    text: TEST_POST_TEXT,
  });

  if (!published.ok) {
    return htmlPage(
      "Publish failed",
      `<h1>Publish failed</h1>${facts.join("")}
       ${row("member", who.data.name ?? who.data.sub)}
       ${row("status", String(published.status))}
       ${row("code", published.code ?? "none")}
       ${row("message", published.message)}
       <pre>${published.raw.slice(0, 1200).replace(/</g, "&lt;")}</pre>`,
    );
  }

  const postUrn = published.restliId ?? "(no x-restli-id header)";

  return htmlPage(
    "Published",
    `<h1>Published to your feed.</h1>
     ${facts.join("")}
     ${row("member", who.data.name ?? who.data.sub)}
     ${row("author urn", author)}
     ${row("post urn", postUrn)}
     ${row("http status", `<span class="ok">${published.status}</span>`)}
     <p style="margin-top:32px;color:#6E6E73">Check the punctuation on the live post. If the parentheses and the apostrophe render clean, commentary needs no escaping.</p>
     <a class="btn" href="${postPermalink(postUrn)}" target="_blank" rel="noreferrer">Open the post on LinkedIn</a>`,
  );
}
