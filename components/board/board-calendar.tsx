"use client";

import Link from "next/link";
import { useOptimistic, useState, useTransition } from "react";
import {
  DndContext,
  DragOverlay,
  useDraggable,
  useDroppable,
  type DragEndEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import { move, scheduleOn } from "@/app/board/actions";
import type { BoardCard, BoardTheme } from "@/lib/board";
import type {
  CalendarDay,
  CalendarMonth,
  DayPost,
  HistoryPost,
} from "@/lib/calendar";
import { cardLabel } from "@/lib/post-kind";
import { formatTime, publishSlot } from "@/lib/time";
import { PostText } from "@/components/post-text";
import { Card } from "./card";
import { CardModal } from "./card-modal";
import { CardShell } from "./card-shell";
import { useBoardSensors } from "./sensors";
import { DayPicker } from "./day-picker";

/**
 * The same cards as the five columns, arranged by the day they go out.
 *
 * The board answers how far along a post is. This answers whether next Thursday
 * has one, which is the question a customer paying for cadence asks and the one
 * the columns cannot be made to answer: a Scheduled column with four cards in
 * it looks identical whether those four days are consecutive or spread over a
 * fortnight.
 *
 * Not a second surface. Same page, same url, same data, one query parameter,
 * so a calendar can never drift from the board it is a reading of.
 *
 * Drag moves a post between days. Dropping one from Ready to schedule onto a
 * day is the same decision as pressing Schedule it, except the day is the
 * user's rather than the next free slot. Dragging a scheduled post back onto
 * the rail takes it out of the queue and leaves the picture alone.
 *
 * A drag is the fast way and never the only way. Every day that can take a
 * post says so in words and opens a list of the approved ones, because a
 * capability with no affordance is a capability nobody finds: an empty
 * Thursday looked identical whether or not it would accept a card, and a
 * keyboard user had to locate a drag handle to learn the difference.
 *
 * Days this profile posted on before GoodSocials are drawn back, in --ink-3
 * with no border. They are imported from the member's LinkedIn archive and
 * exist to be read, so the eye goes to the cells that still need a decision.
 */

const DOW = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

/** Droppable ids are namespaced so a day and the rail cannot collide. */
const DAY_PREFIX = "day:";
const RAIL = "rail";

/**
 * A card waiting for a day, with everything the rail draws already resolved.
 * The optimistic reducer moves posts between the grid and the rail, and a view
 * type on both sides is what makes that round trip lossless.
 */
type RailCard = {
  id: string;
  body: string;
  label: string | null;
  imageUrl: string | null;
};

type Model = { weeks: CalendarDay[][]; rail: RailCard[] };

export function BoardCalendar({
  month,
  rail,
  themes,
  timeZone,
}: {
  month: CalendarMonth;
  /** Approved posts with a picture, waiting for a day. The Image column. */
  rail: BoardCard[];
  themes: BoardTheme[];
  timeZone: string;
}) {
  const themeTitle = new Map(themes.map((t) => [t.id, t.title]));
  const labelOf = (card: BoardCard) =>
    cardLabel(card.kind, card.themeId ? themeTitle.get(card.themeId) : null);

  const waiting: RailCard[] = rail.map((card) => ({
    id: card.id,
    body: card.draftText ?? card.idea,
    label: labelOf(card),
    imageUrl: card.imageUrl,
  }));

  const [model, placeOptimistic] = useOptimistic(
    { weeks: month.weeks, rail: waiting } satisfies Model,
    (state: Model, action: { cardId: string; to: string }): Model =>
      applyPlacement(state, action, timeZone),
  );

  const [dragging, setDragging] = useState<{
    body: string;
    label: string | null;
    imageUrl: string | null;
  } | null>(null);
  const [reading, setReading] = useState<DayPost | null>(null);
  /** The day whose Schedule here was pressed, waiting on which post. */
  const [picking, setPicking] = useState<CalendarDay | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [, startTransition] = useTransition();

  /**
   * The calendar's one write, from the drop and from the picker alike. A
   * refusal leaves the optimistic placement to be undone by the next render
   * from the server, which is the truth about where the post is.
   */
  function place(cardId: string, day: string) {
    setError(null);
    startTransition(async () => {
      placeOptimistic({ cardId, to: day });
      const result = await scheduleOn(cardId, day);
      if (!result.ok) setError(result.error);
    });
  }

  const sensors = useBoardSensors();

  function onDragStart(event: DragStartEvent) {
    const data = event.active.data.current;
    setDragging({
      body: String(data?.body ?? ""),
      label: (data?.label as string | null) ?? null,
      imageUrl: (data?.imageUrl as string | null) ?? null,
    });
  }

  function onDragEnd(event: DragEndEvent) {
    setDragging(null);
    const over = event.over ? String(event.over.id) : null;
    if (!over) return;

    const cardId = String(event.active.id);
    const from = event.active.data.current?.state as string | undefined;
    setError(null);

    if (over === RAIL) {
      // Already waiting. Dropping it back where it came from is not a move.
      if (from !== "scheduled") return;
      startTransition(async () => {
        placeOptimistic({ cardId, to: RAIL });
        const result = await move(cardId, "image");
        if (!result.ok) setError(result.error);
      });
      return;
    }

    if (!over.startsWith(DAY_PREFIX)) return;
    place(cardId, over.slice(DAY_PREFIX.length));
  }

  return (
    <DndContext
      // Without this dnd-kit numbers its own aria ids from a module counter,
      // which the server keeps incrementing between requests, and every card
      // hydrates with an aria-describedby that does not match.
      id="board-calendar"
      sensors={sensors}
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
    >
      {error ? (
        <p className="mb-4 text-[13px] text-ink" role="alert">
          {error}
        </p>
      ) : null}

      <div className="flex flex-col gap-6 xl:flex-row xl:items-start">
        <section className="min-w-0 flex-1">
          <MonthHeader month={month} />

          {/* Seven columns do not fit a phone, and squeezing them would leave
              cells too narrow to hold a line of a post. Scrolled sideways, a
              393px screen showed three days of empty grid at a time. So a
              phone reads the month as a list, one day under the next, which is
              the order a thumb scrolls in: the same cells, one column. */}
          <div className="relative pb-2 md:overflow-x-auto">
            <div className="md:min-w-[840px]">
              <div className="mb-2 hidden grid-cols-7 gap-2 md:grid">
                {DOW.map((name) => (
                  <span key={name} className="px-1 text-[11px] text-ink-3">
                    {name}
                  </span>
                ))}
              </div>

              <div className="grid grid-cols-1 gap-2 md:grid-cols-7">
                {model.weeks.flat().map((day) => (
                  <DayBox
                    key={day.key}
                    day={day}
                    timeZone={timeZone}
                    ready={model.rail.length}
                    onRead={setReading}
                    onSchedule={setPicking}
                  />
                ))}
              </div>
            </div>
          </div>
        </section>

        <Rail cards={model.rail} timeZone={timeZone} />
      </div>

      <DragOverlay>
        {dragging ? (
          <div className="w-[300px]">
            <CardShell
              body={dragging.body}
              label={dragging.label}
              imageUrl={dragging.imageUrl}
              floating
            />
          </div>
        ) : null}
      </DragOverlay>

      {picking ? (
        <DayPicker
          dayLabel={picking.label}
          cards={model.rail}
          onPick={(cardId) => place(cardId, picking.key)}
          onClose={() => setPicking(null)}
        />
      ) : null}

      {reading ? (
        <CardModal
          id={reading.cardId}
          state={reading.state}
          body={reading.body}
          label={reading.label}
          imageUrl={reading.imageUrl}
          scheduledAt={reading.at}
          timeZone={timeZone}
          onClose={() => setReading(null)}
        />
      ) : null}
    </DndContext>
  );
}

/**
 * The month, and the one sentence the board header used to carry as a number.
 * Runway is a count of days; this says which day, which is the same fact with
 * somewhere to point.
 */
function MonthHeader({ month }: { month: CalendarMonth }) {
  return (
    <div className="mb-2 flex min-h-[44px] flex-wrap items-center justify-between gap-x-6 gap-y-1">
      <h2 className="text-[20px] font-semibold tracking-[-0.02em]">
        {month.heading}
      </h2>
      <p className="text-[13px] text-ink-2">
        <span className="num text-ink">{month.posted} posted</span>,{" "}
        <span className="num text-ink">{month.scheduled} scheduled</span>,{" "}
        <span className="num">{month.open} open</span>
        {month.history > 0 ? (
          <>
            {", "}
            <span className="num">{month.history} earlier</span>
          </>
        ) : null}
        {month.dryAfter ? (
          <>
            {". "}Queue dry after{" "}
            <span className="text-ink">{month.dryAfter}</span>
          </>
        ) : (
          ". Nothing is queued"
        )}
        <span className="mx-2 text-ink-3">·</span>
        <Link
          href={`/board?view=calendar&m=${month.previous}`}
          className="nav-link underline touch:py-3"
        >
          Previous
        </Link>
        <span className="mx-2 text-ink-3">·</span>
        <Link
          href={`/board?view=calendar&m=${month.next}`}
          className="nav-link underline touch:py-3"
        >
          Next
        </Link>
      </p>
    </div>
  );
}

/**
 * One day. A cell with a post is the post; a cell without one says so and takes
 * a drop. A day whose slot has gone takes nothing, and neither does a weekend,
 * which is drawn back rather than outlined so an empty Saturday does not read
 * as a day somebody missed.
 */
function DayBox({
  day,
  timeZone,
  ready,
  onRead,
  onSchedule,
}: {
  day: CalendarDay;
  timeZone: string;
  /** How many posts are waiting in the rail. Nothing to pick, nothing to offer. */
  ready: number;
  onRead: (post: DayPost) => void;
  onSchedule: (day: CalendarDay) => void;
}) {
  const open = !day.post && !day.past && day.inMonth;
  const { setNodeRef, isOver } = useDroppable({
    id: `${DAY_PREFIX}${day.key}`,
    disabled: !open,
  });

  const border = isOver
    ? "border-accent border-solid"
    : day.today
      ? "border-accent border-solid"
      : !day.inMonth || day.weekend
        ? "border-transparent"
        : day.post
          ? day.post.state === "posted"
            ? "border-surface border-solid"
            : "border-ink-3 border-dashed"
          : day.past
            ? "border-transparent"
            : "border-hairline border-dotted";

  // In the phone's list there is no grid to keep square, so the days that only
  // pad out the first and last weeks go, and so do past days nobody posted on.
  // Today stays after its slot has gone: it is where the reader is.
  const listed =
    day.inMonth && (day.today || !day.past || day.post || day.history);

  return (
    <div
      ref={setNodeRef}
      className={`group overflow-hidden rounded-[14px] border p-[10px] md:min-h-[124px] ${
        listed ? "" : "max-md:hidden"
      } ${border} ${day.post?.state === "posted" ? "bg-surface" : ""} ${
        day.today ? "bg-[var(--accent-wash)]" : ""
      }`}
    >
      <span
        className={`num block text-[12px] ${
          day.today
            ? "font-semibold text-[var(--accent-on-wash)]"
            : !day.inMonth || day.weekend
              ? "text-ink-3/60"
              : "text-ink-3"
        }`}
      >
        {/* A list has no column heading to say which weekday a number is. */}
        <span className="md:hidden">{day.label}</span>
        <span className="hidden md:inline">{day.number}</span>
      </span>

      {day.post ? (
        <PostChip post={day.post} timeZone={timeZone} onRead={onRead} />
      ) : day.history ? (
        <HistoryChip post={day.history} />
      ) : !day.inMonth ? null : day.weekend ? (
        <>
          <p className="mt-2 text-[12px] text-ink-3/60">Weekend</p>
          {/* An empty Saturday is a choice, so the offer waits to be looked
              for. The cell still takes a drop, as it always did. */}
          {open && ready > 0 ? (
            <ScheduleHere
              day={day}
              onSchedule={onSchedule}
              className="opacity-0 transition-opacity group-focus-within:opacity-100 group-hover:opacity-100 touch:opacity-100"
            />
          ) : null}
        </>
      ) : day.past ? null : open && ready > 0 ? (
        <ScheduleHere day={day} onSchedule={onSchedule} />
      ) : (
        <p className="mt-2 text-[12px] text-ink-3">Nothing here</p>
      )}
    </div>
  );
}

/**
 * What an empty day says now. The word the user is looking for is "schedule",
 * on the day they want it, and it opens the same list a drop would have
 * chosen from. Kept to the ink palette: today's cell is this screen's one
 * saturated thing, per DESIGN.md section 6.
 */
function ScheduleHere({
  day,
  onSchedule,
  className = "",
}: {
  day: CalendarDay;
  onSchedule: (day: CalendarDay) => void;
  className?: string;
}) {
  return (
    <button
      type="button"
      onClick={() => onSchedule(day)}
      aria-label={`Schedule a post for ${day.label}`}
      className={`mt-2 text-left text-[12px] text-ink-2 underline underline-offset-2 hover:text-ink touch:mt-0 touch:min-h-11 ${className}`}
    >
      Schedule here
    </button>
  );
}

/**
 * A post this person published before this board existed, imported from their
 * LinkedIn archive. Read-only by nature: there is no card behind it, no state
 * to move it to, and LinkedIn does not let us edit or delete it from here.
 * Drawn in --ink-3 with no border so a month of history reads as background
 * against the two cells that still want a decision.
 */
function HistoryChip({ post }: { post: HistoryPost }) {
  return (
    <div className="mt-1">
      <p className="line-clamp-3 whitespace-pre-line text-[13px] leading-[1.35] text-ink-2">
        {post.text}
      </p>
      <p className="num mt-[7px] flex items-center gap-[6px] text-[12px] text-ink-3">
        <span
          aria-hidden="true"
          className="inline-block h-[7px] w-[7px] rounded-full bg-hairline"
        />
        {post.url ? (
          <a
            href={post.url}
            target="_blank"
            rel="noreferrer"
            className="underline underline-offset-2 hover:text-ink-2"
          >
            On LinkedIn
          </a>
        ) : (
          <span>On LinkedIn</span>
        )}
        {post.more > 0 ? <span>+{post.more}</span> : null}
      </p>
    </div>
  );
}

/**
 * A post inside a day. Scheduled ones are draggable, because moving one is a
 * decision a user is allowed to make. Posted ones are not: that card carries a
 * real LinkedIn post URN and the day it went out is a fact.
 */
function PostChip({
  post,
  timeZone,
  onRead,
}: {
  post: DayPost;
  timeZone: string;
  onRead: (post: DayPost) => void;
}) {
  const movable = post.state === "scheduled";
  const { setNodeRef, attributes, listeners, isDragging } = useDraggable({
    id: post.cardId,
    disabled: !movable,
    data: {
      state: post.state,
      body: post.body,
      label: post.label,
      imageUrl: post.imageUrl,
    },
  });

  return (
    <div ref={setNodeRef} style={isDragging ? { opacity: 0.4 } : undefined}>
      <div
        {...attributes}
        {...listeners}
        className={
          movable
            ? "cursor-grab touch:select-none touch:[-webkit-touch-callout:none]"
            : undefined
        }
      >
        <p className="mt-1 line-clamp-3 whitespace-pre-line text-[13px] leading-[1.35] text-ink">
          <PostText text={post.body} />
        </p>
      </div>
      <button
        type="button"
        onClick={() => onRead(post)}
        className="num mt-[7px] flex items-center gap-[6px] text-[12px] text-ink-2 touch:mt-0 touch:min-h-11"
      >
        <span
          aria-hidden="true"
          className={`inline-block h-[7px] w-[7px] rounded-full ${
            post.state === "posted"
              ? "bg-ink"
              : "border border-ink-3 bg-transparent"
          }`}
        />
        {post.state === "posted"
          ? "Posted"
          : `Scheduled ${formatTime(post.at, timeZone)}`}
      </button>
    </div>
  );
}

/**
 * Approved posts with a picture and no day yet, which is the Image column under
 * the name it has on this screen. The same card component as the board, because
 * DESIGN.md section 4 allows exactly one and this is still it.
 */
function Rail({
  cards,
  timeZone,
}: {
  cards: RailCard[];
  timeZone: string;
}) {
  const { setNodeRef, isOver } = useDroppable({ id: RAIL });

  // Above the month on a phone. Below it, a post waiting for a day sat under
  // thirty days of list, and a card that needs a decision belongs on top.
  return (
    <section className="w-full shrink-0 max-md:order-first xl:w-[320px]">
      <header className="flex h-[44px] items-center justify-between px-1">
        <h2 className="text-[13px] font-medium text-ink-2">Ready to schedule</h2>
        <span className="num text-[13px] font-medium text-ink-3">
          {cards.length}
        </span>
      </header>

      <div
        ref={setNodeRef}
        className={`flex min-h-[160px] flex-col gap-2 rounded-[20px] border p-2 ${
          isOver ? "border-accent" : "border-hairline"
        }`}
      >
        {cards.length === 0 ? (
          <p className="px-2 py-3 text-[13px] text-ink-3">
            Approve a draft and it waits here for a day.
          </p>
        ) : (
          cards.map((card) => (
            <Card
              key={card.id}
              id={card.id}
              state="image"
              body={card.body}
              label={card.label}
              imageUrl={card.imageUrl}
              timeZone={timeZone}
            />
          ))
        )}
      </div>
      {/* Said once, here, rather than repeated in every empty cell. All three
          routes are the same write, so a user who reads this line never has to
          discover the drag to choose a day. */}
      <p className="mt-[10px] px-1 text-[12px] leading-[1.5] text-ink-3">
        Schedule it takes the next free day. To choose the day, press Schedule
        here on it, or drag a card onto it.
      </p>
    </section>
  );
}

/**
 * The optimistic move, applied to both halves of the screen at once. A post
 * leaving a day has to vanish from that cell in the same render it appears in
 * the new one, or a drop across the grid shows the post twice.
 */
function applyPlacement(
  state: Model,
  action: { cardId: string; to: string },
  timeZone: string,
): Model {
  const fromDay =
    state.weeks.flat().find((day) => day.post?.cardId === action.cardId)?.post ??
    null;
  const fromRail = state.rail.find((card) => card.id === action.cardId) ?? null;
  if (!fromDay && !fromRail) return state;

  const weeks = state.weeks.map((week) =>
    week.map((day) =>
      day.post?.cardId === action.cardId ? { ...day, post: null } : day,
    ),
  );
  const rail = state.rail.filter((card) => card.id !== action.cardId);

  if (action.to === RAIL) {
    // Only a scheduled post can come out of the queue, and it comes out as the
    // card it was before it was given a day.
    if (!fromDay) return state;
    return {
      weeks,
      rail: [
        ...rail,
        {
          id: fromDay.cardId,
          body: fromDay.body,
          label: fromDay.label,
          imageUrl: fromDay.imageUrl,
        },
      ],
    };
  }

  const at = publishSlot(action.to, timeZone);
  const post: DayPost = fromDay
    ? { ...fromDay, state: "scheduled", at }
    : {
        cardId: fromRail!.id,
        body: fromRail!.body,
        label: fromRail!.label,
        imageUrl: fromRail!.imageUrl,
        at,
        state: "scheduled",
      };

  return {
    weeks: weeks.map((week) =>
      week.map((day) => (day.key === action.to ? { ...day, post } : day)),
    ),
    rail,
  };
}
