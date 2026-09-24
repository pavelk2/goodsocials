/**
 * The mark at nav size: the ink lockup from DESIGN.md section 5, drawn from
 * tokens instead of loaded from public/logo-tile.svg so it inverts in dark
 * mode. The exported files stay the source for anything a platform renders;
 * this is the same geometry for the one place the page draws it itself.
 *
 * Eighteen cells posted, one in plum for today, the rest the empty days ahead.
 *
 * The two colours are overridable for one caller: the hero sits on footage
 * that is dark whatever the reader's system theme is, so the tile there is
 * pinned rather than inverted by `prefers-color-scheme`. It is still the same
 * lockup, drawn on the ground it was drawn for.
 */
export function Logo({
  size = 26,
  tile = "var(--ink)",
  cell = "var(--paper)",
}: {
  size?: number;
  /** The rounded square behind the grid. */
  tile?: string;
  /** A day a post went out. Today stays plum and an empty day stays --ink-3. */
  cell?: string;
}) {
  const pos = [40, 70, 100, 130, 160];
  const dots = pos.flatMap((y) => pos.map((x) => ({ x, y })));

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 200 200"
      aria-hidden="true"
      className="shrink-0"
    >
      <rect width="200" height="200" rx="44" fill={tile} />
      {dots.map((dot, i) => (
        <circle
          key={`${dot.x}-${dot.y}`}
          cx={dot.x}
          cy={dot.y}
          r="9"
          fill={
            i < 18
              ? cell
              : i === 18
                ? "var(--accent)"
                : "var(--ink-3)"
          }
        />
      ))}
    </svg>
  );
}
