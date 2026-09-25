"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import type { SourceKind } from "@/lib/integrations/types";
import { RefTag, SourcePills, SourceTag } from "./data-sources";
import { Streak } from "./streak";

/**
 * The hero: one card crossing the board, from a reading in the member's own
 * tools to a post on their feed. Idea, Draft, Image, Approve, Scheduled,
 * Posted, then it starts again.
 *
 * The board is an example, TimeTuna's, written in the house voice for posts:
 * third person, a sample size and a caveat on every claim. The figures on it
 * are illustrative until TimeTuna's own replace them.
 *
 * Movement between columns is FLIP: the card is re-parented into its next
 * column, then animated from where it was to where it is, so the layout is the
 * real one at every frame and nothing is positioned by hand. Reduced motion
 * gets the last frame, standing still.
 */

type Kind = "Research" | "Deep dive" | "Your numbers";

/** The image the agent drew for a post. Abstract on purpose: a stock photo is the fastest way to look like AI slop. Styles in globals.css. */
type Art = "blobs" | "rings" | "dots";

type Static = {
  id: string;
  body: string;
  kind: Kind;
  sources: SourceKind[];
  /** Citations, for research and deep dives. */
  refs?: string[];
  when?: string;
  art?: Art;
};

const COLUMNS: { name: string; cards: Static[] }[] = [
  {
    name: "Idea",
    cards: [
      {
        id: "competitors",
        body: "Of 12 scheduling tools compared this month, 9 put round-robin behind a paid tier. Two moved it there last quarter.",
        kind: "Research",
        sources: [],
        refs: ["12 pricing pages"],
      },
      {
        id: "week-one",
        body: "The most frequent week-one question from new TimeTuna users, coded from 1,200 support threads. It points somewhere the roadmap had not looked.",
        kind: "Deep dive",
        sources: ["notion"],
      },
    ],
  },
  {
    name: "Draft",
    cards: [
      {
        id: "deploys",
        body: "Failed deploys per release fell about 62% after one CI rule. Small sample, 11 releases. Encouraging so far.",
        kind: "Your numbers",
        sources: ["github"],
      },
    ],
  },
  {
    name: "Image",
    cards: [
      {
        id: "slots",
        body: "Why TimeTuna shows 3 slots: choice overload, 25 years on. One famous jam study against a meta-analysis of 50 experiments.",
        kind: "Deep dive",
        sources: [],
        refs: ["Iyengar & Lepper, 2000", "Scheibehenne et al., 2010"],
        art: "dots",
      },
    ],
  },
  {
    name: "Scheduled",
    cards: [
      {
        id: "annual",
        body: "31% of August signups chose annual, up from 19% in July. Two candidate causes, neither confirmed.",
        kind: "Your numbers",
        sources: ["stripe"],
        when: "Wed 09:00",
        art: "blobs",
      },
    ],
  },
  {
    name: "Posted",
    cards: [
      {
        id: "shipping",
        body: "14 deploys a week, and weekly signups held steady. Correlation for now. The causal story is still being checked.",
        kind: "Your numbers",
        sources: ["github", "plausible"],
        art: "rings",
      },
    ],
  },
];

const TITLE = "TimeTuna reschedules: 18% in May, 7% in August";
const BODY =
  "One change in between: the invite now shows the guest's timezone first. n = 9,412 meetings. Seasonality could explain part of it, so a holdout runs in October. Early read, a promising one. Next question: no-shows.";
const BARS = [
  { month: "May", value: 18 },
  { month: "Jun", value: 15 },
  { month: "Jul", value: 11 },
  { month: "Aug", value: 7 },
];
const READING: SourceKind[] = ["posthog", "stripe"];

/**
 * -1 nothing yet, 0 the sources are read and the finding lands, 1 idea,
 * 2 draft, 3 image, 4 approve, 5 scheduled, 6 posted.
 */
type Stage = -1 | 0 | 1 | 2 | 3 | 4 | 5 | 6;
const COLUMN_AT: Record<Stage, number> = { [-1]: -1, 0: 0, 1: 0, 2: 1, 3: 2, 4: 2, 5: 3, 6: 4 };
const LABEL: Record<Stage, string> = {
  [-1]: "",
  0: "",
  1: "Idea",
  2: "Draft",
  3: "Image",
  4: "Image",
  5: "Scheduled",
  6: "Posted",
};

type Frame = { stage: Stage; typed: number; bars: boolean; pressed: boolean; toast: boolean };
const START: Frame = { stage: -1, typed: 0, bars: false, pressed: false, toast: false };
const END: Frame = { stage: 6, typed: BODY.length, bars: true, pressed: false, toast: false };

export function HeroBoard() {
  const [frame, setFrame] = useState<Frame>(START);
  const board = useRef<HTMLDivElement>(null);
  const scroller = useRef<HTMLDivElement>(null);
  const rects = useRef(new Map<string, DOMRect>());
  const column = COLUMN_AT[frame.stage];
  const lastColumn = useRef(column);

  useEffect(() => {
    // The server cannot know the preference, so the still frame arrives one
    // tick after hydration rather than during it.
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      const still = setTimeout(() => setFrame(END), 0);
      return () => clearTimeout(still);
    }

    let cancelled = false;
    let visible = true;
    const observer = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
    });
    if (board.current) observer.observe(board.current);

    const sleep = (ms: number) =>
      new Promise<void>((resolve, reject) =>
        setTimeout(() => (cancelled ? reject(new Error("stopped")) : resolve()), ms),
      );
    const set = (next: Partial<Frame>) => setFrame((f) => ({ ...f, ...next }));

    async function loop() {
      for (;;) {
        while (!visible || document.hidden) await sleep(400);
        setFrame(START);
        await sleep(700);
        set({ stage: 0 });
        await sleep(1900);
        set({ stage: 1 });
        await sleep(1500);
        set({ stage: 2 });
        await sleep(600);
        for (let i = 0; i <= BODY.length; i += 3) {
          set({ typed: i });
          await sleep(22);
        }
        set({ typed: BODY.length });
        await sleep(900);
        set({ stage: 3 });
        await sleep(500);
        set({ bars: true });
        await sleep(1500);
        set({ stage: 4 });
        await sleep(1100);
        set({ pressed: true });
        await sleep(300);
        set({ pressed: false });
        await sleep(250);
        set({ stage: 5 });
        await sleep(1900);
        set({ stage: 6, toast: true });
        await sleep(3600);
        set({ toast: false });
        await sleep(600);
      }
    }
    loop().catch(() => {});

    return () => {
      cancelled = true;
      observer.disconnect();
    };
  }, []);

  // FLIP. Every card on the board is measured after each commit. When the card
  // changes column, whatever moved is animated from its old box to its new one.
  useLayoutEffect(() => {
    const root = board.current;
    if (!root) return;
    const moved = lastColumn.current !== column;
    lastColumn.current = column;
    const next = new Map<string, DOMRect>();
    root.querySelectorAll<HTMLElement>("[data-flip]").forEach((el) => {
      const id = el.dataset.flip!;
      const box = el.getBoundingClientRect();
      next.set(id, box);
      const before = rects.current.get(id);
      if (!moved || !before) return;
      const dx = before.left - box.left;
      const dy = before.top - box.top;
      if (Math.abs(dx) < 1 && Math.abs(dy) < 1) return;
      el.animate(
        [{ transform: `translate(${dx}px, ${dy}px)` }, { transform: "translate(0, 0)" }],
        { duration: id === "hero" ? 850 : 600, easing: "cubic-bezier(0.32, 0.72, 0, 1)" },
      );
    });
    rects.current = next;

    // On a phone the board scrolls sideways. Keep the moving card in view.
    const scroll = scroller.current;
    if (moved && column >= 0 && scroll && scroll.scrollWidth > scroll.clientWidth) {
      const target = scroll.children[column] as HTMLElement | undefined;
      if (target) {
        const left =
          target.getBoundingClientRect().left -
          scroll.getBoundingClientRect().left +
          scroll.scrollLeft -
          16;
        scroll.scrollTo({ left, behavior: "smooth" });
      }
    }
  });

  const posted = frame.stage === 6 ? 19 : 18;

  return (
    <div>
      <SourcePills reading={frame.stage === 0 ? READING : []} />

      <div
        ref={board}
        className="relative mt-7 rounded-[var(--r-2xl)] px-3 pb-6 pt-5 sm:px-6"
        style={{
          background:
            "linear-gradient(175deg, var(--accent-wash) 0%, var(--paper) 78%)",
          // Browsers keep a card near the top of the screen still by scrolling
          // the window when it moves. Every card here moves on purpose, so none
          // of them may be that anchor, or the page scrolls itself.
          overflowAnchor: "none",
        }}
      >
        <div className="flex flex-wrap items-center justify-between gap-3 px-2 pb-4">
          <p className="text-[13px]">
            <span className="font-semibold">TimeTuna.com - scheduling service</span>
            <span className="text-ink-2"> · example board · goal: inbound leads</span>
          </p>
          <p className="num flex items-center gap-3 font-mono text-[12px] text-ink-2">
            September
            <Streak posted={posted} size={30} />
            <span style={{ color: frame.stage === 6 ? "var(--accent-text)" : undefined }}>
              {posted} posted
            </span>
          </p>
        </div>

        {/* A fixed height, so a card growing or crossing the board never
            moves anything below the hero. What runs past the bottom fades. */}
        <div className="relative h-[540px] overflow-hidden">
        <div
          ref={scroller}
          className="grid h-full snap-x grid-cols-[repeat(5,minmax(220px,1fr))] gap-3 overflow-x-auto overflow-y-hidden pb-1 lg:grid-cols-5 lg:overflow-hidden"
        >
          {COLUMNS.map((col, i) => {
            const here = column === i;
            return (
              <section key={col.name} className="snap-start">
                <header className="flex items-center justify-between px-1 pb-2 text-[12px] font-medium">
                  <h3>{col.name}</h3>
                  <span
                    className="num font-mono font-normal transition-colors"
                    style={{ color: here && frame.stage > 0 ? "var(--accent-text)" : "var(--ink-3)" }}
                  >
                    {col.cards.length + (here && frame.stage > 0 ? 1 : 0)}
                  </span>
                </header>
                <div className="flex flex-col gap-2">
                  {here && frame.stage === 0 ? <FactChip /> : null}
                  {here && frame.stage > 0 ? <HeroCard frame={frame} /> : null}
                  {col.cards.map((card) => (
                    <article
                      key={card.id}
                      data-flip={card.id}
                      className="rounded-[12px] border border-hairline bg-surface px-[13px] py-3 text-[13px] leading-[1.42]"
                    >
                      {card.art ? (
                        <div aria-hidden="true" className={`art art-${card.art} mb-3`} />
                      ) : null}
                      {card.body}
                      <Meta kind={card.kind} sources={card.sources} refs={card.refs} when={card.when} />
                    </article>
                  ))}
                </div>
              </section>
            );
          })}
        </div>

        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 bottom-0 h-20"
          style={{ background: "linear-gradient(to bottom, transparent, var(--paper))" }}
        />
        </div>

        <div
          aria-hidden={!frame.toast}
          className="absolute bottom-6 right-6 z-10 flex items-center gap-3 rounded-[14px] bg-surface px-4 py-3 text-[13px] transition-[opacity,transform] duration-500"
          style={{
            boxShadow: "var(--shadow)",
            opacity: frame.toast ? 1 : 0,
            transform: frame.toast ? "none" : "translateY(8px)",
          }}
        >
          <LinkedInMark />
          <div>
            <p className="font-semibold">Live on LinkedIn</p>
            <p className="font-mono text-[11px] text-ink-2">TimeTuna founder · just now</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function Meta({
  kind,
  sources,
  refs = [],
  when,
}: {
  kind: Kind;
  sources: SourceKind[];
  refs?: string[];
  when?: string;
}) {
  return (
    <div className="mt-2 flex flex-wrap items-center gap-[6px] font-mono text-[10.5px] text-ink-3">
      {kind}
      {sources.map((kind) => (
        <SourceTag key={kind} kind={kind} />
      ))}
      {refs.map((label) => (
        <RefTag key={label} label={label} />
      ))}
      {when ? <span className="num ml-auto text-ink-2">{when}</span> : null}
    </div>
  );
}

function FactChip() {
  return (
    <p className="chip-in self-start rounded-full bg-[var(--panel)] px-[14px] py-2 font-mono text-[12px] text-[var(--panel-ink)]">
      reschedule_rate <span style={{ color: "var(--accent-panel)" }}>18% → 7%</span>
    </p>
  );
}

function HeroCard({ frame }: { frame: Frame }) {
  const { stage, typed, bars, pressed } = frame;
  return (
    <article
      data-flip="hero"
      className="relative z-[1] rounded-[12px] border border-hairline bg-surface px-[14px] py-[13px] text-[13.5px] leading-[1.45] transition-shadow duration-500"
      style={{
        boxShadow:
          stage === 6 ? "0 0 0 1.5px var(--accent), var(--lift)" : "var(--shadow)",
      }}
    >
      <div
        className="grid transition-[grid-template-rows,margin] duration-700"
        style={{
          gridTemplateRows: stage >= 3 ? "1fr" : "0fr",
          marginBottom: stage >= 3 ? 10 : 0,
        }}
      >
        <div className="overflow-hidden">
          <Chart grown={bars} />
        </div>
      </div>

      <p className="font-mono text-[10.5px] uppercase tracking-[0.02em] text-accent-text">
        {LABEL[stage]} · Your numbers
      </p>
      <p className="mt-[6px] font-semibold tracking-[-0.01em]">{TITLE}</p>
      {stage >= 2 ? (
        <p className={`mt-[6px] ${stage >= 3 ? "line-clamp-2" : ""}`}>
          {BODY.slice(0, typed)}
          {typed < BODY.length ? (
            <span className="ml-px inline-block h-[14px] w-[1.5px] translate-y-[2px] bg-accent" />
          ) : null}
        </p>
      ) : null}
      <Meta kind="Your numbers" sources={READING} />

      {stage === 4 ? (
        <div className="mt-3 grid grid-cols-3 gap-[5px] text-center text-[11.5px]">
          <span
            className="truncate rounded-full bg-accent px-1 py-1 font-medium text-accent-ink transition-[transform,box-shadow] duration-200"
            style={{
              transform: pressed ? "scale(0.92)" : "none",
              boxShadow: pressed ? "0 0 0 6px var(--accent-wash)" : "none",
            }}
          >
            Approve
          </span>
          <span className="truncate rounded-full border border-hairline px-1 py-1">Revise</span>
          <span className="truncate rounded-full border border-hairline px-1 py-1">Reject</span>
        </div>
      ) : null}

      {stage >= 5 ? (
        <p className="mt-2 font-mono text-[10.5px] text-ink-2">
          {stage === 5 ? "Publishes " : "Posted "}
          <span className="num font-medium" style={{ color: stage === 6 ? "var(--accent-text)" : "var(--ink)" }}>
            Tue 09:00
          </span>
          {stage === 6 ? " ↗" : null}
        </p>
      ) : null}
    </article>
  );
}

/** The image the agent made for this post: the reading, drawn. */
function Chart({ grown }: { grown: boolean }) {
  return (
    <div
      className="relative h-[106px] rounded-[9px] px-3 pt-[10px]"
      style={{
        background:
          "radial-gradient(circle at 88% 110%, var(--accent) 0, transparent 55%), radial-gradient(circle at 10% 0%, var(--art-violet) 0, transparent 45%), var(--art-ink)",
      }}
    >
      <p className="font-mono text-[9.5px] uppercase text-[var(--panel-ink-2)]">
        Reschedule rate
      </p>
      <div className="absolute inset-x-3 bottom-[10px] flex h-[52px] items-end gap-[10px]">
        {BARS.map((bar, i) => {
          const last = i === BARS.length - 1;
          return (
            <div
              key={bar.month}
              className="relative flex-1 rounded-[4px_4px_2px_2px] transition-[height] duration-1000"
              style={{
                height: grown ? bar.value * 2.4 : 0,
                transitionDelay: `${i * 140}ms`,
                transitionTimingFunction: "var(--ease)",
                background: last
                  ? "linear-gradient(to top, var(--accent), var(--art-coral), var(--art-sun))"
                  : "linear-gradient(to top, rgba(255, 255, 255, 0.08), rgba(255, 255, 255, 0.22))",
              }}
            >
              <span
                className="num absolute -top-4 left-0 whitespace-nowrap font-mono text-[10px]"
                style={{ color: last ? "var(--art-sun)" : "var(--panel-ink-2)" }}
              >
                {bar.value}%
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/** LinkedIn's mark, in its own blue, because this is the one place the page says where the post went. */
function LinkedInMark() {
  return (
    <svg viewBox="0 0 448 512" fill="currentColor" aria-hidden="true" className="h-[18px] w-[18px] text-[var(--linkedin)]">
      <path d="M100.28 448H7.4V148.9h92.88zM53.79 108.1C24.09 108.1 0 83.5 0 53.8a53.79 53.79 0 0 1 107.58 0c0 29.7-24.1 54.3-53.79 54.3zM447.9 448h-92.68V302.4c0-34.7-.7-79.2-48.29-79.2-48.29 0-55.69 37.7-55.69 76.7V448h-92.78V148.9h89.08v40.8h1.3c12.4-23.5 42.69-48.3 87.88-48.3 94 0 111.28 61.9 111.28 142.3V448z" />
    </svg>
  );
}
