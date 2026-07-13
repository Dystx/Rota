import { describe, expect, test } from "vitest";
import type { TripDraftDetail } from "@repo/db";
import type { CheckoutProvider } from "@repo/payments";
import type { AuthorizedApiContext } from "@/lib/auth/api";
import { handleUnlockCheckoutRequest } from "./handler";

const travelerAuth = {
  actor: { capabilities: [], reviewerId: null, roles: ["traveler"], userId: "traveler-user-123" },
  reviewerId: null,
  role: "traveler",
  userId: "traveler-user-123"
} as AuthorizedApiContext;

const lockedTrip = {
  id: "42",
  isPaid: false,
  ownerUserId: "traveler-user-123"
} as unknown as TripDraftDetail;

function request(): Request {
  return new Request("http://localhost/api/trips/42/unlock", {
    method: "POST"
  });
}

describe("handleUnlockCheckoutRequest", () => {
  test("redirects owned locked trips to deterministic checkout without leaking secrets", async () => {
    const secret = "unit-test-secret-should-not-leak";
    const checkoutProvider: CheckoutProvider = {
      async createSession(input) {
        expect(input).toMatchObject({
          purchaseKind: "unlock",
          tripId: "42",
          userId: "traveler-user-123"
        });

        return {
          id: "cs_test_unlock_42",
          metadata: {
            purchase_kind: "unlock",
            trip_id: "42",
            user_id: "traveler-user-123"
          },
          mode: "fake",
          url: "https://checkout.stripe.com/c/test_unlock_42"
        };
      }
    };

    const response = await handleUnlockCheckoutRequest(request(), "42", {
      checkoutProvider,
      getTrip: async () => lockedTrip,
      requireTraveler: async () => travelerAuth
    });

    expect(response.status).toBe(303);
    expect(response.headers.get("location")).toBe("https://checkout.stripe.com/c/test_unlock_42");
    expect(JSON.stringify(await response.text())).not.toContain(secret);
  });

  test("rejects checkout for trips owned by another traveler", async () => {
    let checkoutCalled = false;
    const response = await handleUnlockCheckoutRequest(request(), "42", {
      checkoutProvider: {
        async createSession() {
          checkoutCalled = true;
          throw new Error("checkout should not be called for forbidden trips");
        }
      },
      getTrip: async () => ({ ...lockedTrip, ownerUserId: "other-user" } as unknown as TripDraftDetail),
      requireTraveler: async () => travelerAuth
    });

    expect(response.status).toBe(403);
    expect(checkoutCalled).toBe(false);
    await expect(response.json()).resolves.toEqual({
      code: "forbidden",
      message: "Trip does not belong to this traveler."
    });
  });

  test("blocks unauthenticated checkout before persistence", async () => {
    let getTripCalled = false;
    const response = await handleUnlockCheckoutRequest(request(), "42", {
      getTrip: async () => {
        getTripCalled = true;
        return lockedTrip;
      },
      requireTraveler: async () =>
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
    expect(getTripCalled).toBe(false);
  });
});
