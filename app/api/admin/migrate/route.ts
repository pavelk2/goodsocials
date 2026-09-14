import { neon } from "@neondatabase/serverless";
import { readFile, readdir } from "node:fs/promises";
import path from "node:path";
import { assertDebugSecret, htmlPage } from "@/lib/linkedin/debug-auth";

/**
 * Applies db/migrations/*.sql against the deployment's own DATABASE_URL, so the
 * connection string never has to leave Vercel. Gated on LINKEDIN_DEBUG_SECRET
 * and deleted with the other Day 1 routes.
 *
 * Statements are split on the drizzle-kit breakpoint marker, not on semicolons,
 * because a semicolon inside a string literal would cut a statement in half.
 */
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const url = new URL(request.url);

  const denied = assertDebugSecret(url);
  if (denied) return htmlPage("Blocked", `<h1>Blocked</h1><p>${denied}</p>`);

  const connection = process.env.DATABASE_URL_UNPOOLED ?? process.env.DATABASE_URL;
  if (!connection) {
    return htmlPage(
      "Not configured",
      "<h1>Not configured</h1><p>DATABASE_URL is not set on this deployment.</p>",
    );
  }

  const dir = path.join(process.cwd(), "db", "migrations");
  let files: string[];
  try {
    files = (await readdir(dir)).filter((f) => f.endsWith(".sql")).sort();
  } catch {
    return htmlPage(
      "No migrations",
      `<h1>No migrations</h1><p>Nothing at ${dir}</p>`,
    );
  }

  const sql = neon(connection);
  const applied: string[] = [];

  for (const file of files) {
    const body = await readFile(path.join(dir, file), "utf8");
    const statements = body
      .split("--> statement-breakpoint")
      .map((s) => s.trim())
      .filter(Boolean);
    for (const statement of statements) {
      try {
        await sql.query(statement);
      } catch (cause) {
        const message = cause instanceof Error ? cause.message : String(cause);
        // Re-running a migration is expected. Anything else is a real failure.
        if (!/already exists/i.test(message)) {
          return htmlPage(
            "Migration failed",
            `<h1>Migration failed</h1>
             <div class="row"><span>file</span><span>${file}</span></div>
             <div class="row"><span>error</span><span>${message}</span></div>
             <pre>${statement.slice(0, 800).replace(/</g, "&lt;")}</pre>`,
          );
        }
      }
    }
    applied.push(file);
  }

  const tables = await sql.query(
    `select table_name from information_schema.tables
     where table_schema = 'public' order by table_name`,
  );
  const names = (tables as { table_name: string }[]).map((r) => r.table_name);

  return htmlPage(
    "Migrated",
    `<h1>Database is up.</h1>
     <div class="row"><span>migrations applied</span><span>${applied.join(", ")}</span></div>
     <div class="row"><span>tables</span><span class="ok">${names.length}</span></div>
     ${names.map((n) => `<div class="row"><span>${n}</span><span>ok</span></div>`).join("")}`,
  );
}
