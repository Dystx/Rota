import { chromium } from "playwright";
import { writeFileSync, mkdirSync } from "node:fs";
import { join } from "node:path";

const OUT = "/tmp/review-screenshots";
mkdirSync(OUT, { recursive: true });

const routes = [
  { group: "marketing", path: "/", name: "01-home", wait: 5000 },
  { group: "marketing", path: "/how-it-works", name: "02-how-it-works", wait: 1500 },
  { group: "marketing", path: "/pricing", name: "03-pricing", wait: 1500 },
  { group: "marketing", path: "/human-review", name: "04-human-review", wait: 1500 },
  { group: "marketing", path: "/portugal", name: "05-portugal", wait: 1500 },
  { group: "marketing", path: "/explore", name: "06-explore", wait: 4000 },
  { group: "marketing", path: "/explore/workspace", name: "07-explore-workspace", wait: 4000 },
  { group: "app", path: "/itineraries", name: "08-itineraries", wait: 1500 },
  { group: "app", path: "/logistics", name: "09-logistics", wait: 1500 },
  { group: "app", path: "/planner", name: "10-planner", wait: 1500 },
  { group: "app", path: "/trip/new", name: "11-trip-new", wait: 1500 },
  { group: "app", path: "/trip/3", name: "12-trip-3", wait: 4000 },
  { group: "app", path: "/trip/3/map", name: "13-trip-3-map", wait: 4000 },
  { group: "app", path: "/trip/3/export", name: "14-trip-3-export", wait: 1500 },
  { group: "app", path: "/account", name: "15-account", wait: 1500 },
  { group: "console", path: "/console/config", name: "16-console-config", wait: 1500 },
  { group: "console", path: "/console/graph", name: "17-console-graph", wait: 1500 },
  { group: "console", path: "/console/messages", name: "18-console-messages", wait: 1500 },
  { group: "console", path: "/console/metrics", name: "19-console-metrics", wait: 1500 },
  { group: "console", path: "/console/pipeline", name: "20-console-pipeline", wait: 1500 },
  { group: "console", path: "/console/workspace", name: "21-console-workspace", wait: 4000 },
  { group: "admin", path: "/admin/analytics", name: "22-admin-analytics", wait: 1500 },
  { group: "admin", path: "/admin/countries", name: "23-admin-countries", wait: 1500 },
  { group: "admin", path: "/admin/partners", name: "24-admin-partners", wait: 1500 },
  { group: "admin", path: "/admin/places", name: "25-admin-places", wait: 2000 },
  { group: "admin", path: "/admin/quality", name: "26-admin-quality", wait: 1500 },
  { group: "admin", path: "/admin/regions", name: "27-admin-regions", wait: 1500 },
  { group: "admin", path: "/admin/reviewers", name: "28-admin-reviewers", wait: 1500 },
  { group: "admin", path: "/admin/specialists", name: "29-admin-specialists", wait: 1500 },
  { group: "reviewer", path: "/reviewer/history", name: "30-reviewer-history", wait: 1500 },
  { group: "reviewer", path: "/reviewer/operations", name: "31-reviewer-operations", wait: 1500 },
  { group: "reviewer", path: "/reviewer/profile", name: "32-reviewer-profile", wait: 1500 },
  { group: "reviewer", path: "/reviewer/queue", name: "33-reviewer-queue", wait: 1500 },
  { group: "other", path: "/support", name: "34-support", wait: 1500 },
  { group: "other", path: "/sustainability", name: "35-sustainability", wait: 1500 },
  { group: "other", path: "/expert-chat", name: "36-expert-chat", wait: 1500 },
  { group: "other", path: "/guide/onboarding", name: "37-guide-onboarding", wait: 1500 },
  { group: "other", path: "/vault", name: "38-vault", wait: 1500 },
  { group: "other", path: "/checkout", name: "39-checkout", wait: 1500 },
];

const results = [];
const browser = await chromium.launch();

for (const viewport of ["desktop", "mobile"]) {
  const context = viewport === "desktop"
    ? await browser.newContext({ viewport: { width: 1440, height: 900 } })
    : await browser.newContext({ viewport: { width: 393, height: 852 } });

  const page = await context.newPage();
  const errors = [];
  page.on("pageerror", (e) => errors.push(`pageerror: ${e.message.substring(0, 150)}`));
  page.on("console", (msg) => {
    if (msg.type() === "error") {
      const text = msg.text();
      if (!text.includes("favicon") && !text.includes("Download the React DevTools")) {
        errors.push(`console.error: ${text.substring(0, 150)}`);
      }
    }
  });

  for (const route of routes) {
    try {
      const resp = await page.goto(`http://127.0.0.1:3105${route.path}`, {
        waitUntil: "domcontentloaded",
        timeout: 15000,
      });
      await page.waitForTimeout(route.wait);
      const status = resp ? resp.status() : "no-response";
      const finalUrl = page.url().replace("http://127.0.0.1:3105", "");
      const redirected = finalUrl !== route.path && !finalUrl.startsWith(route.path);
      const title = await page.title();
      const h1 = await page.locator("h1").first().textContent({ timeout: 1000 }).catch(() => null);
      const navItems = await page.locator("nav a, header a").count().catch(() => 0);
      const interactiveCount = await page.locator("button, a[href], input, select, textarea").count().catch(() => 0);
      const imgsWithoutAlt = await page.locator("img:not([alt])").count().catch(() => 0);
      const h1Count = await page.locator("h1:visible").count().catch(() => 0);

      const filename = `${viewport}-${route.name}.png`;
      await page.screenshot({ path: join(OUT, filename), fullPage: true });

      results.push({
        viewport, group: route.group, path: route.path, name: route.name,
        status, redirected: redirected ? finalUrl : null,
        title: title?.substring(0, 80),
        h1: h1?.substring(0, 60) || null,
        h1Count, navItems, interactiveCount, imgsWithoutAlt,
        consoleErrors: [...errors],
        screenshot: filename,
      });
      const tag = status === 200 ? "✓" : status === 304 ? "↻" : "✘";
      const errTag = errors.length > 0 ? ` [${errors.length}err]` : "";
      console.log(`${tag} ${viewport.padEnd(7)} ${route.path.padEnd(28)} ${status} h1=${h1Count} int=${interactiveCount}${errTag}`);
    } catch (e) {
      results.push({
        viewport, group: route.group, path: route.path, name: route.name,
        status: "ERROR", error: e.message.substring(0, 200),
        consoleErrors: [...errors],
      });
      console.log(`✘ ${viewport} ${route.path} → ${e.message.substring(0, 80)}`);
    }
    errors.length = 0;
  }

  await context.close();
}

await browser.close();

writeFileSync(join(OUT, "results.json"), JSON.stringify(results, null, 2));
const ok = results.filter((r) => r.status === 200).length;
const fail = results.filter((r) => r.status !== 200).length;
const withErrors = results.filter((r) => r.consoleErrors?.length > 0).length;
console.log(`\n${results.length} routes | ${ok} OK | ${fail} fail | ${withErrors} with console errors`);
