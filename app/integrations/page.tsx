import Link from "next/link";
import { IntegrationsBody } from "@/components/integrations/integrations-body";

export const metadata = { title: "Integrations" };

/**
 * Its own URL rather than a section of settings, for one reason: a credential is
 * pasted here, which means somebody will open this page on a laptop while
 * reading a key off a phone, and a page they can navigate straight to is worth
 * more than a panel four clicks into another screen.
 */
export default function IntegrationsPage() {
  return (
    <main className="px-4 py-8 sm:px-6 sm:py-10">
      <header className="mb-8 flex items-baseline justify-between">
        <h1 className="text-[28px] font-semibold tracking-[-0.03em]">
          Integrations
        </h1>
        <Link href="/settings" className="text-[13px] text-ink-2 underline">
          Settings
        </Link>
      </header>

      <IntegrationsBody />
    </main>
  );
}
