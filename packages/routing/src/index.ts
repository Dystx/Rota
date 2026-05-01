import {
  RouteValidationSchema,
  type Itinerary,
  type RouteDayLayer,
  type RouteStopPoint,
  type RouteValidation,
  type RouteWarning
} from "@repo/types";

const HIGH_TRAVEL_TIME_MINUTES = 75;

function clampMapCoordinate(value: number) {
  return Math.max(0, Math.min(100, value));
}

function getEstimatedTravelMinutes(day: Itinerary["days"][number], dayOffset: number) {
  return 20 + dayOffset * 15 + day.stops.length * 10;
}

function buildWarnings(itinerary: Itinerary): RouteWarning[] {
  const warnings: RouteWarning[] = [];

  for (const [dayOffset, day] of itinerary.days.entries()) {
    const estimatedTravelMinutes = getEstimatedTravelMinutes(day, dayOffset);

    if (estimatedTravelMinutes > HIGH_TRAVEL_TIME_MINUTES) {
      warnings.push({
        code: "travel_time_high",
        dayIndex: day.dayIndex,
        detail: `Estimated travel time reaches ${estimatedTravelMinutes} minutes, which is above the ${HIGH_TRAVEL_TIME_MINUTES}-minute calm pacing target.`,
        severity: "warning",
        title: "High travel time"
      });
    }

    if (day.stops.length > 3) {
      warnings.push({
        code: "too_many_stops",
        dayIndex: day.dayIndex,
        detail: "This preview day has more stops than the calm pacing target allows.",
        severity: "warning",
        title: "Too many stops for one day"
      });
    }

    if (!day.stops.some((stop) => stop.placeName.toLowerCase().includes("lunch"))) {
      warnings.push({
        code: "meal_timing_weak",
        dayIndex: day.dayIndex,
        detail: "The current sequence does not clearly anchor a lunch or dinner moment.",
        severity: "warning",
        title: "Meal timing is still weak"
      });
    }

    if (!day.summary.toLowerCase().includes("buffer") && day.dayIndex > 1) {
      warnings.push({
        code: "rest_buffer_thin",
        dayIndex: day.dayIndex,
        detail: "This day needs a more explicit rest or weather buffer before it feels trusted.",
        severity: "info",
        title: "Rest buffer is thin"
      });
    }

    if (!day.warnings.length && day.dayIndex === itinerary.days.length) {
      warnings.push({
        code: "missing_rain_fallback",
        dayIndex: day.dayIndex,
        detail: "A rain-plan fallback still needs to be attached to the final day.",
        severity: "info",
        title: "Rain fallback not yet attached"
      });
    }
  }

  return warnings;
}

export function buildRouteValidation(itinerary: Itinerary): RouteValidation {
  const days: RouteDayLayer[] = itinerary.days.map((day, dayIndex) => ({
    dayIndex: day.dayIndex,
    estimatedTravelMinutes: getEstimatedTravelMinutes(day, dayIndex),
    label: `Day ${day.dayIndex}`,
    points: day.stops.map((stop, stopIndex): RouteStopPoint => ({
      dayIndex: day.dayIndex,
      index: stopIndex,
      placeName: stop.placeName,
      region: stop.region,
      timeLabel: `${stop.startTime}–${stop.endTime}`,
      x: clampMapCoordinate(16 + stopIndex * 28 + (dayIndex % 2 === 0 ? 5 : 0)),
      y: clampMapCoordinate(18 + dayIndex * 17 + stopIndex * 10)
    })),
    region: day.stops[0]?.region ?? "Portugal",
    warningCount: day.warnings.length
  }));

  const warnings = buildWarnings(itinerary);

  return RouteValidationSchema.parse({
    days,
    summary:
      warnings.length > 0
        ? "This route preview is visually structured, but still needs travel-time and closure validation before it should be trusted fully."
        : "This route preview is balanced, but still needs provider-backed validation before shipping.",
    warnings
  });
}
