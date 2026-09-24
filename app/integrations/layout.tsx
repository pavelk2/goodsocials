import type { ReactNode } from "react";
import { AppHeader } from "@/components/app-header";

/**
 * Integrations reached directly, rather than intercepted over the board, still
 * needs the app chrome. A page that asks somebody to paste a live Stripe key
 * and shows no sign of which product it belongs to is the shape of a phishing
 * page, which is the same reasoning that gave the sign in page its copy.
 */
export default function IntegrationsLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <AppHeader />
      {children}
    </>
  );
}
