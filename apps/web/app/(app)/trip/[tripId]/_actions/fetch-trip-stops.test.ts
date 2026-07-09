import { beforeEach, describe, expect, test, vi } from "vitest";
import type { TripDraftDetail } from "@repo/db";
import type { Itinerary } from "@repo/types";

const mocks = vi.hoisted(() => ({
  generateItineraryFromBrief: vi.fn(),
  getOwnedTrip: vi.fn()
}));

vi.mock("@repo/ai", () => ({
  generateItineraryFromBrief: mocks.generateItineraryFromBrief
}));

vi.mock("@/app/lib/trip-access", () => ({
  getOwnedTrip: mocks.getOwnedTrip
}));

import { fetchTripStopsAction } from "./fetch-trip-stops";

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

const itinerary = {
  days: [
    {
      dayIndex: 1,
      stops: [
        {
          lat: 41.1496,
          lng: -8.6109,
          placeName: "Ribeira",
          reason: "Historic riverfront"
        }
      ]
    }
  ]
} as Itinerary;

describe("fetchTripStopsAction", () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  test("returns flattened stop rows only for an owned trip", async () => {
    mocks.getOwnedTrip.mockResolvedValue({ kind: "ok", trip: ownedTrip, userId: "traveler-user-123" });
    mocks.generateItineraryFromBrief.mockResolvedValue(itinerary);

    await expect(fetchTripStopsAction("42")).resolves.toEqual([
      {
        label: "Ribeira",
        lat: 41.1496,
        lng: -8.6109,
        note: "Historic riverfront",
        order: 1
      }
    ]);
    expect(mocks.getOwnedTrip).toHaveBeenCalledWith("42");
  });

  test("returns no trip data for an anonymous caller", async () => {
    mocks.getOwnedTrip.mockResolvedValue({ kind: "anonymous" });

    await expect(fetchTripStopsAction("42")).resolves.toBeNull();
    expect(mocks.generateItineraryFromBrief).not.toHaveBeenCalled();
  });

  test("returns no trip data for a non-owner caller", async () => {
    mocks.getOwnedTrip.mockResolvedValue({ kind: "forbidden" });

    await expect(fetchTripStopsAction("42")).resolves.toBeNull();
    expect(mocks.generateItineraryFromBrief).not.toHaveBeenCalled();
  });

  test("maps anonymous, missing, and non-owner requests to the identical external result", async () => {
    mocks.getOwnedTrip
      .mockResolvedValueOnce({ kind: "anonymous" })
      .mockResolvedValueOnce({ kind: "missing" })
      .mockResolvedValueOnce({ kind: "forbidden" });

    const anonymousResult = await fetchTripStopsAction("anonymous-trip");
    const missingResult = await fetchTripStopsAction("missing-trip");
    const nonOwnerResult = await fetchTripStopsAction("other-users-trip");

    expect(anonymousResult).toBeNull();
    expect(missingResult).toBeNull();
    expect(missingResult).toEqual(anonymousResult);
    expect(nonOwnerResult).toEqual(missingResult);
    expect(mocks.generateItineraryFromBrief).not.toHaveBeenCalled();
  });
});
