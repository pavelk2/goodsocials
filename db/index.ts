import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "./schema";

/**
 * Built on first use, not at module load. Next collects page data at build
 * time, where DATABASE_URL does not exist, so constructing the client at the
 * top level fails the build rather than the request.
 *
 * One connection per request over HTTP, which is what the pooled Neon URL is
 * for. Migrations use DATABASE_URL_UNPOOLED, see drizzle.config.ts.
 */
let cached: ReturnType<typeof drizzle<typeof schema>> | null = null;

export function getDb() {
  if (cached) return cached;
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("Missing environment variable: DATABASE_URL");
  cached = drizzle(neon(url), { schema });
  return cached;
}

export { schema };
