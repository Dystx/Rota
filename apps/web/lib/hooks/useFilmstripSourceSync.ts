"use client";

import { useMemo } from "react";
import { useMapStore } from "../../store/useMapStore";
import { useMapSourceSync } from "../../store/useMapSourceSync";

/**
 * Minimal filmstrip stop shape needed to build the map's
 * `stops` GeoJSON source. Defined locally so the hook stays
 * decoupled from the trip page's `FilmstripStop` (which
 * carries extra fields the map doesn't need).
 */
export interface FilmstripStopForMap {
  readonly id: string;
  readonly placeName: string;
  readonly startTime: string;
  readonly coordinates?: readonly [number, number];
}

const EMPTY_FC: GeoJSON.FeatureCollection = {
  type: "FeatureCollection",
  features: []
};

/**
 * Build a one-point FeatureCollection for the active stop,
 * or an empty collection if there's no active stop with
 * coordinates. Pure function so it's trivial to unit test.
 *
 * Coordinate order is `[lng, lat]` per MapLibre / GeoJSON.
 */
export function buildActiveStopFC(
  activeStopId: string | null,
  stops: readonly FilmstripStopForMap[]
): GeoJSON.FeatureCollection {
  if (!activeStopId) return EMPTY_FC;
  const stop = stops.find((s) => s.id === activeStopId);
  if (!stop || !stop.coordinates) return EMPTY_FC;
  return {
    type: "FeatureCollection",
    features: [
      {
        type: "Feature",
        id: stop.id,
        geometry: {
          type: "Point",
          coordinates: [stop.coordinates[0], stop.coordinates[1]]
        },
        properties: {
          title: stop.placeName,
          startTime: stop.startTime
        }
      }
    ]
  };
}

/**
 * useFilmstripSourceSync — push the active filmstrip stop to
 * the map's `stops` GeoJSON source.
 *
 * Mount this inside any client component that owns a
 * MapLibre map (e.g. the trip page's `CinematicMapSection`)
 * AFTER `registerMapSource(container, source)` has fired on
 * the same container. The map will then highlight the
 * clicked filmstrip card as a single point feature.
 *
 * High-frequency path: subscribes to `activeStopId` via
 * `useMapSourceSync`, which uses Zustand's `subscribe` (not
 * `useStore`) so this hook does not trigger re-renders.
 *
 * No-op when the map's source isn't registered (the store's
 * `setSourceData` is a no-op in that case — see
 * `useMapStore.ts:150-164`).
 */
export function useFilmstripSourceSync(
  stops: readonly FilmstripStopForMap[]
): void {
  const activeStopId = useMapStore((s) => s.activeStopId);
  const setSourceData = useMapStore((s) => s.setSourceData);

  // The feature collection is a pure function of the
  // currently-active stop and the stops array — memoise so
  // we don't re-build it on every parent render. The
  // subscribe-based path below still gets the latest value.
  const activeFC = useMemo(
    () => buildActiveStopFC(activeStopId, stops),
    [activeStopId, stops]
  );

  useMapSourceSync(activeFC, (next) => {
    setSourceData(next);
  });
}
