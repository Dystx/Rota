import { expect, test, type APIRequestContext, type BrowserContextOptions } from "@playwright/test";
import { createAdminStorageState } from "../fixtures/admin-auth";
import { createAdminLimitedStorageState } from "../fixtures/admin-limited-auth";
import { createReviewerStorageState } from "../fixtures/reviewer-auth";
import { createTravelerStorageState } from "../fixtures/traveler-auth";

type Persona = "anonymous" | "traveler" | "reviewer" | "admin" | "limited-admin";

const reviewerPages = [
  "/reviewer/queue",
  "/reviewer/history",
  "/reviewer/profile",
  "/reviewer/trips/test-trip-id"
] as const;

const adminPages = [
  "/admin/places",
  "/admin/countries",
  "/admin/regions",
  "/admin/partners",
  "/admin/reviewers",
  "/admin/quality",
  "/admin/analytics"
] as const;

const consolePages = [
  "/console/pipeline",
  "/console/workspace",
  "/console/messages",
  "/console/graph",
  "/console/metrics",
  "/console/config",
  "/api/v1/docs"
] as const;

const reviewerApis = ["/api/reviewer-assignments"] as const;

const adminApis = [
  "/api/places",
  "/api/regions",
  "/api/partners",
  "/api/reviewers"
] as const;

const consoleApis = [
  "/api/console/chat-messages?conversationId=conversation-1",
  "/api/console/itinerary-events?conversationId=conversation-1"
] as const;

function storageStateFor(persona: Persona): BrowserContextOptions["storageState"] | undefined {
  if (persona === "admin") return createAdminStorageState();
  if (persona === "limited-admin") return createAdminLimitedStorageState();
  if (persona === "reviewer") return createReviewerStorageState();
  if (persona === "traveler") return createTravelerStorageState();
  return undefined;
}

async function expectPageBlocked(request: APIRequestContext, path: string) {
  const response = await request.get(path, { maxRedirects: 0 });
  const status = response.status();

  // API requests can observe a direct 307/403, while Next's server-component
  // redirect is serialized into a 200 HTML/RSC response by the standalone
  // production server. All three forms still prove the page boundary is gated.
  expect([200, 307, 403]).toContain(status);

  if (status === 307) {
    const location = response.headers()["location"] ?? "";
    expect(location).toContain("/sign-in");
    expect(location).toContain("next=");
    return;
  }

  if (status === 200) {
    const body = await response.text();
    const isRedirect = body.includes("NEXT_REDIRECT");
    const isForbiddenPage = body.includes('data-testid=\"admin-forbidden\"') || body.includes(">Forbidden<") || body.toLowerCase().includes("access is restricted");
    expect(isRedirect || isForbiddenPage).toBe(true);

    if (isRedirect) {
      expect(body).toContain("sign-in");
    }
  }
}

async function expectApiBlocked(request: APIRequestContext, path: string) {
  const response = await request.get(path);
  expect([401, 403]).toContain(response.status());

  const body = (await response.json()) as { code?: string; message?: string; error?: { code?: string; message?: string } };
  const code = body.code ?? body.error?.code;
  expect(["unauthenticated", "forbidden"]).toContain(code ?? "");
}

test.describe("@smoke @protected-routes anonymous access", () => {
  test.use({ storageState: { cookies: [], origins: [] } });

  for (const path of [...reviewerPages, ...adminPages, ...consolePages]) {
    test(`anonymous user is redirected away from ${path}`, async ({ request }) => {
      await expectPageBlocked(request, path);
    });
  }

  for (const path of [...reviewerApis, ...adminApis, ...consoleApis]) {
    test(`anonymous user receives 401 from ${path}`, async ({ request }) => {
      const response = await request.get(path);
      expect(response.status()).toBe(401);

      const body = (await response.json()) as { code?: string; error?: { code?: string } };
      expect(body.code ?? body.error?.code).toBe("unauthenticated");
    });
  }
});

test.describe("@smoke @protected-routes traveler persona is denied reviewer & admin surfaces", () => {
  test.use({ storageState: storageStateFor("traveler")! });

  for (const path of [...reviewerPages, ...adminPages, ...consolePages]) {
    test(`traveler is blocked from ${path}`, async ({ request }) => {
      await expectPageBlocked(request, path);
    });
  }

  for (const path of [...reviewerApis, ...adminApis, ...consoleApis]) {
    test(`traveler is blocked from ${path}`, async ({ request }) => {
      await expectApiBlocked(request, path);
    });
  }
});

test.describe("@smoke @protected-routes reviewer persona cannot access admin surfaces", () => {
  test.use({ storageState: storageStateFor("reviewer")! });

  for (const path of [...adminPages, ...consolePages]) {
    test(`reviewer is blocked from ${path}`, async ({ request }) => {
      await expectPageBlocked(request, path);
    });
  }

  for (const path of [...adminApis, ...consoleApis]) {
    test(`reviewer is blocked from ${path}`, async ({ request }) => {
      await expectApiBlocked(request, path);
    });
  }
});

test.describe("@smoke @protected-routes admin persona can read reviewer operations", () => {
  test.use({ storageState: storageStateFor("admin")! });

  for (const path of reviewerApis) {
    test(`admin can read ${path}`, async ({ request }) => {
      const response = await request.get(path);
      expect(response.status()).toBe(200);
      const body = (await response.json()) as { assignments?: unknown };
      expect(body.assignments).toBeDefined();
    });
  }
});

test.describe("@smoke @protected-routes limited admin capabilities are enforced", () => {
  test.use({ storageState: storageStateFor("limited-admin")! });

  for (const path of [...adminPages, ...consolePages]) {
    test(`limited admin is blocked from ${path}`, async ({ request }) => {
      await expectPageBlocked(request, path);
    });
  }

  for (const path of [...adminApis, ...consoleApis]) {
    test(`limited admin is blocked from ${path}`, async ({ request }) => {
      await expectApiBlocked(request, path);
    });
  }
});

test.describe("@smoke @protected-routes admin persona can reach console and developer boundaries", () => {
  test.use({ storageState: storageStateFor("admin")! });

  for (const path of consolePages) {
    test(`admin can reach ${path}`, async ({ request }) => {
      const response = await request.get(path, { maxRedirects: 0 });
      expect(response.status()).toBe(200);
    });
  }
});
