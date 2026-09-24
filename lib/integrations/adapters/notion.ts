import { credentialError, request } from "../http";
import { ago } from "../format";
import type { Adapter, AdapterInput, DraftFact, ReadResult } from "../types";

/**
 * Notion, and it is the odd one out on purpose. The other four return numbers.
 * This one returns the author's own sentences.
 *
 * That makes it the only source that improves the voice principle rather than
 * supplying a fact, and voice is what gets a draft rejected. A framework post
 * written from the half-finished page where someone worked the method out is a
 * different post from one written from their homepage.
 *
 * It reads only pages the user has explicitly shared with the integration.
 * Notion's permission model does that for us, which is why this is a paste-once
 * token rather than a workspace-wide OAuth grant.
 */

const BASE = "https://api.notion.com/v1";
/** Pinned, like every other version header here. Notion breaks old ones loudly. */
const NOTION_VERSION = "2022-06-28";

/** Three pages with an excerpt each. The prompt budget is in facts.ts, but the
 * cheapest place to stop reading text is before it is fetched. */
const PAGES = 3;
const BLOCKS_PER_PAGE = 30;
const EXCERPT_CHARS = 600;

function headers(credential: string): HeadersInit {
  return {
    Authorization: `Bearer ${credential}`,
    "Notion-Version": NOTION_VERSION,
    "Content-Type": "application/json",
  };
}

type RichText = { plain_text?: string };

type Page = {
  id: string;
  last_edited_time: string;
  url?: string;
  properties?: Record<string, { type: string; title?: RichText[] }>;
};

type Block = {
  type: string;
  [key: string]: unknown;
};

/**
 * A page's title is whichever property has type "title", and its name differs
 * per database, so it is found rather than looked up by key.
 */
function titleOf(page: Page): string {
  for (const property of Object.values(page.properties ?? {})) {
    if (property.type === "title" && property.title?.length) {
      const text = property.title
        .map((part) => part.plain_text ?? "")
        .join("")
        .trim();
      if (text) return text;
    }
  }
  return "Untitled page";
}

/** The block types that hold prose. A table or an embed contributes nothing. */
const PROSE = new Set([
  "paragraph",
  "heading_1",
  "heading_2",
  "heading_3",
  "bulleted_list_item",
  "numbered_list_item",
  "quote",
  "callout",
  "to_do",
  "toggle",
]);

function textOf(blocks: Block[]): string {
  const lines: string[] = [];
  for (const block of blocks) {
    if (!PROSE.has(block.type)) continue;
    const body = block[block.type] as { rich_text?: RichText[] } | undefined;
    const text = (body?.rich_text ?? [])
      .map((part) => part.plain_text ?? "")
      .join("")
      .trim();
    if (text) lines.push(text);
  }
  return lines.join(" ");
}

export const notionAdapter: Adapter = {
  kind: "notion",

  async check({ credential }: AdapterInput) {
    const result = await request<{ name: string | null; bot?: { workspace_name?: string | null } }>(
      `${BASE}/users/me`,
      { headers: headers(credential) },
    );
    if (!result.ok) {
      return {
        ok: false,
        error: credentialError("Notion", result.status, result.error),
      };
    }
    return {
      ok: true,
      account: result.data.bot?.workspace_name ?? result.data.name ?? null,
    };
  },

  async read({ credential, now }: AdapterInput): Promise<ReadResult> {
    const search = await request<{ results: Page[] }>(`${BASE}/search`, {
      method: "POST",
      headers: headers(credential),
      body: JSON.stringify({
        filter: { property: "object", value: "page" },
        sort: { direction: "descending", timestamp: "last_edited_time" },
        page_size: PAGES,
      }),
    });
    if (!search.ok) {
      return {
        ok: false,
        error: credentialError("Notion", search.status, search.error),
      };
    }

    const pages = search.data.results ?? [];
    if (pages.length === 0) {
      return {
        ok: false,
        error:
          "Notion accepted the token and no pages are shared with the integration. Open a page, Connections, and add it.",
      };
    }

    const facts: DraftFact[] = [];
    for (const page of pages) {
      const title = titleOf(page);
      const blocks = await request<{ results: Block[] }>(
        `${BASE}/blocks/${page.id}/children?page_size=${BLOCKS_PER_PAGE}`,
        { headers: headers(credential) },
      );
      const excerpt = blocks.ok ? textOf(blocks.data.results ?? []) : "";

      facts.push({
        // Keyed by page, so the same page edited again updates its row. A page
        // that drops out of the most-recent three has its row deleted by the
        // sync, which is the reason the sync deletes rather than only upserts.
        key: `note:${page.id}`,
        label: `Note: ${title}`,
        value: `edited ${ago(page.last_edited_time, now)}`,
        detail: excerpt ? excerpt.slice(0, EXCERPT_CHARS) : null,
        period: null,
      });
    }

    return { ok: true, facts };
  },
};
