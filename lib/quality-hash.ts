import { createHash } from "node:crypto";

/**
 * The key a quality verdict is stored against. Apart from lib/quality.ts
 * because that file is read by the board in the browser, where node:crypto
 * does not exist.
 */
export function textHash(text: string): string {
  return createHash("sha256").update(text).digest("hex");
}
