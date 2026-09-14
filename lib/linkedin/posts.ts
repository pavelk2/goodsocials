import { linkedinCall, type LinkedInResult } from "./client";

/**
 * Posts go to /rest/posts. /v2/ugcPosts is retired for new integrations.
 * There is no scheduling endpoint, so publish time is ours to manage.
 */

export type Visibility = "PUBLIC" | "CONNECTIONS";

/**
 * LinkedIn's commentary field uses a restricted text format where some
 * characters are reserved. The documented set is not consistent across their
 * pages, so Day 1 publishes a post containing parentheses and an apostrophe
 * unescaped to find out empirically. Do not turn this on until that answer is
 * recorded in CLAUDE.md.
 */
export function escapeCommentary(text: string): string {
  return text.replace(/([\\|{}@\[\]()<>*_~])/g, "\\$1");
}

export function personUrn(memberId: string): string {
  return `urn:li:person:${memberId}`;
}

export async function publishTextPost(opts: {
  accessToken: string;
  authorUrn: string;
  text: string;
  visibility?: Visibility;
}): Promise<LinkedInResult<unknown>> {
  return linkedinCall({
    accessToken: opts.accessToken,
    method: "POST",
    path: "/rest/posts",
    body: {
      author: opts.authorUrn,
      commentary: opts.text,
      visibility: opts.visibility ?? "PUBLIC",
      distribution: {
        feedDistribution: "MAIN_FEED",
        targetEntities: [],
        thirdPartyDistributionChannels: [],
      },
      lifecycleState: "PUBLISHED",
      isReshareDisabledByAuthor: false,
    },
  });
}

export async function deletePost(opts: {
  accessToken: string;
  postUrn: string;
}): Promise<LinkedInResult<unknown>> {
  return linkedinCall({
    accessToken: opts.accessToken,
    method: "DELETE",
    path: `/rest/posts/${encodeURIComponent(opts.postUrn)}`,
  });
}

/** urn:li:share:7123... renders at this URL. Useful for eyeballing a result. */
export function postPermalink(postUrn: string): string {
  return `https://www.linkedin.com/feed/update/${postUrn}/`;
}
