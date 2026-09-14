import Link from "next/link";

/**
 * Shared shell for /privacy and /terms. Both are read by a LinkedIn reviewer
 * and by a customer deciding whether to hand over posting rights, so they are
 * plain type on paper: no cards, no icons, hairline rows for anything that is
 * label left, fact right.
 */
export function LegalPage({
  title,
  summary,
  lastUpdated,
  children,
}: {
  title: string;
  summary: string;
  lastUpdated: string;
  children: React.ReactNode;
}) {
  return (
    <main className="mx-auto w-full max-w-[720px] px-6 py-24">
      <Link href="/" className="text-ink-2 underline underline-offset-4">
        GoodSocials
      </Link>

      <h1
        className="mt-10 text-[clamp(36px,5vw,56px)] font-semibold leading-[1.02]"
        style={{ letterSpacing: "-0.03em" }}
      >
        <span>{title}</span> <span className="cont">{summary}</span>
      </h1>

      <p className="num mt-8 text-ink-2">Last updated {lastUpdated}</p>

      {children}
    </main>
  );
}

export function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="mt-14">
      <h2
        className="text-[22px] font-semibold"
        style={{ letterSpacing: "-0.02em" }}
      >
        {title}
      </h2>
      <div className="mt-4 space-y-4 text-ink-2">{children}</div>
    </section>
  );
}

export function Row({ label, value }: { label: string; value: string }) {
  return (
    <li className="flex flex-col gap-1 border-b border-hairline py-[14px] sm:flex-row sm:items-baseline sm:justify-between sm:gap-8">
      <span className="text-ink">{label}</span>
      <span className="text-ink-2 sm:max-w-[58%] sm:text-right">{value}</span>
    </li>
  );
}
