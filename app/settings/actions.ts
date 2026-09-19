"use server";

import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { auth } from "@/auth";
import { getDb } from "@/db";
import { board as boardTable } from "@/db/schema";
import { loadAccess, setActiveProfile, type Access } from "@/lib/profiles";

export type SaveResult = { ok: true } | { ok: false; error: string };

const GOALS = new Set(["interesting", "followers", "traffic"]);

/** Posts a week. One is the floor, daily is the ceiling LinkedIn rewards. */
const MIN_CADENCE = 1;
const MAX_CADENCE = 7;

async function access(): Promise<Access | null> {
  const session = await auth();
  if (!session?.memberId) return null;
  return loadAccess(session.memberId);
}

/**
 * Which profile the board and the rest of settings are about. The choice is a
 * cookie rather than a column, because it is a view of the account rather than
 * a fact about it, and two browsers signed in as the same agency can sit on two
 * different clients at once.
 */
export async function switchProfile(profileId: string): Promise<SaveResult> {
  const acc = await access();
  if (!acc) return { ok: false, error: "Sign in first." };
  if (!acc.seats.some((seat) => seat.profile.id === profileId)) {
    return { ok: false, error: "That profile is not on your account." };
  }

  await setActiveProfile(profileId);
  revalidatePath("/board");
  revalidatePath("/settings");
  return { ok: true };
}

export async function saveGoal(goal: string): Promise<SaveResult> {
  const acc = await access();
  if (!acc?.active) return { ok: false, error: "Sign in first." };
  if (!GOALS.has(goal)) return { ok: false, error: "Pick one of the three goals." };

  await getDb()
    .update(boardTable)
    .set({ goal: goal as "interesting" | "followers" | "traffic" })
    .where(eq(boardTable.profileId, acc.active.profile.id));

  revalidatePath("/board");
  revalidatePath("/settings");
  return { ok: true };
}

/**
 * Cadence changes the spacing of every slot claimed from now on. Posts already
 * in the queue keep the times they were given, because moving a scheduled post
 * is a decision the user did not make here.
 */
export async function saveCadence(value: string): Promise<SaveResult> {
  const cadence = Number(value);
  const acc = await access();
  if (!acc?.active) return { ok: false, error: "Sign in first." };
  if (
    !Number.isInteger(cadence) ||
    cadence < MIN_CADENCE ||
    cadence > MAX_CADENCE
  ) {
    return { ok: false, error: "Between 1 and 7 posts a week." };
  }

  await getDb()
    .update(boardTable)
    .set({ targetCadence: cadence })
    .where(eq(boardTable.profileId, acc.active.profile.id));

  revalidatePath("/board");
  revalidatePath("/settings");
  return { ok: true };
}
