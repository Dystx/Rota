import { describe, expect, test } from "vitest";
import { NextRequest } from "next/server";
import { requireRouteAccess } from "./routes";

function requestFor(pathname: string) {
  return new NextRequest(`http://localhost${pathname}`);
}

describe("requireRouteAccess", () => {
  test("blocks anonymous reviewer APIs with standard 401 JSON", async () => {
    const response = requireRouteAccess(requestFor("/api/reviewer-assignments"), null);

    expect(response?.status).toBe(401);
    await expect(response?.json()).resolves.toEqual({
      error: {
        code: "unauthenticated",
        message: "Authentication required."
      }
    });
  });

  test("rejects wrong-role reviewer pages", () => {
    const response = requireRouteAccess(requestFor("/reviewer/queue"), { app_metadata: { role: "traveler" } });

    expect(response?.status).toBe(403);
  });

  test("allows reviewer routes for trusted reviewer claims", () => {
    const response = requireRouteAccess(requestFor("/reviewer/trips/42"), { app_metadata: { role: "reviewer" } });

    expect(response).toBeNull();
  });

  test("blocks anonymous admin APIs with standard 401 JSON", async () => {
    const response = requireRouteAccess(requestFor("/api/places"), null);

    expect(response?.status).toBe(401);
    await expect(response?.json()).resolves.toEqual({
      error: {
        code: "unauthenticated",
        message: "Authentication required."
      }
    });
  });

  test("rejects traveler sessions on nested admin APIs", async () => {
    const response = requireRouteAccess(requestFor("/api/regions/north"), { app_metadata: { role: "traveler" } });

    expect(response?.status).toBe(403);
    await expect(response?.json()).resolves.toEqual({
      error: {
        code: "forbidden",
        message: "Forbidden."
      }
    });
  });

  test("allows admin pages for trusted admin claims", () => {
    const response = requireRouteAccess(requestFor("/admin/reviewers"), { app_metadata: { role: "admin" } });

    expect(response).toBeNull();
  });

  test("does not trust user-editable metadata for admin routes", () => {
    const claimsWithUserMetadata = { app_metadata: {}, user_metadata: { role: "admin" } };
    const response = requireRouteAccess(requestFor("/admin/places"), claimsWithUserMetadata);

    expect(response?.status).toBe(403);
  });
});

describe("requireRouteAccess full cross-role access matrix", () => {
  const reviewerPages = [
    "/reviewer/queue",
    "/reviewer/history",
    "/reviewer/profile",
    "/reviewer/trips/test-trip-id"
  ];

  const adminPages = [
    "/admin/places",
    "/admin/countries",
    "/admin/regions",
    "/admin/partners",
    "/admin/reviewers",
    "/admin/quality",
    "/admin/analytics"
  ];

  const reviewerApis = ["/api/reviewer-assignments", "/api/reviewer-assignments/abc123"];

  const adminApis = [
    "/api/places",
    "/api/places/abc123",
    "/api/regions",
    "/api/regions/north",
    "/api/partners",
    "/api/reviewers"
  ];

  const personas = [
    { role: "admin" as const, claims: { app_metadata: { role: "admin" } } },
    { role: "reviewer" as const, claims: { app_metadata: { role: "reviewer" } } },
    { role: "traveler" as const, claims: { app_metadata: { role: "traveler" } } }
  ];

  for (const persona of personas) {
    for (const path of reviewerPages) {
      test(`${persona.role} on reviewer page ${path}`, () => {
        const response = requireRouteAccess(requestFor(path), persona.claims);
        if (persona.role === "reviewer") {
          expect(response).toBeNull();
        } else {
          expect(response?.status).toBe(403);
        }
      });
    }

    for (const path of adminPages) {
      test(`${persona.role} on admin page ${path}`, () => {
        const response = requireRouteAccess(requestFor(path), persona.claims);
        if (persona.role === "admin") {
          expect(response).toBeNull();
        } else {
          expect(response?.status).toBe(403);
        }
      });
    }

    for (const path of reviewerApis) {
      test(`${persona.role} on reviewer API ${path}`, async () => {
        const response = requireRouteAccess(requestFor(path), persona.claims);
        if (persona.role === "reviewer") {
          expect(response).toBeNull();
        } else {
          expect(response?.status).toBe(403);
          await expect(response?.json()).resolves.toEqual({
            error: { code: "forbidden", message: "Forbidden." }
          });
        }
      });
    }

    for (const path of adminApis) {
      test(`${persona.role} on admin API ${path}`, async () => {
        const response = requireRouteAccess(requestFor(path), persona.claims);
        if (persona.role === "admin") {
          expect(response).toBeNull();
        } else {
          expect(response?.status).toBe(403);
          await expect(response?.json()).resolves.toEqual({
            error: { code: "forbidden", message: "Forbidden." }
          });
        }
      });
    }
  }

  for (const path of [...reviewerPages, ...adminPages]) {
    test(`anonymous on page ${path} redirects to sign-in`, () => {
      const response = requireRouteAccess(requestFor(path), null);
      expect(response?.status).toBe(307);
      expect(response?.headers.get("location")).toContain("/sign-in");
      expect(response?.headers.get("location")).toContain("next=");
    });
  }

  for (const path of [...reviewerApis, ...adminApis]) {
    test(`anonymous on API ${path} returns 401 JSON`, async () => {
      const response = requireRouteAccess(requestFor(path), null);
      expect(response?.status).toBe(401);
      await expect(response?.json()).resolves.toEqual({
        error: { code: "unauthenticated", message: "Authentication required." }
      });
    });
  }
});
