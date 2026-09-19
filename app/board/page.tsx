import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { loadBoard } from "@/lib/board";
import { loadAccess, seatName } from "@/lib/profiles";
import { readQuota } from "@/lib/quota";
import { BoardColumns } from "@/components/board/board-columns";
import { BoardHeader } from "@/components/board/board-header";
import { QueueNotice } from "@/components/board/queue-notice";
import { TopUp } from "@/components/board/top-up";

export const metadata = { title: "Board" };

/** Below this the board is one click deep and the agent should be writing. */
const THIN_DRAFT_COLUMN = 2;

export default async function BoardPage() {
  const session = await auth();
  if (!session?.memberId) redirect("/signin");

  const access = await loadAccess(session.memberId);
  // Signed in with no account means the sign in callback failed to write it.
  // Sending them back through sign in is the only thing that fixes it.
  if (!access) redirect("/signin");
  if (!access.active) redirect("/settings");

  const view = await loadBoard(access.active.profile.id);
  if (!view) redirect("/signin");
  if (view.needsOnboarding) redirect("/onboarding");

  const quota = await readQuota(view.profile.id);
  const thin =
    view.cards.draft.length < THIN_DRAFT_COLUMN && view.cards.idea.length > 0;

  return (
    <main className="px-6 py-10">
      <TopUp needed={thin} />

      <BoardHeader
        seat={access.seats.length > 1 ? seatName(access.active) : null}
        runwayDays={view.runwayDays}
        principles={view.principles}
        themes={view.themes}
      />

      <QueueNotice
        connection={view.connection}
        queueError={view.queueError}
        ownProfile={
          view.profile.linkedinMemberId === access.account.ownerMemberId
        }
      />

      <BoardColumns cards={view.cards} themes={view.themes} />

      <p className="mt-6 text-[13px] text-ink-2">
        <span className="num">{quota.used}</span> of{" "}
        <span className="num">{quota.cap}</span> images this month.
      </p>
    </main>
  );
}
