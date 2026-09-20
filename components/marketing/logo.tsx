/**
 * The mark at nav size: the ink lockup from DESIGN.md section 5, drawn from
 * tokens instead of loaded from public/logo-tile.svg so it inverts in dark
 * mode. The exported files stay the source for anything a platform renders;
 * this is the same geometry for the one place the page draws it itself.
 *
 * Eighteen cells posted, one in plum for today, the rest the empty days ahead.
 */
export function Logo({ size = 26 }: { size?: number }) {
  const pos = [40, 70, 100, 130, 160];
  const cells = pos.flatMap((y) => pos.map((x) => ({ x, y })));

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 200 200"
      aria-hidden="true"
      className="shrink-0"
    >
      <rect width="200" height="200" rx="44" fill="var(--ink)" />
      {cells.map((cell, i) => (
        <circle
          key={`${cell.x}-${cell.y}`}
          cx={cell.x}
          cy={cell.y}
          r="9"
          fill={
            i < 18
              ? "var(--paper)"
              : i === 18
                ? "var(--accent)"
                : "var(--ink-3)"
          }
        />
      ))}
    </svg>
  );
}
