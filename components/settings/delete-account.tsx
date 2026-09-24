"use client";

import { useState, useTransition } from "react";
import { deleteAccountAction } from "@/app/settings/actions";

/** The word the action checks. The action holds the copy that counts. */
const WORD = "delete";

/**
 * The one control in the app that cannot be undone, so it takes three steps:
 * a quiet link, a paragraph saying exactly what goes, and a typed word.
 *
 * The paragraph names the profiles and the subscription because those are the
 * two things somebody would be surprised to lose. An agency owner deleting
 * their own account also deletes every client board under it, and a card that
 * stays on file after a delete is how a support email starts.
 */
export function DeleteAccount({
  profiles,
  subscribed,
}: {
  /** How many LinkedIn profiles this account posts as. */
  profiles: number;
  /** True while there is a Stripe customer whose subscription we cancel. */
  subscribed: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [typed, setTyped] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, start] = useTransition();
  const ready = typed.trim().toLowerCase() === WORD;

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="shrink-0 text-[13px] text-ink-2 underline underline-offset-2"
      >
        Delete account
      </button>
    );
  }

  return (
    <form
      className="w-full max-w-[560px] pt-2 text-left"
      onSubmit={(event) => {
        event.preventDefault();
        if (!ready) return;
        setError(null);
        start(async () => {
          const result = await deleteAccountAction(typed);
          // Success signs out and leaves the page, so only a failure lands here.
          if (!result.ok) setError(result.error);
        });
      }}
    >
      <p className="text-[13px] leading-[1.4] text-ink-2">
        {profiles === 1
          ? "This deletes your board, every card and image, your principles and themes, and the LinkedIn connection."
          : `This deletes all ${profiles} boards on this account, every card and image on them, and every LinkedIn connection.`}{" "}
        {subscribed
          ? "Your subscription is cancelled today and nothing more is charged. "
          : ""}
        Posts already on LinkedIn stay there. This cannot be undone, so
        download your data first if you want a copy.
      </p>

      <label
        htmlFor="delete-confirm"
        className="mt-4 block text-[13px] font-medium text-ink-2"
      >
        Type {WORD} to confirm
      </label>
      <div className="mt-2 flex flex-wrap items-center gap-3">
        <input
          id="delete-confirm"
          value={typed}
          autoComplete="off"
          autoFocus
          disabled={busy}
          onChange={(event) => setTyped(event.target.value)}
          className="w-[160px] rounded-[8px] border border-hairline bg-surface px-3 py-1 text-[15px] text-ink outline-none"
        />
        <button
          type="submit"
          disabled={!ready || busy}
          className="rounded-full border border-ink px-4 py-2 text-[13px] font-medium text-ink disabled:opacity-40"
        >
          {busy
            ? "Deleting"
            : subscribed
              ? "Delete account and cancel plan"
              : "Delete account"}
        </button>
        <button
          type="button"
          disabled={busy}
          onClick={() => {
            setOpen(false);
            setTyped("");
            setError(null);
          }}
          className="text-[13px] text-ink-2 underline underline-offset-2"
        >
          Keep it
        </button>
      </div>

      {error ? (
        <p className="mt-3 text-[13px] text-ink" role="alert">
          {error}
        </p>
      ) : null}
    </form>
  );
}
