"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { saveWebsite } from "@/app/settings/actions";
import { Working } from "@/components/ui/working";

/**
 * The website the board is written from. Behind a Change link rather than an
 * always open field, because saving it rewrites the themes and principles and
 * that should be a decision, not a keystroke. The row says so before the
 * button is pressed.
 */
export function WebsiteRow({ value }: { value: string | null }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [typed, setTyped] = useState(value ?? "");
  const [error, setError] = useState<string | null>(null);
  const [busy, start] = useTransition();

  const shown = value ? value.replace(/^https?:\/\//, "").replace(/\/$/, "") : "None";

  return (
    <li className="border-b border-hairline py-[14px]">
      <div className="flex items-baseline justify-between gap-6">
        <span className="text-[13px] font-medium text-ink-2">Website</span>
        <span className="flex items-baseline gap-3">
          <span className="text-right text-[15px] break-all">{shown}</span>
          {open ? null : (
            <button
              type="button"
              onClick={() => setOpen(true)}
              className="shrink-0 text-[13px] text-ink-2 underline underline-offset-2"
            >
              Change
            </button>
          )}
        </span>
      </div>

      {open ? (
        <form
          className="mt-3 text-left"
          onSubmit={(event) => {
            event.preventDefault();
            setError(null);
            start(async () => {
              const result = await saveWebsite(typed);
              if (result.ok) {
                setOpen(false);
                router.refresh();
              } else {
                setError(result.error);
              }
            });
          }}
        >
          <p className="text-[13px] leading-[1.4] text-ink-2">
            We read the new site and rewrite your four themes and three brand
            principles from it. Ideas you have not touched are replaced with
            seven new ones. Drafts and scheduled posts stay.
          </p>
          <label htmlFor="setting-website" className="sr-only">
            Website address
          </label>
          <div className="mt-3 flex flex-wrap items-center gap-3">
            <input
              id="setting-website"
              type="text"
              inputMode="url"
              value={typed}
              placeholder="yourcompany.com"
              autoComplete="url"
              autoFocus
              disabled={busy}
              onChange={(event) => setTyped(event.target.value)}
              className="min-w-0 flex-1 rounded-[8px] border border-hairline bg-surface px-3 py-1 text-[15px] text-ink outline-none"
            />
            <button
              type="submit"
              disabled={busy || typed.trim() === ""}
              className="rounded-full border border-ink px-4 py-2 text-[13px] font-medium text-ink disabled:opacity-40"
            >
              {busy ? <Working label="Reading the site" inherit /> : "Read this site"}
            </button>
            <button
              type="button"
              disabled={busy}
              onClick={() => {
                setOpen(false);
                setTyped(value ?? "");
                setError(null);
              }}
              className="text-[13px] text-ink-2 underline underline-offset-2"
            >
              Keep it
            </button>
          </div>
          {busy ? (
            <p className="mt-3 text-[13px] text-ink-2" role="status">
              This takes about a minute. Keep this page open.
            </p>
          ) : null}
          {error ? (
            <p className="mt-3 text-[13px] text-ink" role="alert">
              {error}
            </p>
          ) : null}
        </form>
      ) : null}
    </li>
  );
}
