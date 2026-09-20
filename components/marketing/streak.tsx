/**
 * The streak grid, drawn at every size the page needs it.
 *
 * DESIGN.md section 5 called this the mark. Section 6 promotes it: it is the
 * page's one drawn element, and nothing else on the landing page is drawn at
 * all. Twenty-five cells, one per day, ink for a day a post went out, plum for
 * today, hairline for a day still ahead.
 *
 * Geometry is the mark's own, so a grid on the page and the favicon are the
 * same object: 9px dots on a 30px pitch. The frame is tight here rather than
 * the mark's 200 square, because on a page it sits in a layout instead of on a
 * tile. That same 30px pitch is the page's vertical rhythm.
 *
 * It is never decoration. The count under it is the count drawn above it, so a
 * grid that looks thin is telling the truth about a month that was thin.
 */
const POS = [15, 45, 75, 105, 135];
const CELLS = POS.flatMap((y) => POS.map((x) => ({ x, y })));

export const STREAK_CELLS = CELLS.length;

export function Streak({
  posted,
  today = true,
  size,
  className,
}: {
  /** Days a post went out, drawn in ink. Anything over 25 is a full grid. */
  posted: number;
  /** Whether the cell after the last posted day is drawn as today, in plum. */
  today?: boolean;
  /** Rendered width in px. The grid is square. */
  size: number;
  className?: string;
}) {
  const filled = Math.max(0, Math.min(posted, CELLS.length));
  const todayAt = today && filled < CELLS.length ? filled : -1;

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 150 150"
      aria-hidden="true"
      className={className}
    >
      {CELLS.map((cell, i) => (
        <circle
          key={`${cell.x}-${cell.y}`}
          cx={cell.x}
          cy={cell.y}
          r="9"
          fill={
            i < filled
              ? "var(--ink)"
              : i === todayAt
                ? "var(--accent)"
                : "var(--hairline)"
          }
        />
      ))}
    </svg>
  );
}

/**
 * A section's anchor: the grid at the count that section has reached, with the
 * count spelled out beside it. This replaces the eyebrow label, the icon, and
 * the tinted plate, all three of which the house style bans and all three of
 * which the first pass at this page shipped anyway.
 */
export function StreakMark({ posted }: { posted: number }) {
  return (
    <div className="flex shrink-0 items-center gap-4">
      <Streak posted={posted} size={56} />
      <p className="font-mono text-[12px] leading-[1.4] text-ink-3">
        <span className="num block text-ink-2">
          {posted} {posted === 1 ? "post" : "posts"}
        </span>
        <span className="block">this month</span>
      </p>
    </div>
  );
}

/**
 * The board's five columns as five dots: the ones behind this card in ink, the
 * column it is in now in plum, the ones ahead still hairline.
 *
 * Same semantics as the grid above and the same geometry, which is the point.
 * It replaces the tinted icon plate the first pass put on these tiles, and it
 * says something the plate could not: where in the card's life this column is.
 */
export function StepDots({ index, total }: { index: number; total: number }) {
  return (
    <svg
      width={total * 10.4}
      height="10.4"
      viewBox={`0 0 ${total * 30} 30`}
      aria-hidden="true"
    >
      {Array.from({ length: total }, (_, i) => (
        <circle
          key={i}
          cx={15 + i * 30}
          cy="15"
          r="9"
          fill={
            i < index
              ? "var(--ink)"
              : i === index
                ? "var(--accent)"
                : "var(--hairline)"
          }
        />
      ))}
    </svg>
  );
}
