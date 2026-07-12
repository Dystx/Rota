"use client";

import {
  resolveDefaultAnalyticsProvider,
  tryCapture
} from "@repo/analytics";
import { getOrCreateAnonDistinctId } from "../../lib/web-vitals";
import type { MapTelemetryEvent } from "@repo/spatial-engine";

/**
 * Forward the spatial-engine's bounded map events to the existing analytics
 * provider. No coordinates, URLs, raw provider errors, or request payloads
 * are included; analytics failure is intentionally fail-open.
 */
export function captureMapTelemetry(event: MapTelemetryEvent, tripId?: string): void {
  const properties = {
    surface: event.surface,
    action: event.type,
    ...(event.type === "intent" ? { intent: event.intent } : {}),
    ...(event.type === "camera-focus"
      ? { reason: event.reason, ...(event.targetId ? { target_id: event.targetId } : {}) }
      : {}),
    ...(event.type === "three-d-opt-in" ? { enabled: event.enabled } : {}),
    ...(event.type === "fallback" || event.type === "tile-failure" || event.type === "webgl-error"
      ? { reason: event.reason }
      : {}),
    ...(tripId ? { trip_id: tripId } : {})
  } as const;

  try {
    void tryCapture(resolveDefaultAnalyticsProvider(), {
      name: "map_surface_event",
      distinctId: getOrCreateAnonDistinctId(),
      properties
    });
  } catch {
    // Map telemetry must never affect navigation or map rendering.
  }
}
