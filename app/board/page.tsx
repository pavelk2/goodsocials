import { redirect } from "next/navigation";
import { billingBlock } from "@/lib/billing";
import { resolveEntry, signInHref } from "@/lib/entry";
import { seatName } from "@/lib/profiles";
import { readQuota } from "@/lib/quota";
import { boardZone } from "@/lib/schedule";
import { buildMonth } from "@/lib/calendar";
import { readPastPosts } from "@/lib/history-store";
import { sourceStates } from "@/lib/integrations/sources";
import { BoardCalendar } from "@/components/board/board-calendar";
import { BoardColumns } from "@/components/board/board-columns";
import { BoardHeader } from "@/components/board/board-header";
import { QueueNotice } from "@/components/board/queue-notice";
import { TimezoneProbe } from "@/components/board/timezone-probe";
import { TopUp } from "@/components/board/top-up";

export const metadata = { title: "Board" };

/** Below this the board is one click deep and the agent should be writing. */
const THIN_DRAFT_COLUMN = 2;

export default async function BoardPage({
  searchParams,
}: {
  searchParams: Promise<{ view?: string; m?: string }>;
}) {
  const entry = await resolveEntry();

  // Every bounce carries what caused it, so sign in can say it in a sentence
  // instead of looking like a login screen a signed in member keeps landing on.
  if (entry.at === "signed-out") redirect(signInHref("signed-out"));
  if (entry.at === "no-account") redirect(signInHref("no-account"));
  if (entry.at === "no-board") redirect(signInHref("no-board"));
  if (entry.at === "no-seat") redirect("/settings");
  if (entry.at === "onboarding") redirect("/onboarding");

  const { access, seat, view } = entry;
  const params = await searchParams;
  // Two readings of the same cards, chosen in the url so a calendar is a link.
  const mode = params.view === "calendar" ? "calendar" : "board";
  const zone = boardZone(view.board.timezone);

  const [quota, sources] = await Promise.all([
    readQuota(view.profile.id),
    sourceStates(view.profile.id),
  ]);
  // Only the calendar draws these, and the columns are the common view.
  const history = mode === "calendar" ? await readPastPosts(view.profile.id) : [];
  const thin =
    view.cards.draft.length < THIN_DRAFT_COLUMN && view.cards.idea.length > 0;

  return (
    <main className="px-6 py-10">
      <TopUp needed={thin} />
      <TimezoneProbe known={Boolean(view.board.timezone)} />

      <BoardHeader
        seat={access.seats.length > 1 ? seatName(seat) : null}
        runwayDays={view.runwayDays}
        view={mode}
        principles={view.principles}
        themes={view.themes}
        sources={sources}
      />

      <QueueNotice
        billing={billingBlock(access.account)}
        connection={view.connection}
        queueError={view.queueError}
        ownProfile={
          view.profile.linkedinMemberId === access.account.ownerMemberId
        }
      />

      {mode === "calendar" ? (
        <BoardCalendar
          month={buildMonth({
            cards: view.cards,
            themes: view.themes,
            history,
            zone,
            month: params.m,
          })}
          rail={view.cards.image}
          themes={view.themes}
          timeZone={zone}
        />
      ) : (
        <BoardColumns
          cards={view.cards}
          themes={view.themes}
          timeZone={zone}
        />
      )}

      <p className="mt-6 text-[13px] text-ink-2">
        <span className="num">{quota.used}</span> of{" "}
        <span className="num">{quota.cap}</span> images this month.
      </p>
    </main>
  );
}
