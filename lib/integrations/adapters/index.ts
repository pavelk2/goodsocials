import type { Adapter, SourceKind } from "../types";
import { githubAdapter } from "./github";
import { notionAdapter } from "./notion";
import { plausibleAdapter } from "./plausible";
import { posthogAdapter } from "./posthog";
import { stripeAdapter } from "./stripe";

/**
 * The registry. Adding a source is a file in this directory and a line here,
 * plus a definition in ../catalog.ts and a member on the source_kind enum.
 * Nothing else in the product knows the five apart.
 */
export const ADAPTERS: Record<SourceKind, Adapter> = {
  stripe: stripeAdapter,
  github: githubAdapter,
  posthog: posthogAdapter,
  plausible: plausibleAdapter,
  notion: notionAdapter,
};

export function adapterFor(kind: SourceKind): Adapter {
  return ADAPTERS[kind];
}
