"use client";

import { useEffect, useRef, useState } from "react";
import { CardActions } from "./card-actions";
import { ImageLightbox } from "./image-lightbox";
import { COLUMN_LABEL, type Column } from "@/lib/board";

const IMAGE_ALT = "The image generated for this post";

/**
 * The whole post, at reading size, with the picture under it and the three
 * actions at the bottom. A card in a 320px column is a summary; this is the
 * thing the user is actually approving, so it carries the full text with the
 * line breaks LinkedIn will render and no clamp.
 *
 * Native <dialog> rather than a div with a scrim, for the same reasons as the
 * image lightbox: Escape, the focus trap, the return of focus to the card, and
 * the inertness of the board behind all come from the platform.
 *
 * The two dialogs stack. Opening the picture full size from in here puts a
 * second dialog in the top layer above this one, and Escape closes that one
 * first, which is what a reader expects.
 */
export function CardModal({
  id,
  state,
  body,
  label,
  needs,
  imageUrl,
  scheduledAt,
  onClose,
}: {
  id: string;
  state: Column;
  body: string;
  label?: string | null;
  needs?: string | null;
  imageUrl?: string | null;
  scheduledAt?: Date | null;
  onClose: () => void;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  const panel = useRef<HTMLDivElement>(null);
  const [viewingImage, setViewingImage] = useState(false);

  // Read through a ref so the effect below can keep empty deps and open the
  // dialog once, without a new callback identity reopening it.
  const closed = useRef(onClose);
  useEffect(() => {
    closed.current = onClose;
  });

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    const handleClose = () => closed.current();
    dialog.addEventListener("close", handleClose);
    // Guarded because React runs this effect twice in development, and
    // showModal on an already open dialog throws.
    if (!dialog.open) dialog.showModal();
    // The cleanup does not call close(). A dialog's close event is queued as a
    // task rather than dispatched inline, so a close() here lands after the
    // second run has re-attached the listener, and the component tears itself
    // down while it is still mounting. Unmounting removes the element, which
    // pops it off the top layer on its own.
    return () => dialog.removeEventListener("close", handleClose);
  }, []);

  const when = scheduledAt
    ? new Intl.DateTimeFormat("en-GB", {
        weekday: "long",
        day: "numeric",
        month: "short",
        hour: "2-digit",
        minute: "2-digit",
        timeZone: "UTC",
      }).format(scheduledAt)
    : null;

  return (
    <dialog
      ref={ref}
      // Anything outside the panel is backdrop, whether it is the dialog itself
      // or the empty space the flexbox leaves around it.
      onClick={(event) => {
        if (!panel.current?.contains(event.target as Node)) ref.current?.close();
      }}
      className="fixed inset-0 h-dvh max-h-dvh w-dvw max-w-dvw items-center justify-center bg-transparent p-4 backdrop:bg-black/70 open:flex"
    >
      <div
        ref={panel}
        className="max-h-[86dvh] w-full max-w-[620px] overflow-y-auto rounded-[20px] border border-hairline bg-surface p-6"
      >
        <div className="flex items-baseline justify-between gap-4">
          <p className="text-[13px] font-medium text-ink-2">
            {COLUMN_LABEL[state]}
            {label ? (
              <span className="ml-2 font-normal">{label}</span>
            ) : null}
          </p>
          {when ? <p className="num text-[13px] text-ink-2">{when}</p> : null}
        </div>

        <p className="mt-4 whitespace-pre-line text-[17px] leading-[1.5] text-ink">
          {body}
        </p>

        {imageUrl ? (
          <button
            type="button"
            onClick={() => setViewingImage(true)}
            aria-label={`${IMAGE_ALT}. Opens it full size.`}
            className="mt-5 block w-full cursor-zoom-in"
          >
            {/* Not optimized: a Vercel Blob URL written minutes ago and read by
                the one person deciding on it. */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={imageUrl}
              alt=""
              className="max-h-[45dvh] w-full rounded-[8px] border border-hairline object-contain"
            />
          </button>
        ) : null}

        {/* Above the actions, because it is the reason Approve is the wrong
            button to press first. The revise box under it is where the answer
            goes, and answering closes the gap. */}
        {needs ? (
          <p className="mt-5 text-[15px] leading-[1.4] text-ink">
            <span className="font-medium">Needs from you.</span> {needs}
          </p>
        ) : null}

        <CardActions id={id} state={state} onAdvance={onClose} />

        <button
          type="button"
          onClick={() => ref.current?.close()}
          className="mt-5 text-[13px] text-ink-2 underline"
        >
          Close, or press Esc
        </button>
      </div>

      {/* Mounted only while open, so the dialog opens on mount and every close,
          by Escape or by click, is the same unmount. */}
      {viewingImage && imageUrl ? (
        <ImageLightbox
          src={imageUrl}
          alt={IMAGE_ALT}
          onClose={() => setViewingImage(false)}
        />
      ) : null}
    </dialog>
  );
}
