import type { ReactNode } from "react";
import { AppHeader } from "@/components/app-header";

/**
 * Settings reached directly, rather than intercepted over the board, still
 * needs the app chrome: it is the page LinkedIn redirects to after connecting
 * a profile, so it is sometimes the first screen of a session.
 */
export default function SettingsLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <AppHeader />
      {children}
    </>
  );
}
