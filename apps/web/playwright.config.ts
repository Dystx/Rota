import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  // The production server and Supabase-backed persona fixture are shared by
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
    // Always build and start a fresh production server for route-level checks.
    // Reusing a process from another checkout can silently exercise stale
    // planner/UI code and make visual and accessibility evidence invalid.
    command: "pnpm exec next build && pnpm exec next start --hostname 127.0.0.1 --port 3105",
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
