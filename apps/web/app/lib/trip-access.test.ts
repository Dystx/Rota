import { beforeEach, describe, expect, test, vi } from "vitest";
import type { TripDraftDetail } from "@repo/db";

const mocks = vi.hoisted(() => ({
  getCurrentUser: vi.fn(),
  getTripDraftById: vi.fn(),
  getTripDraftByIdForOwner: vi.fn(),
  isPersistenceConfigError: vi.fn(() => false),
  isSchemaDriftError: vi.fn(() => false),
  isSessionProviderFailure: vi.fn(() => false),
  loadCurrentAuthorizedActorOutcome: vi.fn(),
  tripDraftExists: vi.fn()
}));

vi.mock("@/lib/auth/current-user", () => ({
  getCurrentUser: mocks.getCurrentUser
}));

vi.mock("@/lib/auth/authorization", () => ({
  loadCurrentAuthorizedActorOutcome: mocks.loadCurrentAuthorizedActorOutcome
}));

vi.mock("@/lib/auth/session-outcome", () => ({
  isSessionProviderFailure: mocks.isSessionProviderFailure
}));

vi.mock("@repo/db", () => ({
  getTripDraftById: mocks.getTripDraftById,
  getTripDraftByIdForOwner: mocks.getTripDraftByIdForOwner,
  isPersistenceConfigError: mocks.isPersistenceConfigError,
  isSchemaDriftError: mocks.isSchemaDriftError,
  tripDraftExists: mocks.tripDraftExists
}));

import { getOwnedTrip } from "./trip-access";

const ownedTrip = {
  brief: {
    accommodationLocation: "Porto historic center",
    avoidances: [],
    budgetLevel: "mid-range",
    destinationCountry: "portugal",
    endDate: "",
    foodPreferences: [],
    interests: [],
    pace: "calm",
    rawBrief: "A calm five-day Portugal route with room for local food and old streets.",
    regions: ["porto"],
    startDate: "",
    transportMode: "train-and-transfers",
    travelerType: "couple",
    travelersCount: 2,
    tripLengthDays: 5
  },
  createdAt: "2026-07-01T00:00:00.000Z",
  hasHumanReview: false,
  id: "42",
  isPaid: false,
  ownerUserId: "traveler-user-123",
  status: "draft",
  title: "5-day porto route",
  tripBriefId: "7",
  tripBriefStatus: "submitted",
  visibility: "private"
} satisfies TripDraftDetail;

describe("getOwnedTrip", () => {
  beforeEach(() => {
    vi.resetAllMocks();
    mocks.isPersistenceConfigError.mockReturnValue(false);
    mocks.isSchemaDriftError.mockReturnValue(false);
    mocks.isSessionProviderFailure.mockReturnValue(false);
    mocks.loadCurrentAuthorizedActorOutcome.mockResolvedValue({ kind: "anonymous" });
  });

  test("returns anonymous before any database lookup", async () => {
    mocks.getCurrentUser.mockResolvedValue({
      outcome: "anonymous",
      sessionOutcome: { kind: "anonymous" },
      user: null,
      session: null
    });

    await expect(getOwnedTrip("42")).resolves.toEqual({ kind: "anonymous" });
    expect(mocks.getTripDraftByIdForOwner).not.toHaveBeenCalled();
    expect(mocks.getTripDraftById).not.toHaveBeenCalled();
  });

  test("preserves an unavailable session before any owner lookup", async () => {
    mocks.getCurrentUser.mockResolvedValue({
      outcome: "unavailable",
      sessionOutcome: { kind: "unavailable" },
      user: null,
      session: null
    });

    await expect(getOwnedTrip("42")).resolves.toEqual({ kind: "unavailable" });
    expect(mocks.loadCurrentAuthorizedActorOutcome).not.toHaveBeenCalled();
    expect(mocks.getTripDraftByIdForOwner).not.toHaveBeenCalled();
  });

  test("fails closed when the authenticated user has no PostgreSQL actor", async () => {
    const sessionOutcome = {
      kind: "ready",
      session: { user: { id: "traveler-user-123" }, session: { id: "session-1" } }
    } as const;
    mocks.getCurrentUser.mockResolvedValue({
      outcome: "ready",
      sessionOutcome,
      user: sessionOutcome.session.user,
      session: sessionOutcome.session.session
    });
    mocks.loadCurrentAuthorizedActorOutcome.mockResolvedValue({ kind: "anonymous" });

    await expect(getOwnedTrip("42")).resolves.toEqual({ kind: "forbidden" });
    expect(mocks.loadCurrentAuthorizedActorOutcome).toHaveBeenCalledWith(sessionOutcome);
    expect(mocks.getTripDraftByIdForOwner).not.toHaveBeenCalled();
    expect(mocks.tripDraftExists).not.toHaveBeenCalled();
    expect(mocks.getTripDraftById).not.toHaveBeenCalled();
  });

  test("returns the owner-filtered trip for its authenticated owner", async () => {
    const sessionOutcome = {
      kind: "ready",
      session: { user: { id: "traveler-user-123" }, session: { id: "session-1" } }
    } as const;
    const actor = { capabilities: [], reviewerId: null, roles: ["traveler"], userId: "traveler-user-123" } as const;
    mocks.getCurrentUser.mockResolvedValue({
      outcome: "ready",
      sessionOutcome,
      user: sessionOutcome.session.user,
      session: sessionOutcome.session.session
    });
    mocks.loadCurrentAuthorizedActorOutcome.mockResolvedValue({ kind: "ready", actor });
    mocks.getTripDraftByIdForOwner.mockResolvedValue(ownedTrip);

    await expect(getOwnedTrip("42")).resolves.toEqual({
      kind: "ok",
      trip: ownedTrip,
      userId: "traveler-user-123",
      actor
    });
    expect(mocks.loadCurrentAuthorizedActorOutcome).toHaveBeenCalledWith(sessionOutcome);
    expect(mocks.getTripDraftByIdForOwner).toHaveBeenCalledWith("42", "traveler-user-123", { actor: expect.objectContaining({ userId: "traveler-user-123" }) });
    expect(mocks.getTripDraftById).not.toHaveBeenCalled();
  });

  test("fails closed when the actor-scoped lookup cannot see a trip", async () => {
    const sessionOutcome = {
      kind: "ready",
      session: { user: { id: "traveler-user-123" }, session: { id: "session-1" } }
    } as const;
    const actor = { capabilities: [], reviewerId: null, roles: ["traveler"], userId: "traveler-user-123" } as const;
    mocks.getCurrentUser.mockResolvedValue({
      outcome: "ready",
      sessionOutcome,
      user: sessionOutcome.session.user,
      session: sessionOutcome.session.session
    });
    mocks.loadCurrentAuthorizedActorOutcome.mockResolvedValue({ kind: "ready", actor });
    mocks.getTripDraftByIdForOwner.mockResolvedValue(null);

    await expect(getOwnedTrip("42")).resolves.toEqual({ kind: "missing" });
    expect(mocks.tripDraftExists).not.toHaveBeenCalled();
    expect(mocks.getTripDraftById).not.toHaveBeenCalled();
  });

  test("uses an already-authorized actor without probing the session again", async () => {
    const actor = { capabilities: [], reviewerId: null, roles: ["traveler"], userId: "traveler-user-123" } as const;
    mocks.getTripDraftByIdForOwner.mockResolvedValue(ownedTrip);

    await expect(getOwnedTrip("42", { actor })).resolves.toEqual({
      kind: "ok",
      trip: ownedTrip,
      userId: "traveler-user-123",
      actor
    });
    expect(mocks.getCurrentUser).not.toHaveBeenCalled();
    expect(mocks.loadCurrentAuthorizedActorOutcome).not.toHaveBeenCalled();
  });

  test("sanitizes known owner-query provider failures as unavailable", async () => {
    const actor = { capabilities: [], reviewerId: null, roles: ["traveler"], userId: "traveler-user-123" } as const;
    const hostile = Object.assign(new Error("DATABASE_URL=secret ECONNREFUSED SQL stack"), { code: "ECONNREFUSED" });
    mocks.getTripDraftByIdForOwner.mockRejectedValue(hostile);
    mocks.isSessionProviderFailure.mockReturnValue(true);

    const result = await getOwnedTrip("42", { actor });
    expect(result).toEqual({ kind: "unavailable" });
    expect(JSON.stringify(result)).not.toMatch(/DATABASE_URL|ECONN|SQL|stack/i);
  });

  test("rethrows unknown owner-query failures for the normal boundary", async () => {
    const actor = { capabilities: [], reviewerId: null, roles: ["traveler"], userId: "traveler-user-123" } as const;
    const failure = new Error("Unexpected owner-query invariant");
    mocks.getTripDraftByIdForOwner.mockRejectedValue(failure);

    await expect(getOwnedTrip("42", { actor })).rejects.toBe(failure);
  });
});
