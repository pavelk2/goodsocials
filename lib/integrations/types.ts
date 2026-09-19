import type { PostKind } from "@/lib/post-kind";

/**
 * Read only, all five of them. Nothing in lib/integrations writes to anybody's
 * API, and no adapter is given a credential that could.
 */
export type SourceKind =
  | "stripe"
  | "github"
  | "posthog"
  | "plausible"
  | "notion";

export const SOURCE_KINDS: SourceKind[] = [
  "stripe",
  "github",
  "posthog",
  "plausible",
  "notion",
];

/**
 * A reading on its way to the database. `key` is stable within a source, so a
 * sync updates the row it wrote last time. A key that stops coming back is a
 * reading that stopped being true, and the sync deletes it.
 */
export type DraftFact = {
  key: string;
  label: string;
  value: string;
  detail?: string | null;
  period?: string | null;
};

/** What an adapter needs. `credential` is plaintext and never leaves the call. */
export type AdapterInput = {
  credential: string;
  handle: string | null;
  host: string | null;
  now: Date;
};

export type CheckResult =
  | { ok: true; handle?: string | null; account?: string | null }
  | { ok: false; error: string };

export type ReadResult =
  | { ok: true; facts: DraftFact[] }
  | { ok: false; error: string };

/**
 * Two methods, and the split matters. `check` is one cheap authenticated read
 * that runs before a credential is stored, so a mistyped key is refused in the
 * sheet the user is still looking at rather than discovered by a cron at 04:00.
 * `read` is the daily work.
 */
export type Adapter = {
  kind: SourceKind;
  check(input: AdapterInput): Promise<CheckResult>;
  read(input: AdapterInput): Promise<ReadResult>;
};

/** A field the connect sheet asks for. Rendered by the catalog, not by a form. */
export type SourceField = {
  name: "credential" | "handle" | "host";
  label: string;
  placeholder: string;
  /** One line under the input. Where the value comes from, in plain words. */
  hint?: string;
  required: boolean;
  /** True for the one field that becomes ciphertext. */
  secret: boolean;
};

export type SourceDefinition = {
  kind: SourceKind;
  name: string;
  /** What it reads, in the words a user would use. One line, no selling. */
  reads: string;
  /** Which post kinds this source feeds, so the value is legible on the row. */
  serves: PostKind[];
  fields: SourceField[];
  /** Deep link to the page that issues the credential, not a docs homepage. */
  credentialUrl: string;
  /** The permission to grant, named exactly. Read scopes only, every time. */
  credentialHow: string;
};
