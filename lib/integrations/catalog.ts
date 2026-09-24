import type { SourceDefinition, SourceKind } from "./types";
import { SOURCE_KINDS } from "./types";

/**
 * The five sources, described once. No secrets, no node imports, no adapter
 * code, so a client component can render the connect sheet from this file
 * without pulling five API clients into the browser bundle.
 *
 * Every credential here is a paste-once key with read scopes, and that is the
 * selection rule rather than a coincidence. LinkedIn already costs this product
 * a re-authorization every 60 days and a monitor to catch it silently dying.
 * Five more OAuth grants would be five more of those. A source that needs a
 * refresh flow does not belong in this file.
 */
export const CATALOG: Record<SourceKind, SourceDefinition> = {
  stripe: {
    kind: "stripe",
    name: "Stripe",
    reads: "Revenue, active subscriptions, new customers, cancellations.",
    serves: ["receipt", "data"],
    credentialUrl: "https://dashboard.stripe.com/apikeys/create",
    credentialHow:
      "Create a restricted key with read access to Customers, Subscriptions, Charges and Events. A secret key works and grants far more than we need.",
    fields: [
      {
        name: "credential",
        label: "Restricted key",
        placeholder: "rk_live_...",
        hint: "Read scopes only. We never write to Stripe.",
        required: true,
        secret: true,
      },
    ],
  },

  github: {
    kind: "github",
    name: "GitHub",
    reads: "Pull requests merged, commits, issues closed, latest release.",
    serves: ["receipt", "finding"],
    credentialUrl: "https://github.com/settings/personal-access-tokens/new",
    credentialHow:
      "A fine-grained token with read-only Contents, Issues and Pull requests. Public repositories need no permissions at all.",
    fields: [
      {
        name: "credential",
        label: "Access token",
        placeholder: "github_pat_...",
        required: true,
        secret: true,
      },
      {
        name: "handle",
        label: "Username",
        placeholder: "Read from the token",
        hint: "Leave empty and we use whoever the token belongs to.",
        required: false,
        secret: false,
      },
    ],
  },

  posthog: {
    kind: "posthog",
    name: "PostHog",
    reads: "Pageviews, visitors, top pages, referrers, product events.",
    serves: ["data", "receipt"],
    credentialUrl: "https://app.posthog.com/settings/user-api-keys",
    credentialHow:
      "A personal API key scoped to this project with Query read access. Nothing else is needed.",
    fields: [
      {
        name: "credential",
        label: "Personal API key",
        placeholder: "phx_...",
        required: true,
        secret: true,
      },
      {
        name: "handle",
        label: "Project id",
        placeholder: "12345",
        hint: "The number in your PostHog URL after /project/.",
        required: true,
        secret: false,
      },
      {
        name: "host",
        label: "Host",
        placeholder: "https://us.posthog.com",
        hint: "https://eu.posthog.com for the EU cloud, or your own domain.",
        required: false,
        secret: false,
      },
    ],
  },

  plausible: {
    kind: "plausible",
    name: "Plausible",
    reads: "Visitors, pageviews, bounce rate, top pages, top sources.",
    serves: ["data", "receipt"],
    credentialUrl: "https://plausible.io/settings/api-keys",
    credentialHow: "A stats API key. Plausible keys are read-only by design.",
    fields: [
      {
        name: "credential",
        label: "API key",
        placeholder: "Plausible stats key",
        required: true,
        secret: true,
      },
      {
        name: "handle",
        label: "Site",
        placeholder: "goodsocials.co",
        hint: "The domain exactly as it appears in Plausible.",
        required: true,
        secret: false,
      },
      {
        name: "host",
        label: "Host",
        placeholder: "https://plausible.io",
        hint: "Only if you host Plausible yourself.",
        required: false,
        secret: false,
      },
    ],
  },

  notion: {
    kind: "notion",
    name: "Notion",
    reads: "Your recently edited pages, with an excerpt of each.",
    serves: ["framework", "finding"],
    credentialUrl: "https://www.notion.so/my-integrations",
    credentialHow:
      "An internal integration with read content capability, then share the pages you want read with it. Pages you do not share stay invisible to us.",
    fields: [
      {
        name: "credential",
        label: "Internal integration secret",
        placeholder: "ntn_...",
        hint: "Read content only. Do not grant insert or update.",
        required: true,
        secret: true,
      },
    ],
  },
};

export const CATALOG_LIST: SourceDefinition[] = SOURCE_KINDS.map(
  (kind) => CATALOG[kind],
);

export function definitionFor(kind: SourceKind): SourceDefinition {
  return CATALOG[kind];
}

export function isSourceKind(value: string): value is SourceKind {
  return (SOURCE_KINDS as string[]).includes(value);
}
