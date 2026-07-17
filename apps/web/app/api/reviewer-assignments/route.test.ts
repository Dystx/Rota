import { describe, expect, test } from "vitest";
import { DuplicateActiveReviewerAssignmentDatabaseError, DuplicateActiveReviewerAssignmentError } from "@repo/db";
import type { ReviewerAssignment } from "@repo/types";
import type { AuthorizedApiContext } from "@/lib/auth/api";
import { handleReviewerAssignmentsPostRequest } from "./handler";

const adminAuth = {
  actor: { capabilities: ["operations:manage"], reviewerId: null, roles: ["admin"], userId: "admin-user-123" },
  reviewerId: null,
  role: "admin",
  userId: "admin-user-123"
} as AuthorizedApiContext;

const existingAssignment: ReviewerAssignment = {
  completedAt: null,
  createdAt: "2026-05-02T00:00:00.000Z",
  id: "7",
  notes: "already active",
  reviewerId: "reviewer-user-9",
  reviewerName: "Inês Almeida",
  status: "assigned",
  tripId: "42"
};

function assignmentRequest(body: unknown): Request {
  return new Request("http://localhost/api/reviewer-assignments", {
    body: JSON.stringify(body),
    headers: {
      "Content-Type": "application/json"
    },
    method: "POST"
  });
}

describe("reviewer assignments admin API", () => {
  test("blocks invalid assignment payloads before parsing for a traveler", async () => {
    let createCalled = false;
    const response = await handleReviewerAssignmentsPostRequest(
      assignmentRequest({ invalid: true }),
      {
        createAssignment: async () => {
          createCalled = true;
          throw new Error("create should not run for a traveler");
        },
        requireAdmin: async () =>
          Response.json(
            { code: "forbidden", message: "Forbidden." },
            { status: 403 }
          )
      }
    );

    expect(response.status).toBe(403);
    expect(createCalled).toBe(false);
    await expect(response.json()).resolves.toEqual({
      code: "forbidden",
      message: "Forbidden."
    });
  });

  test("returns 409 for duplicate active assignment attempts", async () => {
    const response = await handleReviewerAssignmentsPostRequest(
      assignmentRequest({
        notes: "second active assignment",
        reviewerId: "reviewer-user-10",
        status: "assigned",
        tripId: "42"
      }),
      {
        createAssignment: async () => {
          throw new DuplicateActiveReviewerAssignmentError(existingAssignment);
        },
        requireAdmin: async () => adminAuth
      }
    );

    expect(response.status).toBe(409);
    await expect(response.json()).resolves.toEqual({
      code: "validation_error",
      message: "Trip already has an active reviewer assignment."
    });
  });

  test("rejects unsupported assignment statuses before persistence", async () => {
    let createCalled = false;
    const response = await handleReviewerAssignmentsPostRequest(
      assignmentRequest({
        notes: "bad status",
        reviewerId: "reviewer-user-10",
        status: "in_review",
        tripId: "42"
      }),
      {
        createAssignment: async () => {
          createCalled = true;
          throw new Error("create should not run for invalid status");
        },
        requireAdmin: async () => adminAuth
      }
    );

    expect(response.status).toBe(400);
    expect(createCalled).toBe(false);
    await expect(response.json()).resolves.toMatchObject({
      code: "validation_error",
      message: "Reviewer assignment validation failed."
    });
  });

  test("returns 409 when the database unique index rejects a racing duplicate", async () => {
    const response = await handleReviewerAssignmentsPostRequest(
      assignmentRequest({
        notes: "racing active assignment",
        reviewerId: "reviewer-user-10",
        status: "assigned",
        tripId: "42"
      }),
      {
        createAssignment: async () => {
          throw new DuplicateActiveReviewerAssignmentDatabaseError();
        },
        requireAdmin: async () => adminAuth
      }
    );

    expect(response.status).toBe(409);
    await expect(response.json()).resolves.toEqual({
      code: "validation_error",
      message: "Trip already has an active reviewer assignment."
    });
  });
});
