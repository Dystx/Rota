import { beforeEach, describe, expect, it, vi } from "vitest";
import { TripBriefSchema, type Itinerary, type TripBrief } from "@repo/types";
import { __resetItineraryCache, enrichItineraryWithCoords } from "./enrich";

const geocodeBatchStub = vi.fn();
const mapsClient = {
  geocodeBatch: geocodeBatchStub,
  offsetDuplicateCoords: (stops: { lng: number; lat: number; stopIndex: number }[]) =>
    stops.map((stop) => ({ lng: stop.lng, lat: stop.lat }))
};

const baseBrief: TripBrief = TripBriefSchema.parse({
  destinationCountry: "portugal",
  regions: ["porto", "douro-valley"],
  tripLengthDays: 2,
  travelersCount: 2,
  travelerType: "couple",
  budgetLevel: "mid-range",
  pace: "calm",
  interests: ["wine", "local-food"],
  foodPreferences: ["wine-bars"],
  avoidances: ["late-nights"],
  transportMode: "train-and-transfers",
  accommodationLocation: "Porto",
  rawBrief: "We want a calm Portugal-first route with wine, food, and scenic pacing."
});

function buildItinerary(): Itinerary {
  return {
    routeOverview: "A Porto and Douro route.",
    whyThisFitsYou: ["Wine focus.", "Calm rhythm."],
    localNotes: ["Reserve meals.", "Keep buffers."],
    warnings: [],
    confidenceScore: 0.8,
    missingInfo: [],
    days: [
      {
        dayIndex: 1,
        theme: "Porto arrival",
        summary: "Start in Porto.",
        transportAssumption: "Walk and transfer.",
        warnings: [],
        stops: [
          {
            placeName: "Ribeira walk",
            region: "porto",
            startTime: "09:00",
            endTime: "10:00",
            reason: "Local orientation.",
            localTip: "Go early."
          },
          {
            placeName: "Porto lunch",
            region: "porto",
            startTime: "12:00",
            endTime: "13:30",
            reason: "Food anchor.",
            localTip: "Book ahead."
          }
        ]
      },
      {
        dayIndex: 2,
        theme: "Douro wine",
        summary: "Move slowly through the valley.",
        transportAssumption: "Train and transfer.",
        warnings: [],
        stops: [
          {
            placeName: "Douro viewpoint",
            region: "douro valley",
            startTime: "10:00",
            endTime: "11:00",
            reason: "Scenic anchor.",
            localTip: "Watch weather."
          },
          {
            placeName: "Douro tasting",
            region: "douro valley",
            startTime: "13:00",
            endTime: "15:00",
            reason: "Wine focus.",
            localTip: "Reserve tasting."
          }
        ]
      }
    ]
  };
}

describe("enrichItineraryWithCoords", () => {
  beforeEach(() => {
    __resetItineraryCache();
    geocodeBatchStub.mockReset();
    process.env.MAPBOX_TOKEN = "pk.test-token";
    vi.stubGlobal("fetch", vi.fn());
  });

  it("adds coordinates to all stops from geocode results", async () => {
    geocodeBatchStub.mockResolvedValue([
      { lng: -8.61, lat: 41.14, confidence: 0.91, matchedPlace: "Ribeira" },
      { lng: -8.62, lat: 41.15, confidence: 0.92, matchedPlace: "Lunch" },
      { lng: -7.78, lat: 41.16, confidence: 0.93, matchedPlace: "Viewpoint" },
      { lng: -7.79, lat: 41.17, confidence: 0.94, matchedPlace: "Tasting" }
    ]);

    const enriched = await enrichItineraryWithCoords(buildItinerary(), baseBrief, mapsClient);
    const stops = enriched.days.flatMap((day) => day.stops);

    expect(stops.every((stop) => stop.lng !== undefined && stop.lat !== undefined)).toBe(true);
    expect(stops.map((stop) => stop.geocodeSource)).toEqual(["mapbox", "mapbox", "mapbox", "mapbox"]);
    expect(stops.map((stop) => stop.geocodeConfidence)).toEqual([0.91, 0.92, 0.93, 0.94]);
  });

  it("uses cached geocode results for the same brief", async () => {
    geocodeBatchStub.mockResolvedValue([
      { lng: -8.61, lat: 41.14, confidence: 0.91, matchedPlace: "Ribeira" },
      { lng: -8.62, lat: 41.15, confidence: 0.92, matchedPlace: "Lunch" },
      { lng: -7.78, lat: 41.16, confidence: 0.93, matchedPlace: "Viewpoint" },
      { lng: -7.79, lat: 41.17, confidence: 0.94, matchedPlace: "Tasting" }
    ]);

    await enrichItineraryWithCoords(buildItinerary(), baseBrief, mapsClient);
    await enrichItineraryWithCoords(buildItinerary(), baseBrief, mapsClient);

    expect(geocodeBatchStub).toHaveBeenCalledTimes(1);
  });

  it("misses the cache when a brief field changes", async () => {
    geocodeBatchStub.mockResolvedValue([
      { lng: -8.61, lat: 41.14, confidence: 0.91, matchedPlace: "Ribeira" },
      { lng: -8.62, lat: 41.15, confidence: 0.92, matchedPlace: "Lunch" },
      { lng: -7.78, lat: 41.16, confidence: 0.93, matchedPlace: "Viewpoint" },
      { lng: -7.79, lat: 41.17, confidence: 0.94, matchedPlace: "Tasting" }
    ]);
    const changedBrief: TripBrief = { ...baseBrief, pace: "balanced" };

    await enrichItineraryWithCoords(buildItinerary(), baseBrief, mapsClient);
    await enrichItineraryWithCoords(buildItinerary(), changedBrief, mapsClient);

    expect(geocodeBatchStub).toHaveBeenCalledTimes(2);
  });

  it("leaves failed stops without coordinates while enriching successful stops", async () => {
    geocodeBatchStub.mockResolvedValue([
      { lng: -8.61, lat: 41.14, confidence: 0.91, matchedPlace: "Ribeira" },
      null,
      { lng: -7.78, lat: 41.16, confidence: 0.93, matchedPlace: "Viewpoint" },
      { lng: -7.79, lat: 41.17, confidence: 0.94, matchedPlace: "Tasting" }
    ]);

    const enriched = await enrichItineraryWithCoords(buildItinerary(), baseBrief, mapsClient);
    const stops = enriched.days.flatMap((day) => day.stops);

    expect(stops[0]?.lng).toBe(-8.61);
    expect(stops[1]?.lng).toBeUndefined();
    expect(stops[1]?.lat).toBeUndefined();
    expect(stops[2]?.lng).toBe(-7.78);
    expect(stops[3]?.lng).toBe(-7.79);
  });

  it("returns the itinerary without coordinates when every geocode fails", async () => {
    geocodeBatchStub.mockResolvedValue([null, null, null, null]);

    const enriched = await enrichItineraryWithCoords(buildItinerary(), baseBrief, mapsClient);
    const stops = enriched.days.flatMap((day) => day.stops);

    expect(stops.every((stop) => stop.lng === undefined && stop.lat === undefined)).toBe(true);
  });
});
