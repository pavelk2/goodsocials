import type { ReactNode } from "react";

/**
 * The label above a section head, and the label inside the two ink panels.
 *
 * DESIGN.md section 6 banned the eyebrow once and replaced it with a streak
 * grid at the count that section had reached. The grid was doing a label's job
 * and lost its meaning doing it: a reader cannot tell what "11 posts this
 * month" has to do with who the product is for. So the label says what the
 * section is and the grid went back to counting days, which is the one thing
 * it is honest at.
 */
export function Eyebrow({
  children,
  live,
  onPanel,
}: {
  children: ReactNode;
  /** The plum dot. Only on the close, where the next step is the whole point. */
  live?: boolean;
  /** Inside an ink panel, where the hairline and the ground are inverted. */
  onPanel?: boolean;
}) {
  return (
    <span
      className="eyebrow"
      style={
        onPanel
          ? {
              background: "transparent",
              borderColor: "var(--panel-hairline)",
              color: "var(--panel-ink-2)",
            }
          : undefined
      }
    >
      {live ? <span className="dot-live" aria-hidden="true" /> : null}
      {children}
    </span>
  );
}

/**
 * Every section opens the same way: the label, the claim, the explanation.
 *
 * Centred, which the page can afford now that it is one ground instead of
 * alternating bands. The pass before this one ragged every heading left and
 * hung a streak grid off the right edge, which made six sections that all
 * started with the same object and none of which said what they were about.
 */
export function SectionHead({
  eyebrow,
  title,
  children,
}: {
  eyebrow: string;
  title: ReactNode;
  /** The explanation under the claim. Grey, one or two sentences. */
  children?: ReactNode;
}) {
  return (
    <div className="mx-auto max-w-[760px] text-center">
      <Eyebrow>{eyebrow}</Eyebrow>
      <h2 className="mt-7 text-balance text-[clamp(32px,4.6vw,54px)] font-semibold leading-[1.04] tracking-[-0.04em]">
        {title}
      </h2>
      {children ? (
        <p className="mx-auto mt-6 max-w-[58ch] text-balance text-[clamp(16px,1.4vw,19px)] leading-[1.5] text-ink-2">
          {children}
        </p>
      ) : null}
    </div>
  );
}
