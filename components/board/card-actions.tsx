"use client";

import { useState, useTransition } from "react";
import { approve, reject, revise } from "@/app/board/actions";
import type { Column } from "@/lib/board";

/**
 * Three actions and no fourth. The approve button is labelled with what happens
 * next rather than with the word Approve, because the writing rules say a
 * button names its outcome, and because approving an idea and approving a
 * finished post do very different things to somebody's month. The row written
 * to card_action still says "approve".
 *
 * Rendered twice per card: once in the card footer on the board, once at the
 * bottom of the card dialog. Each copy keeps its own pending state, which is
 * correct, because the server revalidates the board and both redraw from the
 * same row afterwards.
 */
const APPROVE_LABEL: Partial<Record<Column, string>> = {
  idea: "Write the draft",
  draft: "Make the image",
  image: "Schedule it",
};

type ActionResult = { ok: boolean; message?: string; error?: string };

export function CardActions({
  id,
  state,
  onAdvance,
}: {
  id: string;
  state: Column;
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

  const approveLabel = APPROVE_LABEL[state];

  function run(work: () => Promise<ActionResult>, advances: boolean) {
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
        <div className="mt-3 border-t border-hairline pt-3">
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            rows={3}
            autoFocus
            placeholder="What should change? It sticks for every post after this one."
            className="w-full rounded-[8px] border border-hairline bg-surface px-3 py-2 text-[13px] leading-[1.4] text-ink outline-none placeholder:text-ink-3"
          />
          <div className="mt-2 flex gap-4 text-[13px]">
            <button
              type="button"
              disabled={pending || comment.trim().length < 3}
              onClick={() => run(() => revise(id, comment), false)}
              className="font-medium text-ink underline disabled:text-ink-3 disabled:no-underline"
            >
              {pending ? "Rewriting" : "Send it"}
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
      ) : (
        <div className="mt-3 flex items-center gap-4 border-t border-hairline pt-3 text-[13px]">
          {approveLabel ? (
            <button
              type="button"
              disabled={pending}
              onClick={() => run(() => approve(id), true)}
              className="font-medium text-ink underline disabled:text-ink-3 disabled:no-underline"
            >
              {pending ? "Working" : approveLabel}
            </button>
          ) : null}
          <button
            type="button"
            disabled={pending}
            onClick={() => setCommenting(true)}
            className="text-ink-2 underline disabled:text-ink-3 disabled:no-underline"
          >
            Revise
          </button>
          {/* Two clicks, because a rejected card leaves the board and the undo
              for a mis-click is regenerating it. No modal for that. */}
          <button
            type="button"
            disabled={pending}
            onClick={() =>
              confirmingReject
                ? run(() => reject(id), true)
                : setConfirmingReject(true)
            }
            className="ml-auto text-ink-2 underline disabled:text-ink-3 disabled:no-underline"
          >
            {confirmingReject ? "Sure?" : "Reject"}
          </button>
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
