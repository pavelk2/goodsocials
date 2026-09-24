"use client";

import { useState, useTransition } from "react";
import { addIdea, moreIdeas } from "@/app/board/actions";
import type { BoardTheme } from "@/lib/board";
import { Working } from "@/components/ui/working";

/** Mirrors OWN_IDEA_MAX in lib/cards.ts, which is the one that is enforced. */
const MAX = 1000;

/**
 * The two ways a card gets into Idea after onboarding: the agent plans seven
 * more, or the user writes one. Both sit at the top of the column they fill,
 * so the answer to "where do new ideas come from" is on the column itself.
 *
 * Planning takes about a minute with thinking on. The tile turns into a status
 * for that long, with the rule running, because a click that changes nothing
 * for a minute gets clicked again.
 */
export function IdeaControls({ themes }: { themes: BoardTheme[] }) {
  const [mode, setMode] = useState<"idle" | "writing">("idle");
  const [text, setText] = useState("");
  const [themeId, setThemeId] = useState("");
  const [note, setNote] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [planning, startPlanning] = useTransition();
  const [saving, startSaving] = useTransition();

  function plan() {
    setError(null);
    setNote(null);
    startPlanning(async () => {
      const result = await moreIdeas();
      if (result.ok) setNote(result.message ?? null);
      else setError(result.error);
    });
  }

  function save() {
    setError(null);
    setNote(null);
    startSaving(async () => {
      const result = await addIdea(text, themeId || null);
      if (result.ok) {
        setText("");
        setThemeId("");
        setMode("idle");
      } else {
        setError(result.error);
      }
    });
  }

  const tile =
    "rounded-[14px] border border-hairline bg-surface px-4 py-[14px] text-[13px]";

  if (planning) {
    return (
      <div className={tile}>
        <Working label="Writing seven ideas" />
        <div className="working-rule mt-3" />
        <p className="mt-3 leading-[1.4] text-ink-2">
          About a minute. They land at the bottom of this column.
        </p>
      </div>
    );
  }

  if (mode === "writing") {
    return (
      <div className={tile}>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={4}
          maxLength={MAX}
          autoFocus
          aria-label="Your idea"
          placeholder="What the post says, in a sentence or two. A number you have makes it better."
          className="w-full rounded-[8px] border border-hairline bg-paper px-3 py-2 text-[15px] leading-[1.4] text-ink outline-none placeholder:text-ink-3"
        />
        {themes.length > 0 ? (
          <select
            value={themeId}
            onChange={(e) => setThemeId(e.target.value)}
            aria-label="Theme"
            className="mt-2 w-full rounded-[8px] border border-hairline bg-paper px-2 py-[6px] text-[13px] text-ink outline-none"
          >
            <option value="">No theme</option>
            {themes.map((t) => (
              <option key={t.id} value={t.id}>
                {t.title}
              </option>
            ))}
          </select>
        ) : null}
        {saving ? <div className="working-rule mt-3" /> : null}
        <div className="mt-3 flex items-center gap-4">
          {saving ? (
            <Working label="Adding it" />
          ) : (
            <>
              <button
                type="button"
                disabled={text.trim().length < 10}
                onClick={save}
                className="font-medium text-ink underline disabled:text-ink-3 disabled:no-underline touch:min-h-11"
              >
                Add to ideas
              </button>
              <button
                type="button"
                onClick={() => {
                  setMode("idle");
                  setError(null);
                }}
                className="text-ink-2 underline touch:min-h-11"
              >
                Cancel
              </button>
            </>
          )}
        </div>
        {error ? (
          <p className="mt-3 leading-[1.4] text-ink" role="alert">
            {error}
          </p>
        ) : null}
      </div>
    );
  }

  return (
    <div className={tile}>
      <div className="flex items-center gap-4">
        <button
          type="button"
          onClick={plan}
          className="font-medium text-ink underline touch:min-h-11"
        >
          Plan 7 more ideas
        </button>
        <button
          type="button"
          onClick={() => {
            setMode("writing");
            setNote(null);
            setError(null);
          }}
          className="text-ink-2 underline touch:min-h-11"
        >
          Write your own
        </button>
      </div>
      {note ? <p className="mt-3 leading-[1.4] text-ink-2">{note}</p> : null}
      {error ? (
        <p className="mt-3 leading-[1.4] text-ink" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}
