/**
 * The one place card markup lives, and the one exception to rows not cards.
 * A kanban card is literally picked up and moved, it has an interior, and two
 * cards in the same column are at different points in their own lifecycle.
 * See DESIGN.md section 4.
 */
export function Card({
  body,
  scheduledAt,
  comment,
}: {
  body: string;
  scheduledAt?: Date | null;
  /** An open revise comment. The exception state, not the resting one. */
  comment?: string;
}) {
  const when = scheduledAt
    ? new Intl.DateTimeFormat("en-GB", {
        day: "numeric",
        month: "short",
        hour: "2-digit",
        minute: "2-digit",
      }).format(scheduledAt)
    : null;

  return (
    <article className="min-h-[88px] rounded-[14px] border border-hairline bg-surface px-4 py-[14px]">
      <p className="line-clamp-3 text-[15px] leading-[1.4] text-ink">{body}</p>
      {when ? <p className="num mt-2 text-[13px] text-ink-2">{when}</p> : null}
      {comment ? (
        <div className="mt-3 border-t border-hairline pt-3">
          <p className="text-[13px] font-medium text-ink-2">Revise</p>
          <p className="mt-1 text-[13px] leading-[1.4] text-ink">{comment}</p>
        </div>
      ) : null}
    </article>
  );
}
