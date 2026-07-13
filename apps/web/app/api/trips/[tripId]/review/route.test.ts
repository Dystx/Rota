import { describe, expect, test } from "vitest";
import { buildReviewCompleteEmail, createFakeEmailProvider } from "@repo/emails";
import type { TripDraftDetail } from "@repo/db";
import type { CheckoutProvider } from "@repo/payments";
import type { AuthorizedApiContext } from "@/lib/auth/api";
import { handleTripReviewRequest, type ReviewCompleteNotifier } from "./handler";

const travelerAuth = {
  actor: { capabilities: [], reviewerId: null, roles: ["traveler"], userId: "traveler-user-123" },
  reviewerId: null,
  role: "traveler",
  userId: "traveler-user-123"
} as AuthorizedApiContext;

const reviewerAuth = {
  actor: { capabilities: [], reviewerId: "reviewer-user-9", roles: ["reviewer"], userId: "reviewer-user-9" },
  reviewerId: "reviewer-user-9",
  role: "reviewer",
  userId: "reviewer-user-9"
} as AuthorizedApiContext;

const paidTrip = {
  hasHumanReview: false,
  id: "42",
  isPaid: true,
  ownerUserId: "traveler-user-123",
  status: "paid"
} as unknown as TripDraftDetail;

const reviewedTrip = {
  ...paidTrip,
  hasHumanReview: true,
  status: "reviewed",
  title: "Lisbon Long Weekend"
} as TripDraftDetail;

function reviewRequest(): Request {
  return new Request("http://localhost/api/trips/42/review", {
    body: new URLSearchParams({
      intent: "request",
      target: "trip"
    }),
    method: "POST"
  });
}

function reviewerCompleteRequest(notes?: string): Request {
  const body = new URLSearchParams({
    intent: "complete",
    target: "reviewer"
  });

  if (notes !== undefined) {
    body.set("notes", notes);
  }

  return new Request("http://localhost/api/trips/42/review", {
    body,
    method: "POST"
  });
}

describe("handleTripReviewRequest", () => {
  test("creates checkout for owned paid trips without queueing review state", async () => {
    const checkoutProvider: CheckoutProvider = {
      async createSession(input) {
        expect(input).toMatchObject({
          purchaseKind: "human_review",
          tripId: "42",
          userId: "traveler-user-123"
        });

        return {
          id: "cs_test_review_42",
          metadata: {
            purchase_kind: "human_review",
            trip_id: "42",
            user_id: "traveler-user-123"
          },
          mode: "fake",
          url: "https://checkout.stripe.com/c/test_review_42"
        };
      }
    };

    const response = await handleTripReviewRequest(reviewRequest(), "42", {
      checkoutProvider,
      getTrip: async () => paidTrip,
      requireTraveler: async () => travelerAuth
    });

    expect(response.status).toBe(303);
    expect(response.headers.get("location")).toBe("https://checkout.stripe.com/c/test_review_42");
  });

  test("rejects human review checkout for another traveler's trip", async () => {
    let checkoutCalled = false;
    const response = await handleTripReviewRequest(reviewRequest(), "42", {
      checkoutProvider: {
        async createSession() {
          checkoutCalled = true;
          throw new Error("checkout should not be called for forbidden trips");
        }
      },
      getTrip: async () => ({ ...paidTrip, ownerUserId: "other-user" } as unknown as TripDraftDetail),
      requireTraveler: async () => travelerAuth
    });

    expect(response.status).toBe(403);
    expect(checkoutCalled).toBe(false);
    await expect(response.json()).resolves.toEqual({
      code: "forbidden",
      message: "Trip does not belong to this traveler."
    });
  });

  test("invokes notifyReviewComplete with completed trip and reviewer notes", async () => {
    const calls: Array<{ notes: string; tripId: string; tripTitle: string }> = [];
    const notifyReviewComplete: ReviewCompleteNotifier = async ({ notes, trip }) => {
      calls.push({ notes, tripId: trip.id, tripTitle: trip.title ?? "" });
    };

    const response = await handleTripReviewRequest(
      reviewerCompleteRequest("Confirmed Belém timing for sunset."),
      "42",
      {
        checkoutProvider: {
          async createSession() {
            throw new Error("checkout should not be called for completion intent");
          }
        },
        getTrip: async () => paidTrip,
        markHumanReviewed: async () => reviewedTrip,
        markReviewAssignmentCompleted: async (_tripId, reviewerId) => {
          expect(reviewerId).toBe("reviewer-user-9");
          return null;
        },
        reviewerHasAssignment: async (_tripId, reviewerId) => reviewerId === "reviewer-user-9",
        notifyReviewComplete,
        requireReviewer: async () => reviewerAuth
      }
    );

    expect(response.status).toBe(303);
    expect(response.headers.get("location")).toContain("review=completed");
    expect(calls).toEqual([
      {
        notes: "Confirmed Belém timing for sunset.",
        tripId: "42",
        tripTitle: "Lisbon Long Weekend"
      }
    ]);
  });

  test("notification failures do not block the reviewer completion redirect", async () => {
    let notified = false;
    const response = await handleTripReviewRequest(reviewerCompleteRequest(), "42", {
      checkoutProvider: {
        async createSession() {
          throw new Error("checkout should not be called for completion intent");
        }
      },
      getTrip: async () => paidTrip,
      markHumanReviewed: async () => reviewedTrip,
      markReviewAssignmentCompleted: async () => null,
      reviewerHasAssignment: async () => true,
      notifyReviewComplete: async () => {
        notified = true;
        throw new Error("resend down");
      },
      requireReviewer: async () => reviewerAuth
    });

    expect(notified).toBe(true);
    expect(response.status).toBe(303);
    expect(response.headers.get("location")).toContain("review=completed");
  });

  test("review completion produces a fake email outbox entry for the traveler", async () => {
    const emailProvider = createFakeEmailProvider();
    const recipient = "traveler@example.com";

    const notifyReviewComplete: ReviewCompleteNotifier = async ({ notes, trip }) => {
      const message = buildReviewCompleteEmail(recipient, {
        reviewerNotes: notes,
        tripId: trip.id,
        tripTitle: trip.title ?? ""
      });

      await emailProvider.send(message);
    };

    const response = await handleTripReviewRequest(
      reviewerCompleteRequest("Confirmed Belém timing for sunset."),
      "42",
      {
        checkoutProvider: {
          async createSession() {
            throw new Error("checkout should not be called for completion intent");
          }
        },
        getTrip: async () => paidTrip,
        markHumanReviewed: async () => reviewedTrip,
        markReviewAssignmentCompleted: async () => null,
        reviewerHasAssignment: async () => true,
        notifyReviewComplete,
        requireReviewer: async () => reviewerAuth
      }
    );

    expect(response.status).toBe(303);
    expect(response.headers.get("location")).toContain("review=completed");

    expect(emailProvider.outbox).toHaveLength(1);

    const [sent] = emailProvider.outbox;
    expect(sent).toBeDefined();
    if (!sent) {
      throw new Error("expected outbox to contain a review-complete email");
    }
    expect(sent.kind).toBe("review-complete");
    expect(sent.to).toBe(recipient);
    expect(sent.subject).toContain("Your reviewed itinerary is ready");
    expect(sent.subject).toContain("Lisbon Long Weekend");
    expect(sent.text).toContain("Lisbon Long Weekend");
    expect(sent.html).toContain("Lisbon Long Weekend");
    expect(sent.text).toContain("Confirmed Belém timing for sunset.");
    expect(sent.idempotencyKey).toBe("review-complete:42:traveler@example.com");
  });

  test("rejects anonymous review completion with standard auth error JSON", async () => {
    let tripLoaded = false;
    const response = await handleTripReviewRequest(reviewerCompleteRequest(), "42", {
      getTrip: async () => {
        tripLoaded = true;
        return paidTrip;
      },
      requireReviewer: async () =>
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
    expect(tripLoaded).toBe(false);
    await expect(response.json()).resolves.toEqual({
      error: {
        code: "unauthenticated",
        message: "Authentication required."
      }
    });
  });

  test("rejects review completion when reviewer is not assigned to the trip", async () => {
    let markedReviewed = false;
    let markedAssignment = false;
    const response = await handleTripReviewRequest(reviewerCompleteRequest(), "42", {
      getTrip: async () => paidTrip,
      markHumanReviewed: async () => {
        markedReviewed = true;
        return reviewedTrip;
      },
      markReviewAssignmentCompleted: async () => {
        markedAssignment = true;
        return null;
      },
      reviewerHasAssignment: async () => false,
      requireReviewer: async () => reviewerAuth
    });

    expect(response.status).toBe(403);
    expect(markedReviewed).toBe(false);
    expect(markedAssignment).toBe(false);
    await expect(response.json()).resolves.toEqual({
      code: "forbidden",
      message: "Reviewer is not assigned to this trip."
    });
  });
});
