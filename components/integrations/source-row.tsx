"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Sheet } from "@/components/ui/sheet";
import { SourceIcon } from "@/components/integrations/source-icon";
import { KIND_LABEL } from "@/lib/post-kind";
import type { SourceDefinition } from "@/lib/integrations/types";
import type { SourceResult } from "@/app/integrations/actions";

/**
 * One integration, as a row.
 *
 * Rows rather than cards, because five boxes with a logo at the top of each is
 * the exact pattern the house style bans and the exact pattern every
 * integrations page ships. The mark is a leading glyph, ink when the source is
 * connected and light grey when it is not, so the state of the row is carried by
 * the weight of its first object rather than by a badge.
 *
 * A connected source shows its readings underneath, in the dashboard's row
 * shape: label left, value right, tabular numerals, hairline between. That list
 * is the one thing worth looking at on this screen, because it is literally what
 * the next post will be built from.
 */

export type Reading = {
  key: string;
  label: string;
  value: string;
  detail: string | null;
  period: string | null;
};

export type Connected = {
  status: "active" | "broken";
  handle: string | null;
  lastSyncedLabel: string | null;
  lastError: string | null;
  /** Every reading is past its shelf life, so none of them reach a draft. */
  stale: boolean;
};

/** Six is enough to prove the connection works without becoming a report. */
const READINGS_SHOWN = 6;

export function SourceRow({
  definition,
  connected,
  readings,
  connect,
  refresh,
  disconnect,
}: {
  definition: SourceDefinition;
  connected: Connected | null;
  readings: Reading[];
  connect: (
    kind: string,
    values: { credential: string; handle?: string; host?: string },
  ) => Promise<SourceResult>;
  refresh: (kind: string) => Promise<SourceResult>;
  disconnect: (kind: string) => Promise<SourceResult>;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [note, setNote] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function run(work: () => Promise<SourceResult>) {
    setError(null);
    setNote(null);
    startTransition(async () => {
      const result = await work();
      if (result.ok) {
        setNote(result.message);
        setOpen(false);
        router.refresh();
      } else {
        setError(result.error);
      }
    });
  }

  const live = connected !== null;

  return (
    <li className="border-b border-hairline py-[14px]">
      <div className="flex items-start justify-between gap-6">
        <div className="flex min-w-0 items-start gap-3">
          <SourceIcon
            kind={definition.kind}
            /* 2px down puts the mark's optical centre on the first line of
               17px text rather than above it. */
            className={`mt-[3px] shrink-0 ${live ? "text-ink" : "text-ink-3"}`}
          />
          <div className="min-w-0">
            <p className="text-[17px] font-medium leading-[1.2] tracking-[-0.01em]">
              {definition.name}
            </p>
            <p className="mt-[3px] text-[13px] leading-[1.4] text-ink-2">
              {definition.reads}
            </p>
            <p className="mt-[2px] text-[13px] leading-[1.4] text-ink-3">
              Feeds {definition.serves.map((k) => KIND_LABEL[k].toLowerCase()).join(" and ")} posts.
            </p>
          </div>
        </div>

        <div className="flex shrink-0 flex-col items-end gap-1">
          {live ? (
            <>
              <span className="num text-[13px] text-ink-2">
                {readings.length === 0
                  ? "No readings yet"
                  : connected.stale
                    ? `${readings.length} stale`
                    : `${readings.length} ${readings.length === 1 ? "reading" : "readings"}`}
                {connected.lastSyncedLabel ? `, read ${connected.lastSyncedLabel}` : ""}
              </span>
              <span className="flex items-center gap-3">
                <button
                  type="button"
                  disabled={pending}
                  onClick={() => run(() => refresh(definition.kind))}
                  className="btn-quiet text-[13px] font-medium text-ink-2 disabled:opacity-50"
                >
                  {pending ? "Working" : "Read now"}
                </button>
                <button
                  type="button"
                  disabled={pending}
                  onClick={() => setOpen(true)}
                  className="btn-quiet text-[13px] font-medium text-ink-2 disabled:opacity-50"
                >
                  Replace key
                </button>
                <button
                  type="button"
                  disabled={pending}
                  onClick={() => run(() => disconnect(definition.kind))}
                  className="btn-quiet text-[13px] font-medium text-ink-2 disabled:opacity-50"
                >
                  Disconnect
                </button>
              </span>
            </>
          ) : (
            <button
              type="button"
              onClick={() => setOpen(true)}
              className="btn-outline rounded-[14px] border border-hairline bg-surface px-4 py-[7px] text-[15px] font-medium text-ink"
            >
              Connect {definition.name}
            </button>
          )}
        </div>
      </div>

      {/* Two different failures, said in two different places. A source that
          refused us says so in the API's own words. A source whose readings
          aged out says what that costs, because the numbers are still sitting
          on the screen underneath and otherwise look usable. */}
      {connected?.stale ? (
        <p
          className="mt-3 max-w-[560px] text-[13px] leading-[1.4] text-ink"
          role="status"
        >
          These readings are more than a week old, so drafts have stopped using
          them and will ask you for the number instead. Read now, or replace the
          key if it stopped working.
        </p>
      ) : null}


      {connected?.status === "broken" && connected.lastError ? (
        <p
          className="mt-3 max-w-[560px] text-[13px] leading-[1.4] text-ink"
          role="status"
        >
          {connected.lastError}
        </p>
      ) : null}

      {error ? (
        <p className="mt-3 max-w-[560px] text-[13px] leading-[1.4] text-ink" role="alert">
          {error}
        </p>
      ) : null}

      {note ? (
        <p className="mt-3 text-[13px] text-ink-2" role="status">
          {note}
        </p>
      ) : null}

      {readings.length > 0 ? (
        <ul className="mt-3 border-t border-hairline">
          {readings.slice(0, READINGS_SHOWN).map((reading) => (
            <li
              key={reading.key}
              className="flex items-baseline justify-between gap-6 border-b border-hairline py-[10px] last:border-b-0"
            >
              <span className="min-w-0">
                <span className="block text-[15px] leading-[1.3]">
                  {reading.label}
                </span>
                {reading.period || reading.detail ? (
                  <span className="mt-[1px] line-clamp-2 block text-[13px] leading-[1.4] text-ink-3">
                    {[reading.period, reading.detail].filter(Boolean).join(". ")}
                  </span>
                ) : null}
              </span>
              <span className="num shrink-0 text-right text-[15px] font-medium">
                {reading.value}
              </span>
            </li>
          ))}
        </ul>
      ) : null}

      {open ? (
        <ConnectSheet
          definition={definition}
          existingHandle={connected?.handle ?? null}
          pending={pending}
          error={error}
          onClose={() => setOpen(false)}
          onSubmit={(values) => run(() => connect(definition.kind, values))}
        />
      ) : null}
    </li>
  );
}

/**
 * The connect form. One field per thing the source needs, the credential first,
 * and a link to the page that issues it with the exact permission named. Nobody
 * should have to guess which of nine Stripe key types we want.
 */
function ConnectSheet({
  definition,
  existingHandle,
  pending,
  error,
  onClose,
  onSubmit,
}: {
  definition: SourceDefinition;
  existingHandle: string | null;
  pending: boolean;
  error: string | null;
  onClose: () => void;
  onSubmit: (values: {
    credential: string;
    handle?: string;
    host?: string;
  }) => void;
}) {
  const [values, setValues] = useState<Record<string, string>>({
    credential: "",
    handle: existingHandle ?? "",
    host: "",
  });

  return (
    <Sheet title={`Connect ${definition.name}`} onClose={onClose}>
      <form
        onSubmit={(event) => {
          event.preventDefault();
          onSubmit({
            credential: values.credential ?? "",
            handle: values.handle,
            host: values.host,
          });
        }}
      >
        <p className="max-w-[560px] text-[15px] leading-[1.5] text-ink-2">
          {definition.credentialHow}
        </p>
        <a
          href={definition.credentialUrl}
          target="_blank"
          rel="noreferrer noopener"
          className="mt-2 inline-block text-[13px] text-ink underline"
        >
          Open {definition.name}
        </a>

        <div className="mt-6 max-w-[560px] space-y-5">
          {definition.fields.map((field) => (
            <div key={field.name}>
              <label
                htmlFor={`${definition.kind}-${field.name}`}
                className="block text-[13px] font-medium text-ink-2"
              >
                {field.label}
                {field.required ? "" : " (optional)"}
              </label>
              <input
                id={`${definition.kind}-${field.name}`}
                /* A credential is a password field so it does not sit in plain
                   text on a shared screen and so browsers offer to keep it
                   rather than autofilling an email into it. */
                type={field.secret ? "password" : "text"}
                autoComplete={field.secret ? "new-password" : "off"}
                spellCheck={false}
                placeholder={field.placeholder}
                value={values[field.name] ?? ""}
                onChange={(event) =>
                  setValues((current) => ({
                    ...current,
                    [field.name]: event.target.value,
                  }))
                }
                className="mt-2 w-full rounded-[8px] border border-hairline bg-surface px-3 py-2 text-[15px] text-ink outline-none placeholder:text-ink-3"
              />
              {field.hint ? (
                <p className="mt-2 text-[13px] leading-[1.4] text-ink-3">
                  {field.hint}
                </p>
              ) : null}
            </div>
          ))}
        </div>

        {error ? (
          <p
            className="mt-5 max-w-[560px] text-[13px] leading-[1.4] text-ink"
            role="alert"
          >
            {error}
          </p>
        ) : null}

        <div className="mt-7 flex items-center gap-4">
          <button
            type="submit"
            disabled={pending}
            className="btn-ink rounded-[14px] bg-ink px-5 py-[10px] text-[15px] font-semibold text-paper disabled:opacity-50"
          >
            {pending ? "Checking the key" : `Connect ${definition.name}`}
          </button>
          <span className="text-[13px] text-ink-3">
            We read it once before saving, so a wrong key fails here.
          </span>
        </div>
      </form>
    </Sheet>
  );
}
