import Link from "next/link";
import { Logo } from "./logo";
import { DEFAULT_PLAN } from "@/lib/plans";

/**
 * Mark and links together on the left, the one control on the right.
 *
 * Not the centred link set the first pass shipped. A logo left, a floating
 * nav in the middle and a button right is the shape of every funded SaaS page
 * since 2023, and it says nothing about what this product is. Reading order
 * left to right is who we are, what there is to read, then the one thing to
 * press, which is how the rest of the page is built too.
 */
const LINKS = [
  { href: "#how", label: "How it works" },
  { href: "#who", label: "Who it is for" },
  { href: "#pricing", label: "Pricing" },
];

export function SiteNav() {
  return (
    <header className="sticky top-0 z-50 border-b border-hairline bg-surface/85 backdrop-blur-[12px]">
      <nav className="mx-auto flex h-[var(--nav-h)] max-w-[1160px] items-center gap-8 px-6">
        <Link
          href="/"
          className="flex shrink-0 items-center gap-[10px] text-[17px] font-semibold tracking-[-0.02em]"
        >
          <Logo />
          GoodSocials
        </Link>

        <ul className="hidden items-center gap-7 text-[15px] text-ink-2 md:flex">
          {LINKS.map((link) => (
            <li key={link.href}>
              <Link href={link.href} className="nav-link">
                {link.label}
              </Link>
            </li>
          ))}
        </ul>

        <div className="ml-auto flex shrink-0 items-center gap-2 sm:gap-5">
          <Link
            href="/signin"
            className="nav-link hidden text-[15px] text-ink-2 sm:block"
          >
            Sign in
          </Link>
          <Link
            href={`/signin?plan=${DEFAULT_PLAN.slug}`}
            className="btn-accent num rounded-[var(--r-btn)] px-4 py-[9px] text-[15px] font-medium"
          >
            {DEFAULT_PLAN.price} a month
          </Link>
        </div>
      </nav>
    </header>
  );
}
