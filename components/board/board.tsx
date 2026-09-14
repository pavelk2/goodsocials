import "./board.css";

/**
 * The board: principles rail on the left, scrolling columns beside it. A real
 * board is wider than a screen, so the columns scroll rather than shrink to
 * fit, and the rail stays put because the correction it holds applies to every
 * card that scrolls past.
 */
export function BoardShell({
  principles,
  children,
  className,
}: {
  principles: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={className ? `board-shell ${className}` : "board-shell"}>
      {principles}
      <div className="board">{children}</div>
    </div>
  );
}
