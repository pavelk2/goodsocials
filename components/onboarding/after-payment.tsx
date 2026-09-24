"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { pickIdeas, saveAnswer } from "@/app/onboarding/actions";
import { FunnelHeader } from "@/components/onboarding/funnel-header";
import { QuestionScreen } from "@/components/onboarding/question-screen";
import { OTHER_MAX, REFINE_QUESTION, type Answer } from "@/lib/funnel-steps";
import type { PostKind } from "@/lib/post-kind";

/**
 * The two questions after payment. Both are the product's own mechanics shown
 * once, on purpose: the first is a correction that becomes a principle, the
 * second is the Idea column with a choice in front of it. By the time the
 * board opens, the member has already used both.
 */

export function Refine({
  imageUrl,
  imageAlt,
  initial,
}: {
  imageUrl: string | null;
  imageAlt: string | null;
  initial?: Answer;
}) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);

  return (
    <>
      <FunnelHeader label="1 of 2" />
      <main className="mx-auto w-full max-w-[640px] px-6 pb-24 pt-20">
        {imageUrl ? (
          // The picture on their first post, from Vercel Blob.
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={imageUrl}
            alt={imageAlt ?? ""}
            className="mb-10 aspect-[4/3] w-full max-w-[420px] rounded-[var(--r-md)] object-cover"
          />
        ) : null}
        <QuestionScreen
          question={REFINE_QUESTION}
          initial={initial}
          busy={pending}
          error={error}
          onAnswer={(answer) =>
            start(async () => {
              const result = await saveAnswer("refine", answer);
              if (!result.ok) setError(result.error);
              else router.refresh();
            })
          }
        />
      </main>
    </>
  );
}

export type IdeaRow = { id: string; idea: string; title: string | null; kind: PostKind; theme: string | null; needs: string | null };

export function PickIdeas({ ideas }: { ideas: IdeaRow[] }) {
  const [picked, setPicked] = useState<Set<string>>(() => new Set(ideas.map((i) => i.id)));
  const [own, setOwn] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();
  const count = picked.size + (own.trim() ? 1 : 0);

  function toggle(id: string) {
    setPicked((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  return (
    <>
      <FunnelHeader label="2 of 2" />
      <main className="mx-auto w-full max-w-[640px] px-6 pb-24 pt-20">
        <h1 className="text-[clamp(30px,4.6vw,48px)] font-semibold leading-[1.04] tracking-[-0.03em]">
          Which should we write?
        </h1>

        <ul className="mt-10">
          {ideas.map((row) => (
            <li key={row.id} className="border-b border-hairline first:border-t">
              <label className="flex cursor-pointer items-start gap-4 py-[16px]">
                <input
                  type="checkbox"
                  checked={picked.has(row.id)}
                  onChange={() => toggle(row.id)}
                  className="mt-[6px] h-4 w-4 shrink-0 accent-accent"
                />
                <span className={picked.has(row.id) ? "" : "text-ink-3"}>{row.title ?? row.idea}</span>
              </label>
            </li>
          ))}
          <li className="border-b border-hairline py-[16px]">
            <label htmlFor="own-idea" className="sr-only">
              Your own idea
            </label>
            <input
              id="own-idea"
              value={own}
              maxLength={OTHER_MAX}
              onChange={(e) => setOwn(e.target.value)}
              placeholder="Your own idea"
              className="mt-3 w-full rounded-[var(--r-sm)] border border-hairline bg-surface px-4 py-3 text-ink outline-none focus:border-ink-3"
            />
          </li>
        </ul>

        {error ? (
          <p role="alert" className="mt-6 text-[15px]">
            {error}
          </p>
        ) : null}

        <button
          type="button"
          disabled={pending || count === 0}
          onClick={() =>
            start(async () => {
              const result = await pickIdeas([...picked], own);
              if (result && !result.ok) setError(result.error);
            })
          }
          className="pill btn-ink mt-10 bg-ink px-6 py-[14px] text-[17px] font-semibold text-paper disabled:opacity-40"
        >
          {pending ? "Opening the board" : `Write ${count} ${count === 1 ? "post" : "posts"}`}
        </button>
      </main>
    </>
  );
}
