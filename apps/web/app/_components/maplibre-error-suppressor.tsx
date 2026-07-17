"use client";

import { useEffect } from "react";

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
    let cancelled = false;
    let installed = false;

    // The suppressor itself must not make the homepage download the map
    // runtime. Map-capable consumers mark their rendered surface explicitly;
    // public list-first routes leave this absent and stay MapLibre-free. A
    // mutation observer keeps the guard correct when a user opens a deferred
    // activity map after the root effect has already run.
    const installIfMapIsPresent = () => {
      if (cancelled || installed || !document.querySelector("[data-map-capable]")) return;
      installed = true;

      // Keep the activity-first homepage and initial public routes free of the
      // MapLibre bundle. Load the helper only after a map-capable surface is
      // actually mounted.
      void import("@repo/spatial-engine/error-suppression").then(
        ({ setupMapLibreErrorSuppression }) => {
          if (!cancelled) setupMapLibreErrorSuppression();
        }
      );
    };

    installIfMapIsPresent();
    const observer = new MutationObserver(installIfMapIsPresent);
    observer.observe(document.body, { childList: true, subtree: true });

    return () => {
      cancelled = true;
      observer.disconnect();
    };
  }, []);
  return null;
}
