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

  it("emits lng/lat on every stop from the region centroid map", async () => {
    const itinerary = await generateItineraryFromBrief(tripBrief);

    // Every stop must carry a non-null lng/lat pair in
    // valid range. The brief cycles ["douro-valley",
    // "porto"] across 3 days, so every day picks a region
    // we know the centroid for.
    for (const day of itinerary.days) {
      for (const stop of day.stops) {
        expect(typeof stop.lng).toBe("number");
        expect(typeof stop.lat).toBe("number");
        expect(stop.lng).toBeGreaterThanOrEqual(-180);
        expect(stop.lng).toBeLessThanOrEqual(180);
        expect(stop.lat).toBeGreaterThanOrEqual(-90);
        expect(stop.lat).toBeLessThanOrEqual(90);
      }
    }

    // Day 1's region is `douro-valley` (regions[0]).
    // Stop 1 is the centroid (no offset), so the middle
    // stop should land at the canonical centroid.
    const day1 = itinerary.days[0]!;
    expect(day1.stops[1]?.lng).toBeCloseTo(-7.7793, 3);
    expect(day1.stops[1]?.lat).toBeCloseTo(41.1419, 3);
  });

  it("fans out stops within a day so the filmstrip highlight is visually distinct", async () => {
    const itinerary = await generateItineraryFromBrief(tripBrief);

    // On day 1 (region: douro-valley), the 3 stops should
    // have 3 distinct (lng, lat) pairs — the per-stop
    // offset rotates through [-0.005, 0], [+0.005, 0] of
    // the centroid. The middle stop is the centroid
    // itself; the first and third stops are offset by
    // ±0.005° in opposite directions.
    const day1 = itinerary.days[0]!;
    const day1Lngs = day1.stops.map((s) => s.lng);
    const day1Lats = day1.stops.map((s) => s.lat);

    // All three lngs are distinct (the offsets are
    // -0.005, 0, +0.005 — all different).
    expect(new Set(day1Lngs).size).toBe(3);
    // All three lats are distinct.
    expect(new Set(day1Lats).size).toBe(3);

    // The offsets are within ±0.01° of the centroid
    // (the STOP_OFFSETS array's largest component is 0.005).
    for (const stop of day1.stops) {
      expect(Math.abs(stop.lng! - (-7.7793))).toBeLessThanOrEqual(0.01);
      expect(Math.abs(stop.lat! - 41.1419)).toBeLessThanOrEqual(0.01);
    }
  });
});
