import { credentialError, request } from "../http";
import { WINDOW_LABEL, count, day, isoDay, windowStart } from "../format";
import type { Adapter, AdapterInput, DraftFact, ReadResult } from "../types";

/**
 * GitHub, for the profiles that ship software. Narrow audience, and near zero
 * ambiguity when it hits: "we merged 41 pull requests and cut 2.4.0" is a
 * receipt whose number nobody has to be talked into believing.
 *
 * Counts come from the search API, which reports a total without paging through
 * it. One call per count, four counts, once a day, against a limit of 30 search
 * requests a minute.
 */

const BASE = "https://api.github.com";

function headers(credential: string): HeadersInit {
  return {
    Authorization: `Bearer ${credential}`,
    Accept: "application/vnd.github+json",
    // Pinned for the same reason as every other version header in this repo.
    "X-GitHub-Api-Version": "2022-11-28",
    "User-Agent": "goodsocials",
  };
}

type Search = { total_count: number };

async function searchCount(
  credential: string,
  path: "issues" | "commits",
  query: string,
): Promise<number | null> {
  const url = new URL(`${BASE}/search/${path}`);
  url.searchParams.set("q", query);
  url.searchParams.set("per_page", "1");
  const result = await request<Search>(url.toString(), {
    headers: headers(credential),
  });
  return result.ok && typeof result.data.total_count === "number"
    ? result.data.total_count
    : null;
}

export const githubAdapter: Adapter = {
  kind: "github",

  /** Who the token belongs to, which is also the handle every search needs. */
  async check({ credential, handle }: AdapterInput) {
    const result = await request<{ login: string; name: string | null }>(
      `${BASE}/user`,
      { headers: headers(credential) },
    );
    if (!result.ok) {
      return {
        ok: false,
        error: credentialError("GitHub", result.status, result.error),
      };
    }
    return {
      ok: true,
      // A handle the user typed wins, so an agency can point at the client's
      // account rather than at whoever's token is in the box.
      handle: handle?.trim() || result.data.login,
      account: result.data.name ?? result.data.login,
    };
  },

  async read({ credential, handle, now }: AdapterInput): Promise<ReadResult> {
    let login = handle?.trim() ?? "";
    if (!login) {
      const me = await request<{ login: string }>(`${BASE}/user`, {
        headers: headers(credential),
      });
      if (!me.ok) {
        return {
          ok: false,
          error: credentialError("GitHub", me.status, me.error),
        };
      }
      login = me.data.login;
    }

    const since = isoDay(windowStart(now));
    const facts: DraftFact[] = [];

    const [merged, closed, commits] = await Promise.all([
      searchCount(credential, "issues", `author:${login} type:pr is:merged merged:>=${since}`),
      searchCount(credential, "issues", `author:${login} type:issue is:closed closed:>=${since}`),
      searchCount(credential, "commits", `author:${login} author-date:>=${since}`),
    ]);

    if (merged !== null) {
      facts.push({
        key: "prs_merged",
        label: "Pull requests merged",
        value: count(merged),
        period: WINDOW_LABEL,
      });
    }
    if (commits !== null) {
      facts.push({
        key: "commits",
        label: "Commits authored",
        value: count(commits),
        period: WINDOW_LABEL,
      });
    }
    if (closed !== null) {
      facts.push({
        key: "issues_closed",
        label: "Issues closed",
        value: count(closed),
        period: WINDOW_LABEL,
      });
    }

    // The repository with the most recent push, and its latest release if it
    // has one. Both best effort: a token with no repository access still gives
    // three useful counts above, and a project with no tags is not a failure.
    const repos = await request<
      { full_name: string; description: string | null; pushed_at: string }[]
    >(
      `${BASE}/users/${encodeURIComponent(login)}/repos?sort=pushed&direction=desc&per_page=1`,
      { headers: headers(credential) },
    );
    const repo = repos.ok ? repos.data[0] : undefined;
    if (repo) {
      facts.push({
        key: "active_repo",
        label: "Repository worked on most recently",
        value: repo.full_name,
        detail: repo.description ?? null,
        period: null,
      });

      const release = await request<{ tag_name: string; name: string | null; published_at: string }>(
        `${BASE}/repos/${repo.full_name}/releases/latest`,
        { headers: headers(credential) },
      );
      if (release.ok && release.data.tag_name) {
        facts.push({
          key: "latest_release",
          label: "Most recent release",
          value: release.data.tag_name,
          detail: `${repo.full_name}, published ${day(release.data.published_at)}`,
          period: null,
        });
      }
    }

    if (facts.length === 0) {
      return {
        ok: false,
        error: `GitHub accepted the token but returned nothing for ${login}. Check the username.`,
      };
    }
    return { ok: true, facts };
  },
};
