import Link from "next/link";
import { Logo } from "./logo";
import { Streak } from "./streak";
import { AGENCY_SEATS, SUPPORT } from "@/lib/legal";
import { BOARD_HREF, DEFAULT_PLAN } from "@/lib/plans";
import { COMPARISONS } from "@/lib/content/compare";
import { POSTS } from "@/lib/content/blog";

/**
 * The sign-off is a year of the mark: twelve grids, one per month, filled to
 * the cadence this product exists to produce and empty for the months that
 * have not happened yet. It is the page's argument in one line of drawing, and
 * it is the only place on the site that shows more than one month.
 *
 * Under it, the shape the reference uses: mark and links on one row, the
 * secondary set below a hairline. Below that, three short columns for the
 * pages that are not the landing page: the comparisons people search for, the
 * newest posts, and the docs. A handful of each with a link to the rest, so the
 * footer stays a footer and not a sitemap.
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
  { href: "/#writes", label: "What it writes" },
  { href: "/#how", label: "How it works" },
  { href: "/#who", label: "Who it is for" },
  { href: "/pricing", label: "Pricing" },
];

const SECONDARY = [
  { href: "/agencies", label: `Run up to ${AGENCY_SEATS} clients` },
  { href: "/tools/linkedin-text-formatter", label: "LinkedIn text formatter" },
  { href: `mailto:${SUPPORT}`, label: SUPPORT },
  { href: "/privacy", label: "Privacy" },
  { href: "/terms", label: "Terms" },
];

/** Six of the twenty: the two best known schedulers, the three LinkedIn-only tools, and ChatGPT. */
const FOOTER_COMPARISONS = [
  "buffer",
  "hootsuite",
  "taplio",
  "supergrow",
  "authoredup",
  "chatgpt",
];

const READ: {
  title: string;
  href: string;
  all: string;
  links: { href: string; label: string }[];
}[] = [
  {
    title: "Compare",
    href: "/compare",
    all: `All ${COMPARISONS.length} comparisons`,
    links: FOOTER_COMPARISONS.flatMap((slug) => {
      const c = COMPARISONS.find((item) => item.slug === slug);
      return c ? [{ href: `/compare/${c.slug}`, label: `vs ${c.name}` }] : [];
    }),
  },
  {
    title: "Blog",
    href: "/blog",
    all: "All posts",
    links: POSTS.slice(0, 4).map((post) => ({
      href: `/blog/${post.slug}`,
      label: post.title,
    })),
  },
  {
    title: "Docs",
    href: "/docs",
    all: "Read the docs",
    links: [
      { href: "/docs#start", label: "Getting started" },
      { href: "/docs#principles", label: "Brand principles" },
      { href: "/docs#schedule", label: "Scheduling" },
      { href: "/docs#reconnect", label: "Reconnecting LinkedIn" },
      { href: "/docs#agency", label: "Running clients' profiles" },
    ],
  },
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

        <div className="mt-10 grid gap-10 border-t border-hairline pt-8 sm:grid-cols-3">
          {READ.map((group) => (
            <div key={group.title}>
              <Link
                href={group.href}
                className="font-mono text-[11px] uppercase tracking-[0.12em] text-ink-3 hover:text-ink"
              >
                {group.title}
              </Link>
              <ul className="mt-5 space-y-3 text-[15px] text-ink-2">
                {group.links.map((link) => (
                  <li key={link.href}>
                    <Link href={link.href} className="nav-link">
                      {link.label}
                    </Link>
                  </li>
                ))}
                <li>
                  <Link href={group.href} className="nav-link text-ink">
                    {group.all}
                  </Link>
                </li>
              </ul>
            </div>
          ))}
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
