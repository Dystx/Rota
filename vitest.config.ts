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
    // Default to the node environment — most of our tests are pure
    // logic (db, ai, ingest, route handlers, zustand stores) and
    // run faster without jsdom. Per-package configs that want jsdom
    // for React component tests override this through the
    // environmentMatchGlobs block below.
    environment: "node",
    // React component tests + any test in packages/ui or
    // packages/spatial-engine need a DOM. We use environmentMatchGlobs
    // instead of switching the default so the db/ai/ingest/api tests
    // stay fast (no jsdom boot) and so a missing-dom regression
    // surfaces with the same error message we just fixed, rather than
    // a slower test suite where the failure is masked.
    //
    // Match all .test.tsx files plus the .ts tests inside the two
    // React-heavy packages (e.g. use-reduced-motion.test.ts uses
    // matchMedia and needs a window).
    environmentMatchGlobs: [
      ["**/*.test.tsx", "jsdom"],
      ["packages/ui/**/*.test.ts", "jsdom"],
      ["packages/spatial-engine/**/*.test.ts", "jsdom"]
    ],
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
