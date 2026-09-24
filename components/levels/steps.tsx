"use client";

import { useEffect, useState, useTransition, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import {
  chooseProof,
  keepRules,
  readerOptions,
  ruleOptions,
  saveReader,
  voiceFromArchive,
  voiceFromText,
  type StepResult,
} from "@/app/levels/actions";
import type { ProposedRule, ReaderOption } from "@/lib/agent/levels";
import { HistoryImport } from "@/components/settings/history-import";
import { ThemesPanel, type ThemeRow } from "@/components/board/themes";
import { Working } from "@/components/ui/working";

/**
 * The next step, one per level, in the funnel's shape: one question, three
 * options, and a way to say it in your own words. Picking an option opens what
 * it needs underneath it and nothing else.
 */

const OPTION =
  "btn-outline flex w-full items-start justify-between gap-4 rounded-[14px] border bg-surface px-4 py-[14px] text-left text-[15px]";
const PRIMARY =
  "btn-ink rounded-[10px] bg-ink px-4 py-2 text-[14px] font-medium text-paper disabled:opacity-50";
const FIELD =
  "mt-3 w-full rounded-[10px] border border-hairline bg-surface px-3 py-2 text-[15px] leading-[1.45] text-ink outline-none focus:border-ink-3";

function Frame({
  question,
  sub,
  children,
}: {
  question: string;
  sub: string;
  children: ReactNode;
}) {
  return (
    <div>
      <p className="mb-2 text-[12px] font-medium text-accent-text">Next step</p>
      <h2 className="text-[22px] font-semibold leading-[1.25] tracking-[-0.02em]">
        {question}
      </h2>
      <p className="mb-4 mt-1 text-[14px] text-ink-2">{sub}</p>
      {children}
    </div>
  );
}

function Option({
  selected,
  onSelect,
  title,
  detail,
  aside,
  children,
}: {
  selected: boolean;
  onSelect: () => void;
  title: string;
  detail?: string;
  aside?: ReactNode;
  children?: ReactNode;
}) {
  return (
    <div className="mb-2">
      <button
        type="button"
        aria-expanded={selected}
        onClick={onSelect}
        className={`${OPTION} ${selected ? "border-accent" : "border-hairline"}`}
        style={selected ? { boxShadow: "0 0 0 1px var(--accent)" } : undefined}
      >
        <span>
          {title}
          {detail ? <span className="block text-[13px] text-ink-2">{detail}</span> : null}
        </span>
        {aside}
      </button>
      {selected && children ? <div className="px-1 pb-2 pt-1">{children}</div> : null}
    </div>
  );
}

/** Sends one answer and says what happened, in the words the server used. */
function useAnswer() {
  const [pending, start] = useTransition();
  const [result, setResult] = useState<StepResult | null>(null);
  function send(run: () => Promise<StepResult>) {
    setResult(null);
    start(async () => setResult(await run()));
  }
  return { pending, result, send };
}

function Outcome({ result }: { result: StepResult | null }) {
  if (!result) return null;
  return (
    <p className={`mt-3 text-[13px] ${result.ok ? "text-ink-2" : "text-ink"}`} role="status">
      {result.ok ? result.message : result.error}
    </p>
  );
}

/* Level 2 */

export function VoiceStep({ archived, archiveLimit }: { archived: number; archiveLimit: number }) {
  const [choice, setChoice] = useState<string | null>(null);
  const [text, setText] = useState("");
  const { pending, result, send } = useAnswer();

  const pick = (c: string) => {
    setChoice(c === choice ? null : c);
    setText("");
  };

  const pasteBox = (placeholder: string, source: string) => (
    <>
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        rows={8}
        placeholder={placeholder}
        className={FIELD}
      />
      <button
        type="button"
        disabled={pending}
        onClick={() => send(() => voiceFromText(source, text))}
        className={`${PRIMARY} mt-3`}
      >
        {pending ? <Working label="Rewriting your voice" inherit /> : "Rewrite my voice"}
      </button>
    </>
  );

  return (
    <Frame
      question="Give us writing that sounds like you."
      sub="Your voice was read off your homepage. Your own words are better. Pick one, it takes a minute."
    >
      <Option
        selected={choice === "archive"}
        onSelect={() => pick("archive")}
        title="Import your LinkedIn archive"
        detail={
          archived > 0
            ? `${archived} of your posts are here already.`
            : "LinkedIn settings, Data privacy, Get a copy of your data. Then Shares.csv."
        }
      >
        <HistoryImport count={archived} limit={archiveLimit} />
        <button
          type="button"
          disabled={pending}
          onClick={() => send(voiceFromArchive)}
          className={`${PRIMARY} mt-4`}
        >
          {pending ? <Working label="Reading your posts" inherit /> : "Rewrite my voice from these posts"}
        </button>
      </Option>

      <Option
        selected={choice === "own"}
        onSelect={() => pick("own")}
        title="Paste three things you wrote"
        detail="Posts, emails, a talk. Anything in your own words."
      >
        {pasteBox("Paste each one with a blank line between them.", "own")}
      </Option>

      <Option
        selected={choice === "admired"}
        onSelect={() => pick("admired")}
        title="Paste three posts you wish you had written"
        detail="By anyone. We copy how they sound, never what they say."
      >
        {pasteBox("Paste each one with a blank line between them.", "admired")}
      </Option>

      <Option
        selected={choice === "described"}
        onSelect={() => pick("described")}
        title="Or say it in your own words"
      >
        {pasteBox("Short sentences. Numbers over adjectives. Never sounds like an ad.", "described")}
      </Option>

      <Outcome result={result} />
    </Frame>
  );
}

/* Level 3 */

export function ReaderStep({ themes }: { themes: ThemeRow[] }) {
  const [readers, setReaders] = useState<ReaderOption[] | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [choice, setChoice] = useState<string | null>(null);
  const [text, setText] = useState("");
  const { pending, result, send } = useAnswer();

  useEffect(() => {
    let live = true;
    readerOptions().then((r) => {
      if (!live) return;
      if (r.ok) setReaders(r.readers);
      else setLoadError(r.error);
    });
    return () => {
      live = false;
    };
  }, []);

  return (
    <Frame
      question="Who should stop scrolling for your posts?"
      sub="Posts are written for everyone right now, which means for nobody in particular."
    >
      {readers === null && !loadError ? (
        <p className="py-3 text-[14px] text-ink-2">
          <Working label="Writing three readers from your site" />
        </p>
      ) : null}

      {readers?.map((r, i) => (
        <Option
          key={r.title}
          selected={choice === `r${i}`}
          onSelect={() => {
            setChoice(`r${i}`);
            setText(r.text);
          }}
          title={r.title}
          detail={r.text}
        />
      ))}
      {loadError ? <p className="mb-2 text-[13px] text-ink-2">{loadError}</p> : null}

      <Option
        selected={choice === "own"}
        onSelect={() => {
          setChoice("own");
          setText("");
        }}
        title="Or say it in your own words"
      />

      {choice ? (
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={4}
          placeholder="Founders of 10 to 50 person software companies who still run sales themselves."
          className={FIELD}
        />
      ) : null}

      <div className="mt-6 border-t border-hairline pt-5">
        <h3 className="mb-1 text-[15px] font-medium">And your four themes</h3>
        <p className="mb-4 text-[13px] text-ink-2">
          Guessed from your homepage. Edit any that are not what you want to be known for.
        </p>
        <ThemesPanel themes={themes} />
      </div>

      <button
        type="button"
        disabled={pending || !choice}
        onClick={() => send(() => saveReader(choice === "own" ? "own" : "suggested", text))}
        className={`${PRIMARY} mt-5`}
      >
        {pending ? <Working label="Saving" inherit /> : "Save reader and themes"}
      </button>
      <Outcome result={result} />
    </Frame>
  );
}

/* Level 4 */

export function ProofStep({ sources, openNeeds }: { sources: string[]; openNeeds: number }) {
  const router = useRouter();
  const [choice, setChoice] = useState<string | null>(null);
  const [text, setText] = useState("");
  const { pending, result, send } = useAnswer();

  const go = (c: "source" | "questions") =>
    send(async () => {
      const r = await chooseProof(c);
      if (r.ok && r.href) router.push(r.href);
      return r;
    });

  return (
    <Frame
      question="Where do your numbers live?"
      sub="A receipt lands when the figure is real. Pick one, it takes a minute."
    >
      <Option
        selected={choice === "source"}
        onSelect={() => setChoice("source")}
        title="Connect a source"
        detail={
          sources.length > 0
            ? `${sources.join(", ")} connected. Add another or carry on.`
            : "Stripe, GitHub, PostHog, Plausible or Notion. Read only."
        }
      >
        <button type="button" disabled={pending} onClick={() => go("source")} className={PRIMARY}>
          {pending ? <Working label="Opening" inherit /> : "Open integrations"}
        </button>
      </Option>

      <Option
        selected={choice === "questions"}
        onSelect={() => setChoice("questions")}
        title={
          openNeeds > 0
            ? `Answer the ${openNeeds} open ${openNeeds === 1 ? "question" : "questions"}`
            : "Answer the questions on your cards"
        }
        detail={
          openNeeds > 0
            ? "Each card says the number it is waiting on. Revise it with the answer."
            : "None are open right now. Receipts ask as they come up."
        }
      >
        <button type="button" disabled={pending} onClick={() => go("questions")} className={PRIMARY}>
          {pending ? <Working label="Opening" inherit /> : "Go to the board"}
        </button>
      </Option>

      <Option
        selected={choice === "number"}
        onSelect={() => setChoice("number")}
        title="Give us a number you are proud of"
        detail="We write a receipt around it and put it on top of your ideas."
      >
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={3}
          placeholder="Churn fell from 6.1 to 3.8 percent after onboarding calls became mandatory in June."
          className={FIELD}
        />
        <button
          type="button"
          disabled={pending}
          onClick={() => send(() => chooseProof("number", text))}
          className={`${PRIMARY} mt-3`}
        >
          {pending ? <Working label="Adding" inherit /> : "Add it as a receipt"}
        </button>
      </Option>

      <Outcome result={result} />
    </Frame>
  );
}

/* Level 5 */

type Draft = ProposedRule & { keep: boolean };

export function RulesStep() {
  const [rules, setRules] = useState<Draft[] | null>(null);
  const [comments, setComments] = useState(0);
  const [loadError, setLoadError] = useState<string | null>(null);
  const { pending, result, send } = useAnswer();

  useEffect(() => {
    let live = true;
    ruleOptions().then((r) => {
      if (!live) return;
      if (r.ok) {
        setRules(r.rules.map((rule) => ({ ...rule, keep: true })));
        setComments(r.comments);
      } else {
        setLoadError(r.error);
      }
    });
    return () => {
      live = false;
    };
  }, []);

  const update = (i: number, patch: Partial<Draft>) =>
    setRules((list) => list?.map((r, j) => (j === i ? { ...r, ...patch } : r)) ?? null);

  return (
    <Frame
      question="These are the corrections you make most. Keep them as rules?"
      sub="A kept rule goes into your principles, so the next draft never needs the same comment."
    >
      {rules === null && !loadError ? (
        <p className="py-3 text-[14px] text-ink-2">
          <Working label="Reading your corrections" />
        </p>
      ) : null}
      {loadError ? <p className="text-[13px] text-ink">{loadError}</p> : null}

      {rules && rules.length === 0 ? (
        <p className="py-2 text-[14px] text-ink-2">
          {comments < 2
            ? `You have corrected ${comments} ${comments === 1 ? "draft" : "drafts"} so far. Rules come from corrections that repeat, and none do.`
            : "None of your corrections repeat. Nothing to keep."}
        </p>
      ) : null}

      <ul>
        {rules?.map((r, i) => (
          <li key={i} className="mb-2 rounded-[14px] border border-hairline px-4 py-3">
            <textarea
              value={r.rule}
              onChange={(e) => update(i, { rule: e.target.value })}
              rows={2}
              disabled={!r.keep}
              className="w-full resize-none bg-transparent text-[15px] leading-[1.4] outline-none disabled:text-ink-3"
            />
            <div className="mt-1 flex items-center justify-between text-[13px] text-ink-2">
              <span>
                Goes into {r.kind}. Seen in {r.seen} comments.
              </span>
              <button
                type="button"
                onClick={() => update(i, { keep: !r.keep })}
                className="btn-quiet text-ink underline"
              >
                {r.keep ? "Drop" : "Keep"}
              </button>
            </div>
          </li>
        ))}
      </ul>

      {rules !== null ? (
        <button
          type="button"
          disabled={pending}
          onClick={() =>
            send(() => keepRules(rules.filter((r) => r.keep).map(({ rule, kind }) => ({ rule, kind }))))
          }
          className={`${PRIMARY} mt-3`}
        >
          {pending ? (
            <Working label="Saving" inherit />
          ) : rules.some((r) => r.keep) ? (
            "Keep these rules"
          ) : (
            "Continue without rules"
          )}
        </button>
      ) : null}
      <Outcome result={result} />
    </Frame>
  );
}

/* States with no question */

export function StepDone({ text }: { text: string }) {
  return (
    <div>
      <p className="mb-2 text-[12px] font-medium text-accent-text">Next step</p>
      <p className="text-[17px] leading-[1.4]">{text}</p>
    </div>
  );
}

export function NextLater({ level, name, next }: { level: number; name: string; next: string }) {
  return (
    <div>
      <p className="mb-2 text-[12px] font-medium text-ink-2">Level {level}, {name}</p>
      <p className="text-[17px] leading-[1.4]">
        Level {level} will ask you to {next}. That step is not built yet. Your board keeps
        running as it is until it opens.
      </p>
    </div>
  );
}
