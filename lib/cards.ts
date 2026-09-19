import { and, eq, sql } from "drizzle-orm";
import { getDb } from "@/db";
import {
  board as boardTable,
  brandPrinciple,
  card as cardTable,
  cardAction,
  cardSource,
  profile as profileTable,
  scheduledPost,
  theme as themeTable,
} from "@/db/schema";
import type { Actor } from "@/lib/profiles";
import { generateDraft } from "@/lib/agent/drafts";
import { generateImage } from "@/lib/agent/images";
import { reviseCardBody } from "@/lib/agent/revise";
import {
  NoSourcesError,
  SearchUnavailableError,
  type Source,
} from "@/lib/agent/research";
import type { Goal } from "@/lib/agent/ideas";
import { needsSources, type PostKind } from "@/lib/post-kind";
import { nextSlot } from "@/lib/schedule";

/**
 * Three actions, no fourth. Approve advances the card one column, Revise
 * rewrites it where it stands, Reject takes it off the board. Everything a
 * user can do to a card is in this file, and every one of them writes a row to
 * card_action, because the log is how a revision is read back and how an
 * agency answers "who approved that".
 */

export type CardResult =
  | { ok: true; message?: string }
  | { ok: false; error: string };

type Loaded = {
  card: typeof cardTable.$inferSelect;
  board: typeof boardTable.$inferSelect;
  profile: typeof profileTable.$inferSelect;
  principles: { voice: string; visual: string; format: string };
  /** Null when the card predates themes, or when its theme was deleted. */
  theme: { title: string; description: string } | null;
  /** How many pages this card's draft was written from. Zero on a personal post. */
  sourceCount: number;
};

/**
 * One query that is also the authorization check. A card is reachable only
 * through the board of a profile on the actor's own account, so there is no
 * separate "is this mine" branch to forget. The account rather than the member
 * is the boundary because an agency posts as many people from one login.
 */
async function load(actor: Actor, cardId: string): Promise<Loaded | null> {
  const db = getDb();

  const [row] = await db
    .select({
      card: cardTable,
      board: boardTable,
      profile: profileTable,
      // Left, not inner: a card with no theme still has to be approvable.
      theme: {
        title: themeTable.title,
        description: themeTable.description,
      },
    })
    .from(cardTable)
    .innerJoin(boardTable, eq(cardTable.boardId, boardTable.id))
    .innerJoin(profileTable, eq(boardTable.profileId, profileTable.id))
    .leftJoin(themeTable, eq(cardTable.themeId, themeTable.id))
    .where(
      and(eq(cardTable.id, cardId), eq(profileTable.accountId, actor.accountId)),
    )
    .limit(1);
  if (!row) return null;

  const [principleRows, sourceRows] = await Promise.all([
    db
      .select()
      .from(brandPrinciple)
      .where(eq(brandPrinciple.profileId, row.profile.id)),
    db
      .select({ id: cardSource.id })
      .from(cardSource)
      .where(eq(cardSource.cardId, row.card.id)),
  ]);

  const principles = { voice: "", visual: "", format: "" };
  for (const p of principleRows) principles[p.kind] = p.text;

  return { ...row, principles, sourceCount: sourceRows.length };
}

/**
 * The gate. A research or explainer card leaves the Draft column only if it is
 * carrying the pages it was written from.
 *
 * It is checked here rather than trusted from the draft call because this is
 * the last place before the card is on its way to somebody's feed, and because
 * a card can reach this line without passing through today's draft path: a row
 * written before the search pass existed, a draft restored by a revision, a
 * drag from Idea straight to Scheduled. One check on the way out covers all of
 * them.
 */
function sourcesMissing(
  card: { kind: PostKind; state: string },
  sourceCount: number,
): CardResult | null {
  if (!needsSources(card.kind) || sourceCount > 0) return null;
  // Not "revise it": a revise comment rewrites the text and never searches.
  // Back to Idea and approved again is the path that runs the research, so
  // that is the path the sentence names.
  return {
    ok: false,
    error:
      "This one has no sources behind it, so it cannot go out. Move it back to Idea and approve it again to research it, or reject it.",
  };
}

/** Saved in the order they were cited, so the post's first source reads first. */
async function saveSources(cardId: string, sources: Source[]): Promise<void> {
  if (sources.length === 0) return;
  await getDb()
    .insert(cardSource)
    .values(
      sources.map((source, position) => ({
        cardId,
        url: source.url,
        title: source.title,
        citedText: source.citedText,
        position,
      })),
    )
    // A redraft of the same card finds some of the same pages. The newest cite
    // is the one the current text leans on, so it wins.
    .onConflictDoUpdate({
      target: [cardSource.cardId, cardSource.url],
      set: { title: sql`excluded.title`, citedText: sql`excluded.cited_text` },
    });
}

async function log(
  cardId: string,
  action: "approve" | "revise" | "reject",
  actorMemberId: string,
  comment?: string,
): Promise<void> {
  await getDb()
    .insert(cardAction)
    .values({ cardId, action, actorMemberId, comment: comment ?? null });
}

/**
 * Approve advances one column. Idea writes the draft, Draft makes the picture,
 * Image claims a publish slot. A card in Scheduled is waiting for the cron and
 * there is nothing left to approve.
 */
export async function approveCard(
  actor: Actor,
  cardId: string,
): Promise<CardResult> {
  const loaded = await load(actor, cardId);
  if (!loaded) return { ok: false, error: "That card is not on your board." };

  const { card, board, profile, principles, theme, sourceCount } = loaded;
  const db = getDb();

  if (card.state === "idea") {
    let draft;
    try {
      draft = await generateDraft({
        idea: card.idea,
        kind: card.kind,
        theme,
        needs: card.needs,
        principles,
        goal: board.goal as Goal,
        siteUrl: board.siteUrl,
        profileId: profile.id,
      });
    } catch (cause) {
      console.error("[cards] draft failed:", cause);
      // The search came back with nothing it could cite. That is a fact about
      // this idea, not a transient failure, so the card says what to do about
      // it rather than inviting the same click again.
      if (cause instanceof NoSourcesError) {
        return {
          ok: false,
          error:
            "Nothing published came back on this one, so there is no post to write. Revise the idea to narrow it, or reject it.",
        };
      }
      // The search itself broke. Nothing is wrong with the idea, so the card
      // does not send the user off to rewrite one that was fine.
      if (cause instanceof SearchUnavailableError) {
        return {
          ok: false,
          error: "The search did not run. Try approving again in a minute.",
        };
      }
      return { ok: false, error: "The draft did not write. Try approving again." };
    }

    // Sources first. A draft on the board that has lost the pages behind it is
    // a card the gate will stop later with no way to explain why.
    await saveSources(card.id, draft.sources);
    await db
      .update(cardTable)
      .set({ state: "draft", draftText: draft.text, updatedAt: new Date() })
      .where(eq(cardTable.id, card.id));
    await log(card.id, "approve", actor.memberId);
    return { ok: true };
  }

  const missing = sourcesMissing(card, sourceCount);
  if (missing) return missing;

  if (card.state === "draft") {
    const text = card.draftText;
    if (!text) return { ok: false, error: "That card has no text to illustrate." };

    // A card dragged back from Image still has the picture it was given, and
    // nobody should pay for it twice to move it forward again.
    if (card.imageUrl) {
      await db
        .update(cardTable)
        .set({ state: "image", updatedAt: new Date() })
        .where(eq(cardTable.id, card.id));
      await log(card.id, "approve", actor.memberId);
      return { ok: true };
    }

    const result = await generateImage({
      profileId: profile.id,
      cardId: card.id,
      postText: text,
      visualPrinciple: principles.visual,
    });

    // At the cap the card carries on without a picture. Blocking the queue to
    // protect our image bill would stop the thing the customer pays for, and a
    // post without an image still publishes.
    if (!result.ok && result.reason === "cap") {
      const slot = await schedule(card.id, profile.id, board.targetCadence);
      await log(card.id, "approve", actor.memberId);
      return { ok: true, message: `${result.error} Scheduled for ${slot} without one.` };
    }

    // A provider that is down or misconfigured is our fault, not a decision
    // about this post. The card stays where it is and says so, because a post
    // scheduled without the picture the user asked for is a silent wrong answer.
    if (!result.ok) return { ok: false, error: result.error };

    await db
      .update(cardTable)
      .set({
        state: "image",
        imageUrl: result.url,
        imageAlt: result.prompt,
        imageUrn: null,
        updatedAt: new Date(),
      })
      .where(eq(cardTable.id, card.id));
    await log(card.id, "approve", actor.memberId);
    return { ok: true, message: `${result.quota.remaining} images left this month.` };
  }

  if (card.state === "image") {
    const slot = await schedule(card.id, profile.id, board.targetCadence);
    await log(card.id, "approve", actor.memberId);
    return { ok: true, message: `Publishing ${slot}.` };
  }

  return { ok: false, error: "That card is already scheduled." };
}

/**
 * Moves the card to Scheduled and writes the publish intent. The cron reads
 * scheduled_post and nothing else, so a card in the Scheduled column without a
 * row here would sit there forever looking correct.
 */
async function schedule(
  cardId: string,
  profileId: string,
  targetCadence: number,
): Promise<string> {
  const publishAt = await nextSlot({ profileId, targetCadence });
  const db = getDb();

  await db
    .insert(scheduledPost)
    .values({ cardId, profileId, publishAt })
    .onConflictDoUpdate({
      target: scheduledPost.cardId,
      set: { publishAt, attempts: 0, lastError: null },
    });

  await db
    .update(cardTable)
    .set({ state: "scheduled", scheduledAt: publishAt, updatedAt: new Date() })
    .where(eq(cardTable.id, cardId));

  return new Intl.DateTimeFormat("en-GB", {
    weekday: "long",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "UTC",
  }).format(publishAt);
}

/**
 * The product. A comment fixes this card and rewrites the principle it was
 * about, so the same note is never typed twice. The card stays in its column:
 * revising is not rejecting, and a revised draft is still a draft.
 */
export async function reviseCard(
  actor: Actor,
  cardId: string,
  comment: string,
): Promise<CardResult> {
  const trimmed = comment.trim();
  if (trimmed.length < 3) {
    return { ok: false, error: "Say what to change." };
  }
  if (trimmed.length > 2000) {
    return { ok: false, error: "Keep a comment under 2000 characters." };
  }

  const loaded = await load(actor, cardId);
  if (!loaded) return { ok: false, error: "That card is not on your board." };

  const { card, board, profile, principles } = loaded;
  if (card.state === "scheduled" || card.state === "posted") {
    return { ok: false, error: "That card has left the queue." };
  }

  const bodyKind = card.draftText ? "post" : "idea";

  // A revision rewrites what is on the card; it never searches again. So the
  // source rows still describe this text, and the revise prompt is the thing
  // keeping that true: it is told to change what the comment asks about and
  // leave the evidence alone. A comment that wants a different claim is a
  // different post, which is what Reject is for.
  let revision;
  try {
    revision = await reviseCardBody({
      bodyKind,
      body: card.draftText ?? card.idea,
      comment: trimmed,
      needs: card.needs,
      principles,
      goal: board.goal as Goal,
      profileId: profile.id,
    });
  } catch (cause) {
    console.error("[cards] revision failed:", cause);
    return { ok: false, error: "The revision did not come back. Try again." };
  }

  const db = getDb();

  // The comment is logged before anything it changed, so the log reads in the
  // order the user experienced it even if a later write fails.
  await log(card.id, "revise", actor.memberId, trimmed);

  // The bracket is the gap, and a post that comes back without one is a post
  // whose number arrived, so the card stops asking. Read off the text rather
  // than off the model saying it filled it in, because the text is what
  // publishes. Only on a draft: an idea brief never carried a bracket, so its
  // absence there proves nothing and the card keeps waiting.
  const filled =
    bodyKind === "post" && Boolean(card.needs) && !revision.body.includes("[");

  await db
    .update(cardTable)
    .set(
      bodyKind === "post"
        ? {
            draftText: revision.body,
            needs: filled ? null : card.needs,
            updatedAt: new Date(),
          }
        : { idea: revision.body, updatedAt: new Date() },
    )
    .where(eq(cardTable.id, card.id));

  if (revision.principle) {
    await db
      .update(brandPrinciple)
      .set({ text: revision.principle.text, updatedAt: new Date() })
      .where(
        and(
          eq(brandPrinciple.profileId, profile.id),
          eq(brandPrinciple.kind, revision.principle.kind),
        ),
      );
  }

  // A visual comment on a card that already has a picture means that picture is
  // wrong, and the principle it was drawn from has just changed.
  if (
    card.state === "image" &&
    card.draftText &&
    revision.principle?.kind === "visual"
  ) {
    const redraw = await generateImage({
      profileId: profile.id,
      cardId: card.id,
      postText: revision.body,
      visualPrinciple: revision.principle.text,
    });
    if (redraw.ok) {
      await db
        .update(cardTable)
        // The URN points at the picture LinkedIn already holds, and this is a
        // different picture. Clearing it is what stops a redrawn card
        // publishing the image it was redrawn to replace.
        .set({
          imageUrl: redraw.url,
          imageAlt: redraw.prompt,
          imageUrn: null,
          updatedAt: new Date(),
        })
        .where(eq(cardTable.id, card.id));
    } else {
      return { ok: true, message: `Text updated. ${redraw.error}` };
    }
  }

  return {
    ok: true,
    message: revision.principle
      ? revision.principle.note
      : "Fixed on this card. It was specific to this one, so nothing else changed.",
  };
}

/**
 * Dragging a card is the same decision as pressing its button, so it runs the
 * same transitions. Forward a column at a time, which means a drag from Idea to
 * Scheduled writes the draft and then the image, in order, and costs what
 * pressing the button twice would cost. Backward only unwinds: nothing is
 * generated, nothing is charged, and the card keeps the text and picture it
 * already has.
 *
 * Posted is written by the cron when LinkedIn accepts the post. It is not a
 * column a human can drag into, because the card there carries a real post URN.
 */
const ORDER = ["idea", "draft", "image", "scheduled", "posted"] as const;
type Ordered = (typeof ORDER)[number];

export async function moveCard(
  actor: Actor,
  cardId: string,
  target: Ordered,
): Promise<CardResult> {
  const loaded = await load(actor, cardId);
  if (!loaded) return { ok: false, error: "That card is not on your board." };

  const from = ORDER.indexOf(loaded.card.state as Ordered);
  const to = ORDER.indexOf(target);
  if (from === -1 || to === -1) {
    return { ok: false, error: "That column does not take cards." };
  }
  if (from === to) return { ok: true };

  if (target === "posted" || loaded.card.state === "posted") {
    return {
      ok: false,
      error: "Posted is written when LinkedIn accepts the post, not by hand.",
    };
  }

  if (to > from) {
    let last: CardResult = { ok: true };
    for (let step = from; step < to; step += 1) {
      last = await approveCard(actor, cardId);
      if (!last.ok) return last;
    }
    return last;
  }

  const db = getDb();
  await db.delete(scheduledPost).where(eq(scheduledPost.cardId, cardId));
  await db
    .update(cardTable)
    .set({ state: target, scheduledAt: null, updatedAt: new Date() })
    .where(eq(cardTable.id, cardId));

  return {
    ok: true,
    message:
      loaded.card.state === "scheduled" ? "Taken out of the queue." : undefined,
  };
}

/** Off the board, still in the table. The log is the point. */
export async function rejectCard(
  actor: Actor,
  cardId: string,
): Promise<CardResult> {
  const loaded = await load(actor, cardId);
  if (!loaded) return { ok: false, error: "That card is not on your board." };
  if (loaded.card.state === "posted") {
    return { ok: false, error: "That one is already published." };
  }

  const db = getDb();
  await db.delete(scheduledPost).where(eq(scheduledPost.cardId, loaded.card.id));
  await db
    .update(cardTable)
    .set({ state: "rejected", scheduledAt: null, updatedAt: new Date() })
    .where(eq(cardTable.id, loaded.card.id));
  await log(loaded.card.id, "reject", actor.memberId);

  return { ok: true };
}

/**
 * Drafting the top of the queue without being asked, so a user who opens the
 * board finds posts to read rather than ideas to click. Bounded to two calls so
 * one page load cannot spend a dollar.
 */
const AUTO_DRAFT_LIMIT = 2;

export async function topUpDrafts(profileId: string): Promise<number> {
  const db = getDb();

  const [row] = await db
    .select({ board: boardTable, profile: profileTable })
    .from(boardTable)
    .innerJoin(profileTable, eq(boardTable.profileId, profileTable.id))
    .where(eq(profileTable.id, profileId))
    .limit(1);
  if (!row) return 0;

  const cards = await db
    .select()
    .from(cardTable)
    .where(eq(cardTable.boardId, row.board.id));

  const drafted = cards.filter((c) => c.state === "draft").length;
  if (drafted >= AUTO_DRAFT_LIMIT) return 0;

  const ideas = cards
    .filter((c) => c.state === "idea")
    .sort((a, b) => a.position - b.position)
    .slice(0, AUTO_DRAFT_LIMIT - drafted);

  const [principleRows, themeRows] = await Promise.all([
    db
      .select()
      .from(brandPrinciple)
      .where(eq(brandPrinciple.profileId, row.profile.id)),
    db
      .select()
      .from(themeTable)
      .where(eq(themeTable.profileId, row.profile.id)),
  ]);
  const principles = { voice: "", visual: "", format: "" };
  for (const p of principleRows) principles[p.kind] = p.text;
  const themes = new Map(themeRows.map((t) => [t.id, t]));

  let written = 0;
  for (const idea of ideas) {
    try {
      const draft = await generateDraft({
        idea: idea.idea,
        kind: idea.kind,
        theme: idea.themeId ? (themes.get(idea.themeId) ?? null) : null,
        needs: idea.needs,
        principles,
        goal: row.board.goal as Goal,
        siteUrl: row.board.siteUrl,
        profileId: row.profile.id,
      });
      await saveSources(idea.id, draft.sources);
      await db
        .update(cardTable)
        .set({ state: "draft", draftText: draft.text, updatedAt: new Date() })
        .where(eq(cardTable.id, idea.id));
      written += 1;
    } catch (cause) {
      // One failed draft does not fail the page. The user can approve by hand,
      // and an idea the search found nothing on stays an idea and says so when
      // they do.
      console.error("[cards] auto draft failed:", cause);
    }
  }

  return written;
}
