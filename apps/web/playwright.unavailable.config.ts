import { defineConfig, devices } from "@playwright/test";

const port = Number(process.env.PERSISTENCE_FAILURE_PORT ?? 3311);
const mode = process.env.PERSISTENCE_FAILURE_MODE === "unreachable" ? "unreachable" : "missing-config";
const runtimeEnvironment = mode === "missing-config"
  ? `env -u DATABASE_URL -u BETTER_AUTH_SECRET HOSTNAME=127.0.0.1 PORT=${port}`
  : `env DATABASE_URL='postgresql://127.0.0.1:9/rumia' BETTER_AUTH_SECRET='unavailable-test-secret-that-is-at-least-32-characters' HOSTNAME=127.0.0.1 PORT=${port}`;

export default defineConfig({
  workers: 1,
  fullyParallel: false,
  testDir: "./playwright/tests",
  testMatch: "persistence-unavailable.spec.ts",
  outputDir: "./playwright/test-results-unavailable",
  reporter: [["list"], ["json", { outputFile: "./playwright-report/persistence-unavailable.json" }]],
  use: {
    baseURL: `http://127.0.0.1:${port}`,
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
    video: "retain-on-failure"
  },
  webServer: {
    // Build once with harmless placeholders, then run the one standalone
    // worker with the requested failure mode. No persona setup or watcher is
    // allowed in this diagnostic gate.
    command: `DATABASE_URL='postgresql://127.0.0.1:5432/rumia' BETTER_AUTH_SECRET='build-only-secret-that-is-at-least-32-characters' NEXT_PUBLIC_APP_URL='http://127.0.0.1:${port}' pnpm exec next build && rm -rf .next/standalone/apps/web/.next/static .next/standalone/apps/web/public && cp -a .next/static .next/standalone/apps/web/.next/static && cp -a public .next/standalone/apps/web/public && ${runtimeEnvironment} node .next/standalone/apps/web/server.js`,
    url: `http://127.0.0.1:${port}`,
    reuseExistingServer: false,
    timeout: 120_000
  },
  projects: [
    {
      name: "desktop-unavailable",
      use: { ...devices["Desktop Chrome"], viewport: { width: 1440, height: 1000 } }
    },
    {
      name: "mobile-unavailable",
      use: { ...devices["Pixel 5"], viewport: { width: 390, height: 844 } }
    }
  ]
});
