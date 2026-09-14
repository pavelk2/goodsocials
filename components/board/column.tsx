import { Children } from "react";
import "./board.css";

import type { CardState } from "@/lib/board";

/**
 * One column. The column a card sits in is its `card_state`, not a position,
 * so a column is a filter over the board and the count is the filter's size.
 */
export function Column({
  state,
  children,
}: {
  state: CardState;
  children?: React.ReactNode;
}) {
  return (
    <section
      className="board-col"
      data-state={state}
      aria-label={COLUMN_NAME[state]}
    >
      <header className="board-col-head">
        <span>{COLUMN_NAME[state]}</span>
        <span className="count">{Children.count(children)}</span>
      </header>
      <div className="board-col-cards">{children}</div>
    </section>
  );
}

const COLUMN_NAME: Record<CardState, string> = {
  idea: "Idea",
  draft: "Draft",
  image: "Image",
  scheduled: "Scheduled",
  posted: "Posted",
  rejected: "Rejected",
};
