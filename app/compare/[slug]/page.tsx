import type { Metadata } from "next";
import { shareMetadata } from "@/lib/share";
import { notFound } from "next/navigation";
import {
  Blocks,
  CloseBand,
  ContentPage,
  LinkRows,
  PageTitle,
} from "@/components/marketing/content";
import Link from "next/link";
import { COMPARISONS } from "@/lib/content/compare";
import { JsonLd } from "@/components/marketing/json-ld";
import { SITE_NAME } from "@/lib/share";
import { breadcrumbs, jsonLd } from "@/lib/structured-data";

/** Twenty pages, all known at build time. Anything else is a 404. */
export const dynamicParams = false;

export function generateStaticParams() {
  return COMPARISONS.map((c) => ({ slug: c.slug }));
}

function find(slug: string) {
  return COMPARISONS.find((c) => c.slug === slug);
}

export async function generateMetadata({
  params,
}: PageProps<"/compare/[slug]">): Promise<Metadata> {
  const c = find((await params).slug);
  if (!c) return {};
  return shareMetadata({
    path: `/compare/${c.slug}`,
    // People search for an alternative to the tool they have, so the title
    // leads with that and keeps the comparison. The brand is already in it.
    title: `${c.name} alternative: GoodSocials vs ${c.name}`,
    description: `${c.summary} How GoodSocials differs, and who should pick which.`,
  });
}

/**
 * One comparison. The table is rows rather than a grid of cards: label, them,
 * us, hairline between, and it stacks on a phone into three lines per row.
 * Each page links the next few so a reader comparing three tools does not go
 * back to the index between them.
 */
export default async function Comparison({
  params,
}: PageProps<"/compare/[slug]">) {
  const c = find((await params).slug);
  if (!c) notFound();

  const at = COMPARISONS.indexOf(c);
  const next = [1, 2, 3, 4].map(
    (step) => COMPARISONS[(at + step) % COMPARISONS.length],
  );

  return (
    <ContentPage>
      <JsonLd
        data={jsonLd(
          breadcrumbs([
            { name: SITE_NAME, path: "" },
            { name: "Compare", path: "/compare" },
            { name: `GoodSocials vs ${c.name}`, path: `/compare/${c.slug}` },
          ]),
        )}
      />
      <PageTitle
        eyebrow={`${c.name} alternative`}
        title={`GoodSocials vs ${c.name}.`}
        summary={`Who each one is for, and when to pick ${c.name}.`}
      />

      <div className="mx-auto mt-14 w-full max-w-[760px] px-6">
        <p className="text-[19px] leading-[1.55] text-ink">{c.verdict}</p>
        <p className="mt-5 text-[17px] leading-[1.6] text-ink-2">
          {c.summary}{" "}
          <a
            href={`https://${c.site}`}
            rel="noopener nofollow"
            className="underline underline-offset-4"
          >
            {c.site}
          </a>
        </p>

        <div className="mt-12">
          <div className="hidden grid-cols-[1fr_1.2fr_1.2fr] gap-6 border-b border-hairline pb-3 font-mono text-[11px] uppercase tracking-[0.12em] text-ink-3 sm:grid">
            <span />
            <span>{c.name}</span>
            <span>GoodSocials</span>
          </div>
          <dl>
            {c.rows.map((row) => (
              <div
                key={row.label}
                className="grid gap-1 border-b border-hairline py-4 sm:grid-cols-[1fr_1.2fr_1.2fr] sm:gap-6"
              >
                <dt className="text-[15px] font-medium text-ink">
                  {row.label}
                </dt>
                <dd className="text-[15px] leading-[1.5] text-ink-2">
                  <span className="text-ink-3 sm:hidden">{c.name}: </span>
                  {row.them}
                </dd>
                <dd className="text-[15px] leading-[1.5] text-ink">
                  <span className="text-ink-3 sm:hidden">GoodSocials: </span>
                  {row.us}
                </dd>
              </div>
            ))}
          </dl>
        </div>

        <div className="mt-14 grid gap-10 sm:grid-cols-2">
          <div>
            <h2 className="text-[20px] font-semibold tracking-[-0.02em]">
              Pick {c.name} if
            </h2>
            <ul className="mt-4 space-y-2 pl-5 text-[16px] leading-[1.5] text-ink-2 [list-style:disc]">
              {c.chooseThem.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
          <div>
            <h2 className="text-[20px] font-semibold tracking-[-0.02em]">
              Pick GoodSocials if
            </h2>
            <ul className="mt-4 space-y-2 pl-5 text-[16px] leading-[1.5] text-ink-2 [list-style:disc]">
              {c.chooseUs.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-8">
          <Blocks blocks={c.blocks} />
        </div>

        <p className="mt-10 text-[13px] leading-[1.5] text-ink-3">
          What we say about {c.name} comes from its public site, checked in
          September 2026. Features and prices change, so check theirs before you
          decide. {c.name} is a trademark of its owner. Our three plans are on{" "}
          <Link href="/pricing" className="underline underline-offset-4">
            the pricing page
          </Link>
          .
        </p>

        <h2 className="mt-16 font-mono text-[11px] uppercase tracking-[0.12em] text-ink-3">
          More comparisons
        </h2>
        <div className="mt-4">
          <LinkRows
            rows={next.map((n) => ({
              href: `/compare/${n.slug}`,
              title: `GoodSocials vs ${n.name}`,
            }))}
          />
        </div>
      </div>

      <CloseBand title="See seven posts written for your profile." />
    </ContentPage>
  );
}
