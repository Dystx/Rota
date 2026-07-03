"use client";

import { useEffect } from "react";
import { useMapStore } from "./useMapStore";

/**
 * Subscribe a component to the map store and invoke
 * `onChange` whenever the selected slice changes. This is
 * the PR-8 high-frequency path: trip pages use this to
 * mutate MapLibre sources directly (via `setData`) without
 * forcing a React re-render.
 *
 * Usage:
 *
 *   const [activeStopId, setSourceData] = useMapStore(
 *     (s) => [s.activeStopId, s.setSourceData]
 *   );
 *   useMapSourceSync(activeStopId, (stopId) => {
 *     setSourceData(stopId ? buildFeatureCollection(stopId) : emptyFC);
 *   });
 *
 * The hook uses Zustand's `subscribe` (not `useStore`) so
 * it doesn't trigger a re-render. The selector returns
 * the slice of state the consumer needs.
 */
export function useMapSourceSync<T>(
  slice: T,
  onChange: (slice: T) => void
): void {
  useEffect(() => {
    // Initial fire so the source gets seeded on mount.
    onChange(slice);
    // Subscribe to subsequent changes; compare via JSON
    // for safety (the slice is a small JSON-serializable
    // value). For high-frequency paths with > 10 Hz
    // updates, prefer a custom equality function.
    let prev = JSON.stringify(slice);
    const unsubscribe = useMapStore.subscribe((state) => {
      const next = JSON.stringify(slice);
      if (next === prev) return;
      prev = next;
      onChange(slice);
    });
    return unsubscribe;
    // The subscriber is intentionally keyed on `slice` so
    // the latest value is captured by the closure.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(slice)]);
}
