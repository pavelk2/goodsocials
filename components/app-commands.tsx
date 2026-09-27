"use client";

import { useRouter } from "next/navigation";
import { useSyncExternalStore, useTransition } from "react";
import { signOutAction } from "@/app/actions";
import {
  CommandMenu,
  openCommandMenu,
  type CommandMenuAction,
} from "@/components/ui/command-menu";

const noop = () => () => {};

/** Null on the server, so the hint is drawn only once the platform is known. */
function modifierKey(): string {
  return /Mac|iPhone|iPad/.test(navigator.platform) ? "⌘" : "Ctrl";
}

/**
 * Every signed in screen answers Cmd+K (Ctrl+K off a Mac) with Kobra's command
 * menu. It reaches the screens the header and the user menu already reach, and
 * nothing a card does: Approve, Revise and Reject stay on the card, where the
 * member can read what they are approving.
 *
 * The trigger in the header is the key hint and nothing more. A shortcut with
 * no visible trace is a shortcut nobody finds. On a touch screen there is no
 * keyboard to press it with, so the hint is not drawn there.
 */
export function AppCommands() {
  const router = useRouter();
  const [, startTransition] = useTransition();
  const mod = useSyncExternalStore(noop, modifierKey, () => null);

  const go = (href: string) => () => router.push(href);

  const actions: CommandMenuAction[] = [
    {
      id: "board",
      label: "Board",
      group: "Go to",
      keywords: ["columns", "kanban", "queue"],
      action: go("/board"),
    },
    {
      id: "calendar",
      label: "Calendar",
      group: "Go to",
      keywords: ["days", "schedule", "month"],
      action: go("/board?view=calendar"),
    },
    {
      id: "integrations",
      label: "Integrations",
      group: "Go to",
      keywords: ["stripe", "github", "posthog", "plausible", "notion", "sources"],
      action: go("/integrations"),
    },
    {
      id: "settings",
      label: "Settings",
      group: "Go to",
      keywords: ["profile", "cadence", "timezone", "goal", "linkedin"],
      action: go("/settings"),
    },
    {
      id: "billing",
      label: "Plan and billing",
      group: "Go to",
      keywords: ["stripe", "invoice", "subscription", "card"],
      action: go("/settings#billing"),
    },
    {
      id: "sign-out",
      label: "Sign out",
      group: "Account",
      keywords: ["log out", "logout"],
      action: () => startTransition(() => signOutAction()),
    },
  ];

  return (
    <>
      {mod ? (
        <button
          type="button"
          onClick={() => openCommandMenu()}
          aria-label="Open command menu"
          aria-keyshortcuts="Meta+K Control+K"
          className="num hidden items-center gap-1 rounded-[var(--r-btn)] border border-hairline px-2 py-[5px] font-mono text-[12px] text-ink-2 sm:flex touch:hidden"
        >
          {mod === "⌘" ? "⌘K" : "Ctrl K"}
        </button>
      ) : null}
      <CommandMenu actions={actions} placeholder="Go to a screen" />
    </>
  );
}
