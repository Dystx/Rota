/**
 * Suppress known MapLibre internal errors that fire during deferred
 * animation ticks (not from our synchronous code).
 *
 * Two specific patterns are caught:
 *
 * 1. `Cannot read properties of null (reading '0')` deep inside
 *    `Xt._calcMatrices` (the projection's matrix calculation). The
 *    trace looks like:
 *      Xt.setBearing → Xt._calcMatrices → Object.A
 *    The trigger is a queued bearing animation tick (`_onEaseFrame`)
 *    firing after the projection's internal globe transform has been
 *    torn down or before it has been initialised. MapLibre v5 has
 *    this race in the globe projection; we can't fix it from the
 *    consumer side.
 *
 * 2. `Attempting to run(), but is already running.` from MapLibre's
 *    animation scheduler when a second `run()` is queued before the
 *    first settles. Our `SpatialCameraController.focus` already has
 *    a single-flight guard for `flyTo` calls, but the globe
 *    rotation loop and the intro choreography both queue bearing
 *    animations through MapLibre's lower-level `setBearing`/`flyTo`
 *    path, which the camera controller does not gate.
 *
 * Both errors are non-blocking — the page remains navigable and the
 * next frame retries. They just flood the dev console. Calling this
 * once at app startup installs a `window.error` handler that swallows
 * the matching messages and a `window.unhandledrejection` handler
 * for the same patterns in rejected promises.
 *
 * Idempotent: safe to call from multiple mount points.
 */
let installed = false;

export function setupMapLibreErrorSuppression(): void {
  if (installed || typeof window === "undefined") return;
  installed = true;

  const isMapLibreInternalError = (message: string | undefined | null): boolean => {
    if (!message) return false;
    return (
      message.includes("Cannot read properties of null (reading '0')") ||
      message.includes("Attempting to run(), but is already running.")
    );
  };

  window.addEventListener("error", (event) => {
    if (isMapLibreInternalError(event.message)) {
      event.preventDefault();
      event.stopImmediatePropagation();
    }
  });

  window.addEventListener("unhandledrejection", (event) => {
    const reason = event.reason as { message?: string } | string | undefined;
    const message = typeof reason === "string" ? reason : reason?.message;
    if (isMapLibreInternalError(message)) {
      event.preventDefault();
    }
  });
}
