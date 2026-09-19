import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { loadBoard } from "@/lib/board";
import { readQuota } from "@/lib/quota";
import { BoardColumns } from "@/components/board/board-columns";
import { Principles } from "@/components/board/principles";
import { QueueNotice } from "@/components/board/queue-notice";
import { TopUp } from "@/components/board/top-up";

export const metadata = { title: "Board" };

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

      <QueueNotice connection={view.connection} queueError={view.queueError} />

      <Principles principles={view.principles} />

      <BoardColumns cards={view.cards} />

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
