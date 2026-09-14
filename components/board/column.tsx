import type { ReactNode } from "react";

/**
 * Board dimensions are fixed, from DESIGN.md section 3. Columns do not flex.
 * The board is the dense surface; the marketing page around it is the airy one.
 */
export function Column({
  name,
  count,
  emptyLine,
  children,
}: {
  name: string;
  count: number;
  emptyLine: string;
  children?: ReactNode;
}) {
  return (
    <section className="w-[320px] shrink-0 snap-start">
      <header className="flex h-[44px] items-center justify-between px-1">
        <h2 className="text-[13px] font-medium text-ink-2">{name}</h2>
        <span className="num text-[13px] font-medium text-ink-3">{count}</span>
      </header>
      <div className="flex min-h-[160px] flex-col gap-2 rounded-[20px] border border-hairline p-2">
        {count === 0 ? (
          <p className="px-2 py-3 text-[13px] text-ink-3">{emptyLine}</p>
        ) : (
          children
        )}
      </div>
    </section>
  );
}
