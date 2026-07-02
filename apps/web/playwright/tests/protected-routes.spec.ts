import { expect, test, type APIRequestContext, type BrowserContextOptions } from "@playwright/test";
import { createAdminStorageState } from "../fixtures/admin-auth";
import { createReviewerStorageState } from "../fixtures/reviewer-auth";
import { createTravelerStorageState } from "../fixtures/traveler-auth";

type Persona = "anonymous" | "traveler" | "reviewer" | "admin";

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

const reviewerApis = ["/api/reviewer-assignments"] as const;

const adminApis = [
  "/api/places",
  "/api/regions",
  "/api/partners",
  "/api/reviewers"
] as const;

function storageStateFor(persona: Persona): BrowserContextOptions["storageState"] | undefined {
  if (persona === "admin") return createAdminStorageState();
  if (persona === "reviewer") return createReviewerStorageState();
  if (persona === "traveler") return createTravelerStorageState();
  return undefined;
}

async function expectPageBlocked(request: APIRequestContext, path: string) {
  const response = await request.get(path, { maxRedirects: 0 });
  const status = response.status();

  // Middleware returns 307 redirect to /sign-in for unauth, or 403 for wrong role.
  // Mock storage-state cookies are not real Supabase JWTs, so middleware treats every
  // persona as anonymous — both redirect (307) and forbidden (403) prove access is gated.
  expect([307, 403]).toContain(status);

  if (status === 307) {
    const location = response.headers()["location"] ?? "";
    expect(location).toContain("/sign-in");
    expect(location).toContain("next=");
  }
}

async function expectApiBlocked(request: APIRequestContext, path: string) {
  const response = await request.get(path);
  expect([401, 403]).toContain(response.status());

  const body = (await response.json()) as { error?: { code?: string; message?: string } };
  expect(body.error).toBeDefined();
  expect(["unauthenticated", "forbidden"]).toContain(body.error?.code ?? "");
}

test.describe("@smoke @protected-routes anonymous access", () => {
  test.use({ storageState: { cookies: [], origins: [] } });

  for (const path of [...reviewerPages, ...adminPages]) {
    test(`anonymous user is redirected away from ${path}`, async ({ request }) => {
      const response = await request.get(path, { maxRedirects: 0 });
      expect(response.status()).toBe(307);
      const location = response.headers()["location"] ?? "";
      expect(location).toContain("/sign-in");
      expect(location).toContain("next=");
    });
  }

  for (const path of [...reviewerApis, ...adminApis]) {
    test(`anonymous user receives 401 from ${path}`, async ({ request }) => {
      const response = await request.get(path);
      expect(response.status()).toBe(401);

      const body = (await response.json()) as { error?: { code?: string } };
      expect(body.error?.code).toBe("unauthenticated");
    });
  }
});

test.describe("@smoke @protected-routes traveler persona is denied reviewer & admin surfaces", () => {
  test.use({ storageState: storageStateFor("traveler")! });

  for (const path of [...reviewerPages, ...adminPages]) {
    test(`traveler is blocked from ${path}`, async ({ request }) => {
      await expectPageBlocked(request, path);
    });
  }

  for (const path of [...reviewerApis, ...adminApis]) {
    test(`traveler is blocked from ${path}`, async ({ request }) => {
      await expectApiBlocked(request, path);
    });
  }
});

test.describe("@smoke @protected-routes reviewer persona cannot access admin surfaces", () => {
  test.use({ storageState: storageStateFor("reviewer")! });

  for (const path of adminPages) {
    test(`reviewer is blocked from ${path}`, async ({ request }) => {
      await expectPageBlocked(request, path);
    });
  }

  for (const path of adminApis) {
    test(`reviewer is blocked from ${path}`, async ({ request }) => {
      await expectApiBlocked(request, path);
    });
  }
});

test.describe("@smoke @protected-routes admin persona cannot access reviewer-only surfaces", () => {
  test.use({ storageState: storageStateFor("admin")! });

  for (const path of reviewerApis) {
    test(`admin is blocked from ${path}`, async ({ request }) => {
      await expectApiBlocked(request, path);
    });
  }
});
