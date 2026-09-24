"use client";

import { useOptimistic, useState, useTransition } from "react";
import {
  DndContext,
  DragOverlay,
  useDroppable,
  type DragEndEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import { move } from "@/app/board/actions";
import {
  COLUMNS,
  COLUMN_LABEL,
  COLUMN_NEXT,
  type BoardCard,
  type BoardTheme,
  type Column,
} from "@/lib/board";
import { cardLabel } from "@/lib/post-kind";
import { heldIssues } from "@/lib/quality";
import { formatSlot } from "@/lib/time";
import { Column as ColumnShell } from "./column";
import { Card } from "./card";
import { CardShell } from "./card-shell";
import { useBoardSensors } from "./sensors";
import { IdeaControls } from "./idea-controls";

const EMPTY_LINE: Record<Column, string> = {
  idea: "Ideas land here first.",
  draft: "Approved ideas become drafts.",
  image: "Finished posts wait here for a day.",
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
 * A mouse needs 8px of movement and a finger a short hold before a card is
 * picked up, so a click is a click and a swipe scrolls. components/board/sensors.ts.
 */
export function BoardColumns({
  cards,
  themes,
  timeZone,
}: {
  cards: Record<Column, BoardCard[]>;
  themes: BoardTheme[];
  /** The profile's own zone, so every time on the board is their 09:00. */
  timeZone: string;
}) {
  // Titles by id, once for the whole board rather than a lookup per card.
  const themeTitle = new Map(themes.map((t) => [t.id, t.title]));
  const labelOf = (card: BoardCard) =>
    cardLabel(card.kind, card.themeId ? themeTitle.get(card.themeId) : null);
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
  // Posted only grows, and nothing in it can be decided, so it starts folded.
  const [showPosted, setShowPosted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [, startTransition] = useTransition();

  const sensors = useBoardSensors();

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
    <DndContext
      id="board"
      sensors={sensors}
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
    >
      {error ? (
        <p className="mb-4 text-[13px] text-ink" role="alert">
          {error}
        </p>
      ) : null}

      {/* Relative, so the visually hidden Read it controls on each card are
          clipped by this scroller. Without it they were placed against the
          page, and five columns of them made a phone's page 1,058px wide and
          zoomed it out. On a phone the columns scroll edge to edge, so the
          next one shows at the right edge as a sign there is more. */}
      <div className="relative -mx-4 flex snap-x scroll-px-4 gap-4 overflow-x-auto px-4 pb-4 sm:mx-0 sm:scroll-px-0 sm:px-0">
        {COLUMNS.map((state) => {
          const list = optimistic[state];
          const folded = state === "posted" && list.length > 0 && !showPosted;
          const outcome = state === "scheduled" || state === "posted";
          return (
            <Dropzone
              key={state}
              state={state}
              count={list.length}
              narrow={outcome && (list.length === 0 || folded)}
              head={state === "idea" ? <IdeaControls themes={themes} /> : null}
            >
              {folded ? (
                <PostedFold
                  last={latest(list)}
                  timeZone={timeZone}
                  onShow={() => setShowPosted(true)}
                />
              ) : (
                list.map((card) => (
                  <Card
                    key={card.id}
                    id={card.id}
                    state={state}
                    body={bodyOf(card, state)}
                    label={labelOf(card)}
                    needs={card.needs}
                    held={heldIssues(card.quality)}
                    imageUrl={card.imageUrl}
                    scheduledAt={card.scheduledAt}
                    timeZone={timeZone}
                  />
                ))
              )}
            </Dropzone>
          );
        })}
      </div>

      <DragOverlay>
        {dragging ? (
          <CardShell
            body={bodyOf(dragging, dragging.state as Column)}
            label={labelOf(dragging)}
            imageUrl={dragging.imageUrl}
            scheduledAt={dragging.scheduledAt}
            timeZone={timeZone}
            floating
          />
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}

function Dropzone({
  state,
  count,
  narrow,
  head,
  children,
}: {
  state: Column;
  count: number;
  narrow: boolean;
  head?: React.ReactNode;
  children: React.ReactNode;
}) {
  const { setNodeRef, isOver } = useDroppable({ id: state });

  return (
    <ColumnShell
      dropRef={setNodeRef}
      over={isOver}
      name={COLUMN_LABEL[state]}
      next={COLUMN_NEXT[state]}
      count={count}
      narrow={narrow}
      emptyLine={EMPTY_LINE[state]}
      head={head}
    >
      {children}
    </ColumnShell>
  );
}

/** Cards sit in position order, so the most recent post is found by its date. */
function latest(cards: BoardCard[]): Date | null {
  let best: Date | null = null;
  for (const c of cards) {
    if (c.scheduledAt && (!best || c.scheduledAt > best)) best = c.scheduledAt;
  }
  return best;
}

/**
 * Posted, folded: when the last one went out and a way to see them all. The
 * cards are a record by now, and the columns before it are where the work is.
 */
function PostedFold({
  last,
  timeZone,
  onShow,
}: {
  last: Date | null;
  timeZone: string;
  onShow: () => void;
}) {
  return (
    <div className="px-2 py-3 text-[13px] leading-[1.4]">
      {last ? (
        <p className="text-ink-2">
          Last one <span className="num">{formatSlot(last, timeZone)}</span>
        </p>
      ) : null}
      <button
        type="button"
        onClick={onShow}
        className="mt-2 text-ink underline"
      >
        Show them
      </button>
    </div>
  );
}
