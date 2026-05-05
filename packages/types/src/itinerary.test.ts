import { describe, expect, it } from "vitest";
import { ItinerarySchema, type StopWithCoords, type TripStop } from "./itinerary";

const legacyStop: TripStop = {
  placeName: "Praia da Marinha",
  region: "algarve",
  startTime: "09:00",
  endTime: "11:00",
  reason: "Great coastal stop",
  localTip: "Arrive early",
  warning: "Wind can be strong"
};

const baseItinerary = {
  routeOverview: "Coastal trip",
  whyThisFitsYou: ["You like views", "You prefer relaxed pacing"],
  localNotes: ["Bring water", "Book lunch ahead"],
  warnings: ["Check tide timings"],
  confidenceScore: 0.8,
  missingInfo: [],
  days: [
    {
      dayIndex: 1,
      theme: "Beach day",
      summary: "Explore the coast",
      transportAssumption: "rental car",
      warnings: [],
      stops: [legacyStop, { ...legacyStop, placeName: "Benagil Cave" }]
    },
    {
      dayIndex: 2,
      theme: "Old town",
      summary: "Walk historic streets",
      transportAssumption: "walk",
      warnings: [],
      stops: [legacyStop, { ...legacyStop, placeName: "Lagos Marina" }]
    }
  ]
};

describe("ItinerarySchema stop coordinates", () => {
  it("parses a legacy stop with no coords", () => {
    const result = ItinerarySchema.safeParse(baseItinerary);

    expect(result.success).toBe(true);
  });

  it("parses a stop with full coords and geocode metadata", () => {
    const result = ItinerarySchema.safeParse({
      ...baseItinerary,
      days: [
        {
          ...baseItinerary.days[0],
          stops: [
            {
              ...legacyStop,
              lng: -8.401,
              lat: 37.089,
              geocodeConfidence: 0.92,
              geocodeSource: "mapbox"
            },
            {
              ...legacyStop,
              placeName: "Benagil Cave",
              lng: -8.411,
              lat: 37.087,
              geocodeConfidence: 1,
              geocodeSource: null
            }
          ]
        },
        {
          ...baseItinerary.days[1],
          stops: [
            {
              ...legacyStop,
              placeName: "Lagos Marina",
              lng: -8.671,
              lat: 37.104,
              geocodeConfidence: 0.55,
              geocodeSource: "manual"
            },
            {
              ...legacyStop,
              placeName: "Ponta da Piedade",
              lng: -8.680,
              lat: 37.090
            }
          ]
        }
      ]
    });

    expect(result.success).toBe(true);
  });

  it("rejects a stop with lng but no lat", () => {
    const result = ItinerarySchema.safeParse({
      ...baseItinerary,
      days: [
        {
          ...baseItinerary.days[0],
          stops: [
            { ...legacyStop, lng: -8.4 },
            { ...legacyStop, placeName: "Benagil Cave" }
          ]
        },
        baseItinerary.days[1]
      ]
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues.some((issue) => issue.path.includes("lat"))).toBe(true);
    }
  });

  it("rejects a stop with lat but no lng", () => {
    const result = ItinerarySchema.safeParse({
      ...baseItinerary,
      days: [
        {
          ...baseItinerary.days[0],
          stops: [
            { ...legacyStop, lat: 37.1 },
            { ...legacyStop, placeName: "Benagil Cave" }
          ]
        },
        baseItinerary.days[1]
      ]
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues.some((issue) => issue.path.includes("lng"))).toBe(true);
    }
  });

  it("rejects an out-of-range lng", () => {
    const result = ItinerarySchema.safeParse({
      ...baseItinerary,
      days: [
        {
          ...baseItinerary.days[0],
          stops: [
            { ...legacyStop, lng: 181, lat: 37.1 },
            { ...legacyStop, placeName: "Benagil Cave" }
          ]
        },
        baseItinerary.days[1]
      ]
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues.some((issue) => issue.path.includes("lng"))).toBe(true);
    }
  });

  it("rejects confidence outside 0 to 1", () => {
    const result = ItinerarySchema.safeParse({
      ...baseItinerary,
      days: [
        {
          ...baseItinerary.days[0],
          stops: [
            { ...legacyStop, lng: -8.4, lat: 37.1, geocodeConfidence: 1.2 },
            { ...legacyStop, placeName: "Benagil Cave" }
          ]
        },
        baseItinerary.days[1]
      ]
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues.some((issue) => issue.path.includes("geocodeConfidence"))).toBe(true);
    }
  });

  it("allows StopWithCoords to compile", () => {
    const stop: StopWithCoords = {
      ...legacyStop,
      lng: -8.4,
      lat: 37.1
    };

    expect(stop.lng).toBe(-8.4);
    expect(stop.lat).toBe(37.1);
  });
});
