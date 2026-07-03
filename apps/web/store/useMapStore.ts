"use client";

import { create } from "zustand";

/**
 * In-page map coordination store.
 *
 * Thin client-state layer that lets cross-page consumers (home bento,
 * workspace filmstrip, hero globe, /explore page) keep their selected
 * destination / viewport / day in lock-step without prop-drilling or
 * URL hacks. Sits ON TOP of the SpatialEngine — never replaces it.
 *
 *   - `viewport`     — synced from the live MapLibre `moveend` event
 *   - `activeStopId` — driven by bento / filmstrip / map feature clicks
 *   - `activeDay`    — drives the spatial-engine day-filter (future work)
 *   - `targetCoordinates` — programmatic fly-to target consumed by the
 *                          workspace via `useEffect`
 *   - `setSourceData` — direct mutation path that bypasses React for
 *                       high-frequency MapLibre source updates
 *                       (PR-8). The active map registers its source
 *                       via `registerMapSource()` on mount; the store
 *                       calls `setData(featureCollection)` on it
 *                       whenever the subscribed slice changes.
 *
 * This store intentionally does NOT know about InMemoryTelemetryService
 * or any backend stream; it only coordinates UI surface state.
 */

export interface ViewportState {
  /** [longitude, latitude] per MapLibre convention. */
  center: readonly [number, number];
  zoom: number;
  pitch: number;
  bearing: number;
}

/** Minimal subset of a MapLibre `GeoJSONSource` we call
 *  `setData` on. Using a structural type (rather than
 *  importing `maplibre-gl`) keeps this module Node-importable
 *  so SSR + unit tests don't drag in WebGL deps. */
export interface GeoJSONSourceLike {
  setData(data: GeoJSON.FeatureCollection): void;
}

export interface MapStore {
  // Viewport — synced from map.on('moveend')
  viewport: ViewportState;
  setViewport: (next: Partial<ViewportState>) => void;

  // Active stop — driven by bento card click, filmstrip card click, map feature click
  activeStopId: string | null;
  selectStop: (stopId: string, coordinates: readonly [number, number]) => void;
  clearActiveStop: () => void;

  // Active day — drives the spatial-engine's day-filter expression (future work)
  activeDay: number | null;
  setActiveDay: (day: number | null) => void;

  // Programmatic fly-to target — components set this; the workspace consumes it via useEffect
  targetCoordinates: readonly [number, number] | null;
  setTargetCoordinates: (coords: readonly [number, number] | null) => void;

  /** Direct MapLibre source mutation. Bypasses React for
   *  high-frequency map updates (PR-8: prevent main-thread
   *  layout jank by isolating interactions). The active
   *  map registers its source via `registerMapSource()`
   *  on mount; the store calls `setData(featureCollection)`
   *  on it. The function is a no-op if no source is
   *  registered. */
  setSourceData: (featureCollection: GeoJSON.FeatureCollection) => void;
}

/**
 * Iberian centroid (just west of Lisbon) used to seed both projections.
 * Matches `PORTUGAL_CENTER` in hero-map.tsx so the home page and the
 * Zustand store start the camera in the same place.
 */
const DEFAULT_CENTER: readonly [number, number] = [-8.165, 39.55];

/** Module-level handle to the active MapLibre source.
 *  Set by `registerMapSource()` from a trip page's mount
 *  effect; cleared on unmount. Stored outside the Zustand
 *  state because the source is a non-serializable runtime
 *  object — putting it in the store would either crash
 *  SSR or force a custom serializer. */
let activeMapSource: GeoJSONSourceLike | null = null;

/** Register the active MapLibre source. Trip pages
 *  call this in a `useEffect` mount with the source they
 *  get from `map.getSource('stops')`. Passing `null`
 *  clears the registration. */
export function registerMapSource(source: GeoJSONSourceLike | null): void {
  activeMapSource = source;
}

export const useMapStore = create<MapStore>((set) => ({
  viewport: {
    center: DEFAULT_CENTER,
    zoom: 3.4,
    pitch: 0,
    bearing: 0
  },
  setViewport: (next) =>
    set((state) => ({ viewport: { ...state.viewport, ...next } })),

  activeStopId: null,
  selectStop: (stopId, coordinates) =>
    set({ activeStopId: stopId, targetCoordinates: coordinates }),
  clearActiveStop: () =>
    set({ activeStopId: null, targetCoordinates: null }),

  activeDay: null,
  setActiveDay: (day) => set({ activeDay: day }),

  targetCoordinates: null,
  setTargetCoordinates: (coords) => set({ targetCoordinates: coords }),

  setSourceData: (featureCollection) => {
    // No-op when no map is mounted. Avoids throwing during
    // SSR (where activeMapSource is null) and during the
    // brief window between a route change and the new
    // map's mount.
    activeMapSource?.setData(featureCollection);
  }
}));
