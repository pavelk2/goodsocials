"use client";

import { useState } from "react";
import {
  DndContext,
  useDraggable,
  useDroppable,
  type DragEndEvent,
} from "@dnd-kit/core";
import { useBoardSensors } from "@/components/board/sensors";
import { SourceTag } from "./data-sources";

/**
 * Section three: the reader does the one job the product asks of them. Drag
 * the card to Scheduled, or press Approve, which is the same move for a
 * keyboard or a thumb, and next week's open day fills in.
 *
 * Same sensors as the real board, so the drag feels the way it will after
 * sign in: 8px before a mouse picks a card up, a quarter second hold on touch.
 */

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri"];
const OPEN_DAY = 1;

export function TryBoard() {
  const [scheduled, setScheduled] = useState(false);
  const sensors = useBoardSensors();

  function onDragEnd(event: DragEndEvent) {
    if (event.over?.id === "scheduled") setScheduled(true);
  }

  return (
    // A fixed id for the same reason as the board's: stable aria ids on hydrate.
    <DndContext id="try-board" sensors={sensors} onDragEnd={onDragEnd}>
      <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-[1fr_1fr_1fr_260px]">
        <Column name="Draft" count={1}>
          <article className="rounded-[14px] border border-hairline bg-surface px-4 py-[14px] text-[14px] leading-[1.45]">
            Failed deploys per release fell about 62% after one CI rule. Small
            sample, 11 releases. Encouraging so far.
            <p className="mt-2 flex items-center gap-[6px] font-mono text-[10.5px] text-ink-3">
              Your numbers <SourceTag kind="github" />
            </p>
          </article>
        </Column>

        <Column name="Image" count={scheduled ? 0 : 1}>
          {scheduled ? (
            <p className="rounded-[14px] border border-dashed border-hairline px-4 py-8 text-center text-[13px] text-ink-3">
              Empty. The next one is being drawn.
            </p>
          ) : (
            <DraggableCard onApprove={() => setScheduled(true)} />
          )}
        </Column>

        <ScheduledColumn scheduled={scheduled} />

        <div className="card-lift rounded-[var(--r-lg)] p-6 md:col-span-3 lg:col-span-1">
          <p className="font-mono text-[12px] text-ink-2">Next week</p>
          <ul className="mt-5 flex justify-between">
            {DAYS.map((day, i) => {
              const open = i === OPEN_DAY && !scheduled;
              const fresh = i === OPEN_DAY && scheduled;
              return (
                <li key={day} className="flex flex-col items-center gap-2">
                  <span
                    className="size-[22px] rounded-full transition-colors duration-500"
                    style={{
                      background: open ? "transparent" : fresh ? "var(--accent)" : "var(--ink)",
                      border: open ? "1.5px dashed var(--accent)" : "none",
                    }}
                  />
                  <span className="font-mono text-[11px] text-ink-2">{day}</span>
                </li>
              );
            })}
          </ul>
          <p className="num mt-5 text-[14px]" aria-live="polite">
            {scheduled ? (
              <>
                <span className="font-semibold">5 of 5 days.</span>{" "}
                <span className="text-ink-2">Tuesday publishes at 09:00.</span>
              </>
            ) : (
              <>
                <span className="font-semibold">4 of 5 days.</span>{" "}
                <span className="text-ink-2">Tuesday is open.</span>
              </>
            )}
          </p>
          {scheduled ? (
            <button
              type="button"
              onClick={() => setScheduled(false)}
              className="mt-4 font-mono text-[12px] text-ink-2 underline"
            >
              Try again
            </button>
          ) : null}
        </div>
      </div>
    </DndContext>
  );
}

function Column({
  name,
  count,
  children,
}: {
  name: string;
  count: number;
  children: React.ReactNode;
}) {
  return (
    <section>
      <header className="flex items-center justify-between px-1 pb-2 text-[13px] font-medium">
        <h3>{name}</h3>
        <span className="num font-mono font-normal text-ink-3">{count}</span>
      </header>
      {children}
    </section>
  );
}

function ScheduledColumn({ scheduled }: { scheduled: boolean }) {
  const { isOver, setNodeRef } = useDroppable({ id: "scheduled" });
  return (
    <Column name="Scheduled" count={scheduled ? 1 : 0}>
      <div
        ref={setNodeRef}
        className="flex min-h-[220px] flex-col rounded-[14px] p-2 transition-colors"
        style={{
          border: scheduled ? "1px solid transparent" : "1.5px dashed var(--accent)",
          background: isOver ? "var(--accent-wash)" : scheduled ? "transparent" : "var(--surface)",
        }}
      >
        {scheduled ? (
          <PostCard>
            <p className="mt-2 font-mono text-[11px] text-ink-2">
              Publishes <span className="num font-medium text-ink">Tue 09:00</span>
            </p>
          </PostCard>
        ) : (
          <p className="m-auto font-mono text-[12px] text-accent-text">Drop here</p>
        )}
      </div>
    </Column>
  );
}

function DraggableCard({ onApprove }: { onApprove: () => void }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: "card",
  });
  return (
    <div
      ref={setNodeRef}
      style={{
        transform: transform ? `translate(${transform.x}px, ${transform.y}px) rotate(2deg)` : undefined,
        position: "relative",
        zIndex: isDragging ? 20 : undefined,
      }}
    >
      <PostCard floating={isDragging} handle={{ ...attributes, ...listeners }}>
        <div className="mt-3 flex gap-[6px] text-[12px]">
          <button
            type="button"
            onClick={onApprove}
            className="pill btn-accent px-3 py-1 text-[12px]"
          >
            Approve
          </button>
          <span className="rounded-full border border-hairline px-3 py-1 text-ink-2">Revise</span>
          <span className="rounded-full border border-hairline px-3 py-1 text-ink-2">Reject</span>
        </div>
      </PostCard>
    </div>
  );
}

function PostCard({
  children,
  floating,
  handle,
}: {
  children?: React.ReactNode;
  floating?: boolean;
  handle?: React.HTMLAttributes<HTMLDivElement>;
}) {
  return (
    <article
      className="rounded-[14px] border border-hairline bg-surface px-4 py-[14px] text-[14px] leading-[1.45]"
      style={{ boxShadow: floating ? "var(--shadow)" : undefined }}
    >
      <div {...handle} className={handle ? "cursor-grab touch:select-none" : undefined}>
        <div
          aria-hidden="true"
          className="mb-3 flex h-[64px] items-end gap-2 rounded-[9px] bg-[var(--panel)] px-3 pb-2"
        >
          {[30, 18, 12].map((h, i) => (
            <span
              key={h}
              className="flex-1 rounded-[3px]"
              style={{ height: h, background: i === 2 ? "var(--accent-panel)" : "var(--panel-hairline)" }}
            />
          ))}
        </div>
        Why TimeTuna shows 3 slots. A/B test on 2,100 bookings, and the earlier
        hypothesis did not hold up.
        <p className="mt-2 flex items-center gap-[6px] font-mono text-[10.5px] text-ink-3">
          Deep dive <SourceTag kind="posthog" />
        </p>
      </div>
      {children}
    </article>
  );
}
