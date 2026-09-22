"use client";

import Link from "next/link";
import { useState } from "react";
import { PrinciplesPanel } from "@/components/board/principles";
import { ThemesPanel, type ThemeRow } from "@/components/board/themes";
import { Sheet } from "@/components/ui/sheet";

/**
 * One shape for both controls: 30px tall, so 8px radius, same padding, same
 * press. They differ only in weight, because they open the same kind of sheet
 * but are not equally worth opening. The motion lives on .btn-ink and
 * .btn-outline in globals.css, with the rest of the app's buttons.
 */
const SHAPE = "rounded-[8px] px-3 py-[6px] text-[13px] font-medium";

/**
 * Solid ink, the house primary. Principles are what makes a correction stick
 * to every future card, so this is the one control on the header worth
 * pressing. Not accent: the board spends its one color on runway, per
 * DESIGN.md section 1.
 */
const PRIMARY = `btn-ink ${SHAPE} bg-ink text-paper`;

/**
 * Surface on paper with a hairline, the same way a card separates from the
 * column ground. Paper on paper, which is what the house secondary button is,
 * is invisible here.
 */
const SECONDARY = `btn-outline ${SHAPE} border border-hairline bg-surface text-ink`;

/**
 * Title, runway, and the two controls that are not part of approving a card.
 * Both open a sheet over the board rather than replacing it, because a user
 * reads a principle or checks a cadence in the middle of approving a week of
 * posts and should come back to the same scroll position and the same board.
 */
export function BoardHeader({
  seat,
  runwayDays,
  view,
  principles,
  themes,
}: {
  seat: string | null;
  runwayDays: number;
  /** Which reading of the same cards is on screen. */
  view: "board" | "calendar";
  principles: { voice: string; visual: string; format: string };
  themes: ThemeRow[];
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="mb-8">
      {/* Wraps rather than overflows. The controls are four wide now that the
          board has two readings, which is more than a phone fits on one line,
          and a header that scrolls sideways takes the page with it. */}
      <header className="flex flex-wrap items-center justify-between gap-x-6 gap-y-3">
        <h1 className="text-[28px] font-semibold tracking-[-0.03em]">
          Board
          {/* An agency runs one of these per client. Whose board this is has
              to be on screen before anyone approves a week of somebody's posts. */}
          {seat ? (
            <span className="ml-3 align-baseline text-[15px] font-normal text-ink-2">
              {seat}
            </span>
          ) : null}
        </h1>

        <div className="flex flex-wrap items-center gap-3">
          {/* The only colored thing on this screen, and it should be. The
              calendar drops it: there the live edge of time is today's cell,
              the month line says which day the queue runs dry rather than how
              many are left, and one screen carries one saturated idea. */}
          {view === "board" ? (
            <p className="mr-1 text-[13px] text-ink-2">
              Runway{" "}
              <span className="num font-medium text-accent">
                {runwayDays} {runwayDays === 1 ? "day" : "days"}
              </span>
            </p>
          ) : null}

          <ViewSwitch view={view} />

          <button
            type="button"
            onClick={() => setOpen(true)}
            aria-haspopup="dialog"
            className={PRIMARY}
          >
            Brand principles
          </button>
          {/* A real link to a real page. From the board it is intercepted by
              app/board/@modal and opens as the same sheet. */}
          <Link href="/settings" className={SECONDARY}>
            Settings
          </Link>
        </div>
      </header>

      {open ? (
        <Sheet title="Brand principles" onClose={() => setOpen(false)}>
          <PrinciplesPanel principles={principles} />

          {/* One sheet, two halves, a rule between them. How the writing sounds
              is one question and what it is about is another, and a user
              correcting a card needs to see which of the two they are about to
              change. */}
          <div className="mt-8 border-t border-hairline pt-6">
            <h3 className="mb-5 text-[15px] font-medium">Themes</h3>
            <ThemesPanel themes={themes} />
          </div>
        </Sheet>
      ) : null}
    </div>
  );
}

/**
 * Two readings of one board, not two pages. A real link each, because the view
 * is in the url: a calendar somebody is looking at can be sent to the person
 * who has to approve the week.
 */
function ViewSwitch({ view }: { view: "board" | "calendar" }) {
  const shape =
    "rounded-[7px] px-[13px] py-[5px] text-[13px] font-medium transition-colors";

  return (
    <div className="flex rounded-[9px] border border-hairline bg-surface p-[2px]">
      <Link
        href="/board"
        aria-current={view === "board" ? "page" : undefined}
        className={`${shape} ${
          view === "board" ? "bg-ink text-paper" : "nav-link text-ink-2"
        }`}
      >
        Board
      </Link>
      <Link
        href="/board?view=calendar"
        aria-current={view === "calendar" ? "page" : undefined}
        className={`${shape} ${
          view === "calendar" ? "bg-ink text-paper" : "nav-link text-ink-2"
        }`}
      >
        Calendar
      </Link>
    </div>
  );
}
