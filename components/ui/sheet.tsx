"use client";

import { useEffect, useRef, type ReactNode } from "react";

/**
 * The one overlay in the app. A native `<dialog>` opened with `showModal`, so
 * the focus trap, the Escape key, the top layer, and the inert page behind it
 * are the platform's rather than ours. Native behaviour is the feature.
 *
 * Every overlay is this component. Two panels that open from two buttons a
 * centimetre apart have to be the same object, so neither the board header nor
 * an intercepted route draws its own chrome.
 */
export function Sheet({
  title,
  onClose,
  children,
}: {
  title: string;
  onClose: () => void;
  children: ReactNode;
}) {
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog || dialog.open) return;
    dialog.showModal();
  }, []);

  return (
    <dialog
      ref={ref}
      aria-label={title}
      /* Escape and a backdrop click both fire `close`, so closing is handled
         in one place instead of three.

         The target check is not paranoia. `close` does not bubble, but React
         dispatches it through the component tree anyway, so a dialog rendered
         inside this one would close this one too and drop the user two screens
         back from where they were. Nothing nests today; this makes sure the
         day something does, it fails visibly rather than like that. */
      onClose={(event) => {
        if (event.target !== ref.current) return;
        onClose();
      }}
      onClick={(event) => {
        // A click that lands on the dialog element itself is the backdrop:
        // the panel inside it covers every other pixel.
        if (event.target === ref.current) ref.current?.close();
      }}
      className="sheet w-[calc(100vw-32px)] max-w-[820px] rounded-[20px] border border-hairline bg-surface p-0 text-ink"
    >
      <div className="flex items-center justify-between gap-6 border-b border-hairline px-6 py-4">
        <h2 className="text-[17px] font-semibold tracking-[-0.01em]">{title}</h2>
        <button
          type="button"
          onClick={() => ref.current?.close()}
          className="btn-quiet rounded-[8px] px-2 py-1 text-[13px] font-medium text-ink-2"
        >
          Close
        </button>
      </div>

      {/* A dialog focuses its first focusable child, which would park the
          accent focus ring on Close. Focus the body instead: Escape still
          closes, and the first Tab lands on something worth pressing. */}
      <div
        autoFocus
        tabIndex={-1}
        className="sheet-body max-h-[70vh] overflow-y-auto px-6 py-5"
      >
        {children}
      </div>
    </dialog>
  );
}
