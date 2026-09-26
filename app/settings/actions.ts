"use server";

import type { Goal } from "@/lib/agent/ideas";
import { revalidatePath } from "next/cache";
import { and, eq, isNotNull, notExists } from "drizzle-orm";
import { auth, signOut } from "@/auth";
import { deleteAccount } from "@/lib/account-data";
import { getDb } from "@/db";
import { board as boardTable, card as cardTable, cardAction } from "@/db/schema";
import { fetchSiteText, normalizeUrl } from "@/lib/agent/site";
import { writeBrand } from "@/lib/brand-intake";
import { planMoreIdeas } from "@/lib/cards";
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

const GOALS = new Set(["interesting", "followers", "traffic", "leads", "engagement"]);

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
  if (!GOALS.has(goal)) return { ok: false, error: "Pick one of the goals." };

  await getDb()
    .update(boardTable)
    .set({ goal: goal as Goal })
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
 * A different website for this profile, most often because the one typed at
 * onboarding was wrong. The themes and principles written from the old site
 * describe the wrong company, so they are rewritten from the new one, the same
 * way a second read in onboarding rewrites them.
 *
 * Ideas the agent wrote from the old themes and nobody has touched go with
 * them, and seven are planned from the new ones. Anything with an action on it,
 * any idea the member typed, and everything past the Idea column stays: that
 * is work somebody chose.
 *
 * The same address twice is refused rather than read again, so a double click
 * is not two model calls.
 */
export async function saveWebsite(input: string): Promise<SaveResult> {
  const session = await auth();
  if (!session?.memberId) return { ok: false, error: "Sign in first." };
  const acc = await loadAccess(session.memberId);
  if (!acc?.active) return { ok: false, error: "Sign in first." };
  const profile = acc.active.profile;

  const url = normalizeUrl(input);
  if (!url) return { ok: false, error: "That does not look like a website address." };

  const db = getDb();
  const [brd] = await db
    .select()
    .from(boardTable)
    .where(eq(boardTable.profileId, profile.id))
    .limit(1);
  if (!brd) return { ok: false, error: "No board for this profile." };
  if (brd.siteUrl === url) return { ok: false, error: "That is the website we have already." };

  const site = await fetchSiteText(url);
  if (!site.ok) return { ok: false, error: site.error };

  const written = await writeBrand({
    profileId: profile.id,
    personName: profile.name,
    site,
    url,
  });
  if (!written.ok) return written;

  // Agent ideas carry a title, typed ones do not.
  await db
    .delete(cardTable)
    .where(
      and(
        eq(cardTable.boardId, brd.id),
        eq(cardTable.state, "idea"),
        isNotNull(cardTable.title),
        notExists(
          db.select().from(cardAction).where(eq(cardAction.cardId, cardTable.id)),
        ),
      ),
    );

  // A failure here leaves the board with fewer ideas and the new themes in
  // place, which More ideas on the board fixes. Not worth failing the save.
  const ideas = await planMoreIdeas({
    memberId: session.memberId,
    accountId: acc.account.id,
    profileId: profile.id,
  });
  if (!ideas.ok) console.error("[settings] ideas after website change:", ideas.error);

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

/**
 * What has to be typed before the delete button does anything. Not exported:
 * a "use server" file exports async functions only, so the form in
 * components/settings/delete-account.tsx carries its own copy of the word.
 */
const DELETE_CONFIRMATION = "delete";

/**
 * Closes the account: cancels the subscription, deletes every board under it,
 * signs out. The typed word is checked here and not only in the form, because
 * a server action is a public endpoint and the form is a suggestion.
 *
 * Returns only on failure. Success ends in a redirect out of the app, since
 * there is no screen left to show.
 */
export async function deleteAccountAction(typed: string): Promise<SaveResult> {
  const session = await auth();
  if (!session?.memberId) return { ok: false, error: "Sign in first." };
  if (typed.trim().toLowerCase() !== DELETE_CONFIRMATION) {
    return { ok: false, error: `Type ${DELETE_CONFIRMATION} to confirm.` };
  }

  const acc = await loadAccess(session.memberId);
  if (!acc) return { ok: false, error: "There is no account to delete." };

  const result = await deleteAccount(acc.account);
  if (!result.ok) return result;

  await signOut({ redirectTo: "/" });
  return { ok: true };
}
