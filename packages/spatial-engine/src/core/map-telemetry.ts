/**
 * Low-cardinality, provider-neutral map telemetry.
 *
 * The spatial engine never sends events itself. A host application may attach
 * `onMapTelemetry` and forward these bounded events to its analytics provider.
 * No raw provider error, URL, coordinate, or request payload is included.
 */
export type MapTelemetrySurface = "activity-map" | "trip-map" | "workspace";

export type MapTelemetryEvent =
  | {
      type: "intent";
      surface: MapTelemetrySurface;
      intent: "mount" | "explicit-open" | "story-start" | "story-stop";
    }
  | {
      type: "camera-focus";
      surface: MapTelemetrySurface;
      reason: "selection" | "story" | "fit" | "manual";
      targetId?: string;
    }
  | {
      type: "three-d-opt-in";
      surface: MapTelemetrySurface;
      enabled: boolean;
    }
  | {
      type: "fallback";
      surface: MapTelemetrySurface;
      reason:
        | "reduced-motion"
        | "small-viewport"
        | "coarse-pointer"
        | "weak-device"
        | "webgl-unavailable"
        | "provider-unavailable"
        | "missing-geometry";
    }
  | {
      type: "tile-failure";
      surface: MapTelemetrySurface;
      reason: "renderer" | "style" | "network";
    }
  | {
      type: "webgl-error";
      surface: MapTelemetrySurface;
      reason: "context-unavailable" | "mount-failure";
    };

export type MapTelemetryHandler = (event: MapTelemetryEvent) => void;

/** Telemetry must never break map rendering or user interaction. */
export function emitMapTelemetry(
  handler: MapTelemetryHandler | undefined,
  event: MapTelemetryEvent
): void {
  try {
    handler?.(event);
  } catch {
    // Analytics is best effort; the map remains the source of truth.
  }
}
