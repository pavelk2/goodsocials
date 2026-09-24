/**
 * Something is being written, drawn or saved. Nine dots filling in streak
 * order, then the words for what is happening, so a user waiting thirty
 * seconds on a draft can see both that it is moving and what it is doing.
 */

/** Snake order through a 3 by 3, the way a streak grid fills day by day. */
const ORDER = [0, 1, 2, 5, 4, 3, 6, 7, 8];
const STEP_MS = 90;

export function WorkingDots({ className = "" }: { className?: string }) {
  return (
    <span className={`working-grid ${className}`} aria-hidden="true">
      {ORDER.map((_, cell) => (
        <span
          key={cell}
          style={{ animationDelay: `${ORDER.indexOf(cell) * STEP_MS}ms` }}
        />
      ))}
    </span>
  );
}

export function Working({
  label,
  inherit = false,
  className = "",
}: {
  label: string;
  /** Take the color and weight of the button it sits in, for filled buttons. */
  inherit?: boolean;
  className?: string;
}) {
  return (
    <span
      role="status"
      className={`inline-flex items-center gap-2 ${
        inherit ? "" : "font-medium text-ink"
      } ${className}`}
    >
      <WorkingDots />
      {label}
    </span>
  );
}
