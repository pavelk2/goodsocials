import type { CSSProperties, HTMLAttributes, ReactNode, Ref } from "react";

const IMAGE_ALT = "The image generated for this post";

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
  onImageClick,
  scheduledAt,
  innerRef,
  style,
  handleProps,
  floating,
  expanded,
  onToggleExpanded,
  children,
}: {
  body: string;
  imageUrl?: string | null;
  /**
   * Opens the image full size. Given on the board, withheld on the drag
   * overlay and on the landing hero, where a card in the air or in a still is
   * not something anybody can click.
   */
  onImageClick?: () => void;
  scheduledAt?: Date | null;
  innerRef?: Ref<HTMLElement>;
  style?: CSSProperties;
  /** Drag listeners. They go on the body, never on the action row. */
  handleProps?: HTMLAttributes<HTMLDivElement>;
  /** True only while the card is under the cursor, mid drag. */
  floating?: boolean;
  /**
   * Full post, no clamp. The line breaks are the ones LinkedIn will render, so
   * an expanded card is the closest thing to a preview of the real post.
   */
  expanded?: boolean;
  /**
   * Given only when there is more body than three lines. It lives here rather
   * than in the footer so the control that opens the text stays next to the
   * text, with the image below both of them.
   */
  onToggleExpanded?: () => void;
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
        <p
          className={`whitespace-pre-line text-[15px] leading-[1.4] text-ink ${
            expanded ? "" : "line-clamp-3"
          }`}
        >
          {body}
        </p>
        {when ? <p className="num mt-2 text-[13px] text-ink-2">{when}</p> : null}
      </div>

      {/* Outside the drag handle, so reading a post never picks the card up. */}
      {onToggleExpanded ? (
        <button
          type="button"
          onClick={onToggleExpanded}
          className="mt-2 text-[13px] text-ink-2 underline"
        >
          {expanded ? "Show less" : "Read it"}
        </button>
      ) : null}

      {/* Outside the drag handle. Opening the image is a click, and a click on
          the handle is the start of a drag, so the two cannot share a surface.
          Below the text because that is the order LinkedIn renders a post in,
          which makes the card a preview of the thing rather than a note about
          it. */}
      {imageUrl ? (
        onImageClick ? (
          <button
            type="button"
            onClick={onImageClick}
            aria-label={`${IMAGE_ALT}. Opens it full size.`}
            className="mt-3 block w-full cursor-zoom-in"
          >
            <CardImage src={imageUrl} alt="" />
          </button>
        ) : (
          <div className="mt-3">
            <CardImage src={imageUrl} alt={IMAGE_ALT} />
          </div>
        )
      ) : null}

      {children}
    </article>
  );
}

/**
 * The card's image, at the card's full width in the ratio it was generated at.
 * Not a 48px thumbnail: the Image column asks the user to approve or reject
 * this picture, and nobody can judge a picture at 48px.
 *
 * Not optimized: a Vercel Blob URL written minutes ago and read by the one
 * person deciding on it, so a cached derivative pays for itself never.
 */
function CardImage({ src, alt }: { src: string; alt: string }) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={alt}
      className="aspect-[4/3] w-full rounded-[8px] border border-hairline object-cover"
    />
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
