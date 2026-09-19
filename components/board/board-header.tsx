"use client";

import Link from "next/link";
import { useState } from "react";
import { PrinciplesPanel } from "@/components/board/principles";
import { Sheet } from "@/components/ui/sheet";

/**
 * One shape for both controls: 30px tall, so 8px radius, same padding, same
 * press feedback. They differ only in weight, because they open the same kind
 * of sheet but are not equally worth opening.
 */
const TOOL_BASE =
  "rounded-[8px] px-3 py-[6px] text-[13px] font-medium transition-[opacity,border-color,transform] duration-150 ease-[var(--ease)] active:scale-[0.98]";

/**
 * Solid ink, the house primary. Principles are what makes a correction stick
 * to every future card, so this is the one control on the header worth
 * pressing. Not accent: the board spends its one color on runway, per
 * DESIGN.md section 1.
 */
const PRIMARY = `${TOOL_BASE} bg-ink text-paper hover:opacity-85`;

/**
 * Surface on paper with a hairline, the same way a card separates from the
 * column ground. Paper on paper, which is what the house secondary button is,
 * is invisible here.
 */
const SECONDARY = `${TOOL_BASE} border border-hairline bg-surface text-ink hover:border-ink-3`;

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
}: {
  seat: string | null;
  runwayDays: number;
  principles: { voice: string; visual: string; format: string };
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
        </Sheet>
      ) : null}
    </div>
  );
}
