import Link from "next/link";
import { Logo } from "./logo";
import { Streak } from "./streak";
import { AGENCY_SEATS, SUPPORT } from "@/lib/legal";
import { DEFAULT_PLAN } from "@/lib/plans";

/**
 * The sign-off is a year of the mark: twelve grids, one per month, filled to
 * the cadence this product exists to produce and empty for the months that
 * have not happened yet. It is the page's argument in one line of drawing,
 * and it is the only thing on the page that shows more than one month.
 *
 * The line beside the brand names an author, a place and a price, which is the
 * ninth position of the house style and the reason a visitor believes there is
 * somebody behind this.
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

const COLUMNS = [
  {
    heading: "The product",
    links: [
      { href: "#how", label: "How it works" },
      { href: "#who", label: "Who it is for" },
      { href: "#pricing", label: "Pricing" },
      { href: "#permissions", label: "What we ask LinkedIn for" },
    ],
  },
  {
    heading: "Start",
    links: [
      { href: `/signin?plan=${DEFAULT_PLAN.slug}`, label: "Start a board" },
      { href: "/signin", label: "Sign in" },
      { href: "#pricing", label: `Run up to ${AGENCY_SEATS} clients` },
      { href: `mailto:${SUPPORT}`, label: SUPPORT },
    ],
  },
  {
    heading: "Legal",
    links: [
      { href: "/privacy", label: "Privacy" },
      { href: "/terms", label: "Terms" },
    ],
  },
];

export function SiteFooter() {
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

        <div className="mt-[60px] flex flex-col gap-[60px] border-t border-hairline pt-[60px] lg:flex-row lg:justify-between lg:gap-20">
          <div className="max-w-[300px]">
            <div className="flex items-center gap-[10px] text-[17px] font-semibold tracking-[-0.02em]">
              <Logo />
              GoodSocials
            </div>
            <p className="mt-5 text-[15px] leading-[1.5] text-ink-2">
              Built and run in Amsterdam. One price on the page,{" "}
              <span className="num">{DEFAULT_PLAN.priceLine}</span>, cancel from
              the settings screen.
            </p>
          </div>

          <div className="grid grow grid-cols-2 gap-10 sm:grid-cols-3 lg:max-w-[600px]">
            {COLUMNS.map((column) => (
              <div key={column.heading}>
                <h2 className="text-[15px] font-semibold tracking-[-0.01em]">
                  {column.heading}
                </h2>
                <ul className="mt-4 flex flex-col gap-3 text-[15px] text-ink-2">
                  {column.links.map((link) => (
                    <li key={link.label}>
                      <Link href={link.href} className="nav-link">
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-[60px] flex flex-col gap-2 border-t border-hairline pt-6 font-mono text-[12px] text-ink-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="num">
            &copy; {now.getUTCFullYear()} GoodSocials, Amsterdam
          </p>
          <p>Not affiliated with LinkedIn. We post as you, with your permission.</p>
        </div>
      </div>
    </footer>
  );
}
