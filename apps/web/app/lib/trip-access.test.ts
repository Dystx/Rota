import { beforeEach, describe, expect, test, vi } from "vitest";
import type { TripDraftDetail } from "@repo/db";

const mocks = vi.hoisted(() => ({
  getCurrentUser: vi.fn(),
  getTripDraftById: vi.fn(),
  getTripDraftByIdForOwner: vi.fn(),
  tripDraftExists: vi.fn()
}));

vi.mock("@/lib/auth/current-user", () => ({
  getCurrentUser: mocks.getCurrentUser
}));

vi.mock("@repo/db", () => ({
  getTripDraftById: mocks.getTripDraftById,
  getTripDraftByIdForOwner: mocks.getTripDraftByIdForOwner,
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
  });

  test("returns anonymous before any database lookup", async () => {
    mocks.getCurrentUser.mockResolvedValue({ user: null });

    await expect(getOwnedTrip("42")).resolves.toEqual({ kind: "anonymous" });
    expect(mocks.getTripDraftByIdForOwner).not.toHaveBeenCalled();
    expect(mocks.getTripDraftById).not.toHaveBeenCalled();
  });

  test("returns missing when the authenticated owner's filtered lookup has no row", async () => {
    mocks.getCurrentUser.mockResolvedValue({ user: { id: "traveler-user-123" } });
    mocks.getTripDraftByIdForOwner.mockResolvedValue(null);
    mocks.tripDraftExists.mockResolvedValue(false);

    await expect(getOwnedTrip("42")).resolves.toEqual({ kind: "missing" });
    expect(mocks.getTripDraftByIdForOwner).toHaveBeenCalledWith("42", "traveler-user-123");
    expect(mocks.tripDraftExists).toHaveBeenCalledWith("42");
    expect(mocks.getTripDraftById).not.toHaveBeenCalled();
  });

  test("returns the owner-filtered trip for its authenticated owner", async () => {
    mocks.getCurrentUser.mockResolvedValue({ user: { id: "traveler-user-123" } });
    mocks.getTripDraftByIdForOwner.mockResolvedValue(ownedTrip);

    await expect(getOwnedTrip("42")).resolves.toEqual({
      kind: "ok",
      trip: ownedTrip,
      userId: "traveler-user-123"
    });
    expect(mocks.getTripDraftById).not.toHaveBeenCalled();
  });

  test("classifies a non-owner result without returning its trip", async () => {
    mocks.getCurrentUser.mockResolvedValue({ user: { id: "traveler-user-123" } });
    mocks.getTripDraftByIdForOwner.mockResolvedValue(null);
    mocks.tripDraftExists.mockResolvedValue(true);

    await expect(getOwnedTrip("42")).resolves.toEqual({ kind: "forbidden" });
    expect(mocks.tripDraftExists).toHaveBeenCalledWith("42");
    expect(mocks.getTripDraftById).not.toHaveBeenCalled();
  });
});
