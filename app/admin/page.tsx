import { notFound } from "next/navigation";
import { AppHeader } from "@/components/app-header";
import { isAdmin, loadPipeline, type MemberRow } from "@/lib/admin";

export const metadata = { title: "Admin", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

/**
 * The pipeline from first visit to paying, for the founder and nobody else.
 * Anyone who is not on ADMIN_EMAILS gets a 404, so the page does not say it
 * exists. Rows in settings style: label left, value right, hairline between.
 */
export default async function AdminPage() {
  if (!(await isAdmin())) notFound();
  const pipeline = await loadPipeline();

  return (
    <>
      <AppHeader />
      <main className="mx-auto w-full max-w-[1160px] px-4 py-8 sm:px-6 sm:py-10">
        <h1 className="text-[28px] font-semibold tracking-[-0.03em]">Pipeline</h1>
        <p className="mt-1 text-[13px] text-ink-2">
          {pipeline.trackingSince
            ? `Visits counted since ${day(pipeline.trackingSince)}. Accounts from before that have no visit history.`
            : "No visits recorded yet."}
        </p>

        <section className="mt-8 grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-5">
          {pipeline.counts.map((c) => (
            <div key={c.label} className="rounded-[var(--r-md)] border border-hairline bg-surface p-4">
              <div className="font-mono text-[24px] font-semibold tabular-nums">{c.value}</div>
              <div className="mt-1 text-[13px] text-ink-2">{c.label}</div>
            </div>
          ))}
        </section>

        <h2 className="mt-12 text-[20px] font-semibold tracking-[-0.02em]">
          Registered <span className="font-mono text-ink-2">{pipeline.members.length}</span>
        </h2>
        <div className="mt-4 overflow-x-auto rounded-[var(--r-md)] border border-hairline bg-surface">
          <table className="w-full min-w-[980px] text-left text-[13px]">
            <thead className="text-ink-2">
              <tr className="border-b border-hairline">
                <Th>Member</Th>
                <Th>Registered</Th>
                <Th>From</Th>
                <Th>Onboarding answers</Th>
                <Th>Step</Th>
                <Th>First post</Th>
                <Th>Finished</Th>
                <Th>Clicked subscribe</Th>
                <Th>Subscription</Th>
              </tr>
            </thead>
            <tbody>
              {pipeline.members.map((m, i) => (
                <Member key={`${m.email}-${i}`} member={m} />
              ))}
            </tbody>
          </table>
        </div>

        <h2 className="mt-12 text-[20px] font-semibold tracking-[-0.02em]">
          Visitors who did not register{" "}
          <span className="font-mono text-ink-2">{pipeline.anonymousTotal}</span>
        </h2>
        <div className="mt-4 overflow-x-auto rounded-[var(--r-md)] border border-hairline bg-surface">
          <table className="w-full min-w-[560px] text-left text-[13px]">
            <thead className="text-ink-2">
              <tr className="border-b border-hairline">
                <Th>First seen</Th>
                <Th>Last seen</Th>
                <Th>From</Th>
                <Th>Got as far as</Th>
              </tr>
            </thead>
            <tbody>
              {pipeline.anonymous.map((a, i) => (
                <tr key={i} className="border-b border-hairline last:border-0">
                  <Td mono>{time(a.firstSeen)}</Td>
                  <Td mono>{time(a.lastSeen)}</Td>
                  <Td>{a.from ?? <Dim>direct</Dim>}</Td>
                  <Td>{a.furthest}</Td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {pipeline.anonymousTotal > pipeline.anonymous.length ? (
          <p className="mt-2 text-[13px] text-ink-2">
            Showing the latest {pipeline.anonymous.length}.
          </p>
        ) : null}
      </main>
    </>
  );
}

function Member({ member: m }: { member: MemberRow }) {
  return (
    <tr className="border-b border-hairline align-top last:border-0">
      <Td>
        <div className="font-medium">{m.email ?? <Dim>no email</Dim>}</div>
        {m.name ? <div className="text-ink-2">{m.name}</div> : null}
        {m.site ? <div className="max-w-[220px] truncate text-ink-2">{m.site}</div> : null}
      </Td>
      <Td mono>{time(m.registeredAt)}</Td>
      <Td>{m.from ?? <Dim>{m.firstSeen ? "direct" : "unknown"}</Dim>}</Td>
      <Td>
        {m.answers.length === 0 ? (
          <Dim>none</Dim>
        ) : (
          <dl className="grid max-w-[320px] grid-cols-[auto_1fr] gap-x-3 gap-y-1">
            {m.answers.map((a) => (
              <div key={a.question} className="contents">
                <dt className="text-ink-2">{a.question}</dt>
                <dd>{a.answer}</dd>
              </div>
            ))}
          </dl>
        )}
      </Td>
      <Td>{m.step ?? <Dim>before funnel</Dim>}</Td>
      <Td>
        <Mark on={m.sawFirstPost} />
      </Td>
      <Td>
        <Mark on={m.finished} />
      </Td>
      <Td>
        <Mark on={m.clickedSubscribe} />
      </Td>
      <Td>
        {m.subscription ? (
          <span className={m.paying ? "font-semibold text-accent-text" : undefined}>
            {m.subscription}
          </span>
        ) : (
          <Dim>none</Dim>
        )}
        {m.cancelled && (
          <div className="mt-1 whitespace-nowrap text-ink-2">
            {m.endsAt ? `Cancelled, ends ${day(m.endsAt)}` : "Cancelled"}
          </div>
        )}
      </Td>
    </tr>
  );
}

function Th({ children }: { children: React.ReactNode }) {
  return <th className="px-4 py-3 font-normal whitespace-nowrap">{children}</th>;
}

function Td({ children, mono }: { children: React.ReactNode; mono?: boolean }) {
  return (
    <td className={`px-4 py-3 ${mono ? "font-mono whitespace-nowrap tabular-nums" : ""}`}>
      {children}
    </td>
  );
}

function Dim({ children }: { children: React.ReactNode }) {
  return <span className="text-ink-3">{children}</span>;
}

function Mark({ on }: { on: boolean }) {
  return on ? <span className="font-semibold">Yes</span> : <Dim>No</Dim>;
}

function day(d: Date): string {
  return d.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" });
}

function time(d: Date): string {
  return d.toLocaleString("en-GB", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "UTC",
  });
}
