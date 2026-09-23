"use server";

import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { auth } from "@/auth";
import { getDb } from "@/db";
import { board as boardTable } from "@/db/schema";
import { loadAccess, setActiveProfile, type Access } from "@/lib/profiles";
import { isZone } from "@/lib/time";
import {
  IMPORT_CHUNK,
  PAST_POST_MAX_TEXT,
  type PastPostInput,
} from "@/lib/history";
import {
  clearPastPosts,
  savePastPosts,
  trimPastPosts,
} from "@/lib/history-store";

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

/**
 * The zone every slot is 09:00 in. Changing it is a deliberate answer to a
 * question the browser guessed at, so unlike the detection on the board this
 * one overwrites.
 *
 * Posts already queued keep their instants, for the same reason changing
 * cadence leaves them alone: moving somebody's scheduled week is a decision
 * they did not make on this row. The calendar is where a post is moved.
 */
export async function saveTimezone(zone: string): Promise<SaveResult> {
  const acc = await access();
  if (!acc?.active) return { ok: false, error: "Sign in first." };
  if (!isZone(zone)) return { ok: false, error: "That is not a time zone." };

  await getDb()
    .update(boardTable)
    .set({ timezone: zone })
    .where(eq(boardTable.profileId, acc.active.profile.id));

  revalidatePath("/board");
  revalidatePath("/settings");
  return { ok: true };
}

/**
 * Posts this profile published before GoodSocials, read out of the member's
 * own LinkedIn archive. There is no API for it: retrieving a member's posts
 * needs r_member_social, which LinkedIn closed to new applications.
 *
 * The browser parses the file and sends it in chunks, so nothing here ever
 * sees a ten year archive and no request approaches the 1MB a server action
 * accepts. Everything that arrives is treated as untrusted: it came from a
 * file a user chose, and the shape of that file is LinkedIn's to change.
 */
export type ImportResult =
  | { ok: true; added: number }
  | { ok: false; error: string };

export async function importHistory(rows: PastPostInput[]): Promise<ImportResult> {
  const acc = await access();
  if (!acc?.active) return { ok: false, error: "Sign in first." };
  if (!Array.isArray(rows) || rows.length === 0) {
    return { ok: false, error: "That file held no posts." };
  }
  if (rows.length > IMPORT_CHUNK) {
    return { ok: false, error: "Too many posts in one request." };
  }

  const clean: PastPostInput[] = [];
  for (const row of rows) {
    const text = typeof row?.text === "string" ? row.text.trim() : "";
    const when = typeof row?.postedAt === "string" ? new Date(row.postedAt) : null;
    if (!text || !when || Number.isNaN(when.getTime())) continue;
    if (when.getTime() > Date.now() + 86_400_000) continue;

    const url = typeof row.url === "string" && row.url.startsWith("https://")
      ? row.url.slice(0, 500)
      : null;
    clean.push({
      postedAt: when.toISOString(),
      text: text.slice(0, PAST_POST_MAX_TEXT),
      url,
    });
  }

  if (clean.length === 0) return { ok: false, error: "None of those rows were posts." };

  const { added } = await savePastPosts(acc.active.profile.id, clean);
  await trimPastPosts(acc.active.profile.id);

  revalidatePath("/board");
  revalidatePath("/settings");
  return { ok: true, added };
}

/** Takes the imported history off the calendar. The archive file still has it. */
export async function clearHistory(): Promise<SaveResult> {
  const acc = await access();
  if (!acc?.active) return { ok: false, error: "Sign in first." };

  await clearPastPosts(acc.active.profile.id);
  revalidatePath("/board");
  revalidatePath("/settings");
  return { ok: true };
}
