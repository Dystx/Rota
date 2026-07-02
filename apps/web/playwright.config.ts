import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
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
    command: "pnpm exec next start --hostname 127.0.0.1 --port 3105",
    url: "http://127.0.0.1:3105",
    reuseExistingServer: true,
    timeout: 120_000
  },
  projects: [
    {
      name: "desktop-chrome",
      use: { ...devices["Desktop Chrome"] }
    },
    {
      name: "mobile-chromium",
      use: { ...devices["Pixel 5"] }
    }
  ]
});
