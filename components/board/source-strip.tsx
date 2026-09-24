import Link from "next/link";
import { SourceIcon } from "@/components/integrations/source-icon";
import { CATALOG_LIST } from "@/lib/integrations/catalog";
import type { SourceState } from "@/lib/integrations/sources";
import type { SourceKind } from "@/lib/integrations/types";

/**
 * The five sources as five glyphs, on the board header.
 *
 * It sits here rather than behind Settings because what the agent knows about
 * this business is a property of the board, the same way runway is. A user
 * approving a card that says "[your number here]" should be able to see, in the
 * same glance, that nothing is connected and that the fix is one click, instead
 * of learning it two screens away.
 *
 * State is the weight of the mark and nothing else: ink when we have the
 * connection, the light grey when we do not. No badge, no count, no second
 * colour. The board spends its one accent on runway, per DESIGN.md section 1,
 * and five brand hues in a header is the plugin directory the house style bans.
 * A source whose last read failed still reads as connected, because it is; what
 * went wrong is a sentence from the API and belongs in the sheet where there is
 * room for it. The label carries it for anyone who cannot see the weight.
 */
export function SourceStrip({
  states,
}: {
  states: Partial<Record<SourceKind, SourceState>>;
}) {
  const connected = CATALOG_LIST.filter((d) => states[d.kind]).length;

  return (
    <div
      role="group"
      aria-label={`Integrations, ${connected} of ${CATALOG_LIST.length} connected`}
      className="inline-flex w-fit items-center gap-[2px] rounded-[9px] border border-hairline bg-surface p-[3px]"
    >
      {CATALOG_LIST.map((definition) => {
        const state = states[definition.kind];
        return (
          <Link
            key={definition.kind}
            href={`/integrations?open=${definition.kind}`}
            /* The name and the state in words, because the mark alone is a
               shape and the colour difference is the whole signal. */
            title={label(definition.name, state)}
            aria-label={label(definition.name, state)}
            className="btn-quiet rounded-[6px] p-[5px]"
          >
            <SourceIcon
              kind={definition.kind}
              size={16}
              className={state ? "text-ink" : "text-ink-3"}
            />
          </Link>
        );
      })}
    </div>
  );
}

function label(name: string, state: SourceState | undefined): string {
  if (state === "broken") return `${name}, connected, last read failed`;
  if (state === "active") return `${name}, connected`;
  return `${name}, not connected`;
}
