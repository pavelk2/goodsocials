import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { loadBoard, COLUMNS, COLUMN_LABEL } from "@/lib/board";
import { Column } from "@/components/board/column";
import { Card } from "@/components/board/card";
import { Principles } from "@/components/board/principles";

export const metadata = { title: "Board" };

const EMPTY_LINE: Record<string, string> = {
  idea: "Ideas land here first.",
  draft: "Approved ideas become drafts.",
  image: "Drafts that need a picture wait here.",
  scheduled: "Approved posts wait for their time.",
  posted: "Published posts stay here.",
};

export default async function BoardPage() {
  const session = await auth();
  if (!session?.memberId) redirect("/signin");

  const view = await loadBoard(session.memberId);
  // Signed in with no rows means the sign in callback failed to write them.
  // Sending them back through sign in is the only thing that fixes it.
  if (!view) redirect("/signin");
  if (view.needsOnboarding) redirect("/onboarding");

  return (
    <main className="px-6 py-10">
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
                body={card.draftText ?? card.idea}
                scheduledAt={card.scheduledAt}
              />
            ))}
          </Column>
        ))}
      </div>
    </main>
  );
}
