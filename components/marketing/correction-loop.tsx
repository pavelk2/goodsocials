"use client";

import { useEffect, useRef, useState } from "react";
import { SourceTag } from "./data-sources";

/**
 * Section three, played once: the note is typed on a draft, the draft is
 * struck, the rule the note wrote lands in Voice, and the next post arrives
 * written under it. A skimmer watches a correction happen instead of reading
 * about one.
 *
 * The server renders the finished state, so without scripting or with reduced
 * motion the section reads complete and still. With motion, it rewinds before
 * <Reveal> shows it and plays when it scrolls into view.
 */

const BEFORE =
  "Ever wondered why so many meetings get missed? TimeTuna looked into its own bookings to find out.";
const NOTE = "Open on the number, not a question.";
const VOICE = ["Reports, does not sell."];
const LEARNED = "Opens on the number.";
const AFTER =
  "14% of 1,200 TimeTuna bookings were missed in August. A reminder two hours before cut that to 6% in a two week test. One month of data so far.";

/** 0 waiting, 1 typing the note, 2 draft struck, 3 rule learned, 4 next post. */
type Step = 0 | 1 | 2 | 3 | 4;

export function CorrectionLoop() {
  const [step, setStep] = useState<Step>(4);
  const [typed, setTyped] = useState(NOTE.length);
  const root = useRef<HTMLOListElement>(null);

  useEffect(() => {
    const el = root.current;
    if (!el || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let cancelled = false;
    const sleep = (ms: number) =>
      new Promise<void>((resolve, reject) =>
        setTimeout(() => (cancelled ? reject(new Error("stopped")) : resolve()), ms),
      );

    // Rewind while <Reveal> still has the section hidden.
    const rewind = setTimeout(() => {
      setStep(0);
      setTyped(0);
    }, 0);

    async function play() {
      await sleep(900);
      setStep(1);
      for (let i = 0; i <= NOTE.length; i += 1) {
        setTyped(i);
        await sleep(38);
      }
      await sleep(350);
      setStep(2);
      await sleep(650);
      setStep(3);
      await sleep(900);
      setStep(4);
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        observer.disconnect();
        play().catch(() => {});
      },
      { rootMargin: "0px 0px -20% 0px" },
    );
    observer.observe(el);

    return () => {
      cancelled = true;
      clearTimeout(rewind);
      observer.disconnect();
    };
  }, []);

  const shown = (on: boolean) => ({
    opacity: on ? 1 : 0,
    transform: on ? "none" : "translateY(6px)",
  });

  return (
    <ol
      ref={root}
      className="grid items-stretch gap-4 lg:grid-cols-[1fr_auto_1fr_auto_1fr]"
    >
      <li className="rv rv-2 card-lift flex flex-col rounded-[var(--r-xl)] p-6">
        <p className="num font-mono text-[12px] text-ink-2">1 · You leave a note</p>
        <article className="mt-5 rounded-[14px] border border-hairline bg-paper px-4 py-[14px] text-[14px] leading-[1.45]">
          <span
            className="transition-colors duration-500"
            style={{
              color: step >= 2 ? "var(--ink-3)" : "var(--ink)",
              textDecoration: step >= 2 ? "line-through" : "none",
            }}
          >
            {BEFORE}
          </span>
        </article>
        <div className="mt-3 flex min-h-[70px] gap-3 rounded-[14px] bg-[var(--accent-wash)] px-4 py-[14px]">
          <span
            aria-hidden="true"
            className="mt-[6px] size-[7px] shrink-0 rounded-full bg-[var(--accent)]"
          />
          <div>
            <p className="text-[14px] font-medium leading-[1.45] text-[var(--accent-on-wash)]">
              {NOTE.slice(0, typed)}
              {step === 1 ? (
                <span className="ml-px inline-block h-[14px] w-[1.5px] translate-y-[2px] bg-accent" />
              ) : null}
            </p>
            <p
              className="mt-1 font-mono text-[10.5px] text-ink-2 transition-opacity duration-500"
              style={{ opacity: step >= 2 ? 1 : 0 }}
            >
              You · Revise
            </p>
          </div>
        </div>
      </li>

      <li aria-hidden="true" className="rv rv-3 hidden items-center text-ink-3 lg:flex">
        →
      </li>

      <li className="rv rv-3 card-lift flex flex-col rounded-[var(--r-xl)] p-6">
        <p className="num font-mono text-[12px] text-ink-2">2 · It becomes a rule</p>
        <div className="mt-5 grow rounded-[14px] border border-hairline bg-paper px-4 py-[14px]">
          <p className="font-mono text-[11px] text-ink-3">VOICE</p>
          <ul className="mt-3 space-y-2 text-[15px] leading-[1.45]">
            {VOICE.map((line) => (
              <li key={line}>{line}</li>
            ))}
            <li
              className="transition-[opacity,transform] duration-700"
              style={{ ...shown(step >= 3), transitionTimingFunction: "var(--ease)" }}
            >
              <span className="rounded-[4px] bg-[var(--accent-wash)] px-[4px] text-[var(--accent-on-wash)]">
                {LEARNED}
              </span>
              <span className="ml-2 font-mono text-[10.5px] text-ink-3">new</span>
            </li>
          </ul>
        </div>
      </li>

      <li aria-hidden="true" className="rv rv-4 hidden items-center text-ink-3 lg:flex">
        →
      </li>

      <li className="rv rv-4 card-lift flex flex-col rounded-[var(--r-xl)] p-6">
        <p className="num font-mono text-[12px] text-ink-2">3 · Every next post follows it</p>
        <article className="relative mt-5 grow rounded-[14px] border border-hairline bg-surface px-4 py-[14px] text-[14px] leading-[1.45]">
          <p
            aria-hidden="true"
            className="absolute inset-x-4 top-[14px] font-mono text-[12px] text-ink-3 transition-opacity duration-500"
            style={{ opacity: step >= 4 ? 0 : 1 }}
          >
            Next post, waiting on the rule
          </p>
          <div
            className="transition-[opacity,transform] duration-700"
            style={{ ...shown(step >= 4), transitionTimingFunction: "var(--ease)" }}
          >
            {AFTER}
            <p className="mt-2 flex items-center gap-[6px] font-mono text-[10.5px] text-ink-3">
              Your numbers <SourceTag kind="posthog" />
            </p>
          </div>
        </article>
      </li>
    </ol>
  );
}
