import Link from "next/link";
import { Logo } from "./logo";
import { AGENCY_SEATS } from "@/lib/legal";
import { DEFAULT_PLAN } from "@/lib/plans";

/**
 * The marketing footer. Notion's shape: mark and a line of its own on the
 * left, link columns on the right, a rule, then the copyright row.
 *
 * The line on the left is the house signature rather than a borrowed quote:
 * an author, a place, and a price, per the ninth position of the house style.
 * A footer that names nobody is the one thing on the page a visitor reads as a
 * company hiding.
 *
 * The slim Footer in components/footer.tsx stays on the app-adjacent pages.
 * This one is for the landing page, where the visitor is deciding.
 */
const COLUMNS = [
  {
    heading: "Product",
    links: [
      { href: "#how", label: "How it works" },
      { href: "#who", label: "Who it is for" },
      { href: "#pricing", label: "Pricing" },
      { href: "#permissions", label: "What we ask LinkedIn for" },
    ],
  },
  {
    heading: "Get started",
    links: [
      { href: `/signin?plan=${DEFAULT_PLAN.slug}`, label: "Start a board" },
      { href: "/signin", label: "Sign in" },
      { href: "#pricing", label: `Run up to ${AGENCY_SEATS} clients` },
    ],
  },
  {
    heading: "Company",
    links: [
      { href: "/privacy", label: "Privacy" },
      { href: "/terms", label: "Terms" },
      { href: "mailto:pavel@goodsocials.co", label: "pavel@goodsocials.co" },
    ],
  },
];

export function SiteFooter() {
  return (
    <footer className="border-t border-hairline bg-surface">
      <div className="mx-auto max-w-[1200px] px-6 py-16">
        <div className="flex flex-col gap-14 lg:flex-row lg:justify-between lg:gap-20">
          <div className="max-w-[320px]">
            <div className="flex items-center gap-[10px] text-[17px] font-semibold tracking-[-0.02em]">
              <Logo />
              GoodSocials
            </div>
            <p className="mt-6 text-[15px] leading-[1.5] text-ink-2">
              Built and run by Pavel in Amsterdam. One price on the page,
              {" "}{DEFAULT_PLAN.priceLine}, cancel from the settings screen.
            </p>
          </div>

          <div className="grid grow grid-cols-2 gap-10 sm:grid-cols-3 lg:max-w-[620px]">
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

        <div className="mt-16 flex flex-col gap-3 border-t border-hairline pt-8 text-[13px] text-ink-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="num">
            &copy; {new Date().getFullYear()} GoodSocials. Amsterdam, the
            Netherlands.
          </p>
          <p>
            Not affiliated with LinkedIn. We post to your profile with your
            permission.
          </p>
        </div>
      </div>
    </footer>
  );
}
