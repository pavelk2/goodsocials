"use client";

import { useEffect, useRef, useState } from "react";
import { signOutAction } from "@/app/actions";

/**
 * One row shape for every item in the panel, so a later item reads as the
 * same list.
 * The wash on hover is --paper over --surface, which is the same pair the card
 * uses against the column, so nothing new enters the palette.
 */
const ITEM =
  "flex w-full items-baseline justify-between gap-4 rounded-[8px] px-3 py-[7px] text-left text-[13px] text-ink transition-colors duration-150 hover:bg-paper";

/**
 * Name and picture, and the way out. Nothing else, because every other door
 * here led somewhere the board already has a door to: Profile opened Settings,
 * and Change plan opened what the billing row in Settings opens. One
 * destination, one door, one name.
 *
 * Not a native element. A <details> would close on Escape and on nothing else,
 * and the popover API positions against the viewport unless anchor positioning
 * is there, which Safari only recently grew. So: a button, a panel, Escape,
 * a click outside, and a focus that leaves the wrapper. Every item is a link
 * or a submit, so Tab walks the list without arrow key handling to get wrong.
 */
export function UserMenu({
  name,
  email,
  avatarUrl,
}: {
  name: string;
  email: string | null;
  avatarUrl: string | null;
}) {
  const [open, setOpen] = useState(false);
  const wrap = useRef<HTMLDivElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;

    function onPointerDown(event: PointerEvent) {
      if (!wrap.current?.contains(event.target as Node)) setOpen(false);
    }
    function onKeyDown(event: KeyboardEvent) {
      if (event.key !== "Escape") return;
      setOpen(false);
      // Escape puts focus back where it came from, the way the sheet does.
      trigger.current?.focus();
    }

    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  return (
    <div
      ref={wrap}
      className="relative"
      // Tabbing past the last item closes it, so the panel is never left open
      // behind a keyboard user who has moved on.
      onBlur={(event) => {
        if (!wrap.current?.contains(event.relatedTarget as Node)) setOpen(false);
      }}
    >
      <button
        ref={trigger}
        type="button"
        aria-expanded={open}
        aria-haspopup="true"
        aria-controls="user-menu"
        onClick={() => setOpen((was) => !was)}
        className="flex items-center gap-2 rounded-[8px] py-[5px] pl-[5px] pr-2 text-[13px] font-medium transition-colors duration-150 hover:bg-paper"
      >
        <Avatar name={name} src={avatarUrl} />
        <span className="hidden max-w-[160px] truncate sm:block">{name}</span>
        <Chevron open={open} />
      </button>

      {open ? (
        <div
          id="user-menu"
          className="absolute right-0 top-[calc(100%+6px)] z-50 w-[248px] rounded-[14px] border border-hairline bg-surface p-[6px] shadow-[var(--shadow)]"
        >
          <div className="px-3 pb-[6px] pt-[5px]">
            <p className="truncate text-[13px] font-medium">{name}</p>
            {email ? (
              <p className="truncate text-[13px] text-ink-2">{email}</p>
            ) : null}
          </div>

          <div className="my-[5px] border-t border-hairline" />

          <form action={signOutAction}>
            <button type="submit" className={ITEM}>
              Sign out
            </button>
          </form>
        </div>
      ) : null}
    </div>
  );
}

/**
 * The LinkedIn picture at 24px, or the first letter of the name. Not
 * next/image: the URL is a licdn host that would need a remote pattern for one
 * 24px avatar, and a cached derivative of it pays for itself never.
 */
function Avatar({ name, src }: { name: string; src: string | null }) {
  if (src) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={src}
        alt=""
        width={24}
        height={24}
        className="size-6 shrink-0 rounded-full border border-hairline object-cover"
      />
    );
  }

  return (
    <span
      aria-hidden="true"
      className="flex size-6 shrink-0 items-center justify-center rounded-full border border-hairline bg-paper text-[11px] font-medium text-ink-2"
    >
      {name.trim().charAt(0).toUpperCase() || "?"}
    </span>
  );
}

function Chevron({ open }: { open: boolean }) {
  return (
    <svg
      width="10"
      height="10"
      viewBox="0 0 10 10"
      aria-hidden="true"
      className={`shrink-0 text-ink-3 transition-transform duration-150 ${open ? "rotate-180" : ""}`}
    >
      <path
        d="M2 4l3 3 3-3"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
