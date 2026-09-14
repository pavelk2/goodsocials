import type { CSSProperties, HTMLAttributes, ReactNode, Ref } from "react";

/**
 * The card's markup, with no opinion about what it can do. The board wraps this
 * in the three actions and in drag; the landing hero renders it with a frozen
 * comment showing the revision loop mid-flight. Both surfaces draw the same
 * object, so the marketing page cannot drift from the product.
 *
 * Dimensions are DESIGN.md section 3. Nothing hovers, nothing lifts, nothing
 * has a drop shadow. White on off-white plus a hairline is the whole
 * separation, and the only shadow is the one a card wears while it is
 * genuinely in the air.
 */
export function CardShell({
  body,
  imageUrl,
  scheduledAt,
  innerRef,
  style,
  handleProps,
  floating,
  children,
}: {
  body: string;
  imageUrl?: string | null;
  scheduledAt?: Date | null;
  innerRef?: Ref<HTMLElement>;
  style?: CSSProperties;
  /** Drag listeners. They go on the body, never on the action row. */
  handleProps?: HTMLAttributes<HTMLDivElement>;
  /** True only while the card is under the cursor, mid drag. */
  floating?: boolean;
  /** The footer: three actions on the board, an open comment on the hero. */
  children?: ReactNode;
}) {
  const when = scheduledAt
    ? new Intl.DateTimeFormat("en-GB", {
        day: "numeric",
        month: "short",
        hour: "2-digit",
        minute: "2-digit",
        timeZone: "UTC",
      }).format(scheduledAt)
    : null;

  return (
    <article
      ref={innerRef}
      style={floating ? { ...style, boxShadow: "var(--shadow)" } : style}
      className="min-h-[88px] rounded-[14px] border border-hairline bg-surface px-4 py-[14px]"
    >
      <div {...handleProps} className={handleProps ? "cursor-grab" : undefined}>
        <div className="flex gap-3">
          <p className="line-clamp-3 flex-1 whitespace-pre-line text-[15px] leading-[1.4] text-ink">
            {body}
          </p>
          {imageUrl ? (
            // Not optimized: these are Vercel Blob URLs written minutes ago and
            // read once at 48px, so the image pipeline would cache a thumbnail
            // nobody asks for twice.
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={imageUrl}
              alt=""
              width={48}
              height={48}
              className="h-12 w-12 shrink-0 rounded-[8px] object-cover"
            />
          ) : null}
        </div>
        {when ? <p className="num mt-2 text-[13px] text-ink-2">{when}</p> : null}
      </div>
      {children}
    </article>
  );
}

/** The open revise comment. On the hero it is frozen; on the board it is live. */
export function CardComment({ comment }: { comment: string }) {
  return (
    <div className="mt-3 border-t border-hairline pt-3">
      <p className="text-[13px] font-medium text-ink-2">Revise</p>
      <p className="mt-1 text-[13px] leading-[1.4] text-ink">{comment}</p>
    </div>
  );
}
