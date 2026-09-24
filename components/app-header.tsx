import Link from "next/link";
import { Logo } from "@/components/marketing/logo";
import { UserMenu } from "@/components/user-menu";
import { loadViewer } from "@/lib/viewer";

/**
 * The chrome over every signed in screen. Mark and wordmark left, whoever is
 * signed in right, hairline under it, and nothing else.
 *
 * It carries who is signed in, what they pay for, and the way to settings,
 * billing and out. What this board is about stays on the board's own header a
 * line below: runway, brand principles. A user approving a week of posts reads
 * down, so the account sits above the work and never inside it.
 *
 * Same height, same hairline and same backdrop as the marketing nav, because
 * signing in should not feel like arriving at a different product.
 */
export async function AppHeader() {
  const viewer = await loadViewer();

  return (
    <header className="sticky top-0 z-40 border-b border-hairline bg-surface/85 backdrop-blur-[12px]">
      <div className="flex h-[var(--nav-h)] items-center justify-between gap-6 px-6">
        <Link
          href="/board"
          className="flex shrink-0 items-center gap-[10px] text-[17px] font-semibold tracking-[-0.02em]"
        >
          <Logo size={24} />
          GoodSocials
        </Link>

        {viewer ? (
          <UserMenu
            name={viewer.name}
            email={viewer.email}
            avatarUrl={viewer.avatarUrl}
            planLabel={viewer.planLabel}
            billing={viewer.billing}
            managing={viewer.managing}
          />
        ) : null}
      </div>
    </header>
  );
}
