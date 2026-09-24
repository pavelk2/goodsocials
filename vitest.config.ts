import { defineConfig } from "vitest/config";
import { fileURLToPath } from "node:url";

/**
 * Unit tests only, Node environment, no database and no network. The `@/`
 * alias is the one thing that has to be repeated here, because vitest does not
 * read tsconfig paths and a domain file importing `@/db` is normal.
 */
export default defineConfig({
  resolve: {
    alias: { "@": fileURLToPath(new URL(".", import.meta.url)) },
  },
  test: {
    environment: "node",
    include: ["**/__tests__/**/*.test.ts"],
  },
});
