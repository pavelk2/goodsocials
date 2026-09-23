"use client";

import { useRef, useState, useTransition } from "react";
import { clearHistory, importHistory } from "@/app/settings/actions";
import { IMPORT_CHUNK, parseShares } from "@/lib/history";

/**
 * Reads Shares.csv out of the member's LinkedIn archive and puts what it
 * holds on the calendar.
 *
 * The file is parsed here, in the browser, and sent in chunks. An archive of
 * ten years is megabytes and a server action body is capped at 1MB, so
 * uploading the file would fail on exactly the accounts worth importing.
 * Nothing leaves the browser except the most recent posts, already trimmed.
 */
export function HistoryImport({
  count,
  limit,
}: {
  /** How many are stored for this profile right now. */
  count: number;
  /** How many this profile keeps. The parser trims to it before sending. */
  limit: number;
}) {
  const input = useRef<HTMLInputElement>(null);
  const [status, setStatus] = useState<string | null>(null);
  const [failed, setFailed] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [busy, start] = useTransition();

  async function read(file: File) {
    setFailed(false);
    setStatus("Reading the file.");

    const parsed = parseShares(await file.text(), limit);
    if (parsed.error) {
      setFailed(true);
      setStatus(parsed.error);
      return;
    }
    if (parsed.rows.length === 0) {
      setFailed(true);
      setStatus("That file held no posts with any text in them.");
      return;
    }

    let added = 0;
    for (let i = 0; i < parsed.rows.length; i += IMPORT_CHUNK) {
      const chunk = parsed.rows.slice(i, i + IMPORT_CHUNK);
      setStatus(`Importing ${i + chunk.length} of ${parsed.rows.length}.`);
      const result = await importHistory(chunk);
      if (!result.ok) {
        setFailed(true);
        setStatus(result.error);
        return;
      }
      added += result.added;
    }

    // Already there is the normal answer on a second import, and it is the
    // answer somebody adding this month's posts is hoping for.
    setStatus(
      added === 0
        ? `Those ${parsed.rows.length} posts were already here.`
        : `${added} posts are on the calendar.`,
    );
  }

  return (
    <div className="mt-4">
      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          disabled={busy}
          onClick={() => input.current?.click()}
          className="rounded-full border border-hairline px-4 py-2 text-[13px] font-medium hover:border-ink-2 disabled:opacity-50"
        >
          Choose Shares.csv
        </button>

        {count > 0 ? (
          confirming ? (
            <button
              type="button"
              disabled={busy}
              onClick={() =>
                start(async () => {
                  const result = await clearHistory();
                  setConfirming(false);
                  setFailed(!result.ok);
                  setStatus(
                    result.ok
                      ? "Removed. Your posts are still on LinkedIn."
                      : result.error,
                  );
                })
              }
              className="text-[13px] text-ink underline"
            >
              Remove all of them?
            </button>
          ) : (
            <button
              type="button"
              onClick={() => setConfirming(true)}
              className="text-[13px] text-ink-2 underline"
            >
              Remove
            </button>
          )
        ) : null}
      </div>

      <input
        ref={input}
        type="file"
        accept=".csv,text/csv"
        className="hidden"
        onChange={(event) => {
          const file = event.target.files?.[0];
          // Cleared so choosing the same file twice still fires a change.
          event.target.value = "";
          if (file) start(() => read(file));
        }}
      />

      {status ? (
        <p
          role="status"
          className={`mt-3 text-[13px] ${failed ? "text-ink" : "text-ink-2"}`}
        >
          {status}
        </p>
      ) : null}
    </div>
  );
}
