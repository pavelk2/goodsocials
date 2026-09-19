"use server";

import { revalidatePath } from "next/cache";
import { eq, and } from "drizzle-orm";
import { auth } from "@/auth";
import { getDb } from "@/db";
import { brandPrinciple } from "@/db/schema";
import {
  approveCard,
  moveCard,
  rejectCard,
  reviseCard,
  topUpDrafts,
  type CardResult,
} from "@/lib/cards";
import { resolveActor, type Actor } from "@/lib/profiles";
import { COLUMNS, type Column } from "@/lib/board";

const KINDS = new Set(["voice", "visual", "format"]);

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

/** Called once by the board when the Draft column is thin. See lib/cards.ts. */
export async function topUp(): Promise<{ written: number }> {
  const who = await actor();
  if (!who) return { written: 0 };

  const written = await topUpDrafts(who.profileId);
  if (written > 0) revalidatePath("/board");
  return { written };
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

  await getDb()
    .update(brandPrinciple)
    .set({ text: trimmed, updatedAt: new Date() })
    .where(
      and(
        eq(brandPrinciple.profileId, who.profileId),
        eq(brandPrinciple.kind, kind as "voice" | "visual" | "format"),
      ),
    );

  revalidatePath("/board");
  return { ok: true };
}
