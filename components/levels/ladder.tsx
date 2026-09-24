import { LEVELS, type Gate, type Stage } from "@/lib/levels";

/**
 * The ten levels as one row of bars under four stage names. Reached levels in
 * ink, the current one in plum, the rest hairline: the streak mark's grammar,
 * where the one colored thing is where you are now.
 */
const STAGES: { stage: Stage; span: number }[] = [
  { stage: "Foundation", span: 3 },
  { stage: "Calibration", span: 2 },
  { stage: "Audience", span: 3 },
  { stage: "Authority", span: 2 },
];

export function Ladder({ level }: { level: number }) {
  return (
    <section className="rounded-[20px] border border-hairline bg-surface px-5 py-5">
      {/* Stage names sit over their bars on a wide screen and drop on a phone,
          where ten columns leave no room for a label that spans three. */}
      <div className="mb-3 hidden grid-cols-10 gap-[10px] sm:grid">
        {STAGES.map((s) => (
          <p
            key={s.stage}
            style={{ gridColumn: `span ${s.span} / span ${s.span}` }}
            className="border-t border-hairline pt-2 text-[11px] uppercase tracking-[0.06em] text-ink-2"
          >
            {s.stage}
          </p>
        ))}
      </div>

      <ol className="grid grid-cols-5 gap-x-[10px] gap-y-4 sm:grid-cols-10">
        {LEVELS.map((def) => {
          const state =
            def.level < level ? "done" : def.level === level ? "now" : "ahead";
          return (
            <li key={def.level} aria-current={state === "now" ? "step" : undefined}>
              <span
                className={`block h-2 rounded-full ${
                  state === "done"
                    ? "bg-ink"
                    : state === "now"
                      ? "bg-accent"
                      : "bg-hairline"
                }`}
              />
              <p
                className={`num mt-2 text-[12px] ${
                  state === "now"
                    ? "font-medium text-accent-text"
                    : state === "done"
                      ? "text-ink-2"
                      : "text-ink-3"
                }`}
              >
                {def.level}
              </p>
              <p
                className={`text-[12.5px] leading-[1.3] ${
                  state === "now"
                    ? "font-medium text-accent-text"
                    : state === "done"
                      ? "text-ink-2"
                      : "text-ink-3"
                }`}
              >
                {def.name}
              </p>
            </li>
          );
        })}
      </ol>
    </section>
  );
}

/** What stands between this level and the next, one row per gate. */
export function Gates({ title, gates }: { title: string; gates: Gate[] }) {
  return (
    <section className="rounded-[20px] border border-hairline bg-surface px-5 py-5">
      <h3 className="mb-2 text-[15px] font-semibold">{title}</h3>
      <ul>
        {gates.map((g) => (
          <li
            key={g.label}
            className="grid grid-cols-[1fr_auto] items-center gap-x-4 gap-y-2 border-t border-hairline py-3 text-[14px] first:border-t-0 sm:grid-cols-[220px_1fr_140px]"
          >
            <span>{g.label}</span>
            <span className="col-span-2 row-start-2 block h-[6px] overflow-hidden rounded-full bg-hairline sm:col-span-1 sm:row-start-auto">
              <span
                className="block h-full bg-ink"
                style={{ width: `${Math.round(g.progress * 100)}%` }}
              />
            </span>
            <span
              className={`num text-right ${g.done ? "text-ink" : "text-ink-2"}`}
            >
              {g.value}
            </span>
          </li>
        ))}
      </ul>
      <p className="mt-3 text-[13px] text-ink-2">
        Every row has to be done. The earliest date is there so the posts that
        prove a level have time to exist.
      </p>
    </section>
  );
}

/** One line of what the agent knows, or is still guessing. */
export type KnownRow = { label: string; detail: string; known: boolean };

export function KnownList({ rows }: { rows: KnownRow[] }) {
  const known = rows.filter((r) => r.known);
  const guessing = rows.filter((r) => !r.known);
  return (
    <section className="rounded-[20px] border border-hairline bg-surface px-5 py-5">
      <h3 className="mb-1 text-[15px] font-semibold">What we know</h3>
      <List rows={known} empty="Your website, and nothing else yet." />
      {guessing.length > 0 ? (
        <>
          <h3 className="mb-1 mt-6 text-[15px] font-semibold">What we are guessing</h3>
          <List rows={guessing} />
        </>
      ) : null}
    </section>
  );
}

function List({ rows, empty }: { rows: KnownRow[]; empty?: string }) {
  if (rows.length === 0 && empty) {
    return <p className="py-2 text-[14px] text-ink-2">{empty}</p>;
  }
  return (
    <ul>
      {rows.map((r) => (
        <li
          key={r.label}
          className="flex gap-3 border-t border-hairline py-[10px] text-[14px] first:border-t-0"
        >
          <span
            aria-hidden="true"
            className={`mt-[7px] h-2 w-2 flex-none rounded-full ${
              r.known ? "bg-ink" : "border-[1.5px] border-ink-3"
            }`}
          />
          <span>
            <span className="font-medium">{r.label}</span>
            <span className="block text-ink-2">{r.detail}</span>
          </span>
        </li>
      ))}
    </ul>
  );
}
