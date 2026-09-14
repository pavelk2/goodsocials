"use client";

import { useOptimistic, useState, useTransition } from "react";
import {
  DndContext,
  DragOverlay,
  KeyboardSensor,
  PointerSensor,
  useDroppable,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import { move } from "@/app/board/actions";
import { COLUMNS, COLUMN_LABEL, type BoardCard, type Column } from "@/lib/board";
import { Column as ColumnShell } from "./column";
import { Card } from "./card";
import { CardShell } from "./card-shell";

const EMPTY_LINE: Record<Column, string> = {
  idea: "Ideas land here first.",
  draft: "Approved ideas become drafts.",
  image: "Drafts that need a picture wait here.",
  scheduled: "Approved posts wait for their time.",
  posted: "Published posts stay here.",
};

/** An idea card shows its idea even after a draft was written and dragged back. */
function bodyOf(card: BoardCard, state: Column): string {
  return state === "idea" ? card.idea : (card.draftText ?? card.idea);
}

/**
 * Dragging a card is the same decision as pressing its button, so the drop runs
 * the same server transitions and can take as long as writing a post takes. The
 * card moves in the UI first and the server is the arbiter: if the move is
 * refused, it goes back where it was and the column says why.
 *
 * An 8px activation distance means a click on a card's action row is a click,
 * not a one pixel drag that swallows it.
 */
export function BoardColumns({
  cards,
}: {
  cards: Record<Column, BoardCard[]>;
}) {
  const [optimistic, moveOptimistic] = useOptimistic(
    cards,
    (state, { id, to }: { id: string; to: Column }) => {
      const next = Object.fromEntries(
        COLUMNS.map((c) => [c, [...state[c]]]),
      ) as Record<Column, BoardCard[]>;

      for (const column of COLUMNS) {
        const index = next[column].findIndex((c) => c.id === id);
        if (index === -1) continue;
        const [card] = next[column].splice(index, 1);
        next[to].push(card);
        break;
      }
      return next;
    },
  );

  const [dragging, setDragging] = useState<BoardCard | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [, startTransition] = useTransition();

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor),
  );

  function onDragStart(event: DragStartEvent) {
    const id = String(event.active.id);
    for (const column of COLUMNS) {
      const found = optimistic[column].find((c) => c.id === id);
      if (found) {
        setDragging(found);
        return;
      }
    }
  }

  function onDragEnd(event: DragEndEvent) {
    setDragging(null);
    const to = event.over?.id as Column | undefined;
    if (!to) return;

    const id = String(event.active.id);
    const from = event.active.data.current?.state as Column | undefined;
    if (from === to) return;

    setError(null);
    startTransition(async () => {
      moveOptimistic({ id, to });
      const result = await move(id, to);
      // A refusal leaves the optimistic move to be undone by the next render
      // from the server, which is the truth about where the card is.
      if (!result.ok) setError(result.error);
    });
  }

  return (
    <DndContext sensors={sensors} onDragStart={onDragStart} onDragEnd={onDragEnd}>
      {error ? (
        <p className="mb-4 text-[13px] text-ink" role="alert">
          {error}
        </p>
      ) : null}

      <div className="flex snap-x gap-4 overflow-x-auto pb-4">
        {COLUMNS.map((state) => (
          <Dropzone key={state} state={state}>
            {optimistic[state].map((card) => (
              <Card
                key={card.id}
                id={card.id}
                state={state}
                body={bodyOf(card, state)}
                imageUrl={card.imageUrl}
                scheduledAt={card.scheduledAt}
              />
            ))}
          </Dropzone>
        ))}
      </div>

      <DragOverlay>
        {dragging ? (
          <CardShell
            body={bodyOf(dragging, dragging.state as Column)}
            imageUrl={dragging.imageUrl}
            scheduledAt={dragging.scheduledAt}
            floating
          />
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}

function Dropzone({
  state,
  children,
}: {
  state: Column;
  children: React.ReactNode[];
}) {
  const { setNodeRef, isOver } = useDroppable({ id: state });

  return (
    <ColumnShell
      dropRef={setNodeRef}
      over={isOver}
      name={COLUMN_LABEL[state]}
      count={children.length}
      emptyLine={EMPTY_LINE[state]}
    >
      {children}
    </ColumnShell>
  );
}
