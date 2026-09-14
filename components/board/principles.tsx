import "./board.css";

import type { PrincipleKind } from "@/lib/board";

/**
 * The three brand principles, as rows. Three boxes with icons is the exact
 * pattern the house style bans, and these are label-left facts, not objects
 * anyone picks up.
 */
export function Principles({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <aside className="board-principles" aria-label="Brand principles">
      <header className="board-principles-head">Brand principles</header>
      {children}
    </aside>
  );
}

export function Principle({
  kind,
  children,
}: {
  kind: PrincipleKind;
  /** The principle text. A node, so the hero can cross-fade a rewrite. */
  children: React.ReactNode;
}) {
  return (
    <div className="board-principle">
      <p className="board-principle-name">{PRINCIPLE_NAME[kind]}</p>
      <p className="board-principle-text">{children}</p>
    </div>
  );
}

const PRINCIPLE_NAME: Record<PrincipleKind, string> = {
  voice: "Voice",
  visual: "Visual",
  format: "Format",
};
