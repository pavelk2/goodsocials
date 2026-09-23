"use client";

import { useEffect, useRef } from "react";

/**
 * Which approved post goes on the day somebody picked.
 *
 * The calendar's one write used to be a drag, and a drag is invisible: nothing
 * on an empty Thursday said it would take a card, and a keyboard user had to
 * find the drag handle to learn it. The cell now carries a button, and this is
 * what the button opens. Same write as the drop, same server call.
 *
 * Native <dialog>, like the card modal, so Escape, the focus trap and the
 * return of focus to the cell come from the platform.
 */

export type PickableCard = {
  id: string;
  body: string;
  label: string | null;
  imageUrl: string | null;
};

export function DayPicker({
  dayLabel,
  cards,
  onPick,
  onClose,
}: {
  /** "Thu, 24 Sept", formatted on the server in the profile's own zone. */
  dayLabel: string;
  cards: PickableCard[];
  onPick: (cardId: string) => void;
  onClose: () => void;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  const panel = useRef<HTMLDivElement>(null);

  const closed = useRef(onClose);
  useEffect(() => {
    closed.current = onClose;
  });

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    const handleClose = () => closed.current();
    dialog.addEventListener("close", handleClose);
    if (!dialog.open) dialog.showModal();
    return () => dialog.removeEventListener("close", handleClose);
  }, []);

  return (
    <dialog
      ref={ref}
      onClick={(event) => {
        if (!panel.current?.contains(event.target as Node)) ref.current?.close();
      }}
      className="fixed inset-0 h-dvh max-h-dvh w-dvw max-w-dvw items-center justify-center bg-transparent p-4 backdrop:bg-black/70 open:flex"
    >
      <div
        ref={panel}
        className="max-h-[86dvh] w-full max-w-[460px] overflow-y-auto rounded-[20px] border border-hairline bg-surface p-6"
      >
        <p className="text-[17px] font-semibold tracking-[-0.02em]">
          Schedule for {dayLabel}
        </p>
        <p className="mt-1 text-[13px] text-ink-2">
          Pick one of the approved posts. It goes out that morning.
        </p>

        <ul className="mt-4 flex flex-col gap-2">
          {cards.map((card) => (
            <li key={card.id}>
              <button
                type="button"
                onClick={() => {
                  onPick(card.id);
                  ref.current?.close();
                }}
                className="flex w-full items-start gap-3 rounded-[14px] border border-hairline p-3 text-left hover:border-accent"
              >
                {card.imageUrl ? (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img
                    src={card.imageUrl}
                    alt=""
                    className="h-[44px] w-[44px] shrink-0 rounded-[8px] object-cover"
                  />
                ) : null}
                <span className="min-w-0">
                  {card.label ? (
                    <span className="block text-[12px] text-ink-2">
                      {card.label}
                    </span>
                  ) : null}
                  <span className="line-clamp-2 block text-[13px] leading-[1.35] text-ink">
                    {card.body}
                  </span>
                </span>
              </button>
            </li>
          ))}
        </ul>

        <button
          type="button"
          onClick={() => ref.current?.close()}
          className="mt-5 text-[13px] text-ink-2 underline"
        >
          Close, or press Esc
        </button>
      </div>
    </dialog>
  );
}
