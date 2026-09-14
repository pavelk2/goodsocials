import type { ReactNode } from "react";

/**
 * Board dimensions are fixed, from DESIGN.md section 3. Columns do not flex.
 * The board is the dense surface; the marketing page around it is the airy one.
 */
export function Column({
  name,
  count,
  children,
}: {
  name: string;
  count: number;
  children?: ReactNode;
}) {
  return (
    <section className="w-[320px] shrink-0 snap-start">
      <header className="flex h-[44px] items-center justify-between px-1">
        <h2 className="text-[13px] font-medium text-ink-2">{name}</h2>
        <span className="num text-[13px] font-medium text-ink-3">{count}</span>
      </header>
      <div className="flex min-h-[160px] flex-col gap-2 rounded-[20px] border border-hairline p-2">
        {children ?? <EmptyColumn name={name} />}
      </div>
    </section>
  );
}

/** One sentence saying what goes here. No illustration. */
function EmptyColumn({ name }: { name: string }) {
  const lines: Record<string, string> = {
    Idea: "Ideas land here first.",
    Draft: "Approved ideas become drafts.",
    Image: "Drafts that need a picture wait here.",
    Scheduled: "Approved posts wait for their time.",
    Posted: "Published posts stay here.",
  };
  return (
    <p className="px-2 py-3 text-[13px] text-ink-3">{lines[name] ?? "Empty."}</p>
  );
}
