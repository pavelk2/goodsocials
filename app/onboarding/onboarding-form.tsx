"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Goal = "interesting" | "followers" | "traffic";

const GOALS: { id: Goal; label: string; detail: string }[] = [
  {
    id: "interesting",
    label: "Interesting content",
    detail: "Posts worth reading. Opinions, decisions, numbers nobody publishes.",
  },
  {
    id: "followers",
    label: "Grow followers",
    detail: "Broader points a stranger can follow, and might argue with.",
  },
  {
    id: "traffic",
    label: "Grow website visits",
    detail: "Every post leaves a reason to go and look. Links carry UTM tags.",
  },
];

type Step = "idle" | "reading" | "writing" | "done";

/**
 * Progress is three rows that tick off, not a spinner. The house style says no
 * spinner where a rendered state would do, and this is a 60 second wait where
 * the reader wants to know it is still working.
 */
const STEP_LINES: { key: Exclude<Step, "idle">; line: string }[] = [
  { key: "reading", line: "Reading your website and picking your themes" },
  { key: "writing", line: "Writing seven posts in your voice" },
  { key: "done", line: "Putting them on your board" },
];

export function OnboardingForm() {
  const router = useRouter();
  const [url, setUrl] = useState("");
  const [goal, setGoal] = useState<Goal>("interesting");
  const [step, setStep] = useState<Step>("idle");
  const [error, setError] = useState<string | null>(null);

  const running = step !== "idle";

  async function run(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    setStep("reading");

    try {
      const principles = await fetch("/api/onboarding/principles", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ url, goal }),
      });
      if (!principles.ok) {
        const body = await principles.json();
        throw new Error(body.error ?? "We could not read that page.");
      }

      setStep("writing");
      const ideas = await fetch("/api/onboarding/ideas", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ url }),
      });
      if (!ideas.ok) {
        const body = await ideas.json();
        throw new Error(body.error ?? "We could not write the posts.");
      }

      setStep("done");
      router.push("/board");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Something went wrong.");
      setStep("idle");
    }
  }

  const reached = (key: Exclude<Step, "idle">) =>
    STEP_LINES.findIndex((s) => s.key === key) <=
    STEP_LINES.findIndex((s) => s.key === step);

  if (running) {
    return (
      <ul className="mt-12 max-w-[520px]">
        {STEP_LINES.map(({ key, line }) => (
          <li
            key={key}
            className="flex items-center justify-between border-b border-hairline py-[14px]"
          >
            <span className={reached(key) ? "text-ink" : "text-ink-3"}>{line}</span>
            <span className="num text-[13px] text-ink-2">
              {step === key ? "working" : reached(key) ? "done" : ""}
            </span>
          </li>
        ))}
        <li className="pt-6 text-[13px] text-ink-2">
          This takes about a minute. Leaving the page stops it.
        </li>
      </ul>
    );
  }

  return (
    <form onSubmit={run} className="mt-12 max-w-[620px]">
      <label htmlFor="url" className="block text-[20px] font-semibold tracking-[-0.01em]">
        Your website
      </label>
      <p className="mt-1 text-ink-2">
        One page is enough. The one that says what you do.
      </p>
      <input
        id="url"
        name="url"
        value={url}
        onChange={(e) => setUrl(e.target.value)}
        placeholder="goodsocials.co"
        autoComplete="url"
        required
        className="mt-4 w-full rounded-[8px] border border-hairline bg-surface px-4 py-3 text-[17px] text-ink outline-none"
      />

      <fieldset className="mt-12">
        <legend className="text-[20px] font-semibold tracking-[-0.01em]">
          What are you posting for
        </legend>
        <ul className="mt-4">
          {GOALS.map((option) => (
            <li key={option.id} className="border-b border-hairline">
              <label className="flex cursor-pointer items-start gap-3 py-[14px]">
                <input
                  type="radio"
                  name="goal"
                  value={option.id}
                  checked={goal === option.id}
                  onChange={() => setGoal(option.id)}
                  className="mt-[6px] accent-accent"
                />
                <span>
                  <span className="block font-medium">{option.label}</span>
                  <span className="mt-1 block text-ink-2">{option.detail}</span>
                </span>
              </label>
            </li>
          ))}
        </ul>
      </fieldset>

      {error ? (
        <p className="mt-8 text-[15px] text-ink" role="alert">
          {error}
        </p>
      ) : null}

      <button
        type="submit"
        className="btn-ink mt-10 rounded-[14px] bg-ink px-6 py-[14px] text-[17px] font-semibold text-paper"
      >
        Write my first seven posts
      </button>
    </form>
  );
}
