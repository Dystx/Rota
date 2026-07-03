import { describe, expect, test } from "vitest";
import type { Place } from "@repo/types";
import type { AuthorizedApiContext } from "@/lib/auth/api";
import { handlePlacesGetRequest, handlePlacesPostRequest } from "./route";

const authClient = {};

const adminAuth = {
  client: authClient,
  reviewerId: null,
  role: "admin",
  userId: "admin-user-123"
} as AuthorizedApiContext;

const savedPlace: Place = {
  category: "Viewpoint",
  id: "miradouro-da-vitoria",
  name: "Miradouro da Vitória",
  quality: 8.8,
  region: "Porto",
  sourceConfidence: "High"
};

function placeRequest(body: unknown): Request {
  return new Request("http://localhost/api/places", {
    body: JSON.stringify(body),
    headers: {
      "Content-Type": "application/json"
    },
    method: "POST"
  });
}

describe("places admin API authorization", () => {
  test("blocks anonymous place reads before persistence", async () => {
    let listCalled = false;
    const response = await handlePlacesGetRequest({
      listPlaceRecords: async () => {
        listCalled = true;
        throw new Error("list should not run without admin auth");
      },
      requireAdmin: async () =>
        Response.json(
          {
            error: {
              code: "unauthenticated",
              message: "Authentication required."
            }
          },
          { status: 401 }
        )
    });

    expect(response.status).toBe(401);
    expect(listCalled).toBe(false);
    await expect(response.json()).resolves.toEqual({
      error: {
        code: "unauthenticated",
        message: "Authentication required."
      }
    });
  });

  test("blocks traveler place writes before validation or persistence", async () => {
    let createCalled = false;
    const response = await handlePlacesPostRequest(placeRequest({}), {
      createPlaceRecord: async () => {
        createCalled = true;
        throw new Error("create should not run for wrong-role users");
      },
      requireAdmin: async () =>
        Response.json(
          {
            error: {
              code: "forbidden",
              message: "Forbidden."
            }
          },
          { status: 403 }
        )
    });

    expect(response.status).toBe(403);
    expect(createCalled).toBe(false);
    await expect(response.json()).resolves.toEqual({
      error: {
        code: "forbidden",
        message: "Forbidden."
      }
    });
  });

  test("uses the authenticated admin client for place reads", async () => {
    const response = await handlePlacesGetRequest({
      listPlaceRecords: async (limit, options) => {
        expect(limit).toBe(100);
        expect(options?.client).toBe(authClient);

        return [savedPlace];
      },
      requireAdmin: async () => adminAuth
    });

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({ places: [savedPlace] });
  });

  test("creates places only for admin sessions", async () => {
    const response = await handlePlacesPostRequest(placeRequest(savedPlace), {
      createPlaceRecord: async (input, options) => {
        expect(input).toEqual(savedPlace);
        expect(options?.client).toBe(authClient);

        return savedPlace;
      },
      writeAuditTrailRecord: async () => {
        // No-op for the success-path test; the audit-trail
        // contract is exercised in apps/web/app/api/places
        // integration tests, not here.
      },
      requireAdmin: async () => adminAuth
    });

    expect(response.status).toBe(201);
    await expect(response.json()).resolves.toEqual({
      message: "Place saved.",
      place: savedPlace
    });
  });
});
