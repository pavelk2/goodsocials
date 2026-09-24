"use server";

import { revalidatePath } from "next/cache";
import { and, desc, eq, isNotNull } from "drizzle-orm";
import { auth } from "@/auth";
import { getDb } from "@/db";
import {
  board as boardTable,
  brandPrinciple,
  card as cardTable,
  cardAction,
  profile as profileTable,
} from "@/db/schema";
import {
  proposeRules,
  rewriteVoice,
  suggestReaders,
  type ProposedRule,
  type ReaderOption,
  type VoiceSource,
} from "@/lib/agent/levels";
import { addOwnIdea } from "@/lib/cards";
import { appendLine } from "@/lib/funnel-steps";
import { readBrand } from "@/lib/funnel-context";
import { readPastPosts } from "@/lib/history-store";
import { readSuggestion, recordStep, saveSuggestion } from "@/lib/levels-store";
import { resolveActor, type Actor } from "@/lib/profiles";

/**
 * One action per step answer. The session is checked here, the step is only
 * answerable while it is the next one or an earlier one, and every answer
 * writes a `level_step` row, which is what the step gate reads.
 */

export type StepResult = { ok: true; message?: string } | { ok: false; error: string };

type Kind = "voice" | "visual" | "format" | "reader";

async function actor(): Promise<Actor | null> {
  const session = await auth();
  if (!session?.memberId) return null;
  return resolveActor(session.memberId);
}

/** The actor, if this step is theirs to answer now. */
async function stepActor(level: number): Promise<Actor | { error: string }> {
  const who = await actor();
  if (!who) return { error: "Sign in first." };
  const [row] = await getDb()
    .select({ level: profileTable.level })
    .from(profileTable)
    .where(eq(profileTable.id, who.profileId))
    .limit(1);
  if (!row) return { error: "No profile to set up." };
  if (level > row.level + 1) {
    return { error: `Level ${row.level + 1} comes first.` };
  }
  return who;
}

async function writePrinciple(profileId: string, kind: Kind, text: string): Promise<void> {
  await getDb()
    .insert(brandPrinciple)
    .values({ profileId, kind, text })
    .onConflictDoUpdate({
      target: [brandPrinciple.profileId, brandPrinciple.kind],
      set: { text, updatedAt: new Date() },
    });
}

function done(message?: string): StepResult {
  revalidatePath("/levels");
  revalidatePath("/board");
  return { ok: true, message };
}

/* Level 2: your voice */

/** How much writing each option needs before it says anything about a voice. */
const MIN_ARCHIVE_POSTS = 5;
const MIN_SAMPLES = 3;
const MIN_DESCRIPTION = 40;
/** A sample longer than this is a document, and the voice is in its first page. */
const SAMPLE_CHARS = 1500;
const MAX_SAMPLES = 15;

export async function voiceFromArchive(): Promise<StepResult> {
  const who = await stepActor(2);
  if ("error" in who) return { ok: false, error: who.error };

  const posts = await readPastPosts(who.profileId);
  if (posts.length < MIN_ARCHIVE_POSTS) {
    return {
      ok: false,
      error: `Import at least ${MIN_ARCHIVE_POSTS} posts first. ${posts.length} are here now.`,
    };
  }

  return applyVoice(
    who,
    "archive",
    posts.slice(0, MAX_SAMPLES).map((p) => p.text.slice(0, SAMPLE_CHARS)),
  );
}

export async function voiceFromText(
  source: string,
  text: string,
): Promise<StepResult> {
  const who = await stepActor(2);
  if ("error" in who) return { ok: false, error: who.error };
  if (source !== "own" && source !== "admired" && source !== "described") {
    return { ok: false, error: "Pick one of the options." };
  }

  const trimmed = (text ?? "").trim();
  if (source === "described") {
    if (trimmed.length < MIN_DESCRIPTION) {
      return { ok: false, error: "Say a little more about how you want to sound." };
    }
    return applyVoice(who, source, [trimmed.slice(0, SAMPLE_CHARS * 2)]);
  }

  // A blank line between pieces is the one separator everybody types without
  // being told twice.
  const samples = trimmed
    .split(/\n\s*\n/)
    .map((s) => s.trim())
    .filter((s) => s.length >= 40);
  if (samples.length < MIN_SAMPLES) {
    return {
      ok: false,
      error: `Paste at least ${MIN_SAMPLES} pieces with a blank line between each. ${samples.length} found.`,
    };
  }
  return applyVoice(
    who,
    source,
    samples.slice(0, MAX_SAMPLES).map((s) => s.slice(0, SAMPLE_CHARS)),
  );
}

async function applyVoice(
  who: Actor,
  source: VoiceSource,
  samples: string[],
): Promise<StepResult> {
  const { principles } = await readBrand(who.profileId);

  let result;
  try {
    result = await rewriteVoice({
      current: principles.voice,
      source,
      samples,
      profileId: who.profileId,
    });
  } catch (cause) {
    console.error("[levels] voice failed:", cause);
    return { ok: false, error: "The voice did not rewrite. Try again in a minute." };
  }

  await writePrinciple(who.profileId, "voice", result.voice.trim());
  await recordStep({
    profileId: who.profileId,
    level: 2,
    choice: source,
    detail: { samples: samples.length, note: result.note, before: principles.voice },
    memberId: who.memberId,
  });
  return done(result.note);
}

/* Level 3: your reader */

/**
 * The three readers to choose from. Written once and kept, so opening the
 * step twice does not pay for them twice.
 */
export async function readerOptions(): Promise<
  { ok: true; readers: ReaderOption[] } | { ok: false; error: string }
> {
  const who = await stepActor(3);
  if ("error" in who) return { ok: false, error: who.error };

  const cached = await readSuggestion<{ readers: ReaderOption[] }>(who.profileId, 3);
  if (cached?.readers?.length) return { ok: true, readers: cached.readers };

  const [{ principles, themes }, [board]] = await Promise.all([
    readBrand(who.profileId),
    getDb()
      .select({ siteUrl: boardTable.siteUrl })
      .from(boardTable)
      .where(eq(boardTable.profileId, who.profileId))
      .limit(1),
  ]);

  try {
    const readers = await suggestReaders({
      principles,
      themes,
      siteUrl: board?.siteUrl ?? null,
      profileId: who.profileId,
    });
    await saveSuggestion(who.profileId, 3, { readers });
    return { ok: true, readers };
  } catch (cause) {
    console.error("[levels] readers failed:", cause);
    return { ok: false, error: "No suggestions this time. Write your own below." };
  }
}

/**
 * The reader, and the themes confirmed with it. Themes are edited in place on
 * the same screen through the board's own action, so by the time this runs
 * they already say what the member wants; saving is the confirmation.
 */
export async function saveReader(choice: string, text: string): Promise<StepResult> {
  const who = await stepActor(3);
  if ("error" in who) return { ok: false, error: who.error };

  const reader = (text ?? "").trim();
  if (reader.length < 15) return { ok: false, error: "Say who they are in a sentence." };
  if (reader.length > 1000) return { ok: false, error: "Keep it under 1000 characters." };

  await writePrinciple(who.profileId, "reader", reader);
  await recordStep({
    profileId: who.profileId,
    level: 3,
    choice: choice === "own" ? "own" : "suggested_reader",
    text: reader,
    memberId: who.memberId,
  });
  return done("Every post from now on is written for this reader.");
}

/* Level 4: your proof */

export async function chooseProof(
  choice: string,
  text?: string,
): Promise<StepResult & { href?: string }> {
  const who = await stepActor(4);
  if ("error" in who) return { ok: false, error: who.error };

  if (choice === "number") {
    const number = (text ?? "").trim();
    if (number.length < 10) {
      return { ok: false, error: "Give the number and what it counts." };
    }
    const added = await addOwnIdea(
      who,
      `A receipt built on this number from the author: ${number}`,
      null,
      "receipt",
    );
    if (!added.ok) return added;
    await recordStep({
      profileId: who.profileId,
      level: 4,
      choice,
      text: number,
      memberId: who.memberId,
    });
    return done("It is on top of your Idea column as a receipt.");
  }

  if (choice !== "source" && choice !== "questions") {
    return { ok: false, error: "Pick one of the options." };
  }

  await recordStep({ profileId: who.profileId, level: 4, choice, memberId: who.memberId });
  revalidatePath("/levels");
  return { ok: true, href: choice === "source" ? "/integrations" : "/board" };
}

/* Level 5: corrections kept as rules */

/** How many recent revise comments the rules are read from. */
const COMMENTS_READ = 40;

export async function ruleOptions(): Promise<
  { ok: true; rules: ProposedRule[]; comments: number } | { ok: false; error: string }
> {
  const who = await stepActor(5);
  if ("error" in who) return { ok: false, error: who.error };

  const rows = await getDb()
    .select({ comment: cardAction.comment })
    .from(cardAction)
    .innerJoin(cardTable, eq(cardAction.cardId, cardTable.id))
    .innerJoin(boardTable, eq(cardTable.boardId, boardTable.id))
    .where(
      and(
        eq(boardTable.profileId, who.profileId),
        eq(cardAction.action, "revise"),
        isNotNull(cardAction.comment),
      ),
    )
    .orderBy(desc(cardAction.createdAt))
    .limit(COMMENTS_READ);
  const comments = rows.map((r) => r.comment as string);

  // Nothing repeats in one comment, and asking the model to find a pattern in
  // it is paying to be told so.
  if (comments.length < 2) return { ok: true, rules: [], comments: comments.length };

  const cached = await readSuggestion<{ rules: ProposedRule[]; comments: number }>(
    who.profileId,
    5,
  );
  if (cached && cached.comments === comments.length) {
    return { ok: true, rules: cached.rules, comments: comments.length };
  }

  const { principles } = await readBrand(who.profileId);
  try {
    const rules = await proposeRules({ comments, principles, profileId: who.profileId });
    await saveSuggestion(who.profileId, 5, { rules, comments: comments.length });
    return { ok: true, rules, comments: comments.length };
  } catch (cause) {
    console.error("[levels] rules failed:", cause);
    return { ok: false, error: "Your corrections could not be read this time. Try again in a minute." };
  }
}

const KINDS = new Set<Kind>(["voice", "visual", "format", "reader"]);

export async function keepRules(
  rules: { rule: string; kind: string }[],
): Promise<StepResult> {
  const who = await stepActor(5);
  if ("error" in who) return { ok: false, error: who.error };

  const kept = (Array.isArray(rules) ? rules : [])
    .map((r) => ({ rule: String(r?.rule ?? "").trim(), kind: r?.kind as Kind }))
    .filter((r) => r.rule.length >= 10 && r.rule.length <= 300 && KINDS.has(r.kind))
    .slice(0, 3);

  const { principles } = await readBrand(who.profileId);
  const next: Record<Kind, string> = {
    voice: principles.voice,
    visual: principles.visual,
    format: principles.format,
    reader: principles.reader ?? "",
  };
  for (const r of kept) {
    const line = /[.!?]$/.test(r.rule) ? r.rule : `${r.rule}.`;
    next[r.kind] = appendLine(next[r.kind], line);
  }

  await Promise.all(
    [...new Set(kept.map((r) => r.kind))].map((kind) =>
      writePrinciple(who.profileId, kind, next[kind]),
    ),
  );
  await recordStep({
    profileId: who.profileId,
    level: 5,
    choice: kept.length > 0 ? "kept" : "none",
    detail: { rules: kept },
    memberId: who.memberId,
  });
  return done(
    kept.length > 0
      ? `${kept.length === 1 ? "One rule is" : `${kept.length} rules are`} in your principles now.`
      : "Nothing to keep. Your drafts already need few corrections.",
  );
}
