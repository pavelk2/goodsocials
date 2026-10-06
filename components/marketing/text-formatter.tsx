"use client";

import Link from "next/link";
import { useRef, useState } from "react";
import {
  POST_LIMIT,
  applyStyle,
  plain,
  postLength,
  type TextStyle,
} from "@/lib/text-style";
import { DEFAULT_PLAN } from "@/lib/plans";

const BUTTONS: { label: string; style: TextStyle | "plain"; sample: string }[] = [
  { label: "Bold", style: "bold", sample: applyStyle("B", "bold") },
  { label: "Italic", style: "italic", sample: applyStyle("I", "italic") },
  { label: "Bold italic", style: "boldItalic", sample: applyStyle("BI", "boldItalic") },
  { label: "Plain", style: "plain", sample: "Aa" },
];

const START = `${applyStyle("Paste your post here", "bold")}

Select a word and press Bold or Italic. The preview below cuts where a phone shows "see more".`;

/**
 * The editor: a textarea, four buttons that restyle the selection, a counter
 * and a phone-width preview clamped at three lines, which is about where the
 * feed folds a post on a phone. Nothing leaves the browser.
 */
export function TextFormatter() {
  const [text, setText] = useState(START);
  const [copied, setCopied] = useState(false);
  const area = useRef<HTMLTextAreaElement>(null);

  function restyle(style: TextStyle | "plain") {
    const el = area.current;
    if (!el) return;
    const { selectionStart: from, selectionEnd: to } = el;
    // No selection restyles the whole post, which is what a heading-less
    // paste usually wants undone.
    const [a, b] = from === to ? [0, text.length] : [from, to];
    const part = text.slice(a, b);
    const next = style === "plain" ? plain(part) : applyStyle(part, style);
    const updated = text.slice(0, a) + next + text.slice(b);
    setText(updated);
    setCopied(false);
    requestAnimationFrame(() => {
      el.focus();
      el.setSelectionRange(a, a + next.length);
    });
  }

  async function copy() {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
    } catch {
      area.current?.select();
    }
  }

  const length = postLength(text);
  const over = length > POST_LIMIT;

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_380px]">
      <div>
        <div className="flex flex-wrap gap-2">
          {BUTTONS.map((button) => (
            <button
              key={button.label}
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => restyle(button.style)}
              className="pill btn-outline border border-hairline bg-surface px-4 py-2 text-[14px]"
            >
              <span aria-hidden="true" className="mr-2 text-ink-2">
                {button.sample}
              </span>
              {button.label}
            </button>
          ))}
        </div>
        <label htmlFor="post" className="sr-only">
          Your LinkedIn post
        </label>
        <textarea
          id="post"
          ref={area}
          value={text}
          onChange={(e) => {
            setText(e.target.value);
            setCopied(false);
          }}
          rows={14}
          className="mt-4 w-full rounded-[var(--r-md)] border border-hairline bg-surface p-4 text-[16px] leading-[1.5] text-ink outline-none focus:border-ink-3"
        />
        <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
          <p
            className={`num font-mono text-[12px] ${over ? "text-accent-text" : "text-ink-2"}`}
            aria-live="polite"
          >
            {length.toLocaleString("en-US")} of {POST_LIMIT.toLocaleString("en-US")}{" "}
            characters
            {over ? ", over the limit LinkedIn allows" : ""}
          </p>
          <button
            type="button"
            onClick={copy}
            className="pill btn-accent px-5 py-2 text-[15px]"
          >
            {copied ? "Copied" : "Copy post"}
          </button>
        </div>
      </div>

      <div>
        <p className="font-mono text-[11px] uppercase tracking-[0.12em] text-ink-3">
          Preview, phone width
        </p>
        <div className="mt-4 max-w-[380px] rounded-[var(--r-md)] border border-hairline bg-surface p-4">
          <p className="line-clamp-3 whitespace-pre-line text-[14px] leading-[1.45] text-ink">
            {text}
          </p>
          <p className="mt-1 text-right text-[14px] text-ink-2">...see more</p>
        </div>
        <p className="mt-4 text-[14px] leading-[1.5] text-ink-2">
          Want the post written too?{" "}
          <Link
            href={`/signin?plan=${DEFAULT_PLAN.slug}`}
            className="underline underline-offset-4"
          >
            See seven posts written for your profile
          </Link>
          .
        </p>
      </div>
    </div>
  );
}
