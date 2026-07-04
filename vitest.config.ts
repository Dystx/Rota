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
    // `test.projects` is vitest 3.2's replacement for the deprecated
    // `environmentMatchGlobs`. Each project is its own vitest process
    // with its own include + environment.
    //
    // Two projects:
    //   - `jsdom`: every `.test.tsx` (React component tests need
    //     @testing-library/react's DOM), plus `.test.ts` inside the
    //     two packages whose per-package configs are NOT auto-picked
    //     by the root runner:
    //       - packages/ui (vitest 2 — separate runtime; the
    //         per-package config has `environment: "jsdom"`, but
    //         only when invoked from inside the package)
    //       - packages/spatial-engine (per-package config is
    //         vitest 3, also jsdom, but not auto-included by the
    //         root)
    //   - `node`: every other `.test.ts` (db, ai, ingest, route
    //     handlers, zustand stores — fastest in node mode).
    //
    // The per-package configs (`packages/ui/vitest.config.ts`,
    // `packages/spatial-engine/vitest.config.ts`) still run
    // independently when invoked from inside the package
    // (`pnpm --filter @repo/ui test`). Listing them in the root
    // projects would double-run the same tests, so we don't.
    projects: [
      {
        // `extends: true` merges the root `resolve.alias` (the
        // `@` -> apps/web alias) into this project. Without it,
        // the project is self-contained and the API route tests
        // can't resolve `@/lib/auth/api`. The previous
        // `environmentMatchGlobs` config didn't have this issue
        // because the root test runner handled the alias; projects
        // are independent.
        extends: true,
        test: {
          name: "jsdom",
          environment: "jsdom",
          include: [
            "**/*.test.tsx",
            "packages/ui/**/*.test.ts",
            "packages/spatial-engine/**/*.test.ts"
          ]
        }
      },
      {
        extends: true,
        test: {
          name: "node",
          environment: "node",
          include: [
            "packages/*/src/**/*.test.ts",
            "apps/web/app/**/*.test.ts",
            "apps/web/lib/**/*.test.ts"
          ],
          // packages/ui and packages/spatial-engine are picked up by the
          // `jsdom` project above. The `packages/*/src/**/*.test.ts`
          // glob above would also catch them (deeper path), so
          // exclude them here to prevent vitest from running them
          // in node mode (where window/document are undefined and
          // testing-library's matchMedia/IntersectionObserver mocks
          // throw ReferenceError).
          exclude: [
            "packages/ui/**",
            "packages/spatial-engine/**"
          ]
        }
      }
    ]
  }
});
