"use client";

import { useState, useTransition } from "react";
import { savePrinciple } from "@/app/board/actions";
import { Working } from "@/components/ui/working";
import type { Principles } from "@/lib/agent/principles";

/**
 * Rows, not cards. Three boxes with icons is the pattern the house style bans,
 * and the reason these sit on the board at all is so a comment on a card and
 * the principle it changes are legible in the same glance.
 */
const ROWS = [
  { kind: "voice", label: "Voice" },
  { kind: "visual", label: "Visual" },
  { kind: "format", label: "Format" },
  { kind: "reader", label: "Reader" },
] as const;

/**
 * The body of the brand principles sheet. The sheet draws its own title and
 * Close, so this is rows and nothing else.
 */
export function PrinciplesPanel({
  principles,
}: {
  principles: Principles;
}) {
  return (
    <div>
      <ul className="space-y-5">
        {ROWS.map((row) => (
          <PrincipleRow
            key={row.kind}
            kind={row.kind}
            label={row.label}
            text={principles[row.kind] ?? ""}
          />
        ))}
      </ul>
      <p className="mt-6 text-[13px] text-ink-3">
        Four at most. A comment on a card updates the one it is about.
      </p>
    </div>
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
    <li>
      <div className="flex items-baseline justify-between gap-4">
        <p className="text-[13px] font-medium text-ink-2">{label}</p>
        {editing ? (
          <span className="flex gap-4 text-[13px]">
            <button
              type="button"
              onClick={save}
              disabled={pending}
              className="btn-quiet font-medium text-ink underline"
            >
              {pending ? <Working label="Saving" /> : "Save"}
            </button>
            <button
              type="button"
              onClick={() => {
                setValue(saved);
                setError(null);
                setEditing(false);
              }}
              className="btn-quiet text-ink-2 underline"
            >
              Cancel
            </button>
          </span>
        ) : (
          <button
            type="button"
            onClick={() => setEditing(true)}
            className="btn-quiet text-[13px] text-ink-2 underline"
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
        <p className={`mt-1 text-[15px] leading-[1.4] ${saved ? "" : "text-ink-3"}`}>
          {saved || "Not named yet. Level 3 asks who your posts are for."}
        </p>
      )}

      {error ? (
        <p className="mt-2 text-[13px] text-ink" role="alert">
          {error}
        </p>
      ) : null}
    </li>
  );
}
