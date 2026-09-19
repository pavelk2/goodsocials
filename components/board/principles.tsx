"use client";

import { useState, useTransition } from "react";
import { savePrinciple } from "@/app/board/actions";

/**
 * Rows, not cards. Three boxes with icons is the pattern the house style bans,
 * and the reason these sit on the board at all is so a comment on a card and
 * the principle it changes are legible in the same glance.
 */
const ROWS = [
  { kind: "voice", label: "Voice" },
  { kind: "visual", label: "Visual" },
  { kind: "format", label: "Format" },
] as const;

/**
 * Closed by default. The principles are what makes a correction stick, and they
 * are still the thing a user edits least often, so they open on request and the
 * board starts at the top of the screen. One row closed, three rows open.
 */
export function Principles({
  principles,
}: {
  principles: { voice: string; visual: string; format: string };
}) {
  const [open, setOpen] = useState(false);

  return (
    <section className="mb-8 max-w-[760px]">
      <div className="flex items-baseline justify-between gap-4 border-b border-hairline py-[14px]">
        <h2 className="text-[13px] font-medium text-ink-2">
          Brand principles{" "}
          <span className="font-normal text-ink-3">voice, visual, format</span>
        </h2>
        <button
          type="button"
          onClick={() => setOpen((shown) => !shown)}
          aria-expanded={open}
          aria-controls="brand-principles"
          className="text-[13px] text-ink-2 underline"
        >
          {open ? "Hide" : "Show"}
        </button>
      </div>

      {open ? (
        <div id="brand-principles">
          <ul>
            {ROWS.map((row) => (
              <PrincipleRow
                key={row.kind}
                kind={row.kind}
                label={row.label}
                text={principles[row.kind]}
              />
            ))}
          </ul>
          <p className="mt-3 text-[13px] text-ink-3">
            Three, and only three. A comment on a card updates the one it is
            about.
          </p>
        </div>
      ) : null}
    </section>
  );
}

function PrincipleRow({
  kind,
  label,
  text,
}: {
  kind: string;
  label: string;
  text: string;
}) {
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState(text);
  const [saved, setSaved] = useState(text);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function save() {
    setError(null);
    startTransition(async () => {
      const result = await savePrinciple(kind, value);
      if (result.ok) {
        setSaved(value.trim());
        setEditing(false);
      } else {
        setError(result.error);
      }
    });
  }

  return (
    <li className="border-b border-hairline py-[14px]">
      <div className="flex items-baseline justify-between gap-4">
        <p className="text-[13px] font-medium text-ink-2">{label}</p>
        {editing ? (
          <span className="flex gap-4 text-[13px]">
            <button
              type="button"
              onClick={save}
              disabled={pending}
              className="font-medium text-ink underline"
            >
              {pending ? "Saving" : "Save"}
            </button>
            <button
              type="button"
              onClick={() => {
                setValue(saved);
                setError(null);
                setEditing(false);
              }}
              className="text-ink-2 underline"
            >
              Cancel
            </button>
          </span>
        ) : (
          <button
            type="button"
            onClick={() => setEditing(true)}
            className="text-[13px] text-ink-2 underline"
          >
            Edit
          </button>
        )}
      </div>

      {editing ? (
        <textarea
          value={value}
          onChange={(e) => setValue(e.target.value)}
          rows={4}
          autoFocus
          className="mt-2 w-full rounded-[8px] border border-hairline bg-surface px-3 py-2 text-[15px] leading-[1.4] text-ink outline-none"
        />
      ) : (
        <p className="mt-1 text-[15px] leading-[1.4]">{saved}</p>
      )}

      {error ? (
        <p className="mt-2 text-[13px] text-ink" role="alert">
          {error}
        </p>
      ) : null}
    </li>
  );
}
