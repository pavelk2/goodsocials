import type { CSSProperties, HTMLAttributes, ReactNode, Ref } from "react";
import { formatSlot } from "@/lib/time";
import { PostText } from "@/components/post-text";
import { hasGap } from "@/lib/gap";
import type { QualityIssue } from "@/lib/quality";

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
  label,
  needs,
  held,
  imageUrl,
  onOpen,
  scheduledAt,
  timeZone,
  innerRef,
  style,
  handleProps,
  floating,
  children,
}: {
  body: string;
  /**
   * What kind of post this is and what it is about, already joined, for example
   * "Receipt. What we charge and why". One line in the meta row rather than a
   * badge: a coloured pill on every card would spend the board's one accent
   * five times per column, and a reader scanning a column wants the subject,
   * not a taxonomy.
   */
  label?: string | null;
  /**
   * The one thing the author has to supply before this post is true. Shown in
   * ink rather than grey, because it is the only thing on a card that is
   * addressed to the reader rather than describing the post.
   */
  needs?: string | null;
  /**
   * What the quality gate found, when it kept this post out of the queue. The
   * card says only that it was held; the reasons and their fixes are in the
   * dialog, where there is room to act on them.
   */
  held?: QualityIssue[] | null;
  imageUrl?: string | null;
  /**
   * Opens the card. Given on the board, withheld on the drag overlay and on the
   * landing hero, where a card in the air or in a still is not something
   * anybody can click.
   */
  onOpen?: () => void;
  scheduledAt?: Date | null;
  /**
   * The profile's own zone, so a card says the hour the post goes out where the
   * author lives. Defaults to UTC for the landing hero, which renders a frozen
   * card belonging to nobody.
   */
  timeZone?: string;
  innerRef?: Ref<HTMLElement>;
  style?: CSSProperties;
  /** Drag listeners. They go on the body, never on the action row. */
  handleProps?: HTMLAttributes<HTMLDivElement>;
  /** True only while the card is under the cursor, mid drag. */
  floating?: boolean;
  /** The footer: three actions on the board, an open comment on the hero. */
  children?: ReactNode;
}) {
  const when = scheduledAt ? formatSlot(scheduledAt, timeZone ?? "UTC") : null;
  // The same question in two shapes: an idea names what it needs, a draft
  // carries it as a bracket in the text. The card flags both the same way and
  // leaves the detail to the dialog, where there is room to answer it.
  const waiting = Boolean(needs) || hasGap(body);

  return (
    <article
      ref={innerRef}
      style={floating ? { ...style, boxShadow: "var(--shadow)" } : style}
      className="min-h-[88px] rounded-[14px] border border-hairline bg-surface px-4 py-[14px]"
    >
      {/* The drag handle and the click target are the same surface. A mouse
          has to move 8px and a finger has to hold before it becomes a drag, so
          a press that does neither is a click. On a phone the hold would
          otherwise select the text and raise the copy menu over the card. */}
      <div
        {...handleProps}
        onClick={onOpen}
        className={
          handleProps
            ? "cursor-grab touch:select-none touch:[-webkit-touch-callout:none]"
            : undefined
        }
      >
        <p className="line-clamp-3 whitespace-pre-line text-[15px] leading-[1.4] text-ink">
          <PostText text={body} />
        </p>
        {/* One meta row, per DESIGN.md section 3. The label and the time share
            it rather than stacking, so a card gains a subject without gaining
            a line. */}
        {label || when ? (
          <p className="mt-2 flex items-baseline justify-between gap-3 text-[13px] text-ink-2">
            {label ? <span className="truncate">{label}</span> : <span />}
            {when ? <span className="num shrink-0">{when}</span> : null}
          </p>
        ) : null}
      </div>

      {/* Outside the drag handle: this is a question, and a press on it should
          not pick the card up. It sits above the actions because it is the
          reason one of them is not ready to be pressed yet. Ink and a dot
          rather than accent: a plum marker per card would spend the board's
          one colour a dozen times. */}
      {/* Before the gap, because a held card cannot be scheduled whatever else
          it is waiting on, and a bracket is one of the things it holds for. */}
      {held && onOpen ? (
        <button
          type="button"
          onClick={onOpen}
          className="mt-2 flex items-center gap-2 text-[13px] font-medium text-ink"
        >
          <span aria-hidden className="size-[6px] rounded-full bg-ink" />
          Held back, {held.length === 1 ? "one thing" : `${held.length} things`} to fix
        </button>
      ) : waiting ? (
        onOpen ? (
          <button
            type="button"
            onClick={onOpen}
            className="mt-2 flex items-center gap-2 text-[13px] font-medium text-ink"
          >
            <span aria-hidden className="size-[6px] rounded-full bg-ink" />
            Needs a detail from you
          </button>
        ) : needs ? (
          <p className="mt-2 text-[13px] leading-[1.4] text-ink">
            <span className="font-medium">Needs from you.</span> {needs}
          </p>
        ) : null
      ) : null}

      {/* The keyboard route into the card. Enter on the body above starts a
          keyboard drag, so opening the post needs a control of its own. Out of
          sight until it has focus: the whole card is the pointer target, and a
          Read it link on every card was the noisiest line on the board. */}
      {onOpen ? (
        <button
          type="button"
          onClick={onOpen}
          className="sr-only text-[13px] text-ink-2 underline focus-visible:not-sr-only focus-visible:mt-2 focus-visible:block"
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
 * The card's image, at the card's full width in a 120px strip. Enough to tell
 * which picture it is and whether it is wrong at a glance; the judgement
 * happens in the dialog, where it runs at full size. At 4:3 two cards filled
 * the Image column.
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
      className="h-[120px] w-full rounded-[8px] border border-hairline object-cover"
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
