"use client";

import { useEffect, useRef } from "react";
import { useMapStore } from "../../store/useMapStore";

/**
 * Imperative surface the hook drives. Matches the
 * `WorkspaceTripCanvasHandle.flyToPoint` shape — kept
 * minimal so the hook stays easy to test (the test file
 * passes a stub).
 */
/**
 * The hook reads the latest handle synchronously on every
 * effect run, so the function's parameter is consumed by
 * callers but not by the type. The parameter name is
 * documentation-only; the eslint-disable-next-line silences
 * the unused-parameter warning that would otherwise fire on
 * the type-alias function signature.
 */
// eslint-disable-next-line no-unused-vars
type FlyToPointFn = (target: {
  lng: number;
  lat: number;
  zoom?: number;
  duration?: number;
}) => Promise<void>;

export interface CameraFlyToPointHandle {
  flyToPoint: FlyToPointFn;
}

const SENTINEL: readonly [number, number] = [0, 0] as const;

/**
 * `useTargetCoordinatesCameraSync` — consume the
 * cross-page `useMapStore.targetCoordinates` and drive
 * the camera via the supplied handle.
 *
 * Sources of `targetCoordinates` writes:
 *   - the bento destination grid on `/` (sets the
 *     destination preset)
 *   - filmstrip card clicks on the trip page (sets the
 *     stop's `[lng, lat]`)
 *   - future: deep-link `?focus=...` parsing
 *
 * Behavior:
 *   - `[0, 0]` is a sentinel (a filmstrip without real
 *     coordinates falls back to that) and is dropped
 *     without flying.
 *   - The flight is async; the captured-target guard
 *     in `finally` prevents an in-flight flight's
 *     resolution from clearing a newer target the user
 *     clicked during the flight.
 *   - If the handle ref isn't mounted yet, the target
 *     is cleared without flying (so it doesn't loop on
 *     the next mount).
 *   - The handle is read fresh from a `useRef` (updated
 *     on every render) so a handle that mounts after the
 *     first effect can still fly, and so the effect
 *     doesn't re-run on every parent re-render.
 *
 * Why a ref for the getter: the consumer passes a fresh
 * arrow function on every render (`() => canvasRef.current`).
 * Without the ref, the `getHandle` dep would cause the
 * effect to re-run on every parent re-render — and with
 * `targetCoordinates` set, the effect would double-fire
 * the in-flight flight. The ref absorbs the identity
 * churn so the effect only runs on a real target change.
 *
 * Extracted from `CinematicMapSection` so the contract
 * is unit-testable in isolation (see
 * `cinematic-map-section.test.tsx`, which exercises the
 * hook directly rather than a clone).
 */
export function useTargetCoordinatesCameraSync(
  getHandle: () => CameraFlyToPointHandle | null
): void {
  const targetCoordinates = useMapStore((s) => s.targetCoordinates);
  const setTargetCoordinates = useMapStore((s) => s.setTargetCoordinates);

  // The latest `getHandle` is kept in a ref so the effect
  // doesn't re-run on every parent re-render (the consumer
  // typically passes a fresh arrow function each render).
  // The ref is updated synchronously on every render,
  // before the effect fires, so the effect always sees
  // the latest handle.
  const handleRef = useRef(getHandle);
  handleRef.current = getHandle;

  useEffect(() => {
    if (!targetCoordinates) return;
    const [lng, lat] = targetCoordinates;
    // Sentinel: a filmstrip click without real coords.
    if (lng === SENTINEL[0] && lat === SENTINEL[1]) {
      setTargetCoordinates(null);
      return;
    }
    const handle = handleRef.current();
    if (!handle) {
      // Canvas not mounted yet — clear so we don't loop
      // on the next mount.
      setTargetCoordinates(null);
      return;
    }
    const captured = targetCoordinates;
    void (async () => {
      try {
        await handle.flyToPoint({ lng, lat });
      } finally {
        // Only clear if the store still holds the same
        // target. If a subsequent click has overwritten
        // it, the in-flight flight for the old target
        // must not nuke the new one.
        if (useMapStore.getState().targetCoordinates === captured) {
          setTargetCoordinates(null);
        }
      }
    })();
  }, [targetCoordinates, setTargetCoordinates]);
}
