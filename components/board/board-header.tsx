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
  principles,
  themes,
}: {
  seat: string | null;
  runwayDays: number;
  principles: { voice: string; visual: string; format: string };
  themes: ThemeRow[];
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="mb-8">
      <header className="flex items-center justify-between gap-6">
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

        <div className="flex items-center gap-3">
          {/* The only colored thing on this screen, and it should be. */}
          <p className="mr-1 text-[13px] text-ink-2">
            Runway{" "}
            <span className="num font-medium text-accent">
              {runwayDays} {runwayDays === 1 ? "day" : "days"}
            </span>
          </p>
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
