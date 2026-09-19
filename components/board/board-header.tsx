"use client";

import Link from "next/link";
import { useState } from "react";
import { PrinciplesPanel } from "@/components/board/principles";

/**
 * Surface on paper with a hairline, the same way a card separates from the
 * column ground. Paper on paper, which is what the house secondary button is,
 * is invisible here. 8px because these are 30px tall, and radius encodes size.
 */
const TOOL =
  "rounded-[8px] border border-hairline bg-surface px-3 py-[6px] text-[13px] font-medium text-ink";

/**
 * Title, runway, and the two controls that are not part of approving a card.
 * The principles panel opens under the button that opens it, so the correction
 * a user is about to write and the button they pressed are in one glance.
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
            id="brand-principles-button"
            onClick={() => setOpen((shown) => !shown)}
            aria-expanded={open}
            aria-controls="brand-principles"
            className={TOOL}
          >
            Brand principles
          </button>
          <Link href="/settings" className={TOOL}>
            Settings
          </Link>
        </div>
      </header>

      {open ? <PrinciplesPanel principles={principles} /> : null}
    </div>
  );
}
