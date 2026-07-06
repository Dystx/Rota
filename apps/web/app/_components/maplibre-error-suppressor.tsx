"use client";

import { useEffect } from "react";
import { setupMapLibreErrorSuppression } from "@repo/spatial-engine";

/**
 * Installs a `window.error` and `unhandledrejection` handler that
 * swallows two known non-blocking MapLibre internal errors:
 *
 * - `Cannot read properties of null (reading '0')` from
 *   `Xt._calcMatrices` during a deferred bearing animation tick
 *   (MapLibre v5 globe projection race; the page remains navigable
 *   and the next frame retries).
 * - `Attempting to run(), but is already running.` from MapLibre's
 *   animation scheduler when a bearing rotation animation and an
 *   intro flyTo race (the spatial-engine's rotation loop and intro
 *   choreography both queue animations through MapLibre's
 *   lower-level path, which the camera controller's single-flight
 *   guard does not gate).
 *
 * Render once at the app root. `setupMapLibreErrorSuppression` is
 * idempotent.
 */
export function MapLibreErrorSuppressor(): null {
  useEffect(() => {
    setupMapLibreErrorSuppression();
  }, []);
  return null;
}
