import { expect, test, type Browser, type BrowserContext, type Page } from "@playwright/test";
import * as fs from "node:fs";
import * as path from "node:path";

import { HTTP_ROUTE_CATALOGUE, type HttpRouteDefinition } from "@/lib/routes/http-route-catalogue";
import { createAdminStorageState } from "../fixtures/admin-auth";
import { createReviewerStorageState } from "../fixtures/reviewer-auth";
import { readTravelerTripFixture } from "../fixtures/traveler-trip";
import { createTravelerStorageState } from "../fixtures/traveler-auth";

type BaselineViewport = "desktop-1440" | "mobile-390";

type BaselineRecord = {
  route: string;
  url: string;
  persona: string;
  viewport: BaselineViewport;
  rendered: boolean;
  responseStatus: number | null;
  finalUrl: string | null;
  visibleH1Count: number | null;
  mainCount: number | null;
  documentWidth: { client: number | null; scroll: number | null };
  consoleErrors: string[];
  pageErrors: string[];
  mediaFontRequests: Array<{ kind: string; url: string; status: number | null; failure?: string }>;
  screenshotPath: string | null;
  fixtureError?: string;
  navigationError?: string;
};

type RedirectRecord = {
  route: string;
  url: string;
  persona: string;
  status: number | null;
  destination: string | null;
  requestError?: string;
};

const VIEWPORTS: ReadonlyArray<{ name: BaselineViewport; width: number; height: number }> = [
  { name: "desktop-1440", width: 1440, height: 1000 },
  { name: "mobile-390", width: 390, height: 844 }
];

const EVIDENCE_ROOT = path.resolve(process.cwd(), "../../.sisyphus/evidence/rumia-corrective-baseline");
const RESULTS_PATH = path.join(EVIDENCE_ROOT, "baseline-results.json");

function routeSlug(route: string): string {
  return route.replace(/[^a-z0-9]+/giu, "-").replace(/^-|-$/gu, "") || "home";
}

function fixturePathFor(route: HttpRouteDefinition): { url: string; persona: string; fixtureError?: string } {
  try {
    if (route.path === "/activities/[activityId]") {
      return { url: "/activities/porto-ribeira-slow-walk", persona: "public" };
    }

    if (route.path === "/reviewer/trips/[tripId]") {
      const fixture = readTravelerTripFixture();
      return { url: `/reviewer/trips/${encodeURIComponent(fixture.tripId)}`, persona: "reviewer" };
    }

    if (route.path === "/trip/[tripId]" || route.path === "/trip/[tripId]/map" || route.path === "/trip/[tripId]/export") {
      const fixture = readTravelerTripFixture();
      const suffix = route.path.endsWith("/map") ? "/map" : route.path.endsWith("/export") ? "/export" : "";
      return { url: `/trip/${encodeURIComponent(fixture.tripId)}${suffix}`, persona: "traveler" };
    }

    if (route.path === "/checkout" || route.path === "/logistics") {
      const fixture = readTravelerTripFixture();
      return { url: `${route.path}?trip=${encodeURIComponent(fixture.tripId)}`, persona: "traveler" };
    }

    if (route.path === "/b2b/[orgSlug]") {
      return { url: "/b2b/e2e-organization", persona: "organization" };
    }

    if (route.path.includes("[")) {
      return { url: route.path.replace(/\[[^\]]+\]/gu, "missing"), persona: route.auth };
    }

    return { url: route.path, persona: route.auth === "public" ? "public" : route.auth };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return {
      url: route.path.replace(/\[[^\]]+\]/gu, "missing"),
      persona: route.auth,
      fixtureError: message
    };
  }
}

function storageStateFor(persona: string): string | undefined {
  if (persona === "traveler") return createTravelerStorageState();
  if (persona === "reviewer") return createReviewerStorageState();
  if (persona === "admin") return createAdminStorageState();
  return undefined;
}

async function captureRenderedRoute(
  browser: Browser,
  route: HttpRouteDefinition,
  viewport: (typeof VIEWPORTS)[number]
): Promise<BaselineRecord> {
  const resolved = fixturePathFor(route);
  const context: BrowserContext = await browser.newContext({
    storageState: storageStateFor(resolved.persona),
    viewport: { width: viewport.width, height: viewport.height }
  });
  const page: Page = await context.newPage();
  const consoleErrors: string[] = [];
  const pageErrors: string[] = [];
  const mediaFontRequests: BaselineRecord["mediaFontRequests"] = [];

  page.on("console", (message) => {
    if (message.type() === "error") consoleErrors.push(message.text());
  });
  page.on("pageerror", (error) => pageErrors.push(error.message));
  page.on("response", (response) => {
    const request = response.request();
    const resourceType = request.resourceType();
    if (resourceType === "media" || resourceType === "font") {
      mediaFontRequests.push({ kind: resourceType, url: response.url(), status: response.status() });
    }
  });
  page.on("requestfailed", (request) => {
    const resourceType = request.resourceType();
    if (resourceType === "media" || resourceType === "font") {
      mediaFontRequests.push({ kind: resourceType, url: request.url(), status: null, failure: request.failure()?.errorText });
    }
  });

  const screenshotFile = path.join(EVIDENCE_ROOT, routeSlug(route.path), `${viewport.name}.png`);
  fs.mkdirSync(path.dirname(screenshotFile), { recursive: true });
  let responseStatus: number | null = null;
  let finalUrl: string | null = null;
  let visibleH1Count: number | null = null;
  let mainCount: number | null = null;
  let documentWidth: BaselineRecord["documentWidth"] = { client: null, scroll: null };
  let navigationError: string | undefined;

  try {
    const response = await page.goto(resolved.url, { waitUntil: "domcontentloaded", timeout: 30_000 });
    responseStatus = response?.status() ?? null;
    finalUrl = page.url();
    visibleH1Count = await page.locator("h1:visible").count();
    mainCount = await page.locator("main").count();
    documentWidth = await page.evaluate(() => ({
      client: document.documentElement.clientWidth,
      scroll: document.documentElement.scrollWidth
    }));
  } catch (error) {
    navigationError = error instanceof Error ? error.message : String(error);
    finalUrl = page.url() || null;
    try {
      visibleH1Count = await page.locator("h1:visible").count();
      mainCount = await page.locator("main").count();
      documentWidth = await page.evaluate(() => ({
        client: document.documentElement.clientWidth,
        scroll: document.documentElement.scrollWidth
      }));
    } catch {
      // The navigation may have failed before a document existed; the record
      // still remains in the immutable results file with null measurements.
    }
  }

  let screenshotPath: string | null = null;
  try {
    await page.screenshot({ path: screenshotFile, fullPage: true });
    screenshotPath = path.relative(process.cwd(), screenshotFile);
  } catch (error) {
    navigationError ||= `screenshot: ${error instanceof Error ? error.message : String(error)}`;
  }
  await context.close();

  return {
    route: route.path,
    url: resolved.url,
    persona: resolved.persona,
    viewport: viewport.name,
    rendered: true,
    responseStatus,
    finalUrl,
    visibleH1Count,
    mainCount,
    documentWidth,
    consoleErrors,
    pageErrors,
    mediaFontRequests,
    screenshotPath,
    ...(resolved.fixtureError ? { fixtureError: resolved.fixtureError } : {}),
    ...(navigationError ? { navigationError } : {})
  };
}

test.describe("@corrective-baseline immutable current artifact", () => {
  test.describe.configure({ mode: "serial" });
  test.setTimeout(30 * 60 * 1000);

  test("captures every current catalogue route at desktop and mobile", async ({ browser, request }) => {
    fs.mkdirSync(EVIDENCE_ROOT, { recursive: true });
    const renderedRoutes: BaselineRecord[] = [];
    const redirects: RedirectRecord[] = [];

    for (const route of HTTP_ROUTE_CATALOGUE) {
      const resolved = fixturePathFor(route);
      if ("redirect" in route && route.redirect) {
        try {
          const response = await request.get(resolved.url, { maxRedirects: 0 });
          redirects.push({
            route: route.path,
            url: resolved.url,
            persona: resolved.persona,
            status: response.status(),
            destination: response.headers().location ?? null,
            ...(resolved.fixtureError ? { requestError: resolved.fixtureError } : {})
          });
        } catch (error) {
          redirects.push({
            route: route.path,
            url: resolved.url,
            persona: resolved.persona,
            status: null,
            destination: null,
            requestError: error instanceof Error ? error.message : String(error)
          });
        }
        continue;
      }

      for (const viewport of VIEWPORTS) {
        renderedRoutes.push(await captureRenderedRoute(browser, route, viewport));
      }
    }

    const payload = {
      capturedAt: new Date().toISOString(),
      buildId: process.env.RUMIA_BUILD_ID ?? process.env.GIT_COMMIT ?? "unknown",
      renderedRoutes,
      redirects
    };
    fs.writeFileSync(RESULTS_PATH, JSON.stringify(payload, null, 2), "utf8");

    expect(renderedRoutes).toHaveLength(51 * 2);
    expect(redirects).toHaveLength(2);
    expect(new Set(renderedRoutes.map((record) => `${record.route}:${record.viewport}`)).size).toBe(51 * 2);
    expect(new Set(redirects.map((record) => record.route)).size).toBe(2);
  });
});
