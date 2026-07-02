import { describe, expect, it } from "vitest";
import { buildRouteValidation } from "./index";

const baseItinerary = {
  confidenceScore: 0.8,
  localNotes: ["note one", "note two"],
  missingInfo: [],
  routeOverview: "A deterministic route preview for testing.",
  warnings: [],
  whyThisFitsYou: ["reason one", "reason two"]
};

const routeValidation = buildRouteValidation({
  ...baseItinerary,
  days: [
    {
      dayIndex: 1,
      theme: "Arrival and local grounding",
      summary: "Keep the pace calm and avoid overfilling the day.",
      transportAssumption: "Walking and short local transfers only.",
      warnings: [],
      stops: [
        {
          placeName: "Porto lunch and local stop",
          region: "Porto",
          startTime: "09:00",
          endTime: "10:00",
          reason: "Anchor one",
          localTip: "Go early."
        },
        {
          placeName: "Porto scenic reset",
          region: "Porto",
          startTime: "11:00",
          endTime: "12:00",
          reason: "Anchor two",
          localTip: "Keep it calm."
        }
      ]
    },
    {
      dayIndex: 2,
      theme: "Historic streets and viewpoint rhythm",
      summary: "A full day without a clear rest window or meal anchor.",
      transportAssumption: "Train and transfers.",
      warnings: [],
      stops: [
        {
          placeName: "Morning stop",
          region: "Douro Valley",
          startTime: "09:00",
          endTime: "10:00",
          reason: "Anchor one",
          localTip: "Start gently."
        },
        {
          placeName: "Midday stop",
          region: "Douro Valley",
          startTime: "11:00",
          endTime: "12:00",
          reason: "Anchor two",
          localTip: "Take a break."
        },
        {
          placeName: "Afternoon stop",
          region: "Douro Valley",
          startTime: "13:00",
          endTime: "14:00",
          reason: "Anchor three",
          localTip: "Keep space."
        },
        {
          placeName: "Evening stop",
          region: "Douro Valley",
          startTime: "15:00",
          endTime: "16:00",
          reason: "Anchor four",
          localTip: "Wrap early."
        }
      ]
    }
  ]
});

describe("buildRouteValidation", () => {
  it("returns a structured validation summary with useful warnings", () => {
    expect(routeValidation.days).toHaveLength(2);
    expect(routeValidation.days[1]?.points).toHaveLength(4);
    expect(routeValidation.days[1]?.points[3]?.x).toBeLessThanOrEqual(100);
    expect(routeValidation.days[1]?.points[3]?.y).toBeLessThanOrEqual(100);
    expect(routeValidation.warnings.map((warning) => warning.code)).toEqual([
      "too_many_stops",
      "meal_timing_weak",
      "rest_buffer_thin",
      "missing_rain_fallback"
    ]);
    expect(routeValidation.summary).toContain("still needs travel-time and closure validation");
  });

  it("produces route validation for a valid itinerary with no warnings", () => {
    const validItinerary = buildRouteValidation({
      ...baseItinerary,
      days: [
        {
          dayIndex: 1,
          theme: "Arrival and local grounding",
          summary: "Keep the pace calm and avoid overfilling the day with buffer time.",
          transportAssumption: "Walking and short local transfers only.",
          warnings: [],
          stops: [
            {
              placeName: "Porto lunch and local stop",
              region: "Porto",
              startTime: "09:00",
              endTime: "10:00",
              reason: "Anchor one",
              localTip: "Go early."
            },
            {
              placeName: "Porto scenic reset",
              region: "Porto",
              startTime: "11:00",
              endTime: "12:00",
              reason: "Anchor two",
              localTip: "Keep it calm."
            }
          ]
        },
        {
          dayIndex: 2,
          theme: "Historic streets",
          summary: "A calm day with buffer time.",
          transportAssumption: "Walking.",
          warnings: ["rain-fallback-attached"],
          stops: [
            {
              placeName: "Morning lunch stop",
              region: "Porto",
              startTime: "09:00",
              endTime: "10:00",
              reason: "Anchor one",
              localTip: "Start gently."
            },
            {
              placeName: "Afternoon reset",
              region: "Porto",
              startTime: "11:00",
              endTime: "12:00",
              reason: "Anchor two",
              localTip: "Take a break."
            }
          ]
        }
      ]
    });

    expect(validItinerary.days).toHaveLength(2);
    expect(validItinerary.warnings).toHaveLength(0);
    expect(validItinerary.summary).toContain("balanced");
  });

  it("generates warnings for invalid routes", () => {
    const invalidItinerary = buildRouteValidation({
      ...baseItinerary,
      days: [
        {
          dayIndex: 1,
          theme: "Overpacked day",
          summary: "Too many stops, no buffer.",
          transportAssumption: "Train and transfers.",
          warnings: [],
          stops: [
            {
              placeName: "Stop one",
              region: "Porto",
              startTime: "09:00",
              endTime: "10:00",
              reason: "Anchor one",
              localTip: "Go early."
            },
            {
              placeName: "Stop two",
              region: "Porto",
              startTime: "11:00",
              endTime: "12:00",
              reason: "Anchor two",
              localTip: "Keep it calm."
            },
            {
              placeName: "Stop three",
              region: "Porto",
              startTime: "13:00",
              endTime: "14:00",
              reason: "Anchor three",
              localTip: "Take a break."
            },
            {
              placeName: "Stop four",
              region: "Porto",
              startTime: "15:00",
              endTime: "16:00",
              reason: "Anchor four",
              localTip: "Wrap early."
            }
          ]
        }
      ]
    });

    const warningCodes = invalidItinerary.warnings.map((w) => w.code);
    expect(warningCodes).toContain("too_many_stops");
    expect(warningCodes).toContain("meal_timing_weak");
    expect(warningCodes).toContain("missing_rain_fallback");
  });

  it("keeps day points within coordinate bounds", () => {
    const heavyItinerary = buildRouteValidation({
      ...baseItinerary,
      days: Array.from({ length: 6 }, (_, dayIndex) => ({
        dayIndex: dayIndex + 1,
        theme: `Day ${dayIndex + 1}`,
        summary: "A day with buffer time.",
        transportAssumption: "Walking.",
        warnings: dayIndex === 5 ? ["rain-fallback-attached"] : [],
        stops: [
          {
            placeName: `Lunch stop ${dayIndex + 1}`,
            region: "Porto",
            startTime: "09:00",
            endTime: "10:00",
            reason: "Anchor one",
            localTip: "Go early."
          },
          {
            placeName: `Reset ${dayIndex + 1}`,
            region: "Porto",
            startTime: "11:00",
            endTime: "12:00",
            reason: "Anchor two",
            localTip: "Keep it calm."
          }
        ]
      }))
    });

    for (const day of heavyItinerary.days) {
      for (const point of day.points) {
        expect(point.x).toBeGreaterThanOrEqual(0);
        expect(point.x).toBeLessThanOrEqual(100);
        expect(point.y).toBeGreaterThanOrEqual(0);
        expect(point.y).toBeLessThanOrEqual(100);
      }
    }
  });

  it("assigns correct day labels and estimated travel minutes", () => {
    expect(routeValidation.days[0]?.label).toBe("Day 1");
    expect(routeValidation.days[1]?.label).toBe("Day 2");
    expect(routeValidation.days[0]?.estimatedTravelMinutes).toBe(20 + 0 * 15 + 2 * 10);
    expect(routeValidation.days[1]?.estimatedTravelMinutes).toBe(20 + 1 * 15 + 4 * 10);
  });

  it("propagates region from first stop of each day", () => {
    expect(routeValidation.days[0]?.region).toBe("Porto");
    expect(routeValidation.days[1]?.region).toBe("Douro Valley");
  });

  it("generates travel_time_high warning when estimated travel exceeds threshold", () => {
    const highTravelItinerary = buildRouteValidation({
      ...baseItinerary,
      days: [
        {
          dayIndex: 1,
          theme: "Long travel day",
          summary: "A day with buffer time.",
          transportAssumption: "Train and transfers.",
          warnings: ["rain-fallback-attached"],
          stops: Array.from({ length: 6 }, (_, i) => ({
            placeName: `Stop ${i + 1}`,
            region: "Porto",
            startTime: "09:00",
            endTime: "10:00",
            reason: "Anchor",
            localTip: "Go early."
          }))
        }
      ]
    });

    const travelTimeWarning = highTravelItinerary.warnings.find(
      (w) => w.code === "travel_time_high"
    );
    expect(travelTimeWarning).toBeDefined();
    expect(travelTimeWarning?.severity).toBe("warning");
  });
});
