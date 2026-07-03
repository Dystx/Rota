import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import { TripBriefSchema } from "@repo/types";
import { generateItineraryFromBrief } from "./index";
import { __resetItineraryCache } from "./enrich";

const tripBrief = TripBriefSchema.parse({
  destinationCountry: "portugal",
  regions: ["douro-valley", "porto"],
  tripLengthDays: 3,
  travelersCount: 2,
  travelerType: "couple",
  budgetLevel: "mid-range",
  pace: "calm",
  interests: ["wine", "local-food"],
  foodPreferences: [],
  avoidances: ["late-nights"],
  transportMode: "train-and-transfers",
  accommodationLocation: "",
  rawBrief: "We want a calm Portugal-first route with wine, food, and scenic pacing."
});

describe("generateItineraryFromBrief", () => {
  beforeEach(() => {
    // Phase 1e: `enrichItineraryWithCoords` now hits Nominatim
    // by default. Stub `fetch` to a no-op so the test stays
    // hermetic, and zero out the rate-limit interval so the
    // test finishes in ms, not 1s/stop.
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => ({ ok: false, status: 0, json: async () => [] }) as unknown as Response)
    );
    process.env.NOMINATIM_MIN_INTERVAL_MS = "0";
    __resetItineraryCache();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    delete process.env.NOMINATIM_MIN_INTERVAL_MS;
  });

  it("builds a deterministic itinerary with useful follow-up questions", async () => {
    const itinerary = await generateItineraryFromBrief(tripBrief);

    expect(itinerary.days).toHaveLength(3);
    expect(itinerary.missingInfo.map((item) => item.title)).toContain("Meal style");
    expect(itinerary.missingInfo.map((item) => item.title)).toContain("Trip timing detail");
    expect(itinerary.missingInfo.map((item) => item.title)).toContain("Douro transport check");
    expect(itinerary.routeOverview).toContain("3-day Portugal-first route");
    expect(itinerary.warnings).toEqual([
      "This is still a deterministic route preview and does not yet validate opening hours or route matrix constraints.",
      "Transfer-heavy days should be rechecked once exact travel dates are known."
    ]);
    expect(itinerary.days[0]?.stops[0]?.startTime).toBe("09:00");
  });
});
