import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { loadAccess, seatName } from "@/lib/profiles";
import { listSources } from "@/lib/integrations/sources";
import { ago } from "@/lib/integrations/format";
import { SourceRow, type Reading } from "@/components/integrations/source-row";
import { connect, disconnect, refresh } from "@/app/integrations/actions";

/**
 * Five rows, in the order they are worth connecting.
 *
 * The heading is the fading sentence the house style asks for: the claim in ink,
 * the qualification in grey, one block rather than a headline and a subheading in
 * two boxes. The qualification is the important half. Somebody is about to paste
 * a live Stripe key into a product they bought last week, and the sentence that
 * earns it is the one that says we only ever read.
 */
export async function IntegrationsBody() {
  const session = await auth();
  if (!session?.memberId) redirect("/signin");

  const access = await loadAccess(session.memberId);
  if (!access?.active) redirect("/settings");

  const profile = access.active.profile;
  const sources = await listSources(profile.id);
  const connected = sources.filter((s) => s.connected !== null).length;

  return (
    <>
      <h2 className="max-w-[680px] text-[22px] font-semibold leading-[1.25] tracking-[-0.02em]">
        <span>Connect what you already measure.</span>{" "}
        <span className="text-ink-3">
          A post that opens on your own number is the one nobody can argue with,
          and typing it in every week is the part people stop doing. We read these
          once a day and never write to any of them.
        </span>
      </h2>

      <section className="mt-8 max-w-[760px]">
        <div className="flex items-baseline justify-between gap-6">
          <h3 className="text-[13px] font-medium text-ink-2">
            {seatName(access.active)}
          </h3>
          <span className="num text-[13px] text-ink-3">
            {connected} of {sources.length} connected
          </span>
        </div>

        <ul className="mt-2">
          {sources.map((view) => (
            <SourceRow
              key={view.definition.kind}
              definition={view.definition}
              connected={
                view.connected
                  ? {
                      status: view.connected.status,
                      handle: view.connected.handle,
                      lastSyncedLabel: view.connected.lastSyncedAt
                        ? ago(view.connected.lastSyncedAt)
                        : null,
                      lastError: view.connected.lastError,
                      stale: view.stale,
                    }
                  : null
              }
              readings={view.facts.map(
                (f): Reading => ({
                  key: f.key,
                  label: f.label,
                  value: f.value,
                  detail: f.detail,
                  period: f.period,
                }),
              )}
              connect={connect}
              refresh={refresh}
              disconnect={disconnect}
            />
          ))}
        </ul>
      </section>

      <div className="mt-6 max-w-[560px] space-y-3 text-[13px] leading-[1.4] text-ink-2">
        <p>
          Every key is stored encrypted and read only by the job that syncs it.
          None of these five can post, charge, or change anything, and we ask for
          read permissions only.
        </p>
        <p>
          A number we read goes into a draft exactly as it came back, with the
          period it covers. If a card asks you for something, it is because no
          connected source has it.{" "}
          <Link href="/board" className="text-ink underline">
            Back to the board
          </Link>
        </p>
      </div>
    </>
  );
}
