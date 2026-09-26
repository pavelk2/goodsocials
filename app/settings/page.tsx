import Link from "next/link";
import { SettingsBody } from "@/components/settings/settings-body";

export const metadata = { title: "Settings" };

/** Changing the website reads the site and rewrites the brand, about a minute. */
export const maxDuration = 300;

/**
 * Settings has its own URL because LinkedIn redirects back to it after a
 * connection, and because a preference page a user can link to is worth more
 * than one that only exists inside another screen. From the board the same
 * body renders inside a sheet, intercepted at app/board/@modal.
 */
export default async function SettingsPage({
  searchParams,
}: {
  searchParams: Promise<{ linked?: string; billing?: string; why?: string }>;
}) {
  const { linked, billing, why } = await searchParams;

  return (
    <main className="px-4 py-8 sm:px-6 sm:py-10">
      <header className="mb-8 flex items-baseline justify-between">
        <h1 className="text-[28px] font-semibold tracking-[-0.03em]">Settings</h1>
        <Link href="/board" className="text-[13px] text-ink-2 underline">
          Board
        </Link>
      </header>

      <SettingsBody linked={linked} billing={billing} why={why} />
    </main>
  );
}
