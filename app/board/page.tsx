import { redirect } from "next/navigation";
import { billingBlock } from "@/lib/billing";
import { resolveEntry, signInHref } from "@/lib/entry";
import { seatName } from "@/lib/profiles";
import { readQuota } from "@/lib/quota";
import { BoardColumns } from "@/components/board/board-columns";
import { BoardHeader } from "@/components/board/board-header";
import { QueueNotice } from "@/components/board/queue-notice";
import { TopUp } from "@/components/board/top-up";

export const metadata = { title: "Board" };

/** Below this the board is one click deep and the agent should be writing. */
const THIN_DRAFT_COLUMN = 2;

export default async function BoardPage() {
  const entry = await resolveEntry();

  // Every bounce carries what caused it, so sign in can say it in a sentence
  // instead of looking like a login screen a signed in member keeps landing on.
  if (entry.at === "signed-out") redirect(signInHref("signed-out"));
  if (entry.at === "no-account") redirect(signInHref("no-account"));
  if (entry.at === "no-board") redirect(signInHref("no-board"));
  if (entry.at === "no-seat") redirect("/settings");
  if (entry.at === "onboarding") redirect("/onboarding");

  const { access, seat, view } = entry;
  const quota = await readQuota(view.profile.id);
  const thin =
    view.cards.draft.length < THIN_DRAFT_COLUMN && view.cards.idea.length > 0;

  return (
    <main className="px-6 py-10">
      <TopUp needed={thin} />

      <BoardHeader
        seat={access.seats.length > 1 ? seatName(seat) : null}
        runwayDays={view.runwayDays}
        principles={view.principles}
        themes={view.themes}
      />

      <QueueNotice
        billing={billingBlock(access.account)}
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
