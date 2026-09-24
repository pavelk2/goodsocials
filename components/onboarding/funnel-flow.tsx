"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { saveAnswer, trackView } from "@/app/onboarding/actions";
import { FunnelHeader } from "@/components/onboarding/funnel-header";
import { QuestionScreen } from "@/components/onboarding/question-screen";
import {
  CONTENT_QUESTION,
  GOAL_QUESTION,
  IMAGE_QUESTION,
  NEXT_STEP,
  type Answer,
  type Funnel,
  type Question,
  type QuestionStep,
  type Step,
} from "@/lib/funnel-steps";

/**
 * The free half of the funnel, in one client component, because its point is
 * that two things happen at once: the member answers three questions while
 * the website and the competitors are read behind them. Splitting it across
 * pages would stop the reads on every navigation.
 *
 *   website  →  image  →  content  →  goal  →  sample (waits, then the offer)
 *
 * The research is never shown while it runs. Every screen is one question and
 * its answers, and the wait is one line, because each extra row is something
 * to read instead of something to answer.
 *
 * Each answer is saved as it is given, so a member who leaves comes back to
 * the question they left, with the research started again if it never landed.
 */

const FREE_STEPS: Step[] = ["website", "image", "content", "goal"];

const BY_STEP: Record<"image" | "content" | "goal", Question> = {
  image: IMAGE_QUESTION,
  content: CONTENT_QUESTION,
  goal: GOAL_QUESTION,
};

export function FunnelFlow({
  initial,
  emailDomain,
  brandReady,
}: {
  initial: Funnel;
  /** A website read off the member's email, offered as the first answer. */
  emailDomain: string | null;
  /** Principles and themes exist, so the website does not need reading again. */
  brandReady: boolean;
}) {
  const router = useRouter();
  const site0 = initial.site ?? null;
  // Coming back mid-funnel with no website stored means the read never
  // started, and the only way to start it is to ask again.
  const resumeBrand = initial.step !== "website" && !brandReady && Boolean(site0);
  const resumeRivals = initial.step !== "website" && !initial.research && Boolean(site0);
  const [step, setStep] = useState<Step>(
    initial.step !== "website" && !brandReady && !site0 ? "website" : initial.step,
  );
  const [answers, setAnswers] = useState(initial.answers);
  const [site, setSite] = useState(site0);
  const [brandFailed, setBrandFailed] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sampleError, setSampleError] = useState<string | null>(null);

  const brandJob = useRef<Promise<boolean> | null>(null);
  const rivalsJob = useRef<Promise<unknown> | null>(null);
  const saves = useRef<Promise<unknown>[]>([]);
  const sampling = useRef(false);

  useEffect(() => {
    void trackView(step);
  }, [step]);

  /** The two reads. Each sets state only when its request answers. */
  const readBrand = useCallback((next: NonNullable<Funnel["site"]>, source?: string) => {
    brandJob.current = fetch("/api/onboarding/research", post({ ...body(next), source }))
      .then(async (res) => {
        const data = await res.json();
        if (!res.ok) throw new Error(data.error ?? "We could not read that page.");
        return true;
      })
      .catch((cause: unknown) => {
        setBrandFailed(true);
        setError(cause instanceof Error ? cause.message : "We could not read that page.");
        return false;
      });
  }, []);

  const readRivals = useCallback((next: NonNullable<Funnel["site"]>) => {
    // Failure is fine here: the sample route researches again.
    rivalsJob.current = fetch("/api/onboarding/competitors", post(body(next))).catch(() => null);
  }, []);

  const writeSample = useCallback(async () => {
    if (sampling.current) return;
    sampling.current = true;
    try {
      await Promise.allSettled(saves.current);
      const brandOk = brandJob.current ? await brandJob.current : true;
      if (!brandOk) {
        setStep("website");
        return;
      }
      // The market research is the sample, so it is worth waiting for.
      if (rivalsJob.current) await Promise.allSettled([rivalsJob.current]);

      const res = await fetch("/api/onboarding/sample", { method: "POST" });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error ?? "Your first post did not write.");
      router.refresh();
    } catch (cause) {
      setSampleError(cause instanceof Error ? cause.message : "Your first post did not write.");
    } finally {
      sampling.current = false;
    }
  }, [router]);

  // Coming back mid-funnel: start whatever never finished. Once, on mount.
  useEffect(() => {
    if (resumeBrand && site0) readBrand(site0);
    if (resumeRivals && site0) readRivals(site0);
    // Deferred a tick: writeSample sets state once its requests answer.
    if (initial.step === "sample") void Promise.resolve().then(writeSample);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function answer(questionStep: QuestionStep, value: Answer) {
    setAnswers((prev) => ({ ...prev, [questionStep]: value }));
    const next = NEXT_STEP[questionStep];
    saves.current.push(saveAnswer(questionStep, value));
    setStep(next);
    window.scrollTo({ top: 0 });
    if (next === "sample") void writeSample();
  }

  const position = FREE_STEPS.indexOf(step);
  const header = position >= 0 ? `${position + 1} of ${FREE_STEPS.length}` : null;

  return (
    <>
      <FunnelHeader label={header} />
      <main className="mx-auto w-full max-w-[640px] px-6 pb-24 pt-20">
        {step === "website" ? (
          <WebsiteScreen
            emailDomain={emailDomain}
            current={site}
            error={error}
            onSubmit={(next, source) => {
              setError(null);
              setBrandFailed(false);
              setSite(next);
              readBrand(next, source);
              readRivals(next);
              setStep("image");
              window.scrollTo({ top: 0 });
            }}
          />
        ) : step === "image" || step === "content" || step === "goal" ? (
          <>
            {brandFailed ? (
              <p role="alert" className="mb-10">
                {error}{" "}
                <button type="button" className="underline" onClick={() => setStep("website")}>
                  Change the website
                </button>
              </p>
            ) : null}
            <QuestionScreen
              key={step}
              question={BY_STEP[step]}
              initial={answers[step]}
              onAnswer={(value) => answer(step, value)}
            />
          </>
        ) : (
          <Waiting
            error={sampleError}
            onRetry={() => {
              setSampleError(null);
              void writeSample();
            }}
          />
        )}
      </main>
    </>
  );
}

function body(site: NonNullable<Funnel["site"]>) {
  return {
    url: site.url ?? undefined,
    description: site.description,
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
  };
}

function post(payload: unknown): RequestInit {
  return {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(payload),
  };
}

const ROW = "flex w-full items-center justify-between gap-6 py-[18px] text-left font-medium";

/** The website question, in the same shape as the others: three answers. */
function WebsiteScreen({
  emailDomain,
  current,
  error,
  onSubmit,
}: {
  emailDomain: string | null;
  current: Funnel["site"] | null;
  error: string | null;
  onSubmit: (site: NonNullable<Funnel["site"]>, source: string) => void;
}) {
  const [mode, setMode] = useState<"pick" | "url" | "none">(
    current?.description ? "none" : current?.url || !emailDomain ? "url" : "pick",
  );
  const [url, setUrl] = useState(current?.url ?? "");
  const [description, setDescription] = useState(current?.description ?? "");
  const field = useRef<HTMLInputElement & HTMLTextAreaElement>(null);
  const enough = description.trim().length >= 60;

  useEffect(() => {
    if (mode !== "pick") field.current?.focus();
  }, [mode]);

  return (
    <section>
      <h1 className="text-[clamp(30px,4.6vw,48px)] font-semibold leading-[1.04] tracking-[-0.03em]">
        Which website is yours?
      </h1>

      <ul className="mt-10">
        {emailDomain ? (
          <li className="border-y border-hairline">
            <button
              type="button"
              onClick={() => onSubmit({ url: `https://${emailDomain}` }, "email")}
              className={ROW}
            >
              {emailDomain}
            </button>
          </li>
        ) : null}

        <li className={`border-b border-hairline ${emailDomain ? "" : "border-t"}`}>
          {mode === "url" ? (
            <form
              className="flex flex-col gap-3 py-[14px] sm:flex-row"
              onSubmit={(event) => {
                event.preventDefault();
                if (url.trim()) onSubmit({ url: url.trim() }, "typed");
              }}
            >
              <label htmlFor="site-url" className="sr-only">
                Website address
              </label>
              <input
                ref={field}
                id="site-url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="yourcompany.com"
                autoComplete="url"
                inputMode="url"
                className="min-w-0 flex-1 rounded-[var(--r-sm)] border border-hairline bg-surface px-4 py-3 text-[17px] text-ink outline-none focus:border-ink-3"
              />
              <button
                type="submit"
                disabled={!url.trim()}
                className="btn-ink rounded-[var(--r-btn)] bg-ink px-5 py-3 font-semibold text-paper disabled:opacity-40"
              >
                Continue
              </button>
            </form>
          ) : (
            <button type="button" onClick={() => setMode("url")} className={ROW}>
              {emailDomain ? "Another website" : "Type your website"}
            </button>
          )}
        </li>

        <li className="border-b border-hairline">
          {mode === "none" ? (
            <form
              className="py-[14px]"
              onSubmit={(event) => {
                event.preventDefault();
                if (enough) onSubmit({ url: null, description: description.trim() }, "none");
              }}
            >
              <label htmlFor="site-none" className="sr-only">
                What you do
              </label>
              <textarea
                ref={field}
                id="site-none"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                maxLength={1200}
                placeholder="Two sentences. What you do, and who it is for."
                className="w-full rounded-[var(--r-sm)] border border-hairline bg-surface px-4 py-3 text-ink outline-none focus:border-ink-3"
              />
              <button
                type="submit"
                disabled={!enough}
                className="btn-ink mt-3 rounded-[var(--r-btn)] bg-ink px-5 py-3 font-semibold text-paper disabled:opacity-40"
              >
                Continue
              </button>
            </form>
          ) : (
            <button
              type="button"
              onClick={() => setMode("none")}
              className={`${ROW} font-normal text-ink-2`}
            >
              I do not have one
            </button>
          )}
        </li>
      </ul>

      {error ? (
        <p role="alert" className="mt-6 text-[15px]">
          {error}
        </p>
      ) : null}
    </section>
  );
}

/**
 * The half minute after the last question. One sentence and a clock. The clock is
 * the accent because it is the one thing on the screen that moves.
 */
function Waiting({ error, onRetry }: { error: string | null; onRetry: () => void }) {
  const [seconds, setSeconds] = useState(0);
  useEffect(() => {
    if (error) return;
    const timer = window.setInterval(() => setSeconds((s) => s + 1), 1000);
    return () => window.clearInterval(timer);
  }, [error]);

  return (
    <section>
      <h1 className="text-[clamp(30px,4.6vw,48px)] font-semibold leading-[1.04] tracking-[-0.03em]">
        Writing your first post.
      </h1>

      {error ? (
        <div className="mt-8 flex flex-wrap items-center gap-4">
          <p role="alert">{error}</p>
          <button
            type="button"
            onClick={onRetry}
            className="btn-ink rounded-[var(--r-btn)] bg-ink px-5 py-3 font-semibold text-paper"
          >
            Try again
          </button>
        </div>
      ) : (
        <p className="num mt-6 text-ink-2">
          <span className="text-accent-text">
            {Math.floor(seconds / 60)}:{String(seconds % 60).padStart(2, "0")}
          </span>{" "}
          About half a minute.
        </p>
      )}
    </section>
  );
}
