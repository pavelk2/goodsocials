import "./board.css";

/**
 * The only card markup in the repo, per CLAUDE.md. The landing hero renders
 * these components rather than a screenshot, so the page cannot drift away
 * from the product: when the card changes, the hero changes with it.
 *
 * Presentational only. Day 3 wraps this in dnd-kit and feeds it a `card` row.
 */
export function Card({
  text,
  meta,
  comment,
  active = false,
}: {
  /** Post text. Clamped to three lines. A node, so the hero can cross-fade it. */
  text: React.ReactNode;
  /** Scheduled or posted time, tabular. Empty on a card that has no time yet. */
  meta?: React.ReactNode;
  /** An open comment box. Present while the card is being revised. */
  comment?: React.ReactNode;
  active?: boolean;
}) {
  return (
    <article className="board-card" data-active={active}>
      <p className="board-card-text">{text}</p>
      {meta ? <p className="board-card-meta">{meta}</p> : null}
      {comment ? <div className="board-card-comment">{comment}</div> : null}
    </article>
  );
}
