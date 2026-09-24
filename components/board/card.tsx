"use client";

import { useState } from "react";
import { useDraggable } from "@dnd-kit/core";
import { CardShell } from "./card-shell";
import { CardActions } from "./card-actions";
import { CardModal } from "./card-modal";
import type { Column } from "@/lib/board";

/**
 * A card on the board is a summary and a dialog is the whole post. Clicking the
 * card opens it: the full text with the line breaks LinkedIn will render, the
 * picture at a size somebody can judge, and the same three actions, so a post
 * can be read and approved without closing anything.
 *
 * The click and the drag share the card body. dnd-kit's pointer sensor waits
 * for 8px of movement before it takes over, so a press that does not move is
 * still a click. The keyboard path is the separate Read it control, because
 * Enter on the body starts a keyboard drag and one key cannot mean two things.
 */
export function Card({
  id,
  state,
  body,
  label,
  needs,
  imageUrl,
  scheduledAt,
  timeZone,
}: {
  id: string;
  state: Column;
  body: string;
  label?: string | null;
  needs?: string | null;
  imageUrl?: string | null;
  scheduledAt?: Date | null;
  timeZone?: string;
}) {
  const [reading, setReading] = useState(false);

  // Listeners go on the body, not on the article, so the action row stays
  // clickable. dnd-kit's attributes make the body focusable and announce the
  // keyboard instructions, which is how a card moves without a mouse.
  const { setNodeRef, attributes, listeners, isDragging } = useDraggable({
    id,
    // The board finds the card it is dragging by id in the column it came
    // from. The calendar cannot: a card can leave the rail or a day cell, so
    // what it needs to draw in the air travels with the drag instead.
    data: { state, body, label, imageUrl },
  });

  return (
    <CardShell
      body={body}
      label={label}
      needs={needs}
      imageUrl={imageUrl}
      onOpen={() => setReading(true)}
      scheduledAt={scheduledAt}
      timeZone={timeZone}
      innerRef={setNodeRef}
      style={isDragging ? { opacity: 0.4 } : undefined}
      handleProps={{ ...attributes, ...listeners }}
    >
      <CardActions id={id} state={state} compact />

      {/* Mounted only while open, so the dialog opens on mount and every close,
          by Escape or by click, is the same unmount. */}
      {reading ? (
        <CardModal
          id={id}
          state={state}
          body={body}
          label={label}
          needs={needs}
          imageUrl={imageUrl}
          scheduledAt={scheduledAt}
          timeZone={timeZone}
          onClose={() => setReading(false)}
        />
      ) : null}
    </CardShell>
  );
}
