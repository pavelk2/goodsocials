import { neon } from "@neondatabase/serverless";
import { assertDebugSecret, htmlPage } from "@/lib/linkedin/debug-auth";

/**
 * Answers "why did sign in fail" in one request instead of a log dig. Reports
 * which variables are present, never their values, and whether the tables
 * actually exist. Deleted with the rest of the Day 1 scaffolding.
 */
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * The first eight break sign in. The last two break the board, and they break
 * it later and quieter: a missing image key throws inside an approve the user
 * already clicked, which reads to them as the product not working.
 */
const REQUIRED = [
  "DATABASE_URL",
  "DATABASE_URL_UNPOOLED",
  "AUTH_SECRET",
  "AUTH_URL",
  "LINKEDIN_CLIENT_ID",
  "LINKEDIN_CLIENT_SECRET",
  "LINKEDIN_API_VERSION",
  "TOKEN_ENCRYPTION_KEY",
  "ANTHROPIC_API_KEY",
  "OPENROUTER_API_KEY",
] as const;

const EXPECTED_TABLES = [
  "account",
  "board",
  "brand_principle",
  "card",
  "card_action",
  "image_quota",
  "linkedin_connection",
  "profile",
  "scheduled_post",
];

function row(label: string, value: string) {
  return `<div class="row"><span>${label}</span><span>${value}</span></div>`;
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const denied = assertDebugSecret(url);
  if (denied) return htmlPage("Blocked", `<h1>Blocked</h1><p>${denied}</p>`);

  const env = REQUIRED.map((name) =>
    row(name, process.env[name] ? "set" : '<span style="color:#c94b4b">missing</span>'),
  );

  // Blob has two ways to authenticate and a connected store uses the newer one:
  // Vercel injects BLOB_STORE_ID and mints VERCEL_OIDC_TOKEN per deployment, so
  // there is no BLOB_READ_WRITE_TOKEN to find and its absence is not a fault.
  // The static token still works, so either one passes.
  const blobStore = process.env.BLOB_STORE_ID;
  const blobToken = process.env.BLOB_READ_WRITE_TOKEN;
  env.push(
    row(
      "Vercel Blob",
      blobStore
        ? "store connected, OIDC"
        : blobToken
          ? "read write token"
          : '<span style="color:#c94b4b">missing</span>',
    ),
  );

  // A key of the wrong length fails only at the moment we seal a token, which
  // is inside the sign in callback, where the error is hardest to see.
  const rawKey = process.env.TOKEN_ENCRYPTION_KEY;
  if (rawKey) {
    const bytes = Buffer.from(rawKey, "base64").length;
    env.push(
      row(
        "TOKEN_ENCRYPTION_KEY length",
        bytes === 32
          ? "32 bytes, ok"
          : `<span style="color:#c94b4b">${bytes} bytes, must be 32</span>`,
      ),
    );
  }

  let tableRows = row("tables", "not checked, DATABASE_URL missing");
  const connection = process.env.DATABASE_URL;
  if (connection) {
    try {
      const result = await neon(connection).query(
        `select table_name from information_schema.tables where table_schema = 'public'`,
      );
      const found = new Set(
        (result as { table_name: string }[]).map((r) => r.table_name),
      );
      const missing = EXPECTED_TABLES.filter((t) => !found.has(t));
      tableRows =
        missing.length === 0
          ? row("tables", `<span class="ok">all ${EXPECTED_TABLES.length} present</span>`)
          : row(
              "tables missing",
              `<span style="color:#c94b4b">${missing.join(", ")}</span>`,
            ) +
            `<p style="margin-top:24px;color:#6E6E73">Run /api/admin/migrate with the same key. Sign in fails with AccessDenied until the tables exist, because the insert throws inside the Auth.js callback.</p>`;
    } catch (cause) {
      tableRows = row(
        "database",
        `<span style="color:#c94b4b">${cause instanceof Error ? cause.message : String(cause)}</span>`,
      );
    }
  }

  return htmlPage("Health", `<h1>Deployment health</h1>${env.join("")}${tableRows}`);
}
