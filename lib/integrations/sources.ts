import { and, asc, eq } from "drizzle-orm";
import { getDb } from "@/db";
import { fact as factTable, source as sourceTable } from "@/db/schema";
import { adapterFor } from "./adapters";
import { CATALOG, CATALOG_LIST } from "./catalog";
import { sealCredential } from "./credentials";
import { syncSource } from "./sync";
import { isStale, type FactRow } from "./facts";
import type { SourceDefinition, SourceKind } from "./types";

/**
 * Everything the integrations screen and its server actions need. One file so
 * no route invents its own authorization rule, the way lib/profiles.ts is the
 * one answer to "whose board is this".
 *
 * Nothing here returns a credential, sealed or otherwise. The screen shows when
 * a source was last read and what it said, which is all a user needs and all we
 * are willing to put in an HTML payload.
 */

export type ConnectedSource = {
  id: string;
  status: "active" | "broken";
  handle: string | null;
  host: string | null;
  lastSyncedAt: Date | null;
  lastError: string | null;
  connectedAt: Date;
};

export type SourceView = {
  definition: SourceDefinition;
  connected: ConnectedSource | null;
  facts: FactRow[];
  /**
   * The readings are here but too old to go into a post. Shown rather than
   * hidden: a user whose key was revoked three weeks ago should see the
   * numbers the source last gave us and the reason they stopped being used,
   * not an empty row that looks like nothing was ever connected.
   */
  stale: boolean;
};

export async function listSources(
  profileId: string,
  now = new Date(),
): Promise<SourceView[]> {
  const db = getDb();

  const [rows, facts] = await Promise.all([
    db.select().from(sourceTable).where(eq(sourceTable.profileId, profileId)),
    db
      .select({
        kind: sourceTable.kind,
        key: factTable.key,
        label: factTable.label,
        value: factTable.value,
        detail: factTable.detail,
        period: factTable.period,
        observedAt: factTable.observedAt,
      })
      .from(factTable)
      .innerJoin(sourceTable, eq(factTable.sourceId, sourceTable.id))
      .where(eq(factTable.profileId, profileId))
      .orderBy(asc(factTable.label)),
  ]);

  const byKind = new Map(rows.map((row) => [row.kind, row]));
  const factsByKind = new Map<SourceKind, FactRow[]>();
  for (const row of facts as FactRow[]) {
    const list = factsByKind.get(row.kind) ?? [];
    list.push(row);
    factsByKind.set(row.kind, list);
  }

  return CATALOG_LIST.map((definition) => {
    const row = byKind.get(definition.kind);
    const own = factsByKind.get(definition.kind) ?? [];
    return {
      definition,
      connected: row
        ? {
            id: row.id,
            status: row.status,
            handle: row.handle,
            host: row.host,
            lastSyncedAt: row.lastSyncedAt,
            lastError: row.lastError,
            connectedAt: row.createdAt,
          }
        : null,
      facts: own,
      stale:
        own.length > 0 && own.every((f) => isStale(f.observedAt, now)),
    };
  });
}

export type ConnectInput = {
  profileId: string;
  kind: SourceKind;
  credential: string;
  handle?: string | null;
  host?: string | null;
};

export type ConnectResult =
  | { ok: true; facts: number; warning?: string }
  | { ok: false; error: string };

function clean(value: string | null | undefined): string | null {
  const trimmed = value?.trim();
  return trimmed ? trimmed : null;
}

/**
 * Connect, and read once before saying it worked.
 *
 * The credential is checked against the live API before it is stored, so a
 * mistyped key is refused in the sheet the user is still looking at. Then the
 * first sync runs inline, because a screen that says "connected" and shows no
 * numbers is a screen the user cannot tell from a broken one.
 */
export async function connectSource(input: ConnectInput): Promise<ConnectResult> {
  const definition = CATALOG[input.kind];
  const credential = input.credential.trim();
  let handle = clean(input.handle);
  const host = clean(input.host);

  for (const field of definition.fields) {
    if (!field.required) continue;
    const value =
      field.name === "credential" ? credential : field.name === "handle" ? handle : host;
    if (!value) return { ok: false, error: `${field.label} is required.` };
  }

  const adapter = adapterFor(input.kind);
  const now = new Date();

  let checked;
  try {
    checked = await adapter.check({ credential, handle, host, now });
  } catch (cause) {
    console.error(`[sources] ${input.kind} check threw:`, cause);
    return {
      ok: false,
      error: `We could not reach ${definition.name}. Try again in a minute.`,
    };
  }
  if (!checked.ok) return { ok: false, error: checked.error };

  // GitHub tells us the login the token belongs to, which is the handle every
  // later call needs and the one field a user should not have to type.
  handle = clean(checked.handle) ?? handle;

  const sealed = sealCredential(credential);
  const [row] = await getDb()
    .insert(sourceTable)
    .values({
      profileId: input.profileId,
      kind: input.kind,
      ...sealed,
      handle,
      host,
      status: "active",
      lastError: null,
    })
    .onConflictDoUpdate({
      // Reconnecting replaces the key in place, so a rotated credential keeps
      // the source's facts instead of orphaning them behind a new row.
      target: [sourceTable.profileId, sourceTable.kind],
      set: { ...sealed, handle, host, status: "active", lastError: null },
    })
    .returning();

  if (!row) return { ok: false, error: "We could not save that connection." };

  const report = await syncSource(row, now);
  if (!report.ok) {
    return {
      ok: true,
      facts: 0,
      warning: report.error ?? `${definition.name} is connected and read nothing yet.`,
    };
  }
  return { ok: true, facts: report.facts };
}

/**
 * Disconnecting takes the facts with it. The row cascades, and that is the
 * intent rather than a side effect: a number we can no longer re-read is a
 * number we should not be putting under somebody's name next Tuesday.
 *
 * Scoped to one kind on one profile. An agency running twelve clients must not
 * be able to clear eleven other boards by disconnecting Stripe on this one.
 */
export async function disconnectSource(
  profileId: string,
  kind: SourceKind,
): Promise<void> {
  await getDb()
    .delete(sourceTable)
    .where(
      and(eq(sourceTable.profileId, profileId), eq(sourceTable.kind, kind)),
    );
}
