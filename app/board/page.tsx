import { Column } from "@/components/board/column";

/** The board column is the card's state, not a stored position. */
const COLUMNS = ["Idea", "Draft", "Image", "Scheduled", "Posted"] as const;

export default function BoardPage() {
  return (
    <main className="px-6 py-10">
      <header className="mb-8 flex items-baseline justify-between">
        <h1 className="text-[28px] font-semibold tracking-[-0.03em]">Board</h1>
        {/* The only colored thing on this screen, and it should be. */}
        <p className="text-[13px] text-ink-2">
          Runway <span className="num font-medium text-accent">0 days</span>
        </p>
      </header>

      <div className="flex snap-x gap-4 overflow-x-auto pb-4">
        {COLUMNS.map((name) => (
          <Column key={name} name={name} count={0} />
        ))}
      </div>
    </main>
  );
}
