import { describe, expect, test } from "vitest";
import { NextRequest } from "next/server";
import { requireRouteAccess } from "./routes";

function requestFor(pathname: string) {
  return new NextRequest(`http://localhost${pathname}`);
}

describe("requireRouteAccess", () => {
  test("leaves anonymous reviewer APIs to the API route", async () => {
    const response = requireRouteAccess(requestFor("/api/reviewer-assignments"), null);

    expect(response).toBeNull();
  });

  test("does not authorize roles at the session-refresh boundary", () => {
    const response = requireRouteAccess(requestFor("/reviewer/trips/42"), { app_metadata: { role: "traveler" } });

    expect(response).toBeNull();
  });

  test("leaves anonymous admin APIs to the API route", async () => {
    const response = requireRouteAccess(requestFor("/api/places"), null);

    expect(response).toBeNull();
  });

  test("leaves APIs to the server-side authorization layer", async () => {
    const response = requireRouteAccess(requestFor("/api/regions/north"), { app_metadata: { role: "traveler" } });

    expect(response).toBeNull();
  });

  test("allows every authenticated session through for server-side access checks", () => {
    const claimsWithUserMetadata = { app_metadata: {}, user_metadata: { role: "admin" } };
    const response = requireRouteAccess(requestFor("/admin/places"), claimsWithUserMetadata);

    expect(response).toBeNull();
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
        expect(response).toBeNull();
      });
    }

    for (const path of adminPages) {
      test(`${persona.role} on admin page ${path}`, () => {
        const response = requireRouteAccess(requestFor(path), persona.claims);
        expect(response).toBeNull();
      });
    }

    for (const path of reviewerApis) {
      test(`${persona.role} on reviewer API ${path}`, async () => {
        const response = requireRouteAccess(requestFor(path), persona.claims);
        expect(response).toBeNull();
      });
    }

    for (const path of adminApis) {
      test(`${persona.role} on admin API ${path}`, async () => {
        const response = requireRouteAccess(requestFor(path), persona.claims);
        expect(response).toBeNull();
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
    test(`anonymous on API ${path} is left to the API route`, async () => {
      const response = requireRouteAccess(requestFor(path), null);
      expect(response).toBeNull();
    });
  }
});
