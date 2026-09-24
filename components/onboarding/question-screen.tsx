"use client";

import { useEffect, useRef, useState } from "react";
import { OTHER_MAX, type Answer, type Question } from "@/lib/funnel-steps";

/**
 * One question, one screen, three answers and a quiet fourth for the member's
 * own words. Nothing else on the screen: every extra line is a reason to stop.
 * Number keys still pick an option, unlabelled, for whoever tries them. The last row is always the member's own words, which opens a field
 * in place rather than on another screen.
 *
 * A picked option moves on immediately. There is no Next button to find,
 * because the pick is the answer and a second click only asks for it twice.
 */
export function QuestionScreen({
  question,
  initial,
  onAnswer,
  busy = false,
  error,
}: {
  question: Question;
  initial?: Answer;
  onAnswer: (answer: Answer) => void;
  busy?: boolean;
  error?: string | null;
}) {
  const [other, setOther] = useState(initial?.choice === "other");
  const [text, setText] = useState(initial?.choice === "other" ? initial.text ?? "" : "");
  const input = useRef<HTMLInputElement>(null);
  const otherKey = question.options.length + 1;

  useEffect(() => {
    if (other) input.current?.focus();
  }, [other]);

  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      if (busy || event.metaKey || event.ctrlKey || event.altKey) return;
      const target = event.target as HTMLElement | null;
      if (target?.tagName === "INPUT" || target?.tagName === "TEXTAREA") return;
      const n = Number(event.key);
      if (!Number.isInteger(n) || n < 1) return;
      if (n <= question.options.length) onAnswer({ choice: question.options[n - 1].id });
      else if (n === otherKey) setOther(true);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [busy, onAnswer, otherKey, question.options]);

  const pictures = question.options.some((o) => o.preview);

  return (
    <section>
      <h1 className="max-w-[22ch] text-[clamp(30px,4.6vw,48px)] font-semibold leading-[1.04] tracking-[-0.03em]">
        {question.title}
      </h1>

      <ul className={pictures ? "mt-10 grid gap-3 sm:grid-cols-3" : "mt-10"}>
        {question.options.map((option) => {
          const chosen = initial?.choice === option.id;
          return pictures ? (
            <li key={option.id}>
              <button
                type="button"
                disabled={busy}
                onClick={() => onAnswer({ choice: option.id })}
                aria-pressed={chosen}
                className={`btn-outline block w-full overflow-hidden rounded-[var(--r-md)] border bg-surface text-left ${
                  chosen ? "border-ink" : "border-hairline"
                }`}
              >
                <Preview src={option.preview} label={option.label} />
                <span className="block p-4 font-medium">{option.label}</span>
              </button>
            </li>
          ) : (
            <li key={option.id} className="border-b border-hairline first:border-t">
              <button
                type="button"
                disabled={busy}
                onClick={() => onAnswer({ choice: option.id })}
                aria-pressed={chosen}
                className="flex w-full items-start justify-between gap-6 py-[16px] text-left"
              >
                <span>
                  <span className={`block font-medium ${chosen ? "text-accent-text" : ""}`}>
                    {option.label}
                  </span>
                  {option.detail ? (
                    <span className="mt-1 block text-ink-2">{option.detail}</span>
                  ) : null}
                </span>
              </button>
            </li>
          );
        })}
      </ul>

      <div className={pictures ? "mt-6 border-y border-hairline" : "border-b border-hairline"}>
        {other ? (
          <form
            className="flex flex-col gap-3 py-[14px] sm:flex-row sm:items-center"
            onSubmit={(event) => {
              event.preventDefault();
              if (text.trim()) onAnswer({ choice: "other", text: text.trim() });
            }}
          >
            <label htmlFor={`other-${question.step}`} className="sr-only">
              {question.other.label}
            </label>
            <input
              ref={input}
              id={`other-${question.step}`}
              value={text}
              maxLength={OTHER_MAX}
              onChange={(e) => setText(e.target.value)}
              placeholder={question.other.placeholder}
              className="min-w-0 flex-1 rounded-[var(--r-sm)] border border-hairline bg-surface px-4 py-3 text-ink outline-none focus:border-ink-3"
            />
            <button
              type="submit"
              disabled={busy || !text.trim()}
              className="btn-ink rounded-[var(--r-btn)] bg-ink px-5 py-3 font-semibold text-paper disabled:opacity-40"
            >
              Continue
            </button>
          </form>
        ) : (
          <button
            type="button"
            disabled={busy}
            onClick={() => setOther(true)}
            className="flex w-full items-center justify-between gap-6 py-[16px] text-left text-ink-2"
          >
            <span>{question.other.label}</span>
          </button>
        )}
      </div>

      {error ? (
        <p role="alert" className="mt-6 text-[15px]">
          {error}
        </p>
      ) : null}

    </section>
  );
}

/**
 * The picture that decides an image style. Generated once by
 * scripts/onboarding-styles.ts. Until it has been run the tile keeps its
 * shape and shows the name, so the question still works without it.
 */
function Preview({ src, label }: { src?: string; label: string }) {
  const [missing, setMissing] = useState(false);
  return (
    <span className="relative block aspect-[4/3] bg-paper">
      {src && !missing ? (
        // A static file from /public, drawn at its own size. next/image would
        // add a loader for three pictures that never change.
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={src}
          alt=""
          onError={() => setMissing(true)}
          // An error before hydration never reaches onError, so the element
          // is asked on mount whether it loaded.
          ref={(el) => {
            if (el?.complete && el.naturalWidth === 0) setMissing(true);
          }}
          className="absolute inset-0 h-full w-full object-cover"
        />
      ) : (
        <span className="absolute inset-0 grid place-items-center text-[13px] text-ink-3">
          {label}
        </span>
      )}
    </span>
  );
}
