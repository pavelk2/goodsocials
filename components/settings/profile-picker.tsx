"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { switchProfile } from "@/app/settings/actions";

export type SeatRow = {
  id: string;
  name: string;
  /** Derived in lib/token-expiry.ts, so the board and this row cannot disagree. */
  connection: string;
  /** True once the token is close enough to dead that it needs a person. */
  needsAttention: boolean;
  active: boolean;
};

/**
 * Which LinkedIn profile the posts go to. An agency runs up to twelve of these
 * from one login, so this is the screen where a whole client's month is picked
 * up or put down, and it is rows: name left, state right.
 *
 * The same list is the token monitor. A seat with a dead connection publishes
 * nothing and nobody finds out for weeks, so every row says how long it has
 * left next to the button that fixes it.
 */
export function ProfilePicker({
  seats,
  seatsLeft,
  planLine,
}: {
  seats: SeatRow[];
  seatsLeft: number;
  /** What to say when there is no room for another profile on this plan. */
  planLine: string;
}) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function pick(id: string) {
    setError(null);
    startTransition(async () => {
      const result = await switchProfile(id);
      if (result.ok) {
        router.refresh();
      } else {
        setError(result.error);
      }
    });
  }

  return (
    <section className="mb-10 max-w-[760px]">
      <h2 className="text-[13px] font-medium text-ink-2">Posting as</h2>

      <ul className="mt-2">
        {seats.map((seat) => (
          <li
            key={seat.id}
            className="flex items-baseline justify-between gap-6 border-b border-hairline py-[14px]"
          >
            <span className="text-[15px]">
              {seat.name}
              {seat.active ? (
                <span className="ml-3 text-[13px] text-ink-2">
                  this board
                </span>
              ) : null}
            </span>
            <span className="flex items-baseline gap-4 text-right">
              <span
                className={`num text-[13px] ${
                  seat.needsAttention ? "text-accent" : "text-ink-2"
                }`}
              >
                {seat.connection}
              </span>
              {seat.active ? null : (
                <button
                  type="button"
                  disabled={pending}
                  onClick={() => pick(seat.id)}
                  className="text-[13px] text-ink underline disabled:text-ink-3 disabled:no-underline"
                >
                  {pending ? "Switching" : "Post here"}
                </button>
              )}
            </span>
          </li>
        ))}
      </ul>

      {error ? (
        <p className="mt-3 text-[13px] text-ink" role="alert">
          {error}
        </p>
      ) : null}

      {seatsLeft > 0 ? (
        <p className="mt-4 text-[13px] leading-[1.5] text-ink-2">
          <a href="/api/linkedin/link" className="font-medium text-ink underline">
            Connect another LinkedIn profile
          </a>{" "}
          <span className="text-ink-3">
            {seatsLeft} of {seats.length + seatsLeft} seats free. LinkedIn
            connects whichever account your browser is signed into, so sign into
            that one first or use a private window. Use the same link to renew a
            profile whose 60 days are running out.
          </span>
        </p>
      ) : (
        <p className="mt-4 text-[13px] leading-[1.5] text-ink-2">{planLine}</p>
      )}

      <p className="mt-2 text-[13px] leading-[1.5] text-ink-3">
        Personal profiles only. Posting to a company page needs an API LinkedIn
        approves case by case, and we do not have it.
      </p>
    </section>
  );
}
