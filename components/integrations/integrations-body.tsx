import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { loadAccess, seatName } from "@/lib/profiles";
import { listSources } from "@/lib/integrations/sources";
import { ago } from "@/lib/integrations/format";
import { SourceRow, type Reading } from "@/components/integrations/source-row";
import { isSourceKind } from "@/lib/integrations/catalog";
import { connect, disconnect, refresh } from "@/app/integrations/actions";

/**
 * Five rows, in the order they are worth connecting.
 *
 * The heading is the fading sentence the house style asks for: the claim in ink,
 * the qualification in grey, one block rather than a headline and a subheading in
 * two boxes. The qualification is the important half. Somebody is about to paste
 * a live Stripe key into a product they bought last week, and the sentence that
 * earns it is the one that says we only ever read.
 *
 * One body, two frames. On its own page it carries a heading and a way back to
 * the board; in the sheet over the board the sheet already has both, so it
 * drops them rather than saying the same thing twice a centimetre apart.
 */
export async function IntegrationsBody({
  open,
  inSheet = false,
}: {
  /** Which source to put the connect form on, from `?open=`. */
  open?: string;
  inSheet?: boolean;
} = {}) {
  const session = await auth();
  if (!session?.memberId) redirect("/signin");

  const access = await loadAccess(session.memberId);
  if (!access?.active) redirect("/settings");

  const profile = access.active.profile;
  const sources = await listSources(profile.id);
  const connected = sources.filter((s) => s.connected !== null).length;
  // An unknown slug opens nothing rather than erroring: the parameter comes
  // from a url anybody can edit.
  const openKind = open && isSourceKind(open) ? open : null;

  return (
    <>
      <h2
        className={`max-w-[680px] font-semibold tracking-[-0.02em] ${
          inSheet
            ? "text-[17px] leading-[1.3]"
            : "text-[22px] leading-[1.25]"
        }`}
      >
        <span>Connect what you already measure.</span>{" "}
        <span className="text-ink-3">
          A post that opens on your own number is the one nobody can argue with,
          and typing it in every week is the part people stop doing. We read these
          once a day and never write to any of them.
        </span>
      </h2>

      <section className={`${inSheet ? "mt-5" : "mt-8"} max-w-[760px]`}>
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
              /* The open state is a prop, and a prop change does not reset
                 useState. Keying on it remounts the one row whose form should
                 be open, so clicking a second glyph while the sheet is already
                 up moves the form instead of leaving it on the first. */
              key={`${view.definition.kind}:${openKind === view.definition.kind}`}
              openOnMount={openKind === view.definition.kind}
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
          {inSheet ? null : (
            <Link href="/board" className="text-ink underline">
              Back to the board
            </Link>
          )}
        </p>
      </div>
    </>
  );
}
