import { credentialError, request } from "../http";
import {
  WINDOW_DAYS,
  WINDOW_LABEL,
  count,
  duration,
  percent,
  series,
} from "../format";
import type { Adapter, AdapterInput, DraftFact, ReadResult } from "../types";

/**
 * Plausible, for the customers who run it instead of PostHog. Four numbers and
 * two lists out of three calls, and the key is read-only by construction, which
 * makes it the least frightening thing on the page to connect.
 */

const DEFAULT_HOST = "https://plausible.io";
const PERIOD = `${WINDOW_DAYS}d`;

function base(host: string | null): string {
  const trimmed = (host?.trim() || DEFAULT_HOST).replace(/\/+$/, "");
  return trimmed.startsWith("http") ? trimmed : `https://${trimmed}`;
}

function headers(credential: string): HeadersInit {
  return { Authorization: `Bearer ${credential}` };
}

type Aggregate = {
  results: Record<string, { value: number } | undefined>;
};

type Breakdown = { results: Record<string, unknown>[] };

function aggregateUrl(host: string | null, site: string): string {
  const url = new URL(`${base(host)}/api/v1/stats/aggregate`);
  url.searchParams.set("site_id", site);
  url.searchParams.set("period", PERIOD);
  url.searchParams.set("metrics", "visitors,pageviews,bounce_rate,visit_duration");
  return url.toString();
}

async function breakdown(
  credential: string,
  host: string | null,
  site: string,
  property: string,
): Promise<Record<string, unknown>[] | null> {
  const url = new URL(`${base(host)}/api/v1/stats/breakdown`);
  url.searchParams.set("site_id", site);
  url.searchParams.set("period", PERIOD);
  url.searchParams.set("property", property);
  url.searchParams.set("metrics", "visitors");
  url.searchParams.set("limit", "3");
  const result = await request<Breakdown>(url.toString(), {
    headers: headers(credential),
  });
  return result.ok && Array.isArray(result.data.results) ? result.data.results : null;
}

function labels(rows: Record<string, unknown>[], field: string): string[] {
  return rows
    .map((row) => row[field])
    .filter((value): value is string => typeof value === "string" && value !== "");
}

export const plausibleAdapter: Adapter = {
  kind: "plausible",

  /** The aggregate call is the check: it needs the key and the site to be right. */
  async check({ credential, handle, host }: AdapterInput) {
    const site = handle?.trim();
    if (!site) return { ok: false, error: "Add the site domain." };

    const result = await request<Aggregate>(aggregateUrl(host, site), {
      headers: headers(credential),
    });
    if (!result.ok) {
      return {
        ok: false,
        error: credentialError(
          "Plausible",
          result.status,
          result.status === 404
            ? `No site called ${site} on this key's account.`
            : result.error,
        ),
      };
    }
    return { ok: true, handle: site, account: site };
  },

  async read({ credential, handle, host }: AdapterInput): Promise<ReadResult> {
    const site = handle?.trim();
    if (!site) return { ok: false, error: "Add the site domain." };

    const aggregate = await request<Aggregate>(aggregateUrl(host, site), {
      headers: headers(credential),
    });
    if (!aggregate.ok) {
      return {
        ok: false,
        error: credentialError("Plausible", aggregate.status, aggregate.error),
      };
    }

    const stats = aggregate.data.results ?? {};
    const visitors = stats.visitors?.value;
    const pageviews = stats.pageviews?.value;
    const bounce = stats.bounce_rate?.value;
    const visit = stats.visit_duration?.value;

    const facts: DraftFact[] = [];
    if (typeof visitors === "number") {
      facts.push({
        key: "visitors",
        label: "Unique visitors",
        value: count(visitors),
        detail:
          typeof pageviews === "number" ? `${count(pageviews)} pageviews` : null,
        period: WINDOW_LABEL,
      });
    }
    if (typeof bounce === "number") {
      facts.push({
        key: "engagement",
        label: "Bounce rate",
        // Plausible reports a whole number already, so it is not divided twice.
        value: percent(bounce / 100),
        detail:
          typeof visit === "number"
            ? `average visit ${duration(visit)}`
            : null,
        period: WINDOW_LABEL,
      });
    }

    const [pages, sources] = await Promise.all([
      breakdown(credential, host, site, "event:page"),
      breakdown(credential, host, site, "visit:source"),
    ]);

    const pageLabels = labels(pages ?? [], "page");
    if (pageLabels.length > 0) {
      facts.push({
        key: "top_pages",
        label: "Most visited pages",
        value: series(pageLabels),
        period: WINDOW_LABEL,
      });
    }

    const sourceLabels = labels(sources ?? [], "source");
    if (sourceLabels.length > 0) {
      facts.push({
        key: "top_sources",
        label: "Where visitors arrived from",
        value: series(sourceLabels),
        period: WINDOW_LABEL,
      });
    }

    if (facts.length === 0) {
      return {
        ok: false,
        error: `Plausible has no traffic recorded for ${site} in the last ${WINDOW_DAYS} days.`,
      };
    }
    return { ok: true, facts };
  },
};
