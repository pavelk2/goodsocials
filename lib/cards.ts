import { and, asc, eq } from "drizzle-orm";
import { getDb } from "@/db";
import {
  board as boardTable,
  brandPrinciple,
  card as cardTable,
  cardAction,
  profile as profileTable,
  scheduledPost,
  theme as themeTable,
} from "@/db/schema";
import type { Actor } from "@/lib/profiles";
import { generateDraft } from "@/lib/agent/drafts";
import { generateImage } from "@/lib/agent/images";
import { reviseCardBody } from "@/lib/agent/revise";
import { generateIdeas, type Goal } from "@/lib/agent/ideas";
import { fetchSiteText } from "@/lib/agent/site";
import { parseFunnel } from "@/lib/funnel-steps";
import { boardZone, checkDay, nextSlot } from "@/lib/schedule";
import { formatDayAndTime, publishSlot, type DayKey } from "@/lib/time";
import { readFacts, type FactRow } from "@/lib/integrations/facts";

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
  /**
   * What the connected sources last read. Loaded with the card rather than at
   * each call site, so a draft, a revision and an auto draft all write from the
   * same numbers and no path quietly forgets them.
   */
  facts: FactRow[];
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

  const [principleRows, facts] = await Promise.all([
    db
      .select()
      .from(brandPrinciple)
      .where(eq(brandPrinciple.profileId, row.profile.id)),
    readFacts(row.profile.id),
  ]);

  const principles = { voice: "", visual: "", format: "" };
  for (const p of principleRows) principles[p.kind] = p.text;

  return { ...row, principles, facts };
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

  const { card, board, profile, principles, theme, facts } = loaded;
  const db = getDb();

  if (card.state === "idea") {
    let text: string;
    try {
      text = await generateDraft({
        idea: card.idea,
        kind: card.kind,
        theme,
        needs: card.needs,
        principles,
        goal: board.goal as Goal,
        siteUrl: board.siteUrl,
        facts,
        profileId: profile.id,
      });
    } catch (cause) {
      console.error("[cards] draft failed:", cause);
      return { ok: false, error: "The draft did not write. Try approving again." };
    }

    await db
      .update(cardTable)
      .set({ state: "draft", draftText: text, updatedAt: new Date() })
      .where(eq(cardTable.id, card.id));
    await log(card.id, "approve", actor.memberId);
    return { ok: true };
  }

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
      const slot = await schedule(
        card.id,
        profile.id,
        board.targetCadence,
        boardZone(board.timezone),
      );
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
    const slot = await schedule(
      card.id,
      profile.id,
      board.targetCadence,
      boardZone(board.timezone),
    );
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
  zone: string,
): Promise<string> {
  const publishAt = await nextSlot({ profileId, targetCadence, zone });
  return place(cardId, profileId, publishAt, zone);
}

/**
 * Writes one publish intent and moves the card to Scheduled. Every route into
 * the queue goes through here: the Approve button, a drag across the board, and
 * a drop onto a day in the calendar all have to leave the same two rows behind.
 *
 * Attempts and the last error are cleared, because a row arriving here is a
 * fresh intent. A post that burned its five attempts and was then moved to
 * another day is being asked again, not resumed.
 */
async function place(
  cardId: string,
  profileId: string,
  publishAt: Date,
  zone: string,
): Promise<string> {
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

  return formatDayAndTime(publishAt, zone);
}

/**
 * Puts a card on a day the user picked, which is the one thing the board's five
 * columns cannot express. Dropping a card from Ready to schedule onto a day is
 * the same decision as approving it, so it runs the same write and writes the
 * same log row. Dropping a card that is already scheduled onto another day is a
 * move, and a move is none of approve, revise or reject, so it logs nothing.
 *
 * Only those two states. An idea or a draft dropped on a day would have to
 * write a post and buy a picture inside a drag, which is a surprise that costs
 * money, so the calendar refuses and says which column to use.
 */
export async function scheduleCardOn(
  actor: Actor,
  cardId: string,
  day: DayKey,
): Promise<CardResult> {
  const loaded = await load(actor, cardId);
  if (!loaded) return { ok: false, error: "That card is not on your board." };

  const { card, board, profile } = loaded;

  if (card.state === "posted") {
    return { ok: false, error: "That one is already published." };
  }
  if (card.state !== "image" && card.state !== "scheduled") {
    return {
      ok: false,
      error: "Only a post with a picture can take a day. Approve it first.",
    };
  }

  const zone = boardZone(board.timezone);
  const check = await checkDay({
    profileId: profile.id,
    cardId: card.id,
    day,
    zone,
  });
  if (!check.ok) return { ok: false, error: check.error };

  const wasWaiting = card.state === "image";
  const slot = await place(card.id, profile.id, publishSlot(day, zone), zone);
  if (wasWaiting) await log(card.id, "approve", actor.memberId);

  return { ok: true, message: `Publishing ${slot}.` };
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

  const { card, board, profile, principles, facts } = loaded;
  if (card.state === "scheduled" || card.state === "posted") {
    return { ok: false, error: "That card has left the queue." };
  }

  const bodyKind = card.draftText ? "post" : "idea";
  let revision;
  try {
    revision = await reviseCardBody({
      bodyKind,
      body: card.draftText ?? card.idea,
      comment: trimmed,
      needs: card.needs,
      principles,
      goal: board.goal as Goal,
      facts,
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

  const [principleRows, themeRows, facts] = await Promise.all([
    db
      .select()
      .from(brandPrinciple)
      .where(eq(brandPrinciple.profileId, row.profile.id)),
    db
      .select()
      .from(themeTable)
      .where(eq(themeTable.profileId, row.profile.id)),
    readFacts(row.profile.id),
  ]);
  const principles = { voice: "", visual: "", format: "" };
  for (const p of principleRows) principles[p.kind] = p.text;
  const themes = new Map(themeRows.map((t) => [t.id, t]));

  let written = 0;
  for (const idea of ideas) {
    try {
      const text = await generateDraft({
        idea: idea.idea,
        kind: idea.kind,
        theme: idea.themeId ? (themes.get(idea.themeId) ?? null) : null,
        needs: idea.needs,
        principles,
        goal: row.board.goal as Goal,
        siteUrl: row.board.siteUrl,
        facts,
        profileId: row.profile.id,
      });
      await db
        .update(cardTable)
        .set({ state: "draft", draftText: text, updatedAt: new Date() })
        .where(eq(cardTable.id, idea.id));
      written += 1;
    } catch (cause) {
      // One failed draft does not fail the page. The user can approve by hand.
      console.error("[cards] auto draft failed:", cause);
    }
  }

  return written;
}

/**
 * Ideas on demand. The first seven were written from the homepage at
 * onboarding; this is where the next seven come from once those are used up.
 * Everything the board already holds or turned down goes to the planner as a
 * list not to repeat, so a second plan is new ground rather than the first
 * one reworded.
 *
 * Capped by what is waiting in the Idea column, not by a counter: a user with
 * a column full of unread ideas does not need more, and a double click cannot
 * spend twice past it.
 */
export const OPEN_IDEA_LIMIT = 21;
const AVOID_LIMIT = 40;

export async function planMoreIdeas(actor: Actor): Promise<CardResult> {
  const db = getDb();

  const [row] = await db
    .select({ board: boardTable })
    .from(boardTable)
    .innerJoin(profileTable, eq(boardTable.profileId, profileTable.id))
    .where(
      and(
        eq(profileTable.id, actor.profileId),
        eq(profileTable.accountId, actor.accountId),
      ),
    )
    .limit(1);
  if (!row) return { ok: false, error: "No board for this profile." };

  const cards = await db
    .select({
      idea: cardTable.idea,
      state: cardTable.state,
      position: cardTable.position,
      createdAt: cardTable.createdAt,
    })
    .from(cardTable)
    .where(eq(cardTable.boardId, row.board.id));

  const open = cards.filter((c) => c.state === "idea").length;
  if (open >= OPEN_IDEA_LIMIT) {
    return {
      ok: false,
      error: `You have ${open} ideas waiting. Write or reject some of them first.`,
    };
  }

  const [principleRows, themeRows, facts] = await Promise.all([
    db
      .select()
      .from(brandPrinciple)
      .where(eq(brandPrinciple.profileId, actor.profileId)),
    db
      .select()
      .from(themeTable)
      .where(eq(themeTable.profileId, actor.profileId)),
    readFacts(actor.profileId),
  ]);
  if (themeRows.length === 0) {
    return { ok: false, error: "Add a theme in Brand principles first." };
  }
  const principles = { voice: "", visual: "", format: "" };
  for (const p of principleRows) principles[p.kind] = p.text;

  // The homepage again, because it may have changed since onboarding. A site
  // that does not answer today falls back to the two sentences written in its
  // place, and then to nothing: the principles and themes were written from
  // it and carry most of what it said.
  let siteText = "";
  if (row.board.siteUrl) {
    const site = await fetchSiteText(row.board.siteUrl);
    if (site.ok) siteText = site.text;
  }
  if (!siteText) {
    siteText = parseFunnel(row.board.funnel)?.site?.description ?? "";
  }

  const avoid = [...cards]
    .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
    .slice(0, AVOID_LIMIT)
    .map((c) => c.idea);

  let ideas;
  try {
    ideas = await generateIdeas({
      principles,
      themes: themeRows,
      goal: row.board.goal as Goal,
      siteUrl: row.board.siteUrl ?? "",
      siteText,
      facts,
      avoid,
      profileId: actor.profileId,
    });
  } catch (cause) {
    console.error("[cards] more ideas failed:", cause);
    return { ok: false, error: "The ideas did not come back. Try again in a minute." };
  }

  // Below everything already waiting, so what the user queued first is still
  // what gets drafted first.
  const last = Math.max(0, ...cards.map((c) => c.position));
  const byTitle = new Map(themeRows.map((t) => [t.title.trim().toLowerCase(), t.id]));
  await db.insert(cardTable).values(
    ideas.map((idea, i) => ({
      boardId: row.board.id,
      idea: idea.idea,
      kind: idea.kind,
      themeId: byTitle.get(idea.theme.trim().toLowerCase()) ?? null,
      needs: idea.needs,
      position: last + 1 + i,
    })),
  );

  return { ok: true, message: `${ideas.length} new ideas.` };
}

export const OWN_IDEA_MAX = 1000;

/**
 * An idea the user wrote. It goes to the top of the column, because somebody
 * who typed it out wants it next, and it is a finding with no theme until the
 * draft says otherwise: the shape of a post you thought of yourself is yours
 * to tell us in a revise comment, not ours to guess.
 */
export async function addOwnIdea(
  actor: Actor,
  text: string,
  themeId: string | null,
): Promise<CardResult> {
  const idea = text.trim();
  if (idea.length < 10) return { ok: false, error: "Say a little more than that." };
  if (idea.length > OWN_IDEA_MAX) {
    return { ok: false, error: `Keep an idea under ${OWN_IDEA_MAX} characters.` };
  }

  const db = getDb();
  const [row] = await db
    .select({ boardId: boardTable.id })
    .from(boardTable)
    .innerJoin(profileTable, eq(boardTable.profileId, profileTable.id))
    .where(
      and(
        eq(profileTable.id, actor.profileId),
        eq(profileTable.accountId, actor.accountId),
      ),
    )
    .limit(1);
  if (!row) return { ok: false, error: "No board for this profile." };

  // Scoped by profile, so a theme id from somebody else's board is dropped
  // rather than attached.
  let theme: string | null = null;
  if (themeId) {
    const [found] = await db
      .select({ id: themeTable.id })
      .from(themeTable)
      .where(and(eq(themeTable.id, themeId), eq(themeTable.profileId, actor.profileId)))
      .limit(1);
    theme = found?.id ?? null;
  }

  const [top] = await db
    .select({ position: cardTable.position })
    .from(cardTable)
    .where(and(eq(cardTable.boardId, row.boardId), eq(cardTable.state, "idea")))
    .orderBy(asc(cardTable.position))
    .limit(1);

  await db.insert(cardTable).values({
    boardId: row.boardId,
    idea,
    kind: "finding",
    themeId: theme,
    position: (top?.position ?? 1) - 1,
  });

  return { ok: true };
}
