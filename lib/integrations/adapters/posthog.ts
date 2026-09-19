import { credentialError, request } from "../http";
import { WINDOW_DAYS, WINDOW_LABEL, count, series } from "../format";
import type { Adapter, AdapterInput, DraftFact, ReadResult } from "../types";

/**
 * PostHog, read through HogQL rather than through the insight endpoints, so one
 * query shape covers every number we want and the query text is readable in
 * this file instead of assembled out of filter objects.
 *
 * Two jobs at once. It feeds the data kind, and it is the only source that
 * answers the question a customer on the traffic goal already has, which is
 * whether the posting is sending anyone to the site. We tag every link with UTM
 * parameters and until now had nowhere to read the other end of that.
 */

const DEFAULT_HOST = "https://us.posthog.com";

function base(host: string | null): string {
  const trimmed = (host?.trim() || DEFAULT_HOST).replace(/\/+$/, "");
  return trimmed.startsWith("http") ? trimmed : `https://${trimmed}`;
}

function headers(credential: string): HeadersInit {
  return {
    Authorization: `Bearer ${credential}`,
    "Content-Type": "application/json",
  };
}

type QueryResponse = { results: unknown[][] };

async function hogql(
  credential: string,
  host: string | null,
  project: string,
  query: string,
): Promise<unknown[][] | null> {
  const result = await request<QueryResponse>(
    `${base(host)}/api/projects/${encodeURIComponent(project)}/query/`,
    {
      method: "POST",
      headers: headers(credential),
      body: JSON.stringify({ query: { kind: "HogQLQuery", query } }),
    },
  );
  return result.ok && Array.isArray(result.data.results)
    ? result.data.results
    : null;
}

/** HogQL over an interval, written once so every query reads the same window. */
function recent(where: string): string {
  return `timestamp > now() - interval ${WINDOW_DAYS} day${where ? ` and ${where}` : ""}`;
}

function numberAt(row: unknown[] | undefined, index: number): number | null {
  const value = row?.[index];
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}

export const posthogAdapter: Adapter = {
  kind: "posthog",

  async check({ credential, handle, host }: AdapterInput) {
    const project = handle?.trim();
    if (!project) return { ok: false, error: "Add the project id." };

    const result = await request<{ name: string }>(
      `${base(host)}/api/projects/${encodeURIComponent(project)}/`,
      { headers: headers(credential) },
    );
    if (!result.ok) {
      return {
        ok: false,
        error: credentialError(
          "PostHog",
          result.status,
          result.status === 404
            ? `Project ${project} is not on this key's organisation, or the host is wrong.`
            : result.error,
        ),
      };
    }
    return { ok: true, handle: project, account: result.data.name };
  },

  async read({ credential, handle, host }: AdapterInput): Promise<ReadResult> {
    const project = handle?.trim();
    if (!project) return { ok: false, error: "Add the project id." };

    const traffic = await hogql(
      credential,
      host,
      project,
      `select count(), count(distinct person_id) from events where ${recent("event = '$pageview'")}`,
    );
    if (!traffic) {
      return {
        ok: false,
        error:
          "PostHog would not run the query. The key needs Query read access on this project.",
      };
    }

    const facts: DraftFact[] = [];
    const pageviews = numberAt(traffic[0], 0);
    const visitors = numberAt(traffic[0], 1);
    if (pageviews !== null && pageviews > 0) {
      facts.push({
        key: "pageviews",
        label: "Pageviews",
        value: count(pageviews),
        detail: visitors !== null ? `${count(visitors)} unique visitors` : null,
        period: WINDOW_LABEL,
      });
    }

    const pages = await hogql(
      credential,
      host,
      project,
      `select properties.$pathname as path, count() as views from events
       where ${recent("event = '$pageview' and properties.$pathname != ''")}
       group by path order by views desc limit 3`,
    );
    const pageRows = (pages ?? []).filter((row) => typeof row[0] === "string");
    if (pageRows.length > 0) {
      facts.push({
        key: "top_pages",
        label: "Most visited pages",
        value: series(pageRows.map((row) => String(row[0]))),
        detail: `${count(numberAt(pageRows[0], 1) ?? 0)} views on the first of them`,
        period: WINDOW_LABEL,
      });
    }

    const referrers = await hogql(
      credential,
      host,
      project,
      `select properties.$referring_domain as source, count() as views from events
       where ${recent("event = '$pageview' and source not in ('', '$direct')")}
       group by source order by views desc limit 3`,
    );
    const referrerRows = (referrers ?? []).filter((row) => typeof row[0] === "string");
    if (referrerRows.length > 0) {
      facts.push({
        key: "top_referrers",
        label: "Where visitors arrived from",
        value: series(referrerRows.map((row) => String(row[0]))),
        period: WINDOW_LABEL,
      });
    }

    // Custom events only. PostHog's own $pageview and $autocapture say nothing
    // about the product, and a post about them would be a post about PostHog.
    const events = await hogql(
      credential,
      host,
      project,
      `select event, count() as fired from events
       where ${recent("event not like '$%'")}
       group by event order by fired desc limit 3`,
    );
    const eventRows = (events ?? []).filter((row) => typeof row[0] === "string");
    if (eventRows.length > 0) {
      facts.push({
        key: "top_events",
        label: "Most frequent product events",
        value: eventRows
          .map((row) => `${row[0]} ${count(numberAt(row, 1) ?? 0)}`)
          .join(", "),
        period: WINDOW_LABEL,
      });
    }

    if (facts.length === 0) {
      return {
        ok: false,
        error: `PostHog ran the query and project ${project} has no events in the last ${WINDOW_DAYS} days.`,
      };
    }
    return { ok: true, facts };
  },
};
