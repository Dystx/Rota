import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

export default defineConfig({
  root: fileURLToPath(new URL(".", import.meta.url)),
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./apps/web", import.meta.url)),
      "server-only": fileURLToPath(new URL("./test/server-only.ts", import.meta.url))
    }
  },
  test: {
    environment: "node",
    include: [
      "packages/*/src/**/*.test.ts",
      "packages/*/src/**/*.test.tsx",
      "apps/web/app/**/*.test.ts",
      "apps/web/app/**/*.test.tsx",
      "apps/web/lib/**/*.test.ts",
      "apps/web/lib/**/*.test.tsx"
    ]
  }
});
