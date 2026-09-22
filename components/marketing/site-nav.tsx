import Link from "next/link";
import { Logo } from "./logo";
import { DEFAULT_PLAN, TRIAL_DAYS } from "@/lib/plans";

/**
 * Mark left, the sections in the middle, two controls right.
 *
 * The first pass at this bar put the links next to the mark on the argument
 * that a centred set is the shape of every funded SaaS page. That was true and
 * it was not a reason. A reader scanning a bar for where to go finds the links
 * faster in the middle, the mark keeps the corner it has on every other
 * surface, and the two controls on the right are the only thing on the page
 * that follows the reader down it. DESIGN.md section 6.
 *
 * Sign in is an outlined pill rather than a bare link. On the reference page
 * the pair reads as one control with two ends, and a text link beside a filled
 * button reads as an afterthought.
 */
const LINKS = [
  { href: "#how", label: "How it works" },
  { href: "#who", label: "Who it is for" },
  { href: "#pricing", label: "Pricing" },
  { href: "#permissions", label: "LinkedIn" },
];

export function SiteNav() {
  return (
    <header className="sticky top-0 z-50 border-b border-hairline bg-paper/80 backdrop-blur-[12px]">
      <nav className="mx-auto flex h-[var(--nav-h)] max-w-[1160px] items-center gap-6 px-6">
        <Link
          href="/"
          className="flex shrink-0 items-center gap-[10px] text-[17px] font-semibold tracking-[-0.02em]"
        >
          <Logo />
          GoodSocials
        </Link>

        {/* Centred on the bar rather than on the space left over, so the link
            set does not drift when the two buttons change width. */}
        <ul className="absolute left-1/2 hidden -translate-x-1/2 items-center gap-8 text-[15px] text-ink-2 lg:flex">
          {LINKS.map((link) => (
            <li key={link.href}>
              <Link href={link.href} className="nav-link">
                {link.label}
              </Link>
            </li>
          ))}
        </ul>

        <div className="ml-auto flex shrink-0 items-center gap-2">
          <Link
            href="/signin"
            className="pill btn-outline hidden whitespace-nowrap border border-hairline bg-surface px-[18px] py-[9px] text-[15px] sm:block"
          >
            Sign in
          </Link>
          {/* The header's button starts the flow. It does not quote a price:
              the hero states one a screen further down and the pricing section
              states all three, and a number in a sticky bar that follows the
              reader the whole way is a nag rather than an offer. What it does
              say is that the first week costs nothing, which is the only fact
              that makes pressing it easy. */}
          <Link
            href={`/signin?plan=${DEFAULT_PLAN.slug}`}
            className="pill btn-accent num whitespace-nowrap px-[18px] py-[9px] text-[15px]"
          >
            Start {TRIAL_DAYS} days free
          </Link>
        </div>
      </nav>
    </header>
  );
}
