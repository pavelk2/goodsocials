import type { ReactNode, Ref } from "react";

/**
 * Board dimensions are fixed, from DESIGN.md section 3. Columns do not flex.
 * The board is the dense surface; the marketing page around it is the airy one.
 *
 * A column under a dragged card says so with its own hairline going to the
 * accent, which is the one moment the board is allowed a second colored thing:
 * it lasts as long as the card is in the air.
 */
export function Column({
  name,
  count,
  emptyLine,
  dropRef,
  over,
  head,
  children,
}: {
  name: string;
  count: number;
  emptyLine: string;
  dropRef?: Ref<HTMLDivElement>;
  over?: boolean;
  /** Controls that add cards to this column, above the cards they add. */
  head?: ReactNode;
  children?: ReactNode;
}) {
  return (
    <section className="w-[320px] shrink-0 snap-start">
      <header className="flex h-[44px] items-center justify-between px-1">
        <h2 className="text-[13px] font-medium text-ink-2">{name}</h2>
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
