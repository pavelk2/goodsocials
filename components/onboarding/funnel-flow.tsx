"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { saveAnswer, trackView } from "@/app/onboarding/actions";
import { FunnelHeader } from "@/components/onboarding/funnel-header";
import { QuestionScreen } from "@/components/onboarding/question-screen";
import {
  GOAL_QUESTION,
  IMAGE_QUESTION,
  NEXT_STEP,
  VOICE_QUESTION,
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
 *   website  →  image  →  voice  →  goal  →  sample (waits, then the offer)
 *
 * Each answer is saved as it is given, so a member who leaves comes back to
 * the question they left, with the research started again if it never landed.
 */

type Work = "idle" | "running" | "done" | "failed";

type Competitor = { name: string; posts: string };

const FREE_STEPS: Step[] = ["website", "image", "voice", "goal"];

const BY_STEP: Record<"image" | "voice" | "goal", Question> = {
  image: IMAGE_QUESTION,
  voice: VOICE_QUESTION,
  goal: GOAL_QUESTION,
};

export function FunnelFlow({
  initial,
  emailDomain,
  brandReady,
  themes: initialThemes,
}: {
  initial: Funnel;
  /** A website read off the member's email, offered as the first option. */
  emailDomain: string | null;
  /** Principles and themes exist, so the website does not need reading again. */
  brandReady: boolean;
  themes: string[];
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
  const [brand, setBrand] = useState<Work>(brandReady ? "done" : resumeBrand ? "running" : "idle");
  const [rivals, setRivals] = useState<Work>(
    initial.research ? "done" : resumeRivals ? "running" : "idle",
  );
  const [themes, setThemes] = useState<string[]>(initialThemes);
  const [competitors, setCompetitors] = useState<Competitor[]>(
    initial.research?.competitors ?? [],
  );
  const [gap, setGap] = useState<string | null>(initial.research?.gap ?? null);
  const [error, setError] = useState<string | null>(null);
  const [sampleError, setSampleError] = useState<string | null>(null);

  const brandJob = useRef<Promise<boolean> | null>(null);
  const rivalsJob = useRef<Promise<unknown> | null>(null);
  const saves = useRef<Promise<unknown>[]>([]);
  const sampling = useRef(false);

  useEffect(() => {
    void trackView(step);
  }, [step]);

  /**
   * The two reads. Each sets state only when its request answers, and the
   * caller marks it running, so both can start from an event or on mount.
   */
  const readBrand = useCallback((next: NonNullable<Funnel["site"]>, source?: string) => {
    brandJob.current = fetch("/api/onboarding/research", post({ ...body(next), source }))
      .then(async (res) => {
        const data = await res.json();
        if (!res.ok) throw new Error(data.error ?? "We could not read that page.");
        setThemes(data.themes ?? []);
        setBrand("done");
        return true;
      })
      .catch((cause: unknown) => {
        setBrand("failed");
        setError(cause instanceof Error ? cause.message : "We could not read that page.");
        return false;
      });
  }, []);

  const readRivals = useCallback((next: NonNullable<Funnel["site"]>) => {
    rivalsJob.current = fetch("/api/onboarding/competitors", post(body(next)))
      .then(async (res) => {
        const data = await res.json();
        if (!res.ok) throw new Error(data.error);
        setCompetitors(data.competitors ?? []);
        setGap(data.gap ?? null);
        setRivals("done");
      })
      .catch(() => setRivals("failed"));
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
      // Competitors are worth waiting for, because the sample is aimed at the
      // gap they leave. If they failed the sample route researches again.
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

  const background = (
    <Background
      site={site}
      brand={brand}
      rivals={rivals}
      themes={themes}
      competitors={competitors}
    />
  );

  return (
    <>
      <FunnelHeader label={header} />
      <main className="mx-auto w-full max-w-[760px] px-6 pb-24 pt-16">
        {step === "website" ? (
          <WebsiteScreen
            emailDomain={emailDomain}
            current={site}
            error={error}
            onSubmit={(next, source) => {
              setError(null);
              setSite(next);
              setBrand("running");
              setRivals("running");
              readBrand(next, source);
              readRivals(next);
              setStep("image");
              window.scrollTo({ top: 0 });
            }}
          />
        ) : step === "image" || step === "voice" || step === "goal" ? (
          <>
            {brand === "failed" ? (
              <p role="alert" className="mb-10 border-y border-hairline py-[14px]">
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
              aside={background}
            />
          </>
        ) : (
          <Waiting
            site={site}
            brand={brand}
            rivals={rivals}
            themes={themes}
            competitors={competitors}
            gap={gap}
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

function hostOf(site: Funnel["site"] | null): string {
  if (!site?.url) return "what you do";
  try {
    return new URL(site.url).hostname.replace(/^www\./, "");
  } catch {
    return site.url;
  }
}

/** The website question. Same shape as the others, with a field behind two rows. */
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

  useEffect(() => {
    if (mode !== "pick") field.current?.focus();
  }, [mode]);

  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      const target = event.target as HTMLElement | null;
      if (target?.tagName === "INPUT" || target?.tagName === "TEXTAREA") return;
      if (event.key === "1" && emailDomain) onSubmit({ url: `https://${emailDomain}` }, "email");
      if (event.key === "2") setMode("url");
      if (event.key === "3") setMode("none");
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [emailDomain, onSubmit]);

  return (
    <section>
      <h1 className="max-w-[22ch] text-[clamp(30px,4.6vw,48px)] font-semibold leading-[1.04] tracking-[-0.03em]">
        <span>Which website is yours?</span>{" "}
        <span className="text-ink-3">
          We read it to learn what you do and who else writes to your buyers. Your first post is
          ready in about a minute.
        </span>
      </h1>

      <ul className="mt-10">
        {emailDomain ? (
          <li className="border-y border-hairline">
            <button
              type="button"
              onClick={() => onSubmit({ url: `https://${emailDomain}` }, "email")}
              className="flex w-full items-start justify-between gap-6 py-[16px] text-left"
            >
              <span>
                <span className="block font-medium">{emailDomain}</span>
                <span className="mt-1 block text-ink-2">From your email address</span>
              </span>
              <Key n={1} />
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
                Read it
              </button>
            </form>
          ) : (
            <button
              type="button"
              onClick={() => setMode("url")}
              className="flex w-full items-start justify-between gap-6 py-[16px] text-left"
            >
              <span>
                <span className="block font-medium">
                  {emailDomain ? "Another website" : "Type your website"}
                </span>
                <span className="mt-1 block text-ink-2">The page that says what you do.</span>
              </span>
              <Key n={2} />
            </button>
          )}
        </li>

        <li className="border-b border-hairline">
          {mode === "none" ? (
            <form
              className="py-[14px]"
              onSubmit={(event) => {
                event.preventDefault();
                if (description.trim().length >= 60) {
                  onSubmit({ url: null, description: description.trim() }, "none");
                }
              }}
            >
              <label htmlFor="site-none" className="block font-medium">
                Say what you do in two sentences
              </label>
              <textarea
                ref={field}
                id="site-none"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                maxLength={1200}
                placeholder="I help B2B founders price their first product. Most of my clients sell software to finance teams."
                className="mt-3 w-full rounded-[var(--r-sm)] border border-hairline bg-surface px-4 py-3 text-ink outline-none focus:border-ink-3"
              />
              <div className="mt-3 flex items-center justify-between gap-4">
                <span className="num text-[13px] text-ink-2">
                  {description.trim().length < 60
                    ? `${60 - description.trim().length} more characters`
                    : "Enough to start"}
                </span>
                <button
                  type="submit"
                  disabled={description.trim().length < 60}
                  className="btn-ink rounded-[var(--r-btn)] bg-ink px-5 py-3 font-semibold text-paper disabled:opacity-40"
                >
                  Continue
                </button>
              </div>
            </form>
          ) : (
            <button
              type="button"
              onClick={() => setMode("none")}
              className="flex w-full items-start justify-between gap-6 py-[16px] text-left text-ink-2"
            >
              <span>I do not have one</span>
              <Key n={3} />
            </button>
          )}
        </li>
      </ul>

      {error ? (
        <p role="alert" className="mt-6 text-[15px]">
          {error}
        </p>
      ) : null}

      <p className="mt-10 text-[13px] text-ink-2">
        We read one page, once. Nothing is posted until you approve it.
      </p>
    </section>
  );
}

function Key({ n }: { n: number }) {
  return (
    <kbd className="num hidden shrink-0 rounded-[6px] border border-hairline px-[7px] py-[1px] font-sans text-[12px] text-ink-2 sm:inline-block">
      {n}
    </kbd>
  );
}

function state(work: Work, done: string): string {
  if (work === "done") return done;
  if (work === "failed") return "skipped";
  if (work === "running") return "working";
  return "";
}

/** What is running behind the questions, in rows that tick off. */
function Background({
  site,
  brand,
  rivals,
  themes,
  competitors,
}: {
  site: Funnel["site"] | null;
  brand: Work;
  rivals: Work;
  themes: string[];
  competitors: Competitor[];
}) {
  return (
    <div>
      <h2 className="text-[13px] font-medium text-ink-2">While you answer</h2>
      <ul className="mt-2 text-[15px]">
        <Row label={`Reading ${hostOf(site)}`} value={state(brand, `${themes.length} themes`)} />
        <Row
          label="Finding who else writes to your buyers"
          value={state(rivals, competitors.length ? `${competitors.length} found` : "done")}
        />
      </ul>
    </div>
  );
}

function Row({ label, value, strong }: { label: string; value: string; strong?: boolean }) {
  return (
    <li className="flex items-center justify-between gap-6 border-b border-hairline py-[12px]">
      <span className={strong || value ? "text-ink" : "text-ink-3"}>{label}</span>
      <span className={`num shrink-0 text-[13px] ${value === "working" ? "text-accent-text" : "text-ink-2"}`}>
        {value}
      </span>
    </li>
  );
}

/**
 * The minute after the last question. The research that already landed is
 * the thing to read while the post is written, because it is the first proof
 * that we looked at their market and not only at their homepage.
 */
function Waiting({
  site,
  brand,
  rivals,
  themes,
  competitors,
  gap,
  error,
  onRetry,
}: {
  site: Funnel["site"] | null;
  brand: Work;
  rivals: Work;
  themes: string[];
  competitors: Competitor[];
  gap: string | null;
  error: string | null;
  onRetry: () => void;
}) {
  const [seconds, setSeconds] = useState(0);
  useEffect(() => {
    if (error) return;
    const timer = window.setInterval(() => setSeconds((s) => s + 1), 1000);
    return () => window.clearInterval(timer);
  }, [error]);

  return (
    <section>
      <h1 className="max-w-[22ch] text-[clamp(30px,4.6vw,48px)] font-semibold leading-[1.04] tracking-[-0.03em]">
        <span>Writing your first post.</span>{" "}
        <span className="text-ink-3">
          In your voice, aimed at what nobody else in your market is saying, with its picture.
        </span>
      </h1>

      <ul className="mt-10">
        <Row label={`Read ${hostOf(site)}`} value={state(brand, "done")} />
        <Row label="Wrote four themes" value={themes.length ? "done" : state(brand, "done")} />
        <Row
          label="Found who else writes to your buyers"
          value={state(rivals, competitors.length ? `${competitors.length} found` : "done")}
        />
        <Row
          label="Writing the post and drawing its picture"
          value={error ? "stopped" : "working"}
          strong
        />
      </ul>

      {error ? (
        <div className="mt-6 flex flex-wrap items-center gap-4">
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
        <p className="num mt-6 text-[13px] text-ink-2">
          <span className="text-accent-text">
            {Math.floor(seconds / 60)}:{String(seconds % 60).padStart(2, "0")}
          </span>{" "}
          · usually about a minute. Leaving this page stops it.
        </p>
      )}

      {themes.length ? (
        <div className="mt-14">
          <h2 className="text-[13px] font-medium text-ink-2">What you will be known for</h2>
          <ul className="mt-2">
            {themes.map((title) => (
              <li key={title} className="border-b border-hairline py-[12px]">
                {title}
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      {competitors.length ? (
        <div className="mt-14">
          <h2 className="text-[13px] font-medium text-ink-2">Who else writes to your buyers</h2>
          <ul className="mt-2">
            {competitors.map((c) => (
              <li key={c.name} className="border-b border-hairline py-[12px]">
                <span className="font-medium">{c.name}</span>{" "}
                <span className="text-ink-2">{c.posts}</span>
              </li>
            ))}
          </ul>
          {gap ? (
            <p className="mt-6">
              <span className="font-medium">The gap.</span> <span className="text-ink-2">{gap}</span>
            </p>
          ) : null}
        </div>
      ) : null}
    </section>
  );
}
