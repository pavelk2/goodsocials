"use client";

import { useState, useTransition } from "react";
import { approve, reject, revise } from "@/app/board/actions";
import type { Column } from "@/lib/board";
import { Working } from "@/components/ui/working";

/**
 * Three actions and no fourth. The approve button is labelled with what happens
 * next rather than with the word Approve, because the writing rules say a
 * button names its outcome, and because approving an idea and approving a
 * finished post do very different things to somebody's month. The row written
 * to card_action still says "approve".
 *
 * Rendered twice per card: once in the card footer on the board, once at the
 * bottom of the card dialog. The card footer is compact: the approve button
 * alone, filled, because it is the one decision a column asks for and three
 * underlined links of one weight on every card made fifty links a screen.
 * Revise and Reject are in the dialog, one click away, which is where the
 * text they are about can be read in full. Each copy keeps its own pending state, which is
 * correct, because the server revalidates the board and both redraw from the
 * same row afterwards.
 */
const APPROVE_LABEL: Partial<Record<Column, string>> = {
  idea: "Write the draft",
  draft: "Make the image",
  image: "Schedule it",
};

/** What the agent is doing while the button waits, in the words of the outcome. */
const WORKING_LABEL: Partial<Record<Column, string>> = {
  idea: "Writing the draft",
  draft: "Making the image",
  image: "Scheduling",
};

type ActionResult = { ok: boolean; message?: string; error?: string };

export function CardActions({
  id,
  state,
  compact,
  onAdvance,
}: {
  id: string;
  state: Column;
  /** Approve only. The card on the board; the dialog carries all three. */
  compact?: boolean;
  /**
   * Called after an approve or a reject, the two that take the card out of the
   * column it is in. The dialog closes on them rather than sitting open over a
   * card that has moved. A revise leaves the card where it is, so the dialog
   * stays and redraws with the new text.
   */
  onAdvance?: () => void;
}) {
  const [commenting, setCommenting] = useState(false);
  const [comment, setComment] = useState("");
  const [confirmingReject, setConfirmingReject] = useState(false);
  const [note, setNote] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const [doing, setDoing] = useState<string>("Working");

  const approveLabel = APPROVE_LABEL[state];
  // Scheduled and posted cards have no next step to press from the board.
  if (compact && !approveLabel) return null;

  function run(
    work: () => Promise<ActionResult>,
    advances: boolean,
    label: string,
  ) {
    setDoing(label);
    setError(null);
    setNote(null);
    startTransition(async () => {
      const result = await work();
      if (result.ok) {
        setNote(result.message ?? null);
        setCommenting(false);
        setComment("");
        if (advances) onAdvance?.();
      } else {
        setError(result.error ?? "That did not work.");
      }
      setConfirmingReject(false);
    });
  }

  return (
    <>
      {commenting ? (
        <div className="mt-3">
          <Rule busy={pending} />
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            rows={3}
            autoFocus
            placeholder="What should change? It sticks for every post after this one."
            className="mt-3 w-full rounded-[8px] border border-hairline bg-surface px-3 py-2 text-[13px] leading-[1.4] text-ink outline-none placeholder:text-ink-3"
          />
          <div className="mt-2 flex gap-4 text-[13px]">
            <button
              type="button"
              disabled={pending || comment.trim().length < 3}
              onClick={() => run(() => revise(id, comment), false, "Rewriting")}
              className={
                pending
                  ? ""
                  : "font-medium text-ink underline disabled:text-ink-3 disabled:no-underline"
              }
            >
              {pending ? <Working label="Rewriting" /> : "Send it"}
            </button>
            <button
              type="button"
              onClick={() => {
                setCommenting(false);
                setComment("");
                setError(null);
              }}
              className="text-ink-2 underline"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : pending ? (
        // The whole row becomes the status while the work is out. Revise and
        // Reject cannot be pressed then anyway, and a row of greyed links next
        // to a moving grid splits the eye between two things.
        <div className="mt-3 text-[13px]">
          <Rule busy />
          <Working label={doing} className="mt-3" />
        </div>
      ) : (
        <div className="mt-3 text-[13px]">
          <Rule busy={false} />
          <div className="mt-3 flex items-center gap-4">
            {approveLabel ? (
              <button
                type="button"
                onClick={() =>
                  run(
                    () => approve(id),
                    true,
                    WORKING_LABEL[state] ?? "Working",
                  )
                }
                className={
                  compact
                    ? "btn-ink rounded-[8px] bg-ink px-3 py-[6px] font-medium text-paper"
                    : "font-medium text-ink underline"
                }
              >
                {approveLabel}
              </button>
            ) : null}
            {compact ? null : (
              <>
                <button
                  type="button"
                  onClick={() => setCommenting(true)}
                  className="text-ink-2 underline"
                >
                  Revise
                </button>
                {/* Two clicks, because a rejected card leaves the board and the undo
                for a mis-click is regenerating it. No modal for that. */}
                <button
                  type="button"
                  onClick={() =>
                    confirmingReject
                      ? run(() => reject(id), true, "Rejecting")
                      : setConfirmingReject(true)
                  }
                  className="ml-auto text-ink-2 underline"
                >
                  {confirmingReject ? "Sure?" : "Reject"}
                </button>
              </>
            )}
          </div>
        </div>
      )}

      {note ? (
        <p className="mt-3 text-[13px] leading-[1.4] text-ink-2">{note}</p>
      ) : null}
      {error ? (
        <p className="mt-3 text-[13px] leading-[1.4] text-ink" role="alert">
          {error}
        </p>
      ) : null}
    </>
  );
}

/** The rule above the action row, running while the card's work is out. */
function Rule({ busy }: { busy: boolean }) {
  return busy ? (
    <div className="working-rule" />
  ) : (
    <div className="h-px bg-hairline" />
  );
}
