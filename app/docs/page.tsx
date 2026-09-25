import type { Metadata } from "next";
import { shareMetadata } from "@/lib/share";
import {
  Blocks,
  CloseBand,
  ContentPage,
  PageTitle,
} from "@/components/marketing/content";
import { DOCS } from "@/lib/content/docs";

export const metadata: Metadata = shareMetadata({
  path: "/docs",
  title: "Docs | GoodSocials",
  description:
    "How GoodSocials works: the board, the three card actions, brand principles, themes, scheduling, sources, reconnecting LinkedIn, agency mode and billing.",
});

/**
 * One page, every section on it, a contents list down the side on a wide
 * screen. Seventeen sections is short enough that search is the browser's
 * find, and one URL per answer is an anchor.
 */
export default function Docs() {
  return (
    <ContentPage>
      <PageTitle
        eyebrow="Docs"
        title="How GoodSocials works."
        summary="Everything on the board, in settings and on the bill, one section each."
      />

      <div className="mx-auto mt-16 grid w-full max-w-[1080px] gap-12 px-6 lg:grid-cols-[220px_1fr]">
        <nav
          aria-label="Contents"
          className="lg:sticky lg:top-[calc(var(--nav-h)+32px)] lg:self-start"
        >
          <p className="font-mono text-[11px] uppercase tracking-[0.12em] text-ink-3">
            Contents
          </p>
          <ol className="mt-4 space-y-2 text-[14px] text-ink-2">
            {DOCS.map((section) => (
              <li key={section.id}>
                <a href={`#${section.id}`} className="nav-link">
                  {section.title}
                </a>
              </li>
            ))}
          </ol>
        </nav>

        <div className="max-w-[720px]">
          {DOCS.map((section) => (
            <section
              key={section.id}
              id={section.id}
              className="scroll-mt-[calc(var(--nav-h)+32px)] border-t border-hairline pb-12 pt-10 first:border-t-0 first:pt-0"
            >
              <h2 className="mb-5 text-[26px] font-semibold leading-[1.15] tracking-[-0.02em]">
                <a href={`#${section.id}`}>{section.title}</a>
              </h2>
              <Blocks blocks={section.blocks} />
            </section>
          ))}
        </div>
      </div>

      <CloseBand title="See your first seven posts." />
    </ContentPage>
  );
}
