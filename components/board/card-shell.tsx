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
  onOpen,
  scheduledAt,
  innerRef,
  style,
  handleProps,
  floating,
  children,
}: {
  body: string;
  imageUrl?: string | null;
  /**
   * Opens the card. Given on the board, withheld on the drag overlay and on the
   * landing hero, where a card in the air or in a still is not something
   * anybody can click.
   */
  onOpen?: () => void;
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
      {/* The drag handle and the click target are the same surface. dnd-kit's
          pointer sensor waits for 8px of movement, so a press that does not
          move never becomes a drag and the click lands. */}
      <div
        {...handleProps}
        onClick={onOpen}
        className={handleProps ? "cursor-grab" : undefined}
      >
        <p className="line-clamp-3 whitespace-pre-line text-[15px] leading-[1.4] text-ink">
          {body}
        </p>
        {when ? <p className="num mt-2 text-[13px] text-ink-2">{when}</p> : null}
      </div>

      {/* The keyboard route into the card, and the visible sign that there is
          one. Enter on the body above starts a keyboard drag, so opening the
          post needs a control of its own. Outside the drag handle, so reading a
          post never picks the card up. */}
      {onOpen ? (
        <button
          type="button"
          onClick={onOpen}
          className="mt-2 text-[13px] text-ink-2 underline"
        >
          Read it
        </button>
      ) : null}

      {/* Below the text because that is the order LinkedIn renders a post in,
          which makes the card a preview of the thing rather than a note about
          it. Outside the drag handle: a click on it opens the card, and a click
          on the handle is the start of a drag. */}
      {imageUrl ? (
        onOpen ? (
          <button
            type="button"
            onClick={onOpen}
            aria-label={`${IMAGE_ALT}. Opens the post.`}
            className="mt-3 block w-full cursor-pointer"
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
