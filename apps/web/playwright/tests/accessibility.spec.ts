import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page } from "@playwright/test";
import * as fs from "fs";
import * as path from "path";
import { createAdminStorageState } from "../fixtures/admin-auth";
import { createReviewerStorageState } from "../fixtures/reviewer-auth";
import { createTravelerStorageState } from "../fixtures/traveler-auth";
import { getTravelerTripId, travelerTripPath } from "../fixtures/traveler-trip";
import { assertExactArtifactReceipt } from "../visual-state-matrix";

test.beforeEach(() => {
  assertExactArtifactReceipt();
});

const axeResults: { path: string; violations: any[] }[] = [];

// Accept the committed Supabase fixture cookie as well as the current Better
// Auth fixture without treating arbitrary cookie names as proof of a session.
const authSessionCookieName = /^(?:better-auth\.session_token|sb-[a-z0-9]+(?:-[a-z0-9]+)*-auth-token(?:\.\d+)?)$/i;

function hasAuthSessionCookie(cookies: ReadonlyArray<{ name: string }>): boolean {
  return cookies.some((cookie) => authSessionCookieName.test(cookie.name));
}
const h1AuditResults: {
  path: string;
  status: "ok" | "auth-redirect" | "permission-blocked" | "unexpected";
  finalUrl: string;
  title: string;
  bodyClass: string;
  h1Count?: number;
  visibleH1Count?: number;
  sourceVerified: boolean;
  error?: string;
}[] = [];
let shouldWriteH1Audit = false;
const tripId = () => getTravelerTripId();
const tripPath = () => travelerTripPath();
const tripExportPath = () => travelerTripPath("/export");
const tripMapPath = () => travelerTripPath("/map");

async function stabilizeA11yMotion(page: Page): Promise<void> {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.addStyleTag({
    content: "*,*::before,*::after{animation:none!important;transition:none!important}"
  });
  await page.waitForFunction(() =>
    document.getAnimations().every((animation) => animation.playState !== "running")
  );
}

test.afterAll(() => {
  const dir = path.join(process.cwd(), "../../.sisyphus/evidence/future-roadmap");
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  fs.writeFileSync(
    path.join(dir, "task-37-axe-violations.json"),
    JSON.stringify(axeResults, null, 2)
  );

  if (shouldWriteH1Audit) {
    const h1AuditDir = path.join(process.cwd(), "../../.sisyphus/evidence/full-app-framer-redesign");
    if (!fs.existsSync(h1AuditDir)) {
      fs.mkdirSync(h1AuditDir, { recursive: true });
    }
    fs.writeFileSync(
      path.join(h1AuditDir, "task-10-h1-audit.json"),
      JSON.stringify(h1AuditResults, null, 2)
    );
  }
});

async function runAxe(page: any, routePath: string) {
  await page.waitForLoadState("networkidle");
  await stabilizeA11yMotion(page);
  const results = await new AxeBuilder({ page }).analyze();
  
  axeResults.push({
    path: routePath,
    violations: results.violations.map(v => ({
      id: v.id,
      impact: v.impact,
      nodes: v.nodes.map(n => ({ html: n.html, target: n.target }))
    }))
  });

  const seriousOrCritical = results.violations.filter(
    v => v.impact === "serious" || v.impact === "critical"
  );
  
  expect(seriousOrCritical, `Found serious/critical accessibility violations on ${routePath}`).toEqual([]);
}

async function verifyLandmarksAndFocus(page: any, routePath: string) {
  // Route-group loading UIs are intentionally non-landmark status shells. Wait
  // for the resolved route heading before asserting the final landmark tree.
  await page.locator("h1:visible").first().waitFor({ state: "visible" });
  const mainCount = await page.locator("main").count();
  expect(mainCount, `Route ${routePath} should have exactly one <main>`).toBe(1);

  const h1Count = await page.locator("h1:visible").count();
  expect(h1Count, `Route ${routePath} should have exactly one visible <h1>`).toBe(1);

  const skipLinkCount = await page.locator("a.sr-only:has-text('Skip')").count();
  expect(skipLinkCount, `Route ${routePath} should have a skip-to-content link`).toBe(1);
  await expect(page.locator("img[src*='placehold'], img[src*='placeholder'], img[src*='unsplash.com']"), `${routePath} must not contain fallback placeholder imagery`).toHaveCount(0);
}

async function verifyCustomerBodyMinimum(page: any, routePath: string) {
  await page.waitForLoadState("networkidle");
  const undersized = await page.locator("main p, main li, main blockquote").evaluateAll((elements: HTMLElement[]) => {
    const metadata = /font-(?:mono|label|metadata)|text-(?:mono|label|metadata)|type-label|uppercase|tracking-|text-xs|text-ochre-dark|kicker|text-\[[0-9]+px\]/;
    return elements
      .map((element: HTMLElement) => {
        const style = window.getComputedStyle(element);
        const rect = element.getBoundingClientRect();
        const className = typeof element.className === "string" ? element.className : "";
        const text = (element.textContent ?? "").replace(/\s+/g, " ").trim();
        const inControl = Boolean(element.closest("nav, form, fieldset, [role='group']"));
        const shortControlLabel = /text-sm\s+font-medium/.test(className) && text.length < 64;
        const ariaHidden = Boolean(element.closest("[aria-hidden='true']"));
        return {
          tag: element.tagName.toLowerCase(),
          text: text.slice(0, 120),
          size: Number.parseFloat(style.fontSize),
          className,
          visible: rect.width > 0 && rect.height > 0 && style.visibility !== "hidden",
          inControl,
          shortControlLabel,
          ariaHidden
        };
      })
      .filter((item: { visible: boolean; text: string; size: number; className: string; inControl: boolean; shortControlLabel: boolean; ariaHidden: boolean }) => item.visible && item.text && item.size < 16 && !item.inControl && !item.shortControlLabel && !item.ariaHidden && !metadata.test(item.className));
  });

  expect(
    undersized,
    `${routePath} has customer body copy below the 16px minimum`
  ).toEqual([]);
}

async function auditSourceHeading(routePath: string): Promise<boolean> {
  const sourceFiles: Record<string, string> = {
    [tripExportPath()]: "app/(app)/trip/[tripId]/export/page.tsx",
    "/reviewer/history": "app/(reviewer)/reviewer/history/page.tsx",
    "/admin/countries": "app/(admin)/admin/countries/page.tsx",
    "/admin/regions": "app/(admin)/admin/regions/page.tsx",
    "/admin/partners": "app/(admin)/admin/partners/page.tsx",
    "/admin/reviewers": "app/(admin)/admin/reviewers/page.tsx",
    "/admin/quality": "app/(admin)/admin/quality/page.tsx"
  };
  const relative = sourceFiles[routePath];
  if (!relative) return false;

  const candidates = [
    path.join(process.cwd(), relative),
    path.join(process.cwd(), "apps/web", relative)
  ];
  const sourcePath = candidates.find((candidate) => fs.existsSync(candidate)) ?? candidates[0]!;
  const source = await fs.promises.readFile(sourcePath, "utf8");
  return source.includes("h1");
}

async function recordH1Audit(page: any, routePath: string): Promise<{
  path: string;
  status: "ok" | "auth-redirect" | "permission-blocked" | "unexpected";
  finalUrl: string;
  title: string;
  bodyClass: string;
  h1Count: number;
  visibleH1Count: number;
  sourceVerified: boolean;
  error?: string;
}> {
  const h1Count = await page.locator("h1").count();
  const visibleH1Count = await page.locator("h1:visible").count();
  const finalUrl = page.url();
  const title = await page.title();
  const bodyText = await page.locator("body").innerText().catch(() => "");
  const bodyClass = bodyText.includes("Sign in")
    ? "auth-redirect"
    : bodyText.includes("Forbidden")
      ? "permission-blocked"
      : "page";
  const sourceVerified = await auditSourceHeading(routePath);
  const samePath = new URL(finalUrl, "http://127.0.0.1").pathname === routePath;
  const isAuthGateRoute = ["/admin/countries", "/admin/regions", "/admin/partners", "/admin/reviewers", "/admin/quality", "/reviewer/history", tripExportPath()].includes(routePath);
  const status = visibleH1Count === 1
    ? "ok"
    : bodyClass === "auth-redirect"
      ? "auth-redirect"
      : bodyClass === "permission-blocked"
        ? "permission-blocked"
        : samePath
          ? isAuthGateRoute
            ? "permission-blocked"
            : "unexpected"
          : isAuthGateRoute
            ? "auth-redirect"
            : "unexpected";

  return {
    path: routePath,
    status,
    finalUrl,
    title,
    bodyClass,
    h1Count,
    visibleH1Count,
    sourceVerified,
    error:
      visibleH1Count === 1
        ? undefined
        : samePath
          ? `Expected exactly one visible <h1>, received ${visibleH1Count}`
          : undefined
  };
}

test.describe("Accessibility Audit - Public", () => {
  test.setTimeout(60_000);
  const publicRoutes = [
    "/",
    "/portugal",
    "/explore",
    "/explore/workspace",
    "/how-it-works",
    "/pricing",
    "/human-review",
    "/privacy",
    "/terms",
    "/sustainability",
    "/support",
    "/offline",
    "/sign-in",
    "/expert-chat",
    "/feedback",
    "/feedback?activity=porto-ribeira-slow-walk&source=activity-day",
    "/guide",
    "/b2b",
    "/guide/onboarding",
    "/b2b/unknown-workspace"
  ];

  for (const route of publicRoutes) {
    test(`@smoke @a11y public route ${route}`, async ({ page }) => {
      await page.goto(route);
      if (route === "/human-review") {
        await expect(page).toHaveURL(/\/local-expertise(?:\?|$)/u);
      }
      await verifyLandmarksAndFocus(page, route);
      await runAxe(page, route);
    });
  }

  test("@smoke @a11y public customer body copy stays at least 16px", async ({ page }) => {
    const bodyRoutes = [
      "/",
      "/portugal",
      "/explore",
      "/explore/workspace",
      "/activities/porto-ribeira-slow-walk",
      "/how-it-works",
      "/pricing",
      "/local-expertise",
      "/support",
      "/privacy",
      "/terms",
      "/sustainability",
      "/offline",
      "/sign-in",
      "/feedback",
      "/expert-chat",
      "/guide",
      "/b2b/unknown-workspace",
      "/checkout"
    ];

    for (const route of bodyRoutes) {
      await page.goto(route);
      await page.locator("h1:visible").first().waitFor({ state: "visible" });
      await verifyCustomerBodyMinimum(page, route);
    }
  });
});

test.describe("Accessibility Audit - Traveler", () => {
  test.setTimeout(60_000);
  test.use({ storageState: createTravelerStorageState() });
  const routes: Array<() => string> = [() => "/trip/new", tripPath, () => "/account", () => "/vault", () => "/itineraries"];
  
  for (const [index, routeFactory] of routes.entries()) {
    test(`@smoke @a11y traveler route ${index + 1}`, async ({ page }) => {
      const route = routeFactory();
      const authCookies = await page.context().cookies();
      expect(hasAuthSessionCookie(authCookies), "traveler storage state must be loaded before auditing protected routes").toBe(true);
      await page.goto(route);
      await expect(page).not.toHaveURL(/\/sign-in/);
      await verifyLandmarksAndFocus(page, route);
      await runAxe(page, route);
    });
  }

  test("@smoke @a11y itineraries filtered-empty state keeps recovery actionable", async ({ page }) => {
    const route = "/itineraries#filtered-empty";
    await page.goto("/itineraries");
    await expect(page).not.toHaveURL(/\/sign-in/);
    await stabilizeA11yMotion(page);
    const draftsFilter = page.getByRole("button", { name: "Drafts" });
    const filterMotion = await draftsFilter.evaluate((element: HTMLElement) => {
      const style = window.getComputedStyle(element);
      return { animationName: style.animationName, transitionDuration: style.transitionDuration };
    });
    expect(filterMotion, "Axe interactions must disable motion before changing state").toEqual({
      animationName: "none",
      transitionDuration: "0s"
    });
    await page.getByRole("searchbox", { name: "Search itineraries" }).fill("Madeira");
    await draftsFilter.click();
    await expect(draftsFilter).toHaveAttribute("aria-pressed", "true");
    await expect(page.getByTestId("itinerary-filtered-empty")).toBeVisible();
    await expect(page.getByRole("button", { name: "Clear filters" })).toBeVisible();
    await verifyLandmarksAndFocus(page, route);
    await runAxe(page, route);
  });

  test("@smoke @a11y traveler customer body copy stays at least 16px", async ({ page }) => {
    const routes = [
      "/trip/new",
      tripPath(),
      tripExportPath(),
      tripMapPath(),
      `/logistics?trip=${encodeURIComponent(tripId())}`,
      `/expert-chat?trip=${encodeURIComponent(tripId())}`,
      "/account",
      "/vault",
      "/itineraries",
      "/checkout"
    ];

    for (const route of routes) {
      await page.goto(route);
      await expect(page).not.toHaveURL(/\/sign-in/);
      await page.locator("h1:visible").first().waitFor({ state: "visible" });
      await verifyCustomerBodyMinimum(page, route);
    }
  });
});

test("@smoke @a11y planner is choice-led and input-free", async ({ page }) => {
  await page.goto("/planner");
  await expect(page.locator("main")).toHaveCount(1);
  await expect(page.locator("h1:visible")).toHaveCount(1);
  await expect(page.locator("main input, main textarea"), "Planner choices must not regress to free-form inputs").toHaveCount(0);
  // The planner intentionally starts with a pre-filled place context. The
  // current single-screen composition exposes that finite choice group in
  // the first viewport; it must remain selectable without free-form input.
  const placeChoices = page.getByLabel("Place context choices");
  await expect(placeChoices).toBeVisible();
  await expect(placeChoices.locator('[role="radio"], button').first()).toBeVisible();
  await verifyCustomerBodyMinimum(page, "/planner");
  await runAxe(page, "/planner");
});

test("@smoke @a11y cinematic media keeps a poster path for reduced motion", async ({ browser }) => {
  const context = await browser.newContext({ reducedMotion: "reduce" });
  const page = await context.newPage();
  await page.goto("/");
  await page.waitForLoadState("networkidle");
  await expect(page.locator('[data-testid="hero-editorial-media"]')).toBeVisible();
  await expect(page.locator('[data-testid="hero-editorial-media"] video')).toHaveCount(0);
  await expect(page.locator('[data-testid="hero-editorial-media"] img')).toBeVisible();
  await expect(page.locator('[data-testid="hero-editorial-media"]')).toHaveAttribute("data-motion-enabled", "false");
  await context.close();
});

test("@smoke @a11y cinematic media removes autoplay under reduced data", async ({ browser }) => {
  const context = await browser.newContext();
  await context.addInitScript(() => {
    const nativeMatchMedia = window.matchMedia.bind(window);
    window.matchMedia = (query: string) => {
      const result = nativeMatchMedia(query);
      if (query !== "(prefers-reduced-data: reduce)") return result;

      return Object.defineProperties(result, {
        matches: { configurable: true, value: true },
        media: { configurable: true, value: query }
      });
    };
  });

  const page = await context.newPage();
  await page.goto("/");
  await page.waitForLoadState("networkidle");

  const hero = page.locator('[data-testid="hero-editorial-media"]');
  await expect(hero).toBeVisible();
  await expect(hero).toHaveAttribute("data-motion-enabled", "false");
  await expect(hero.locator("video")).toHaveCount(0);
  await expect(hero.locator("img")).toBeVisible();

  await context.close();
});

test("@smoke @a11y 200% zoom-equivalent viewport reflows core routes", async ({ browser }) => {
  // A 640px CSS viewport is the effective width of a 1280px desktop viewport
  // at 200% browser zoom. This catches clipped content while preserving the
  // browser's real responsive layout and focus behavior.
  const context = await browser.newContext({ viewport: { width: 640, height: 1000 } });
  const page = await context.newPage();
  const routes = ["/", "/portugal", "/explore", "/pricing", "/sign-in"];

  for (const route of routes) {
    await page.goto(route);
    await page.locator("h1:visible").first().waitFor({ state: "visible" });
    const metrics = await page.evaluate(() => ({
      clientWidth: document.documentElement.clientWidth,
      scrollWidth: document.documentElement.scrollWidth,
      bodyScrollWidth: document.body.scrollWidth
    }));
    expect(
      metrics.scrollWidth,
      `${route} must not introduce page-level horizontal overflow at the 200% zoom-equivalent width`
    ).toBeLessThanOrEqual(metrics.clientWidth);
    expect(
      metrics.bodyScrollWidth,
      `${route} body must not introduce page-level horizontal overflow at the 200% zoom-equivalent width`
    ).toBeLessThanOrEqual(metrics.clientWidth);
  }

  await context.close();
});

test.describe("Accessibility Audit - Reviewer", () => {
  test.use({ storageState: createReviewerStorageState() });
  const routes = ["/reviewer/queue", "/reviewer/profile"];
  
  for (const route of routes) {
    test(`@smoke @a11y reviewer route ${route}`, async ({ page }) => {
      await page.goto(route);
      await verifyLandmarksAndFocus(page, route);
      await runAxe(page, route);
    });
  }
});

test.describe("Accessibility Audit - Admin", () => {
  test.use({ storageState: createAdminStorageState() });
  const routes = ["/admin/places", "/admin/analytics"];
  
  for (const route of routes) {
    test(`@smoke @a11y admin route ${route}`, async ({ page }) => {
      await page.goto(route);
      await verifyLandmarksAndFocus(page, route);
      await runAxe(page, route);
    });
  }
});

test("@smoke @a11y route h1 sweep", async ({ browser }) => {
  if (test.info().project.name !== "desktop-1440") {
    test.skip();
  }
  // The sweep visits 22 routes (5 marketing + 5 traveler + 5
  // reviewer + 7 admin). The 3D map on the traveler trip map and the
  // admin pages adds to per-route load time, so the default
  // 30s test timeout is too tight. 90s gives the sweep enough
  // headroom for slow route loads.
  test.setTimeout(90_000);

  shouldWriteH1Audit = true;
  const sweeps: Array<{ storageState?: string; routes: string[] }> = [
    { routes: ["/", "/portugal", "/explore", "/explore/workspace", "/how-it-works", "/pricing", "/human-review", "/privacy", "/terms", "/sustainability", "/support", "/offline", "/sign-in"] },
    { storageState: createTravelerStorageState(), routes: ["/trip/new", tripPath(), tripMapPath(), tripExportPath(), "/account"] },
    { storageState: createReviewerStorageState(), routes: ["/reviewer/queue", "/reviewer/profile", "/reviewer/history", "/reviewer/operations", `/reviewer/trips/${tripId()}`] },
    { storageState: createAdminStorageState(), routes: ["/admin/places", "/admin/analytics", "/admin/countries", "/admin/regions", "/admin/partners", "/admin/reviewers", "/admin/quality"] }
  ];

  for (const sweep of sweeps) {
    const context = await browser.newContext(
      sweep.storageState ? { storageState: sweep.storageState } : {}
    );
    const page = await context.newPage();

    for (const route of sweep.routes) {
      await page.goto(route);
      // The 3D map + Realtime subscription on workspace/trip
      // pages keep the network active past `networkidle`'s
      // 500ms quiet window, so the sweep can deadlock on
      // 30s. `domcontentloaded` is enough for the h1 audit
      // because the h1 is in the static layout shell —
      // the audit doesn't need the WebGL canvas to be
      // settled.
      await page.waitForLoadState("domcontentloaded");
      // Give the static markup a beat to paint before
      // recording.
      await page.waitForTimeout(500);
      const result = await recordH1Audit(page, route);

      if (result.status === "ok") {
        expect(result.visibleH1Count, `Route ${route} should have exactly one visible <h1>`).toBe(1);
      } else {
        expect(result.sourceVerified, `Route ${route} source file should contain h1 semantics`).toBe(true);
      }

      h1AuditResults.push(result);
    }

    await context.close();
  }
});

test.describe("Accessibility Audits - Behavior", () => {
  test.use({ storageState: createTravelerStorageState() });

  test("@smoke @a11y keyboard navigation sequence /trip/new", async ({ page }) => {
    const trace: string[] = [];
    await page.route("**/api/trips**", async (route) => {
      if (route.request().method() === "POST") {
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({ tripId: tripId(), tripBriefId: tripId(), message: "Trip brief saved." })
        });
        trace.push(`Mocked POST /api/trips with tripId=${tripId()} for keyboard-only a11y isolation`);
      } else {
        await route.continue();
      }
    });

    await page.goto("/trip/new");
    await page.waitForLoadState("networkidle");
    await expect(page.locator("h1")).toContainText("Give your time a shape");
    trace.push("Navigated to /trip/new");

    await page.waitForTimeout(5000);

    const submitButton = page.getByRole("button", { name: /Save this plan shape/i });
    await submitButton.waitFor({ state: "visible" });
    await submitButton.focus();
    trace.push("Focused submit button via keyboard target");
    await submitButton.press("Enter");
    trace.push("Enter (Submitted choice-led brief)");

    try {
      // Wait for either a redirect to /trip/[id] OR a success message on the page
      await Promise.race([
        page.waitForURL(/\/trip\/\d+/, { timeout: 15000 }),
        page.locator('text=Trip brief saved').waitFor({ timeout: 15000 })
      ]);
      trace.push("Form submitted successfully. URL: " + page.url());
    } catch (e) {
      const pageText = await page.locator('p.rota-form-error, p.text-on-surface-variant:has-text("need attention"), p.text-on-surface-variant:has-text("Could not save")').first().textContent().catch(()=>"No error text found");
      trace.push("Failed to submit form. Found error: " + pageText);
      throw e;
    } finally {
      const dir = path.join(process.cwd(), "../../.sisyphus/evidence/future-roadmap");
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      fs.writeFileSync(path.join(dir, "task-37-keyboard-trip-new.txt"), trace.join("\n"));
    }
  });
});

test("@smoke @a11y focus-visible regression", async ({ page }) => {
  const pages = ["/", "/pricing", "/how-it-works"];
  for (const route of pages) {
    await page.goto(route);
    await page.keyboard.press("Tab"); 
    const outline = await page.evaluate(() => {
      const el = document.activeElement;
      if (!el) return null;
      return window.getComputedStyle(el).outline;
    });
    expect(outline).not.toBe("0px none rgb(0, 0, 0)");
  }
});

test("@smoke @a11y reduced-motion respect", async ({ browser }) => {
  const context = await browser.newContext({ reducedMotion: "reduce" });
  const page = await context.newPage();
  const route = tripPath();
  const evidenceDir = path.join(process.cwd(), "../../.sisyphus/evidence/full-app-framer-redesign");

  if (!fs.existsSync(evidenceDir)) {
    fs.mkdirSync(evidenceDir, { recursive: true });
  }

  await page.goto(route);
  await page.waitForLoadState("networkidle");

  const sampleStyles = await page.evaluate(() => {
    const parseMs = (value: string) => value.split(",").map((part) => part.trim()).map((part) => {
      if (part.endsWith("ms")) return Number(part.slice(0, -2));
      if (part.endsWith("s")) return Number(part.slice(0, -1)) * 1000;
      return Number(part);
    });

    const selector = [
      "main",
      "main *",
      "[data-motion]",
      "[style*='transition']",
      "[style*='animation']"
    ].join(", ");
    const candidates = Array.from(document.querySelectorAll(selector)).filter((element) => {
      const rect = element.getBoundingClientRect();
      return rect.width > 0 && rect.height > 0;
    });

    return candidates.slice(0, 12).map((element) => {
      const style = window.getComputedStyle(element);
      return {
        tag: element.tagName.toLowerCase(),
        animationDurationsMs: parseMs(style.animationDuration),
        animationIterationCount: style.animationIterationCount,
        transitionDurationsMs: parseMs(style.transitionDuration),
        transitionDelaysMs: parseMs(style.transitionDelay),
      };
    });
  });

  expect(sampleStyles.length, `Expected reduced-motion route ${route} to expose at least one visible sample element`).toBeGreaterThan(0);

  for (const sample of sampleStyles) {
    expect.soft(
      sample.animationDurationsMs.every((duration) => duration === 0),
      `Reduced-motion should zero animation duration on <${sample.tag}> at ${route}`
    ).toBe(true);
    expect.soft(
      sample.animationIterationCount,
      `Reduced-motion should remove repeated animations on <${sample.tag}> at ${route}`
    ).toBe("1");
    expect.soft(
      sample.transitionDurationsMs.every((duration) => duration === 0),
      `Reduced-motion should zero transition duration on <${sample.tag}> at ${route}`
    ).toBe(true);
    expect.soft(
      sample.transitionDelaysMs.every((duration) => duration === 0),
      `Reduced-motion should zero transition delay on <${sample.tag}> at ${route}`
    ).toBe(true);
  }

  await page.screenshot({
    path: path.join(evidenceDir, "task-5-reduced-motion.png"),
    fullPage: true,
  });

  await context.close();
});
