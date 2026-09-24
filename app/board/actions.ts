"use server";

import { revalidatePath } from "next/cache";
import { and, eq, isNull } from "drizzle-orm";
import { auth } from "@/auth";
import { getDb } from "@/db";
import {
  board as boardTable,
  brandPrinciple,
  theme as themeTable,
} from "@/db/schema";
import {
  addOwnIdea,
  approveCard,
  moveCard,
  planMoreIdeas,
  rejectCard,
  reviseCard,
  scheduleCardOn,
  topUpDrafts,
  type CardResult,
} from "@/lib/cards";
import { isDayKey, isZone } from "@/lib/time";
import { resolveActor, type Actor } from "@/lib/profiles";
import { COLUMNS, type Column } from "@/lib/board";

const KINDS = new Set(["voice", "visual", "format", "reader"]);

/**
 * The three actions, and nothing else a card can do. Each one is a thin wrapper
 * around lib/cards.ts: the session is checked here, the work happens there, and
 * the board is revalidated once at the end so a card and the principle it just
 * rewrote refresh together.
 */

/** Session plus the account and the profile it is looking at. */
async function actor(): Promise<Actor | null> {
  const session = await auth();
  if (!session?.memberId) return null;
  return resolveActor(session.memberId);
}

export async function approve(cardId: string): Promise<CardResult> {
  const who = await actor();
  if (!who) return { ok: false, error: "Sign in first." };

  const result = await approveCard(who, cardId);
  if (result.ok) revalidatePath("/board");
  return result;
}

export async function revise(
  cardId: string,
  comment: string,
): Promise<CardResult> {
  const who = await actor();
  if (!who) return { ok: false, error: "Sign in first." };

  const result = await reviseCard(who, cardId, comment);
  if (result.ok) revalidatePath("/board");
  return result;
}

export async function reject(cardId: string): Promise<CardResult> {
  const who = await actor();
  if (!who) return { ok: false, error: "Sign in first." };

  const result = await rejectCard(who, cardId);
  if (result.ok) revalidatePath("/board");
  return result;
}

export async function move(
  cardId: string,
  target: string,
): Promise<CardResult> {
  const who = await actor();
  if (!who) return { ok: false, error: "Sign in first." };
  if (!COLUMNS.includes(target as Column)) {
    return { ok: false, error: "That column does not take cards." };
  }

  const result = await moveCard(who, cardId, target as Column);
  if (result.ok) revalidatePath("/board");
  return result;
}

/**
 * Puts a post on a day, which is the calendar's one write. The day is a
 * `YYYY-MM-DD` in the profile's own zone rather than an instant, because the
 * user dropped a card on a square on a grid and the hour is the product's to
 * decide. Everything about whether that day can take a post is checked in
 * lib/schedule.ts, on the server, where the queue lives.
 */
export async function scheduleOn(
  cardId: string,
  day: string,
): Promise<CardResult> {
  const who = await actor();
  if (!who) return { ok: false, error: "Sign in first." };
  if (!isDayKey(day)) return { ok: false, error: "That is not a day." };

  const result = await scheduleCardOn(who, cardId, day);
  if (result.ok) revalidatePath("/board");
  return result;
}

/**
 * The zone the browser reported, written once. Never an overwrite: the first
 * answer stands until somebody changes it in settings, so an agency operator
 * opening a client's board from an airport does not move that client's posting
 * hour to wherever they landed.
 */
export async function saveDetectedTimezone(
  zone: string,
): Promise<{ ok: boolean }> {
  const who = await actor();
  if (!who) return { ok: false };
  if (!isZone(zone)) return { ok: false };

  const written = await getDb()
    .update(boardTable)
    .set({ timezone: zone })
    .where(
      and(
        eq(boardTable.profileId, who.profileId),
        isNull(boardTable.timezone),
      ),
    )
    .returning({ id: boardTable.id });

  if (written.length > 0) {
    revalidatePath("/board");
    revalidatePath("/settings");
  }
  return { ok: true };
}

/** Called once by the board when the Draft column is thin. See lib/cards.ts. */
export async function topUp(): Promise<{ written: number }> {
  const who = await actor();
  if (!who) return { written: 0 };

  const written = await topUpDrafts(who.profileId);
  if (written > 0) revalidatePath("/board");
  return { written };
}

/** Seven more ideas, planned against everything already on the board. */
export async function moreIdeas(): Promise<CardResult> {
  const who = await actor();
  if (!who) return { ok: false, error: "Sign in first." };

  const result = await planMoreIdeas(who);
  if (result.ok) revalidatePath("/board");
  return result;
}

/** An idea the user typed, at the top of the Idea column. */
export async function addIdea(
  text: string,
  themeId: string | null,
): Promise<CardResult> {
  const who = await actor();
  if (!who) return { ok: false, error: "Sign in first." };

  const result = await addOwnIdea(who, text, themeId);
  if (result.ok) revalidatePath("/board");
  return result;
}

/**
 * Editing is the exception path, the same way editing a card's text is. The
 * principle a user types by hand carries the same weight as one the revision
 * loop writes, so this is one update and nothing clever.
 */
export async function savePrinciple(
  kind: string,
  text: string,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const who = await actor();
  if (!who) return { ok: false, error: "Sign in first." };
  if (!KINDS.has(kind)) return { ok: false, error: "Unknown principle." };

  const trimmed = text.trim();
  if (trimmed.length < 10) {
    return { ok: false, error: "Say a little more than that." };
  }
  if (trimmed.length > 2000) {
    return { ok: false, error: "Keep a principle under 2000 characters." };
  }

  // An upsert: the reader has no row until somebody names one.
  await getDb()
    .insert(brandPrinciple)
    .values({
      profileId: who.profileId,
      kind: kind as "voice" | "visual" | "format" | "reader",
      text: trimmed,
    })
    .onConflictDoUpdate({
      target: [brandPrinciple.profileId, brandPrinciple.kind],
      set: { text: trimmed, updatedAt: new Date() },
    });

  revalidatePath("/board");
  return { ok: true };
}

/**
 * A theme, edited by hand. Same shape as editing a principle and the same
 * reason: what the agent wrote from a homepage is a first draft of what this
 * person is known for, and the person is the one who knows.
 *
 * Scoped by profile in the where clause rather than checked first, so a theme
 * id belonging to somebody else's board updates nothing instead of updating
 * something.
 */
export async function saveTheme(
  id: string,
  title: string,
  description: string,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const who = await actor();
  if (!who) return { ok: false, error: "Sign in first." };

  const name = title.trim();
  const body = description.trim();
  if (name.length < 2) return { ok: false, error: "Give the theme a name." };
  if (name.length > 80) return { ok: false, error: "Keep a theme name short." };
  if (body.length < 10) return { ok: false, error: "Say a little more than that." };
  if (body.length > 2000) {
    return { ok: false, error: "Keep a theme under 2000 characters." };
  }

  const updated = await getDb()
    .update(themeTable)
    .set({ title: name, description: body })
    .where(and(eq(themeTable.id, id), eq(themeTable.profileId, who.profileId)))
    .returning({ id: themeTable.id });

  if (updated.length === 0) {
    return { ok: false, error: "That theme is not on your board." };
  }

  revalidatePath("/board");
  return { ok: true };
}
