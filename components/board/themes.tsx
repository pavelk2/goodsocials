"use client";

import { useState, useTransition } from "react";
import { saveTheme } from "@/app/board/actions";
import { Working } from "@/components/ui/working";

/**
 * Rows, not cards, for the same reason the principles are rows: a theme is a
 * label and a sentence, which is the shape a row is for.
 *
 * They sit in the same sheet as the principles because they answer the other
 * half of the same question. The principles say how this person sounds; the
 * themes say what they are allowed to be about, and a reader deciding whether
 * a card belongs on the board needs both on screen at once.
 */
export type ThemeRow = {
  id: string;
  title: string;
  description: string;
};

export function ThemesPanel({ themes }: { themes: ThemeRow[] }) {
  if (themes.length === 0) {
    return (
      <p className="text-[15px] leading-[1.4] text-ink-2">
        No themes yet. They are written from your website when you set the board
        up.
      </p>
    );
  }

  return (
    <div>
      <ul className="space-y-5">
        {themes.map((theme) => (
          <Row key={theme.id} theme={theme} />
        ))}
      </ul>
      <p className="mt-6 text-[13px] text-ink-3">
        Ideas are dealt across these, so no one theme takes the whole week.
      </p>
    </div>
  );
}

function Row({ theme }: { theme: ThemeRow }) {
  const [editing, setEditing] = useState(false);
  const [title, setTitle] = useState(theme.title);
  const [description, setDescription] = useState(theme.description);
  const [saved, setSaved] = useState({
    title: theme.title,
    description: theme.description,
  });
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function save() {
    setError(null);
    startTransition(async () => {
      const result = await saveTheme(theme.id, title, description);
      if (result.ok) {
        setSaved({ title: title.trim(), description: description.trim() });
        setEditing(false);
      } else {
        setError(result.error);
      }
    });
  }

  function cancel() {
    setTitle(saved.title);
    setDescription(saved.description);
    setError(null);
    setEditing(false);
  }

  return (
    <li>
      <div className="flex items-baseline justify-between gap-4">
        {editing ? (
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            autoFocus
            aria-label="Theme name"
            className="min-w-0 flex-1 rounded-[8px] border border-hairline bg-surface px-2 py-1 text-[13px] font-medium text-ink outline-none"
          />
        ) : (
          <p className="text-[13px] font-medium text-ink-2">{saved.title}</p>
        )}

        {editing ? (
          <span className="flex shrink-0 gap-4 text-[13px]">
            <button
              type="button"
              onClick={save}
              disabled={pending}
              className="btn-quiet font-medium text-ink underline touch:-m-3 touch:p-3"
            >
              {pending ? <Working label="Saving" /> : "Save"}
            </button>
            <button
              type="button"
              onClick={cancel}
              className="btn-quiet text-ink-2 underline touch:-m-3 touch:p-3"
            >
              Cancel
            </button>
          </span>
        ) : (
          <button
            type="button"
            onClick={() => setEditing(true)}
            className="btn-quiet shrink-0 text-[13px] text-ink-2 underline touch:-m-3 touch:p-3"
          >
            Edit
          </button>
        )}
      </div>

      {editing ? (
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={3}
          aria-label="What this theme covers"
          className="mt-2 w-full rounded-[8px] border border-hairline bg-surface px-3 py-2 text-[15px] leading-[1.4] text-ink outline-none"
        />
      ) : (
        <p className="mt-1 text-[15px] leading-[1.4]">{saved.description}</p>
      )}

      {error ? (
        <p className="mt-2 text-[13px] text-ink" role="alert">
          {error}
        </p>
      ) : null}
    </li>
  );
}
