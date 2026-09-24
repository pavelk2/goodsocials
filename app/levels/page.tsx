import Link from "next/link";
import { redirect } from "next/navigation";
import { and, count, eq, inArray, isNotNull } from "drizzle-orm";
import { auth } from "@/auth";
import { getDb } from "@/db";
import { card as cardTable, cardAction, source } from "@/db/schema";
import { resolveEntry, signInHref } from "@/lib/entry";
import { summarisePastPosts } from "@/lib/history-store";
import { CATALOG } from "@/lib/integrations/catalog";
import { gatesFor, levelDef, MAX_LEVEL } from "@/lib/levels";
import { syncLevel } from "@/lib/levels-store";
import { PAST_POST_LIMIT } from "@/db/schema";
import { Gates, KnownList, Ladder, type KnownRow } from "@/components/levels/ladder";
import {
  NextLater,
  ProofStep,
  ReaderStep,
  RulesStep,
  StepDone,
  VoiceStep,
} from "@/components/levels/steps";

export const metadata = { title: "Levels" };

// Rewriting a voice or reading a month of corrections runs with thinking on.
export const maxDuration = 300;

const GOAL_LABEL: Record<string, string> = {
  interesting: "Posts people find worth reading",
  followers: "More followers",
  traffic: "Visits to your website",
  leads: "Leads",
  engagement: "Comments and reactions",
};

/**
 * Where this profile is on the ladder, what the agent knows and is still
 * guessing, the one step that moves it, and what else stands in the way.
 * The same answer the board header gives in one line, at full length.
 */
export default async function LevelsPage() {
  const entry = await resolveEntry();
  if (entry.at === "signed-out") redirect(signInHref("signed-out"));
  if (entry.at === "no-account") redirect(signInHref("no-account"));
  if (entry.at === "no-board") redirect(signInHref("no-board"));
  if (entry.at === "no-seat") redirect("/settings");
  if (entry.at === "onboarding") redirect("/onboarding");

  const { view } = entry;
  const session = await auth();
  const profileId = view.profile.id;

  const state = await syncLevel(profileId, session?.memberId);
  if (!state) redirect("/board");
  const { level, evidence, startedAt } = state;

  const db = getDb();
  const [history, sources, needs, revises] = await Promise.all([
    summarisePastPosts(profileId),
    db
      .select({ kind: source.kind })
      .from(source)
      .where(and(eq(source.profileId, profileId), eq(source.status, "active"))),
    db
      .select({ n: count() })
      .from(cardTable)
      .where(
        and(
          eq(cardTable.boardId, view.board.id),
          inArray(cardTable.state, ["idea", "draft", "image"]),
          isNotNull(cardTable.needs),
        ),
      ),
    db
      .select({ n: count() })
      .from(cardAction)
      .innerJoin(cardTable, eq(cardAction.cardId, cardTable.id))
      .where(and(eq(cardTable.boardId, view.board.id), eq(cardAction.action, "revise"))),
  ]);
  const openNeeds = needs[0]?.n ?? 0;
  const sourceNames = sources.map((s) => CATALOG[s.kind].name);

  const here = levelDef(level);
  const next = level < MAX_LEVEL ? levelDef(level + 1) : null;

  const rows: KnownRow[] = [
    {
      label: "Website and goal",
      detail: [view.board.siteUrl ?? "Your own description", GOAL_LABEL[view.board.goal]]
        .filter(Boolean)
        .join(". "),
      known: true,
    },
    evidence.steps.has(2)
      ? { label: "Voice", detail: "Rewritten from writing you gave us", known: true }
      : { label: "Voice", detail: "Read off your homepage, not your own writing", known: false },
    view.principles.reader
      ? { label: "Reader", detail: clip(view.principles.reader), known: true }
      : { label: "Reader", detail: "Nobody named yet, so posts are written for everyone", known: false },
    evidence.steps.has(3)
      ? { label: "Themes", detail: `${view.themes.map((t) => t.title).join(", ")}. Chosen by you`, known: true }
      : {
          label: "Themes",
          detail: `${view.themes.map((t) => t.title).join(", ") || "None"}. Guessed from your homepage`,
          known: false,
        },
    sourceNames.length > 0
      ? { label: "Your numbers", detail: `Read daily from ${sourceNames.join(", ")}`, known: true }
      : {
          label: "Your numbers",
          detail:
            openNeeds > 0
              ? `${openNeeds} ${openNeeds === 1 ? "card is" : "cards are"} waiting on a figure only you have`
              : "No source connected, so receipts wait on you",
          known: false,
        },
    evidence.steps.has(5)
      ? { label: "Your corrections", detail: "Kept as standing rules", known: true }
      : {
          label: "Your corrections",
          detail: `${revises[0]?.n ?? 0} so far, not yet turned into rules`,
          known: false,
        },
    {
      label: "What your readers respond to",
      detail: "Nothing measured yet. Level 6 asks for it",
      known: false,
    },
  ];

  return (
    <main className="mx-auto max-w-[960px] px-4 py-10 sm:px-6">
      <Link href="/board" className="text-[13px] text-ink-2 underline">
        Board
      </Link>

      <h1 className="mt-4 text-[34px] font-semibold tracking-[-0.03em]">
        Level <span className="num">{level}</span>{" "}
        <span className="text-ink-3">of {MAX_LEVEL}</span>
      </h1>
      <p className="mt-1 text-ink-2">
        {here.name}. {here.meaning}
      </p>

      <div className="mt-7">
        <Ladder level={level} />
      </div>

      <div className="mt-5 grid gap-5 md:grid-cols-[1fr_1.35fr]">
        <KnownList rows={rows} />

        <section className="rounded-[20px] border border-hairline bg-surface px-5 py-5">
          {!next ? (
            <StepDone text="The top of the ladder. Keep posting." />
          ) : !next.open ? (
            <NextLater level={next.level} name={next.name} next={next.next} />
          ) : evidence.steps.has(next.level) ? (
            <StepDone text="Step done. What is left is below, and it moves as you post." />
          ) : next.level === 2 ? (
            <VoiceStep archived={history.count} archiveLimit={PAST_POST_LIMIT} />
          ) : next.level === 3 ? (
            <ReaderStep themes={view.themes.map((t) => ({ id: t.id, title: t.title, description: t.description }))} />
          ) : next.level === 4 ? (
            <ProofStep sources={sourceNames} openNeeds={openNeeds} />
          ) : next.level === 5 ? (
            <RulesStep />
          ) : null}
        </section>
      </div>

      {next?.open ? (
        <div className="mt-5">
          <Gates
            title={`To reach level ${next.level}, ${next.name}`}
            gates={gatesFor(next.level, evidence, startedAt)}
          />
        </div>
      ) : null}
    </main>
  );
}

function clip(text: string, max = 140): string {
  return text.length > max ? `${text.slice(0, max - 1).trimEnd()}…` : text;
}
