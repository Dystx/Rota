import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  // The production server and PostgreSQL/Better Auth persona fixture are shared by
  // every project. A single worker keeps WebGL, streamed route shells, and
  // fixture writes deterministic in the canonical release gate.
  workers: 1,
  fullyParallel: false,
  globalSetup: "./playwright/global-setup.ts",
  testDir: "./playwright/tests",
  outputDir: "./playwright/test-results",
  reporter: [
    ["list"],
    ["json", { outputFile: "./playwright-report/results.json" }],
    ["html", { outputFolder: "./playwright-report", open: "never" }]
  ],
  use: {
    baseURL: "http://127.0.0.1:3105",
    trace: "on-first-retry",
    screenshot: "only-on-failure",
    video: "retain-on-failure"
  },
  webServer: {
    // Always build and start the standalone release artifact for route-level
    // checks. Reusing a process from another checkout can silently exercise
    // stale planner/UI code and make visual and accessibility evidence invalid.
    // Next's standalone server needs static/public assets copied beside it.
    command:
      "pnpm exec next build && rm -rf .next/standalone/apps/web/.next/static .next/standalone/apps/web/public && cp -a .next/static .next/standalone/apps/web/.next/static && cp -a public .next/standalone/apps/web/public && HOSTNAME=127.0.0.1 PORT=3105 node .next/standalone/apps/web/server.js",
    url: "http://127.0.0.1:3105",
    reuseExistingServer: false,
    timeout: 120_000
  },
  projects: [
    {
      name: "desktop-chrome",
      use: { ...devices["Desktop Chrome"] }
    },
    {
      name: "mobile-chromium",
      use: { ...devices["Pixel 5"], viewport: { width: 390, height: 844 } }
    }
  ]
});
