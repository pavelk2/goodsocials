import Link from "next/link";
import { SettingsBody } from "@/components/settings/settings-body";

export const metadata = { title: "Settings" };

/**
 * Settings has its own URL because LinkedIn redirects back to it after a
 * connection, and because a preference page a user can link to is worth more
 * than one that only exists inside another screen. From the board the same
 * body renders inside a sheet, intercepted at app/board/@modal.
 */
export default async function SettingsPage({
  searchParams,
}: {
  searchParams: Promise<{ linked?: string }>;
}) {
  const linked = (await searchParams).linked;

  return (
    <main className="px-6 py-10">
      <header className="mb-8 flex items-baseline justify-between">
        <h1 className="text-[28px] font-semibold tracking-[-0.03em]">Settings</h1>
        <Link href="/board" className="text-[13px] text-ink-2 underline">
          Board
        </Link>
      </header>

      <SettingsBody linked={linked} />
    </main>
  );
}
