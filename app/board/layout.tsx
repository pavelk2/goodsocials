import type { ReactNode } from "react";

/**
 * The board carries a `@modal` slot so Settings can be intercepted over it.
 * Clicking Settings on the board opens the settings sheet without leaving the
 * board; opening /settings directly, or reloading with it open, renders the
 * full page. Both are the same body, in components/settings/settings-body.tsx.
 */
export default function BoardLayout({
  children,
  modal,
}: {
  children: ReactNode;
  modal: ReactNode;
}) {
  return (
    <>
      {children}
      {modal}
    </>
  );
}
