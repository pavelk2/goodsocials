import Link from "next/link";
import { Logo } from "./logo";
import { DEFAULT_PLAN, TRIAL_DAYS } from "@/lib/plans";

/**
 * The marketing header. Notion's shape: mark and wordmark left, a short link
 * set in the middle, one quiet text link and one filled button on the right,
 * stuck to the top of the window with the page showing through it.
 *
 * The app does not get this. The board has its own header and a second
 * persistent bar above a kanban surface would cost a row of cards.
 *
 * No dropdowns. Notion has them because it sells eleven surfaces; we sell one
 * board, and a menu that opens onto a single anchor is furniture.
 */
const LINKS = [
  { href: "#how", label: "How it works" },
  { href: "#who", label: "Who it is for" },
  { href: "#pricing", label: "Pricing" },
];

export function SiteNav() {
  return (
    <header className="sticky top-0 z-50 border-b border-hairline bg-surface/80 backdrop-blur-[12px]">
      <nav className="mx-auto flex h-[var(--nav-h)] max-w-[1200px] items-center justify-between gap-6 px-6">
        <Link
          href="/"
          className="flex items-center gap-[10px] text-[17px] font-semibold tracking-[-0.02em]"
        >
          <Logo />
          GoodSocials
        </Link>

        <ul className="hidden items-center gap-8 text-[15px] text-ink-2 md:flex">
          {LINKS.map((link) => (
            <li key={link.href}>
              <Link href={link.href} className="nav-link">
                {link.label}
              </Link>
            </li>
          ))}
        </ul>

        <div className="flex items-center gap-2 sm:gap-5">
          <Link
            href="/signin"
            className="nav-link hidden text-[15px] text-ink-2 sm:block"
          >
            Sign in
          </Link>
          <Link
            href={`/signin?plan=${DEFAULT_PLAN.slug}`}
            className="btn-accent rounded-[var(--r-btn)] px-4 py-[9px] text-[15px] font-medium"
          >
            Start {TRIAL_DAYS} days free
          </Link>
        </div>
      </nav>
    </header>
  );
}
