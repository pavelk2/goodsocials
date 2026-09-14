import type { ReactNode } from "react";

/**
 * The card's markup, with no opinion about what it can do. The board wraps this
 * in the three actions; the landing hero renders it with a frozen comment
 * showing the revision loop mid-flight. Both surfaces draw the same object, so
 * the screenshot on the marketing page cannot drift from the product.
 *
 * Dimensions are DESIGN.md section 3. Nothing hovers, nothing lifts, nothing
 * has a drop shadow. White on off-white plus a hairline is the whole separation.
 */
export function CardShell({
  body,
  imageUrl,
  scheduledAt,
  children,
}: {
  body: string;
  imageUrl?: string | null;
  scheduledAt?: Date | null;
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
    <article className="min-h-[88px] rounded-[14px] border border-hairline bg-surface px-4 py-[14px]">
      <div className="flex gap-3">
        <p className="line-clamp-3 flex-1 whitespace-pre-line text-[15px] leading-[1.4] text-ink">
          {body}
        </p>
        {imageUrl ? (
          // Not optimized: these are Vercel Blob URLs written minutes ago and
          // read once, so the image pipeline would cache a thumbnail nobody
          // asks for twice.
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
