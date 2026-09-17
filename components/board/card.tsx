"use client";

import { useState, useTransition } from "react";
import { useDraggable } from "@dnd-kit/core";
import { approve, reject, revise } from "@/app/board/actions";
import { CardShell } from "./card-shell";
import type { Column } from "@/lib/board";

/**
 * Three actions and no fourth. The approve button is labelled with what happens
 * next rather than with the word Approve, because the writing rules say a
 * button names its outcome, and because approving an idea and approving a
 * finished post do very different things to somebody's month. The row written
 * to card_action still says "approve".
 */
const APPROVE_LABEL: Partial<Record<Column, string>> = {
  idea: "Write the draft",
  draft: "Make the image",
  image: "Schedule it",
};

type ActionResult = { ok: boolean; message?: string; error?: string };

export function Card({
  id,
  state,
  body,
  imageUrl,
  scheduledAt,
}: {
  id: string;
  state: Column;
  body: string;
  imageUrl?: string | null;
  scheduledAt?: Date | null;
}) {
  const [expanded, setExpanded] = useState(false);
  const [commenting, setCommenting] = useState(false);
  const [comment, setComment] = useState("");
  const [confirmingReject, setConfirmingReject] = useState(false);
  const [note, setNote] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  // Listeners go on the body, not on the article, so the action row stays
  // clickable. dnd-kit's attributes make the body focusable and announce the
  // keyboard instructions, which is how a card moves without a mouse.
  const { setNodeRef, attributes, listeners, isDragging } = useDraggable({
    id,
    data: { state },
  });

  const approveLabel = APPROVE_LABEL[state];

  // Three lines at this width is about this many characters. Showing the
  // control on a card that is already whole would be a lie about there being
  // more to read.
  const clamped = body.length > 140 || body.includes("\n");

  function run(work: () => Promise<ActionResult>) {
    setError(null);
    setNote(null);
    startTransition(async () => {
      const result = await work();
      if (result.ok) {
        setNote(result.message ?? null);
        setCommenting(false);
        setComment("");
      } else {
        setError(result.error ?? "That did not work.");
      }
      setConfirmingReject(false);
    });
  }

  return (
    <CardShell
      body={body}
      imageUrl={imageUrl}
      scheduledAt={scheduledAt}
      innerRef={setNodeRef}
      style={isDragging ? { opacity: 0.4 } : undefined}
      handleProps={{ ...attributes, ...listeners }}
      expanded={expanded}
    >
      {/* Its own line, above the hairline, so the action row stays three
          actions and nothing else. Outside the drag handle, so reading a post
          never picks the card up. */}
      {clamped ? (
        <button
          type="button"
          onClick={() => setExpanded((open) => !open)}
          className="mt-2 text-[13px] text-ink-2 underline"
        >
          {expanded ? "Show less" : "Read it"}
        </button>
      ) : null}

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
              onClick={() => run(() => revise(id, comment))}
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
              onClick={() => run(() => approve(id))}
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
              confirmingReject ? run(() => reject(id)) : setConfirmingReject(true)
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
    </CardShell>
  );
}
