import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { loadBoard, COLUMNS, COLUMN_LABEL } from "@/lib/board";
import { readQuota } from "@/lib/quota";
import { Column } from "@/components/board/column";
import { Card } from "@/components/board/card";
import { Principles } from "@/components/board/principles";
import { TopUp } from "@/components/board/top-up";

export const metadata = { title: "Board" };

const EMPTY_LINE: Record<string, string> = {
  idea: "Ideas land here first.",
  draft: "Approved ideas become drafts.",
  image: "Drafts that need a picture wait here.",
  scheduled: "Approved posts wait for their time.",
  posted: "Published posts stay here.",
};

/** Below this the board is one click deep and the agent should be writing. */
const THIN_DRAFT_COLUMN = 2;

export default async function BoardPage() {
  const session = await auth();
  if (!session?.memberId) redirect("/signin");

  const view = await loadBoard(session.memberId);
  // Signed in with no rows means the sign in callback failed to write them.
  // Sending them back through sign in is the only thing that fixes it.
  if (!view) redirect("/signin");
  if (view.needsOnboarding) redirect("/onboarding");

  const quota = await readQuota(view.profile.id);
  const thin =
    view.cards.draft.length < THIN_DRAFT_COLUMN && view.cards.idea.length > 0;

  return (
    <main className="px-6 py-10">
      <TopUp needed={thin} />

      <header className="mb-8 flex items-baseline justify-between">
        <h1 className="text-[28px] font-semibold tracking-[-0.03em]">Board</h1>
        {/* The only colored thing on this screen, and it should be. */}
        <p className="text-[13px] text-ink-2">
          Runway{" "}
          <span className="num font-medium text-accent">
            {view.runwayDays} {view.runwayDays === 1 ? "day" : "days"}
          </span>
        </p>
      </header>

      <Principles principles={view.principles} />

      <div className="flex snap-x gap-4 overflow-x-auto pb-4">
        {COLUMNS.map((state) => (
          <Column
            key={state}
            name={COLUMN_LABEL[state]}
            count={view.cards[state].length}
            emptyLine={EMPTY_LINE[state]}
          >
            {view.cards[state].map((card) => (
              <Card
                key={card.id}
                id={card.id}
                state={state}
                body={card.draftText ?? card.idea}
                imageUrl={card.imageUrl}
                scheduledAt={card.scheduledAt}
              />
            ))}
          </Column>
        ))}
      </div>

      <p className="mt-6 text-[13px] text-ink-2">
        <span className="num">{quota.used}</span> of{" "}
        <span className="num">{quota.cap}</span> images this month.{" "}
        <Link href="/settings" className="underline">
          Settings
        </Link>
      </p>
    </main>
  );
}
