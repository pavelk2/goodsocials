import { and, asc, eq, isNull, lte } from "drizzle-orm";
import { getDb } from "@/db";
import {
  account as accountTable,
  card as cardTable,
  linkedinConnection,
  profile as profileTable,
  scheduledPost,
} from "@/db/schema";
import { billingBlock } from "@/lib/billing";
import { openToken } from "@/lib/linkedin/crypto";
import { uploadImage } from "@/lib/linkedin/images";
import { personUrn, postPermalink, publishPost } from "@/lib/linkedin/posts";
import { statusFor } from "@/lib/token-expiry";
import { toLinkedInText } from "@/lib/bold";
import { brokenIssues, type QualityIssue, type QualityVerdict } from "@/lib/quality";
import { textHash } from "@/lib/quality-hash";

/**
 * LinkedIn has no scheduling endpoint, so this is the publish loop. It reads
 * scheduled_post and nothing else, which is why a card in the Scheduled column
 * without a row here would sit there looking correct forever.
 *
 * Three things it is built not to do:
 *
 * Fail post by post on a dead token. A connection past 60 days pauses the
 * whole profile in one decision and writes it on every row it skipped, because
 * an agency with 12 clients needs to read "this client needs to sign in again"
 * rather than 40 identical 401s.
 *
 * Retry forever. Five attempts and the row stops, holding the error that
 * stopped it. A queue that retries a malformed post every 15 minutes for a
 * month is a rate limit incident with extra steps.
 *
 * Publish something the user did not approve. A card approved with a picture
 * publishes with that picture or it does not publish yet. The one case where a
 * post goes out without one is the image cap, and that decision was made at
 * approval time, on the board, where the user saw it.
 *
 * Publish a post that is broken in the feed. The quality gate in
 * lib/cards.ts runs when a card asks for a slot; this repeats its rules that
 * make a post false or unreadable, for anything queued before the gate or
 * changed after it. A post that fails is taken off the queue and handed back
 * to Ready to schedule with the reason, never retried, because no number of
 * attempts fills a bracket.
 *
 * Publish for an account that is not paying. Billing is checked before the
 * token, once per profile, and a stopped account pauses rather than fails, so
 * the queue it has built publishes the day the plan starts again.
 */

const MAX_ATTEMPTS = 5;
const DEFAULT_BATCH = 25;

export type PublishOutcome =
  | { cardId: string; result: "published"; postUrn: string; permalink: string }
  | { cardId: string; result: "failed"; attempts: number; error: string }
  | { cardId: string; result: "paused"; error: string }
  | { cardId: string; result: "held"; error: string }
  | { cardId: string; result: "exhausted"; attempts: number; error: string };

export type PublishRun = {
  ranAt: string;
  due: number;
  published: number;
  failed: number;
  paused: number;
  exhausted: number;
  held: number;
  outcomes: PublishOutcome[];
};

type DueRow = {
  scheduled: typeof scheduledPost.$inferSelect;
  card: typeof cardTable.$inferSelect;
  profile: typeof profileTable.$inferSelect;
  /** The paying entity. Read here so billing is one query, not one per post. */
  account: typeof accountTable.$inferSelect;
};

export async function runPublishQueue(opts?: {
  now?: Date;
  limit?: number;
}): Promise<PublishRun> {
  const now = opts?.now ?? new Date();
  const db = getDb();

  const due: DueRow[] = await db
    .select({
      scheduled: scheduledPost,
      card: cardTable,
      profile: profileTable,
      account: accountTable,
    })
    .from(scheduledPost)
    .innerJoin(cardTable, eq(scheduledPost.cardId, cardTable.id))
    .innerJoin(profileTable, eq(scheduledPost.profileId, profileTable.id))
    .innerJoin(accountTable, eq(profileTable.accountId, accountTable.id))
    .where(
      and(
        isNull(scheduledPost.publishedAt),
        lte(scheduledPost.publishAt, now),
      ),
    )
    .orderBy(asc(scheduledPost.publishAt))
    .limit(opts?.limit ?? DEFAULT_BATCH);

  const run: PublishRun = {
    ranAt: now.toISOString(),
    due: due.length,
    published: 0,
    failed: 0,
    paused: 0,
    exhausted: 0,
    held: 0,
    outcomes: [],
  };

  // Grouped by profile so one token read and one connection decision covers
  // every post that member has waiting, in the order they were scheduled.
  const byProfile = new Map<string, DueRow[]>();
  for (const row of due) {
    const rows = byProfile.get(row.profile.id) ?? [];
    rows.push(row);
    byProfile.set(row.profile.id, rows);
  }

  for (const rows of byProfile.values()) {
    await publishForProfile(rows, now, run);
  }

  return run;
}

async function publishForProfile(
  rows: DueRow[],
  now: Date,
  run: PublishRun,
): Promise<void> {
  const db = getDb();
  const profile = rows[0].profile;

  // Billing before the token, because an account that stopped paying should
  // not have its LinkedIn connection read at all. Paused, not failed: nothing
  // is wrong with these posts and they go out the day a plan starts again.
  const stopped = billingBlock(rows[0].account);
  if (stopped) {
    await pauseProfile(rows, stopped, run);
    return;
  }

  const [connection] = await db
    .select()
    .from(linkedinConnection)
    .where(eq(linkedinConnection.profileId, profile.id))
    .limit(1);

  if (!connection) {
    await pauseProfile(rows, "No LinkedIn connection. Sign in again to reconnect.", run);
    return;
  }

  // The status is derived from expires_at in one place, and this is where it
  // gets written down, because the cron runs whether or not anyone is looking.
  //
  // Dead is the one status the clock cannot undo. A token LinkedIn refused is
  // gone whatever its expiry says, and recomputing it back to active would
  // retry a revoked token every quarter hour and take the banner off the board
  // while it did.
  const derived = statusFor(connection.expiresAt, now);
  const status = connection.status === "dead" ? "dead" : derived;
  if (status !== connection.status) {
    await db
      .update(linkedinConnection)
      .set({ status })
      .where(eq(linkedinConnection.id, connection.id));
  }

  if (status === "dead") {
    // Expired and revoked have the same remedy and are not the same event.
    // Telling somebody their token expired when LinkedIn refused it sends them
    // looking for a date that is still weeks away.
    await pauseProfile(
      rows,
      derived === "dead"
        ? "The LinkedIn connection reached its 60 days and expired. Sign in again and the queue picks up where it stopped."
        : "LinkedIn refused this connection. Sign in again and the queue picks up where it stopped.",
      run,
    );
    return;
  }

  let accessToken: string;
  try {
    accessToken = openToken({
      ciphertext: connection.accessTokenCiphertext,
      iv: connection.accessTokenIv,
      tag: connection.accessTokenTag,
    });
  } catch (cause) {
    console.error("[publish] could not decrypt token:", cause);
    await pauseProfile(
      rows,
      "The stored LinkedIn token could not be read. Sign in again.",
      run,
    );
    return;
  }

  const authorUrn = connection.memberUrn || personUrn(profile.linkedinMemberId);

  for (let i = 0; i < rows.length; i += 1) {
    const row = rows[i];

    if (row.scheduled.attempts >= MAX_ATTEMPTS) {
      run.exhausted += 1;
      run.outcomes.push({
        cardId: row.card.id,
        result: "exhausted",
        attempts: row.scheduled.attempts,
        error: row.scheduled.lastError ?? "Stopped after repeated failures.",
      });
      continue;
    }

    const outcome = await publishOne({
      row,
      accessToken,
      memberId: profile.linkedinMemberId,
      authorUrn,
    });

    run.outcomes.push(outcome);

    if (outcome.result === "published") {
      run.published += 1;
      continue;
    }

    if (outcome.result === "held") {
      run.held += 1;
      continue;
    }

    // A dead or revoked token found mid-run stops the rest of this profile in
    // the same pass. Carrying on would spend attempts on posts that cannot
    // succeed and would fill the log with the same 401 twelve times.
    if (outcome.result === "paused") {
      run.paused += 1;
      const remaining = rows.slice(i + 1);
      if (remaining.length > 0) await pauseProfile(remaining, outcome.error, run);
      return;
    }

    run.failed += 1;
  }
}

async function publishOne(opts: {
  row: DueRow;
  accessToken: string;
  memberId: string;
  authorUrn: string;
}): Promise<PublishOutcome> {
  const { row, accessToken, memberId, authorUrn } = opts;
  const db = getDb();
  const text = row.card.draftText;

  if (!text) {
    return record(row, "That card has no text to publish.");
  }

  const broken = brokenIssues(text);
  if (broken.length > 0) return hold(row, text, broken);

  // The upload is idempotent from our side: a URN we already hold is reused,
  // so a post that failed after the upload does not pay for it twice.
  let imageUrn = row.card.imageUrn;
  if (row.card.imageUrl && !imageUrn) {
    const uploaded = await uploadImage({
      accessToken,
      memberId,
      ownerUrn: authorUrn,
      imageUrl: row.card.imageUrl,
    });

    if (!uploaded.ok) {
      return record(row, `Image upload failed at ${uploaded.step}: ${uploaded.error}`);
    }

    imageUrn = uploaded.imageUrn;
    await db
      .update(cardTable)
      .set({ imageUrn, updatedAt: new Date() })
      .where(eq(cardTable.id, row.card.id));
  }

  const published = await publishPost({
    accessToken,
    memberId,
    authorUrn,
    // Stored with **markers**, sent as bold letters. See lib/bold.ts.
    text: toLinkedInText(text),
    imageUrn,
    altText: row.card.imageAlt,
  });

  if (!published.ok) {
    const dead =
      published.status === 401 ||
      published.code === "REVOKED_ACCESS_TOKEN" ||
      published.code === "EXPIRED_ACCESS_TOKEN";

    if (dead) {
      await getDb()
        .update(linkedinConnection)
        .set({ status: "dead" })
        .where(eq(linkedinConnection.profileId, row.profile.id));
      const error =
        "LinkedIn refused the token. Sign in again and the queue picks up where it stopped.";
      await pauseRow(row, error);
      return { cardId: row.card.id, result: "paused", error };
    }

    // Our own budget refusal and LinkedIn's 429 are both "not now, and not
    // your post's fault". Spending an attempt on either would retire a good
    // post after five quiet hours.
    if (published.status === 429) {
      await pauseRow(row, published.message);
      return { cardId: row.card.id, result: "paused", error: published.message };
    }

    return record(
      row,
      `LinkedIn returned ${published.status} ${published.code ?? ""}: ${published.message}`.trim(),
    );
  }

  const postUrn = published.restliId;
  if (!postUrn) {
    // 201 with no x-restli-id means it may well have posted. Retrying would
    // publish it twice, so the row stops here holding the reason.
    await db
      .update(scheduledPost)
      .set({
        attempts: MAX_ATTEMPTS,
        lastError:
          "LinkedIn accepted the post but returned no post URN. Check the feed before rescheduling.",
      })
      .where(eq(scheduledPost.id, row.scheduled.id));
    return {
      cardId: row.card.id,
      result: "exhausted",
      attempts: MAX_ATTEMPTS,
      error: "Published without a post URN. Check the feed.",
    };
  }

  const publishedAt = new Date();
  await db
    .update(scheduledPost)
    .set({ postUrn, publishedAt, lastError: null })
    .where(eq(scheduledPost.id, row.scheduled.id));
  await db
    .update(cardTable)
    .set({ state: "posted", postUrn, updatedAt: publishedAt })
    .where(eq(cardTable.id, row.card.id));

  console.log(
    JSON.stringify({
      event: "post_published",
      profile_id: row.profile.id,
      card_id: row.card.id,
      post_urn: postUrn,
      with_image: Boolean(row.card.imageUrl),
      late_by_seconds: Math.round(
        (publishedAt.getTime() - row.scheduled.publishAt.getTime()) / 1000,
      ),
    }),
  );

  return {
    cardId: row.card.id,
    result: "published",
    postUrn,
    permalink: postPermalink(postUrn),
  };
}

/**
 * Off the queue and back to Ready to schedule, carrying the reasons the way a
 * card the gate held at approval does, so the board shows the same thing
 * whichever check caught it. The slot is freed rather than kept, because the
 * day has come and the post is not going out on it.
 */
async function hold(
  row: DueRow,
  text: string,
  issues: QualityIssue[],
): Promise<PublishOutcome> {
  const db = getDb();
  const verdict: QualityVerdict = {
    textHash: textHash(text),
    passed: false,
    issues,
    checkedAt: new Date().toISOString(),
  };
  await db.delete(scheduledPost).where(eq(scheduledPost.id, row.scheduled.id));
  await db
    .update(cardTable)
    .set({ state: "image", scheduledAt: null, quality: verdict, updatedAt: new Date() })
    .where(eq(cardTable.id, row.card.id));

  console.log(
    JSON.stringify({
      event: "post_quality_checked",
      profile_id: row.profile.id,
      card_id: row.card.id,
      passed: false,
      layer: "cron",
      rules: issues.map((i) => i.rule),
    }),
  );

  return {
    cardId: row.card.id,
    result: "held",
    error: `Held back at publish time. ${issues[0].problem}`,
  };
}

/** A real failure. Costs an attempt and the reason is readable in a query. */
async function record(row: DueRow, error: string): Promise<PublishOutcome> {
  const attempts = row.scheduled.attempts + 1;
  await getDb()
    .update(scheduledPost)
    .set({ attempts, lastError: error })
    .where(eq(scheduledPost.id, row.scheduled.id));
  console.error("[publish]", row.card.id, error);
  return { cardId: row.card.id, result: "failed", attempts, error };
}

/**
 * Paused, not failed. The reason is written so the board and an operator query
 * can both see it, and the attempt count is untouched, because nothing about
 * this post was wrong and it should publish the moment the member reconnects.
 */
async function pauseRow(row: DueRow, error: string): Promise<void> {
  await getDb()
    .update(scheduledPost)
    .set({ lastError: error })
    .where(eq(scheduledPost.id, row.scheduled.id));
}

async function pauseProfile(
  rows: DueRow[],
  error: string,
  run: PublishRun,
): Promise<void> {
  for (const row of rows) {
    await pauseRow(row, error);
    run.paused += 1;
    run.outcomes.push({ cardId: row.card.id, result: "paused", error });
  }
}
