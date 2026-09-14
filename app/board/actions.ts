"use server";

import { revalidatePath } from "next/cache";
import { eq, and } from "drizzle-orm";
import { auth } from "@/auth";
import { getDb } from "@/db";
import { profile as profileTable, brandPrinciple } from "@/db/schema";

const KINDS = new Set(["voice", "visual", "format"]);

/**
 * Editing is the exception path, the same way editing a card's text is. The
 * principle a user types by hand carries the same weight as one the revision
 * loop writes, so this is one update and nothing clever.
 */
export async function savePrinciple(
  kind: string,
  text: string,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const session = await auth();
  if (!session?.memberId) return { ok: false, error: "Sign in first." };
  if (!KINDS.has(kind)) return { ok: false, error: "Unknown principle." };

  const trimmed = text.trim();
  if (trimmed.length < 10) {
    return { ok: false, error: "Say a little more than that." };
  }
  if (trimmed.length > 2000) {
    return { ok: false, error: "Keep a principle under 2000 characters." };
  }

  const db = getDb();
  const [prof] = await db
    .select()
    .from(profileTable)
    .where(eq(profileTable.linkedinMemberId, session.memberId))
    .limit(1);
  if (!prof) return { ok: false, error: "No profile for this account." };

  await db
    .update(brandPrinciple)
    .set({ text: trimmed, updatedAt: new Date() })
    .where(
      and(
        eq(brandPrinciple.profileId, prof.id),
        eq(brandPrinciple.kind, kind as "voice" | "visual" | "format"),
      ),
    );

  revalidatePath("/board");
  return { ok: true };
}
