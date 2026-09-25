import Link from "next/link";
import { Logo } from "./logo";
import { Streak } from "./streak";
import { AGENCY_SEATS, SUPPORT } from "@/lib/legal";
import { BOARD_HREF, DEFAULT_PLAN } from "@/lib/plans";

/**
 * The sign-off is a year of the mark: twelve grids, one per month, filled to
 * the cadence this product exists to produce and empty for the months that
 * have not happened yet. It is the page's argument in one line of drawing, and
 * it is the only place on the site that shows more than one month.
 *
 * Under it, the shape the reference uses: mark and links on one row, the
 * secondary set below a hairline. Three stacked columns of links is a footer
 * for a site with three products; we have one page with six anchors on it.
 */
const MONTHS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

const LINKS = [
  { href: "#writes", label: "What it writes" },
  { href: "#how", label: "How it works" },
  { href: "#who", label: "Who it is for" },
  { href: "#pricing", label: "Pricing" },
];

const SECONDARY = [
  { href: "#pricing", label: `Run up to ${AGENCY_SEATS} clients` },
  { href: `mailto:${SUPPORT}`, label: SUPPORT },
  { href: "/privacy", label: "Privacy" },
  { href: "/terms", label: "Terms" },
];

/**
 * The two account links are the only rows that change with a session, so they
 * are built here rather than sitting in the lists above. Signed out the footer
 * offers the two doors it always had; signed in it offers the two screens
 * behind them. The default is signed out, which is what /privacy and /terms
 * pass by saying nothing, so those pages stay prerendered.
 */
export function SiteFooter({ signedIn = false }: { signedIn?: boolean }) {
  const entry = signedIn
    ? { href: BOARD_HREF, label: "Your board" }
    : { href: "/signin", label: "Sign in" };
  const secondaryEntry = signedIn
    ? { href: "/settings", label: "Settings" }
    : { href: `/signin?plan=${DEFAULT_PLAN.slug}`, label: "Start a board" };

  const now = new Date();
  const month = now.getUTCMonth();

  return (
    <footer className="border-t border-hairline bg-surface">
      <div className="mx-auto max-w-[1160px] px-6 py-[60px]">
        {/* A year at this cadence. Months that have not happened are empty,
            because drawing them full would be the one dishonest thing on the
            page. */}
        <div className="flex gap-[18px] overflow-x-auto pb-1 sm:gap-6">
          {MONTHS.map((name, i) => (
            <div key={name} className="shrink-0">
              <Streak
                posted={i < month ? 22 : i === month ? 14 : 0}
                today={i === month}
                size={50}
              />
              <p className="mt-2 font-mono text-[11px] text-ink-3">{name}</p>
            </div>
          ))}
        </div>

        <div className="mt-[60px] flex flex-col gap-8 border-t border-hairline pt-[40px] lg:flex-row lg:items-center lg:justify-between lg:gap-12">
          <Link
            href="/"
            className="flex shrink-0 items-center gap-[10px] text-[17px] font-semibold tracking-[-0.02em]"
          >
            <Logo />
            GoodSocials
          </Link>

          <ul className="flex flex-wrap items-center gap-x-8 gap-y-3 text-[15px] text-ink-2">
            {[...LINKS, entry].map((link) => (
              <li key={link.label}>
                <Link href={link.href} className="nav-link">
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>

          <p className="num shrink-0 font-mono text-[12px] text-ink-3">
            &copy; {now.getUTCFullYear()} GoodSocials, Amsterdam
          </p>
        </div>

        <div className="mt-10 border-t border-hairline pt-8">
          <p className="font-mono text-[11px] uppercase tracking-[0.12em] text-ink-3">
            More
          </p>
          <ul className="mt-5 flex flex-wrap gap-x-10 gap-y-3 text-[15px] text-ink-2">
            {[secondaryEntry, ...SECONDARY].map((link) => (
              <li key={link.label}>
                <Link href={link.href} className="nav-link">
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
          <p className="mt-8 max-w-[70ch] text-[13px] leading-[1.5] text-ink-3">
            Built and run in Amsterdam. One price on the page,{" "}
            <span className="num">{DEFAULT_PLAN.priceLine}</span>, cancel from
            the settings screen. Not affiliated with LinkedIn. We post as you,
            with your permission.
          </p>
        </div>
      </div>
    </footer>
  );
}
