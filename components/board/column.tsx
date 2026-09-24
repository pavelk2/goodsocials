import type { ReactNode, Ref } from "react";

/**
 * Board dimensions are fixed, from DESIGN.md section 3. Columns do not flex.
 * The board is the dense surface; the marketing page around it is the airy one.
 *
 * A column under a dragged card says so with its own hairline going to the
 * accent, which is the one moment the board is allowed a second colored thing:
 * it lasts as long as the card is in the air.
 *
 * A narrow column is one with nothing to decide in it: Scheduled or Posted,
 * empty, or Posted folded. At full width those two pushed Posted off the right
 * edge of a laptop screen while holding one line of grey text between them.
 */
export function Column({
  name,
  next,
  count,
  emptyLine,
  dropRef,
  over,
  narrow,
  head,
  children,
}: {
  name: string;
  /** What approve does here, beside the name. Only on columns that wait on the member. */
  next?: string;
  count: number;
  emptyLine: string;
  dropRef?: Ref<HTMLDivElement>;
  over?: boolean;
  narrow?: boolean;
  /** Controls that add cards to this column, above the cards they add. */
  head?: ReactNode;
  children?: ReactNode;
}) {
  return (
    <section
      className={`${narrow ? "w-[200px]" : "w-[320px]"} shrink-0 snap-start`}
    >
      <header className="flex h-[44px] items-center justify-between gap-3 px-1">
        <h2 className="truncate text-[13px] font-medium text-ink-2">
          {name}
          {next ? (
            <span className="font-normal text-ink-3"> · {next}</span>
          ) : null}
        </h2>
        <span className="num text-[13px] font-medium text-ink-3">{count}</span>
      </header>
      <div
        ref={dropRef}
        className={`flex min-h-[160px] flex-col gap-2 rounded-[20px] border p-2 ${
          over ? "border-accent" : "border-hairline"
        }`}
      >
        {head}
        {count === 0 ? (
          <p className="px-2 py-3 text-[13px] text-ink-3">{emptyLine}</p>
        ) : (
          children
        )}
      </div>
    </section>
  );
}
