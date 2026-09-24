"use client";

import { useEffect, useRef } from "react";

/**
 * The generated image at the size the decision needs. A card image is enough to
 * see what was drawn; this is for looking at it properly before approving it,
 * and approving is the only thing this product asks a user to do.
 *
 * Native <dialog> rather than a div with a scrim: Escape, the focus trap, the
 * return of focus to the image, and the inertness of the board behind all come
 * from the platform instead of from us.
 *
 * No zoom, no pan, no next and previous. One image, full size, close it.
 */
export function ImageLightbox({
  src,
  alt,
  onClose,
}: {
  src: string;
  alt: string;
  onClose: () => void;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  const figure = useRef<HTMLElement>(null);
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

  return (
    // The dialog fills the viewport and centres the figure inside it. Left to
    // shrink-wrap the image it would be wider than the screen, and a box wider
    // than the screen cannot be centred by margin, so it hangs off one edge.
    <dialog
      ref={ref}
      // Anything outside the figure is backdrop, whether it is the dialog
      // itself or the empty space the flexbox leaves around the image.
      onClick={(event) => {
        if (!figure.current?.contains(event.target as Node)) ref.current?.close();
      }}
      className="dialog-fill fixed inset-0 h-dvh max-h-dvh w-dvw max-w-dvw items-center justify-center bg-transparent backdrop:bg-black/70 open:flex"
    >
      <figure ref={figure} className="m-0 flex flex-col items-center gap-3">
        {/* Not optimized: a Vercel Blob URL read once at full size by the one
            person deciding whether to keep it. */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={src}
          alt={alt}
          className="max-h-[80dvh] min-h-0 rounded-[14px] object-contain"
        />
        <button
          type="button"
          onClick={() => ref.current?.close()}
          className="text-[13px] text-white/70 underline touch:min-h-11"
        >
          Close<span className="touch:hidden">, or press Esc</span>
        </button>
      </figure>
    </dialog>
  );
}
