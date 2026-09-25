import Link from "next/link";
import type { ReactNode } from "react";
import type { Block, Reference } from "@/lib/content/types";
import { SiteNav } from "./site-nav";
import { SiteFooter } from "./site-footer";
import { Eyebrow } from "./section-head";
import { DEFAULT_PLAN, HERO_CTA, TRIAL_LINE } from "@/lib/plans";

/**
 * The shell for the long pages a stranger reads before signing in: the
 * comparisons, the blog and the docs. Same bar and footer as the landing page,
 * plain type on paper between them, one reading column. Nothing here reads a
 * session, so every page built on it prerenders.
 */
export function ContentPage({ children }: { children: ReactNode }) {
  return (
    <>
      <SiteNav />
      <main className="w-full flex-1">{children}</main>
      <SiteFooter />
    </>
  );
}

/** The fading sentence every major heading uses: the claim in ink, the rest grey. */
export function PageTitle({
  eyebrow,
  title,
  summary,
  children,
}: {
  eyebrow: ReactNode;
  title: string;
  /** The grey half of the sentence. Left out on a blog post, where the title stands alone. */
  summary?: string;
  children?: ReactNode;
}) {
  return (
    <header className="mx-auto w-full max-w-[760px] px-6 pt-20 sm:pt-24">
      <Eyebrow>{eyebrow}</Eyebrow>
      <h1 className="mt-7 text-balance text-[clamp(34px,5vw,54px)] font-semibold leading-[1.04] tracking-[-0.04em]">
        <span>{title}</span>
        {summary ? <span className="text-ink-3"> {summary}</span> : null}
      </h1>
      {children}
    </header>
  );
}

/**
 * Text with its citation markers turned into links. "[2]" in a string becomes
 * a superscript 2 that jumps to the second entry of the page's reference list.
 */
function Cited({ text }: { text: string }) {
  const parts = text.split(/(\[\d+\])/);
  return (
    <>
      {parts.map((part, i) => {
        const n = /^\[(\d+)\]$/.exec(part)?.[1];
        return n ? (
          <sup key={i} className="num ml-[1px] text-[0.72em]">
            <a
              href={`#ref-${n}`}
              className="text-ink underline-offset-2 hover:underline"
              aria-label={`Reference ${n}`}
            >
              [{n}]
            </a>
          </sup>
        ) : (
          part
        );
      })}
    </>
  );
}

/** The numbered list the markers point at, at the end of a page. */
export function References({ references }: { references: Reference[] }) {
  if (references.length === 0) return null;
  return (
    <section className="mt-16 border-t border-hairline pt-8">
      <h2 className="font-mono text-[11px] uppercase tracking-[0.12em] text-ink-3">
        References
      </h2>
      <ol className="mt-5 space-y-3 text-[14px] leading-[1.5] text-ink-2">
        {references.map((ref, i) => (
          <li
            key={ref.url + i}
            id={`ref-${i + 1}`}
            className="flex scroll-mt-[calc(var(--nav-h)+32px)] gap-3"
          >
            <span className="num w-6 shrink-0 text-ink-3">{i + 1}.</span>
            <span>
              {ref.title}{" "}
              <a
                href={ref.url}
                rel="noopener nofollow"
                className="break-all underline underline-offset-2"
              >
                {ref.url.replace(/^https?:\/\//, "")}
              </a>
            </span>
          </li>
        ))}
      </ol>
    </section>
  );
}

/** A run of blocks at reading size. `id` on an h2 makes it linkable. */
export function Blocks({ blocks }: { blocks: Block[] }) {
  return (
    <div className="space-y-5 text-[17px] leading-[1.6] text-ink-2">
      {blocks.map((block, i) => {
        switch (block.type) {
          case "h2":
            return (
              <h2
                key={i}
                className="pt-8 text-[24px] font-semibold leading-[1.2] tracking-[-0.02em] text-ink"
              >
                <Cited text={block.text} />
              </h2>
            );
          case "p":
            return (
              <p key={i}>
                <Cited text={block.text} />
              </p>
            );
          case "list":
            return (
              <ul key={i} className="space-y-2 pl-5 [list-style:disc]">
                {block.items.map((item) => (
                  <li key={item}>
                    <Cited text={item} />
                  </li>
                ))}
              </ul>
            );
          case "steps":
            return (
              <ol key={i} className="space-y-2 pl-5 [list-style:decimal]">
                {block.items.map((item) => (
                  <li key={item} className="num">
                    <Cited text={item} />
                  </li>
                ))}
              </ol>
            );
        }
      })}
    </div>
  );
}

/** Label left, links right, hairline between. The index pages and "read next". */
export function LinkRows({
  rows,
}: {
  rows: { href: string; title: string; meta?: string; line?: string }[];
}) {
  return (
    <ul className="border-t border-hairline">
      {rows.map((row) => (
        <li key={row.href} className="border-b border-hairline">
          <Link
            href={row.href}
            className="group flex flex-col gap-1 py-5 sm:flex-row sm:items-baseline sm:gap-8"
          >
            {row.meta ? (
              <span className="num shrink-0 font-mono text-[12px] text-ink-3 sm:w-[150px]">
                {row.meta}
              </span>
            ) : null}
            <span className="flex-1">
              <span className="text-[17px] font-medium text-ink group-hover:underline group-hover:underline-offset-4">
                {row.title}
              </span>
              {row.line ? (
                <span className="mt-1 block text-[15px] leading-[1.5] text-ink-2">
                  {row.line}
                </span>
              ) : null}
            </span>
          </Link>
        </li>
      ))}
    </ul>
  );
}

/** The one plum control on these pages, at the end, where the next step is. */
export { Cited };

export function CloseBand({ title }: { title: string }) {
  return (
    <section className="mx-auto w-full max-w-[760px] px-6 py-24">
      <div className="card-lift rounded-[var(--r-xl)] px-8 py-12 text-center sm:px-12">
        <h2 className="text-balance text-[clamp(26px,3.4vw,36px)] font-semibold leading-[1.1] tracking-[-0.03em]">
          {title}
        </h2>
        <p className="mt-4 text-[16px] text-ink-2">
          Sign in with LinkedIn and paste a website URL. Seven posts appear on a
          board. {TRIAL_LINE}
        </p>
        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Link
            href={`/signin?plan=${DEFAULT_PLAN.slug}`}
            className="pill btn-accent px-6 py-3 text-[16px]"
          >
            {HERO_CTA}
          </Link>
          <Link
            href="/#pricing"
            className="pill btn-outline num border border-hairline bg-surface px-6 py-3 text-[16px]"
          >
            From {DEFAULT_PLAN.priceLine}
          </Link>
        </div>
      </div>
    </section>
  );
}

export function formatDate(iso: string): string {
  return new Date(`${iso}T12:00:00Z`).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  });
}
