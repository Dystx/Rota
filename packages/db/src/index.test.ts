import { describe, expect, test } from "vitest";
import {
  createReviewerAssignment,
  createTripDraft,
  DuplicateActiveReviewerAssignmentDatabaseError,
  DuplicateActiveReviewerAssignmentError,
  filterActiveReviewerAssignments,
  fulfillTripPaymentWebhook,
  getTripDraftByIdForOwner,
  getTripsForUser,
  getLatestAssignmentForReviewerTrip,
  getReviewerAssignmentById,
  reviewerHasTripAssignment,
  type PaymentWebhookFulfillmentInput,
  type TripDraftDetail
} from "./index";
import type { RotaDataClient } from "./clients";
import type { TripBrief } from "@repo/types";

const validBrief: TripBrief = {
  accommodationLocation: "Porto historic center",
  avoidances: ["rushed-schedules"],
  budgetLevel: "mid-range",
  destinationCountry: "portugal",
  endDate: "",
  foodPreferences: ["casual-local-meals"],
  interests: ["local-food", "old-streets"],
  pace: "calm",
  rawBrief:
    "We want a calm five-day Portugal trip with local food, old streets, sea views, and enough buffer time to avoid feeling rushed.",
  regions: ["porto", "douro-valley"],
  startDate: "",
  transportMode: "train-and-transfers",
  travelerType: "couple",
  travelersCount: 2,
  tripLengthDays: 5
};

function createRpcClient(assertRpcArgs: (args: Record<string, unknown>) => void): RotaDataClient {
  return ({
    from() {
      throw new Error("from() should not be used when creating trip drafts.");
    },
    rpc(name: string, args: Record<string, unknown>) {
      expect(name).toBe("create_trip_draft");
      assertRpcArgs(args);

      return {
        single: async () => ({
          data: {
            trip_brief_id: 987,
            trip_id: 654
          },
          error: null
        })
      };
    }
  } as unknown) as RotaDataClient;
}

describe("createTripDraft", () => {
  test("uses the atomic create_trip_draft RPC with the authenticated owner id", async () => {
    expect.assertions(6);

    const result = await createTripDraft(validBrief, {
      client: createRpcClient((args) => {
        expect(args.p_owner_user_id).toBe("traveler-user-123");
        expect(args.p_normalized_json).toEqual(validBrief);
        expect(args.p_title).toBe("5-day porto route");
        expect(args.p_start_date).toBeNull();
      }),
      ownerUserId: "traveler-user-123"
    });

    expect(result).toEqual({
      tripBriefId: "987",
      tripId: "654"
    });
  });

  test("surfaces RPC failure without attempting fallback writes", async () => {
    const client = ({
      from() {
        throw new Error("from() should not be used when RPC persistence fails.");
      },
      rpc() {
        return {
          single: async () => ({
            data: null,
            error: { message: "rpc transaction failed" }
          })
        };
      }
    } as unknown) as RotaDataClient;

    await expect(createTripDraft(validBrief, { client, ownerUserId: "traveler-user-123" })).rejects.toThrow(
      "rpc transaction failed"
    );
  });
});

type Mutation = {
  args?: Record<string, unknown>;
  name?: string;
  table?: string;
  type: "rpc" | "select";
};

const webhookInput: PaymentWebhookFulfillmentInput = {
  eventId: "evt_test_paid_42",
  purchaseKind: "unlock",
  stripeSessionId: "cs_test_paid_42",
  tripId: "42",
  userId: "traveler-user-123"
};

const baseTrip = {
  brief: validBrief,
  createdAt: "2026-05-02T00:00:00.000Z",
  hasHumanReview: false,
  id: "42",
  isPaid: false,
  ownerUserId: "traveler-user-123",
  status: "draft",
  title: "5-day porto route",
  tripBriefId: "100",
  tripBriefStatus: "submitted",
  visibility: "private"
} satisfies TripDraftDetail;

describe("getTripDraftByIdForOwner", () => {
  test("filters a trip lookup by the authenticated owner before reading a single row", async () => {
    const filters: Array<[string, unknown]> = [];
    const client = ({
      from(table: string) {
        expect(table).toBe("trips");

        return {
          select() {
            return {
              eq(column: string, value: unknown) {
                filters.push([column, value]);

                return {
                  eq(nextColumn: string, nextValue: unknown) {
                    filters.push([nextColumn, nextValue]);

                    return {
                      single: async () => ({ data: rawTrip(baseTrip), error: null })
                    };
                  }
                };
              }
            };
          }
        };
      }
    } as unknown) as RotaDataClient;

    await expect(getTripDraftByIdForOwner("42", "traveler-user-123", { client })).resolves.toEqual(baseTrip);
    expect(filters).toEqual([
      ["id", 42],
      ["owner_user_id", "traveler-user-123"]
    ]);
  });
});

describe("getTripsForUser", () => {
  test("does not run an unscoped privileged list query without an authenticated owner", async () => {
    const client = ({
      from() {
        throw new Error("anonymous list query must not reach the database");
      }
    } as unknown) as RotaDataClient;

    await expect(getTripsForUser(null, 24, { client })).resolves.toEqual([]);
  });

  test("filters trip lists by the authenticated owner before ordering rows", async () => {
    const filters: Array<[string, unknown]> = [];
    const client = ({
      from(table: string) {
        expect(table).toBe("trips");

        return {
          select() {
            return {
              eq(column: string, value: unknown) {
                filters.push([column, value]);

                return {
                  order() {
                    return {
                      limit: async () => ({ data: [rawTrip(baseTrip)], error: null })
                    };
                  }
                };
              }
            };
          }
        };
      }
    } as unknown) as RotaDataClient;

    await expect(getTripsForUser("traveler-user-123", 24, { client })).resolves.toEqual([
      expect.objectContaining({ id: "42", ownerUserId: "traveler-user-123" })
    ]);
    expect(filters).toEqual([["owner_user_id", "traveler-user-123"]]);
  });
});

function rawTrip(trip: TripDraftDetail) {
  return {
    created_at: trip.createdAt,
    has_human_review: trip.hasHumanReview,
    id: trip.id,
    is_paid: trip.isPaid,
    owner_user_id: trip.ownerUserId,
    status: trip.status,
    title: trip.title,
    trip_briefs: {
      id: trip.tripBriefId,
      normalized_json: trip.brief,
      status: trip.tripBriefStatus
    },
    visibility: trip.visibility
  };
}

function createWebhookClient({ review = false, status = "fulfilled" }: { review?: boolean; status?: "duplicate" | "fulfilled" } = {}): RotaDataClient & { mutations: Mutation[] } {
  const mutations: Mutation[] = [];
  const trip: TripDraftDetail = {
    ...baseTrip,
    hasHumanReview: review,
    isPaid: true,
    status: review ? "in_review" : "paid"
  };

  return ({
    from(table: string) {
      if (table !== "trips") {
        throw new Error(`Unexpected table ${table}`);
      }

      return {
        select() {
          mutations.push({ table, type: "select" });

          return {
            eq() {
              return {
                single: async () => ({ data: rawTrip(trip), error: null })
              };
            }
          };
        }
      };
    },
    mutations,
    rpc(name: string, args: Record<string, unknown>) {
      mutations.push({ args, name, type: "rpc" });

      return {
        single: async () => ({ data: { fulfillment_status: status }, error: null })
      };
    }
  } as unknown) as RotaDataClient & { mutations: Mutation[] };
}

describe("fulfillTripPaymentWebhook", () => {
  test("records the event before unlocking a trip", async () => {
    const client = createWebhookClient({ review: true });

    const result = await fulfillTripPaymentWebhook(webhookInput, { client });

    expect(result.status).toBe("fulfilled");
    expect(result.trip?.isPaid).toBe(true);
    expect(client.mutations.map((mutation) => mutation.type === "rpc" ? `${mutation.name}:${mutation.type}` : `${mutation.table}:${mutation.type}`)).toEqual([
      "fulfill_trip_payment_webhook:rpc",
      "trips:select"
    ]);
    expect(client.mutations[0]).toMatchObject({
      args: {
        p_event_id: "evt_test_paid_42",
        p_purchase_kind: "unlock",
        p_stripe_session_id: "cs_test_paid_42",
        p_trip_id: 42,
        p_user_id: "traveler-user-123"
      }
    });
  });

  test("does not re-apply side effects for duplicate event ids", async () => {
    const client = createWebhookClient({ status: "duplicate" });

    const result = await fulfillTripPaymentWebhook(webhookInput, { client });

    expect(result.status).toBe("duplicate");
    expect(client.mutations.map((mutation) => mutation.type === "rpc" ? `${mutation.name}:${mutation.type}` : `${mutation.table}:${mutation.type}`)).toEqual([
      "fulfill_trip_payment_webhook:rpc",
      "trips:select"
    ]);
  });

  test("human-review payment unlocks then queues review", async () => {
    const client = createWebhookClient();

    const result = await fulfillTripPaymentWebhook({ ...webhookInput, eventId: "evt_test_review_42", purchaseKind: "human_review" }, { client });

    expect(result.status).toBe("fulfilled");
    expect(result.trip?.isPaid).toBe(true);
    expect(client.mutations.map((mutation) => mutation.type === "rpc" ? `${mutation.name}:${mutation.type}` : `${mutation.table}:${mutation.type}`)).toEqual([
      "fulfill_trip_payment_webhook:rpc",
      "trips:select"
    ]);
  });
});

function createReviewerAssignmentClient() {
  return ({
    from(table: string) {
      expect(table).toBe("reviewer_assignments");

      return {
        select() {
          return {
            eq(column: string, value: unknown) {
              if (column === "trip_id") {
                expect(value).toBe(42);

                return {
                  order: async () => ({
                    data: [
                      {
                        completed_at: null,
                        created_at: "2026-05-02T00:00:00.000Z",
                        id: 7,
                        notes: "assigned",
                        reviewer_id: "reviewer-user-9",
                        reviewers: { name: "Inês Almeida" },
                        status: "assigned",
                        trip_id: 42
                      }
                    ],
                    error: null
                  })
                };
              }

              expect(column).toBe("id");
              expect(value).toBe(7);

              return {
                maybeSingle: async () => ({
                  data: {
                    completed_at: null,
                    created_at: "2026-05-02T00:00:00.000Z",
                    id: 7,
                    notes: "assigned",
                    reviewer_id: "reviewer-user-9",
                    reviewers: { name: "Inês Almeida" },
                    status: "assigned",
                    trip_id: 42
                  },
                  error: null
                })
              };
            }
          };
        }
      };
    }
  } as unknown) as RotaDataClient;
}

function createReviewerAssignmentCreationClient(existingStatus?: string, insertError?: { code?: string; message: string }) {
  const insertedRows: unknown[] = [];

  return ({
    insertedRows,
    from(table: string) {
      expect(table).toBe("reviewer_assignments");

      return {
        insert(row: unknown) {
          insertedRows.push(row);

          return {
            select() {
              return {
                single: async () =>
                  insertError
                    ? {
                        data: null,
                        error: insertError
                      }
                    : {
                        data: {
                          completed_at: null,
                          created_at: "2026-05-02T00:05:00.000Z",
                          id: 8,
                          notes: "new assignment",
                          reviewer_id: "reviewer-user-10",
                          reviewers: { name: "Tomás Costa" },
                          status: "assigned",
                          trip_id: 42
                        },
                        error: null
                      }
              };
            }
          };
        },
        select() {
          return {
            eq(column: string, value: unknown) {
              expect(column).toBe("trip_id");
              expect(value).toBe(42);

              return {
                order: async () => ({
                  data: existingStatus
                    ? [
                        {
                          completed_at: existingStatus === "completed" ? "2026-05-02T00:04:00.000Z" : null,
                          created_at: "2026-05-02T00:00:00.000Z",
                          id: 7,
                          notes: `${existingStatus} assignment`,
                          reviewer_id: "reviewer-user-9",
                          reviewers: { name: "Inês Almeida" },
                          status: existingStatus,
                          trip_id: 42
                        }
                      ]
                    : [],
                  error: null
                })
              };
            }
          };
        }
      };
    }
  } as unknown) as RotaDataClient & { insertedRows: unknown[] };
}

describe("reviewer assignment access helpers", () => {
  test("detects assigned and unassigned reviewer trip access", async () => {
    const client = createReviewerAssignmentClient();

    await expect(reviewerHasTripAssignment("42", "reviewer-user-9", { client })).resolves.toBe(true);
    await expect(reviewerHasTripAssignment("42", "other-reviewer", { client })).resolves.toBe(false);
  });

  test("loads an assignment by id for reviewer-owned API checks", async () => {
    const client = createReviewerAssignmentClient();

    await expect(getReviewerAssignmentById("7", { client })).resolves.toMatchObject({
      id: "7",
      reviewerId: "reviewer-user-9",
      reviewerName: "Inês Almeida",
      tripId: "42"
    });
  });

  test("selects the authenticated reviewer's assignment for completion", async () => {
    const client = createReviewerAssignmentClient();

    await expect(getLatestAssignmentForReviewerTrip("42", "reviewer-user-9", { client })).resolves.toMatchObject({
      id: "7",
      reviewerId: "reviewer-user-9",
      tripId: "42"
    });
  });

  test("rejects duplicate active assignments before inserting a second row", async () => {
    const client = createReviewerAssignmentCreationClient("assigned");

    await expect(
      createReviewerAssignment(
        {
          notes: "second reviewer",
          reviewerId: "reviewer-user-10",
          status: "assigned",
          tripId: "42"
        },
        { client }
      )
    ).rejects.toBeInstanceOf(DuplicateActiveReviewerAssignmentError);
    expect(client.insertedRows).toHaveLength(0);
  });

  test("allows a new assignment after a completed historical assignment", async () => {
    const client = createReviewerAssignmentCreationClient("completed");

    await expect(
      createReviewerAssignment(
        {
          notes: "new assignment",
          reviewerId: "reviewer-user-10",
          status: "assigned",
          tripId: "42"
        },
        { client }
      )
    ).resolves.toMatchObject({
      id: "8",
      reviewerId: "reviewer-user-10",
      status: "assigned",
      tripId: "42"
    });
    expect(client.insertedRows).toEqual([
      {
        notes: "new assignment",
        reviewer_id: "reviewer-user-10",
        status: "assigned",
        trip_id: 42
      }
    ]);
  });

  test("maps the database partial unique index violation to a duplicate assignment error", async () => {
    const client = createReviewerAssignmentCreationClient(undefined, {
      code: "23505",
      message: 'duplicate key value violates unique constraint "reviewer_assignments_one_active_per_trip_idx"'
    });

    await expect(
      createReviewerAssignment(
        {
          notes: "racing assignment",
          reviewerId: "reviewer-user-10",
          status: "assigned",
          tripId: "42"
        },
        { client }
      )
    ).rejects.toBeInstanceOf(DuplicateActiveReviewerAssignmentDatabaseError);
    expect(client.insertedRows).toHaveLength(1);
  });

  test("filters inactive completed and returned assignments out of active queues", () => {
    const activeAssignments = filterActiveReviewerAssignments([
      {
        completedAt: null,
        createdAt: "2026-05-02T00:00:00.000Z",
        id: "1",
        notes: "assigned",
        reviewerId: "reviewer-user-1",
        status: "assigned",
        tripId: "42"
      },
      {
        completedAt: null,
        createdAt: "2026-05-02T00:01:00.000Z",
        id: "2",
        notes: "submitted",
        reviewerId: "reviewer-user-2",
        status: "submitted",
        tripId: "42"
      },
      {
        completedAt: "2026-05-02T00:02:00.000Z",
        createdAt: "2026-05-02T00:01:00.000Z",
        id: "3",
        notes: "completed",
        reviewerId: "reviewer-user-3",
        status: "completed",
        tripId: "42"
      },
      {
        completedAt: null,
        createdAt: "2026-05-02T00:03:00.000Z",
        id: "4",
        notes: "returned",
        reviewerId: "reviewer-user-4",
        status: "returned",
        tripId: "42"
      }
    ]);

    expect(activeAssignments.map((assignment) => assignment.status)).toEqual(["assigned", "submitted"]);
  });

  test("does not hardcode a production reviewer when creating assignments", async () => {
    const client = createReviewerAssignmentCreationClient();

    await createReviewerAssignment(
      {
        notes: "explicit admin choice",
        reviewerId: "reviewer-user-42",
        status: "assigned",
        tripId: "42"
      },
      { client }
    );

    expect(client.insertedRows).toEqual([
      {
        notes: "explicit admin choice",
        reviewer_id: "reviewer-user-42",
        status: "assigned",
        trip_id: 42
      }
    ]);
  });
});
