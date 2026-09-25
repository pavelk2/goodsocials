import type { SourceKind } from "@/lib/integrations/types";
import { SourceIcon } from "@/components/integrations/source-icon";

/**
 * The tools a board reads from, as the landing page names them.
 *
 * Two lists because two things are true. The five connected kinds are the ones
 * `lib/integrations/adapters/` reads today. The four after them are on the way
 * and say so, because a pill that looks connected and is not is the first thing
 * a Product Hunt comment finds.
 *
 * Marks for the four are the simple-icons paths, like `SourceIcon`, except
 * Crisp, which simple-icons does not carry, so it is a plain chat bubble.
 */
export const CONNECTED: { kind: SourceKind; name: string }[] = [
  { kind: "posthog", name: "PostHog" },
  { kind: "stripe", name: "Stripe" },
  { kind: "github", name: "GitHub" },
  { kind: "plausible", name: "Plausible" },
  { kind: "notion", name: "Notion" },
];

const SOON_PATHS = {
  sentry:
    "M13.91 2.505c-.873-1.448-2.972-1.448-3.844 0L6.904 7.92a15.478 15.478 0 0 1 8.53 12.811h-2.221A13.301 13.301 0 0 0 5.784 9.814l-2.926 5.06a7.65 7.65 0 0 1 4.435 5.848H2.194a.365.365 0 0 1-.298-.534l1.413-2.402a5.16 5.16 0 0 0-1.614-.913L.296 19.275a2.182 2.182 0 0 0 .812 2.999 2.24 2.24 0 0 0 1.086.288h6.983a9.322 9.322 0 0 0-3.845-8.318l1.11-1.922a11.47 11.47 0 0 1 4.95 10.24h5.915a17.242 17.242 0 0 0-7.885-15.28l2.244-3.845a.37.37 0 0 1 .504-.13c.255.14 9.75 16.708 9.928 16.9a.365.365 0 0 1-.327.543h-2.287c.029.612.029 1.223 0 1.831h2.297a2.206 2.206 0 0 0 1.922-3.31z",
  supabase:
    "M11.9 1.036c-.015-.986-1.26-1.41-1.874-.637L.764 12.05C-.33 13.427.65 15.455 2.409 15.455h9.579l.113 7.51c.014.985 1.259 1.408 1.873.636l9.262-11.653c1.093-1.375.113-3.403-1.645-3.403h-9.642z",
  vercel: "M24 22.525H0l12-21.05 12 21.05z",
  crisp:
    "M4 3h16a2 2 0 0 1 2 2v11a2 2 0 0 1-2 2h-9l-5 4v-4H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2z",
} as const;

export const SOON: { kind: keyof typeof SOON_PATHS; name: string }[] = [
  { kind: "sentry", name: "Sentry" },
  { kind: "supabase", name: "Supabase" },
  { kind: "vercel", name: "Vercel" },
  { kind: "crisp", name: "Crisp" },
];

/** The agent tools the next integration round is for. Named, not drawn. */
export const SOON_AGENTS = ["Codex", "Claude Code", "Grok bot"];

function SoonIcon({ kind, size }: { kind: keyof typeof SOON_PATHS; size: number }) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill="currentColor"
      aria-hidden="true"
      focusable="false"
    >
      <path d={SOON_PATHS[kind]} />
    </svg>
  );
}

/**
 * The row of pills in the hero board's header. `reading` lights the pills the
 * animated card is being written from, so the row and the board tell one
 * story. `compact` drops the tools still to come, which section two names.
 */
export function SourcePills({
  reading = [],
  compact,
}: {
  reading?: SourceKind[];
  compact?: boolean;
}) {
  return (
    <ul
      aria-label="Tools a board reads from"
      className={`flex flex-wrap items-center gap-2 ${compact ? "" : "justify-center"}`}
    >
      {CONNECTED.map((source) => {
        const on = reading.includes(source.kind);
        return (
          <li
            key={source.kind}
            className="flex items-center gap-[7px] rounded-full border bg-surface py-[6px] pl-[10px] pr-3 text-[13px] transition-[border-color,box-shadow,transform] duration-500"
            style={{
              borderColor: on ? "var(--accent)" : "var(--hairline)",
              boxShadow: on ? "0 0 0 4px var(--accent-wash)" : "none",
              transform: on ? "translateY(-2px)" : "none",
            }}
          >
            <SourceIcon kind={source.kind} size={14} />
            {source.name}
            <span
              aria-hidden="true"
              className={`size-[6px] rounded-full ${on ? "src-reading" : ""}`}
              style={{ background: on ? "var(--accent)" : "var(--ink)" }}
            />
          </li>
        );
      })}
      {compact ? null : SOON.map((source) => (
        <li
          key={source.kind}
          className="hidden items-center gap-[7px] rounded-full border border-dashed border-hairline py-[6px] pl-[10px] pr-3 text-[13px] text-ink-3 sm:flex"
        >
          <SoonIcon kind={source.kind} size={14} />
          {source.name}
          <span className="font-mono text-[10.5px]">soon</span>
        </li>
      ))}
    </ul>
  );
}

/** The small source chip in a card's meta row. */
export function SourceTag({ kind }: { kind: SourceKind }) {
  const name = CONNECTED.find((source) => source.kind === kind)?.name ?? kind;
  return (
    <span className="inline-flex items-center gap-1 rounded-full border border-hairline px-[7px] py-[2px] font-mono text-[10.5px] text-ink-2">
      <SourceIcon kind={kind} size={10} />
      {name}
    </span>
  );
}

/** A citation in a card's meta row: a paper, a report, a set of pages read. */
export function RefTag({ label }: { label: string }) {
  return (
    <span className="inline-flex items-center gap-1 rounded-full border border-hairline px-[7px] py-[2px] font-mono text-[10.5px] text-ink-2">
      <svg
        viewBox="0 0 12 12"
        width={10}
        height={10}
        aria-hidden="true"
        focusable="false"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.2"
      >
        <path d="M2 1.5h6.5a1 1 0 0 1 1 1v8H3a1 1 0 0 1-1-1z" />
        <path d="M2 9.5a1 1 0 0 1 1-1h6.5" />
      </svg>
      {label}
    </span>
  );
}
