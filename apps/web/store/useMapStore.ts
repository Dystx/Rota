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
   *  map registers its source via `registerMapSource(container, source)`
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

/**
 * Module-level registry of MapLibre sources keyed by their owning
 * container element. Stored outside the Zustand state because the
 * source is a non-serializable runtime object — putting it in the
 * store would either crash SSR or force a custom serializer.
 *
 * Each component that owns a MapLibre instance calls
 * `registerMapSource(container, source)` on mount with the source it
 * pulled from `map.getSource('stops')`, and the matching
 * `registerMapSource(container, null)` on unmount.
 *
 * Race-safety: a `WeakMap<HTMLElement, ...>` keyed by the DOM
 * element means a stale unmount cleanup cannot clobber a different
 * component's source. In React 18+ concurrent mode the unmount
 * cleanup of the outgoing page can fire AFTER the mount of the
 * incoming page; the previous single-slot design
 * (`let activeMapSource: ... | null`) had the outgoing cleanup
 * clear the incoming mount's source. The keyed registry closes
 * that hole — see the race-condition test in
 * `apps/web/lib/store/useMapStore.test.ts`.
 *
 * `activeKey` is the most recently registered container. It is
 * cleared only when the unregistering container IS the active one,
 * so an out-of-order cleanup from a different page does not
 * detach the active source.
 */
const sourcesByContainer = new WeakMap<HTMLElement, GeoJSONSourceLike>();
let activeKey: object | null = null;

/** Register the active MapLibre source for a given container.
 *  Pass `source = null` to unregister (matches the mount /
 *  unmount useEffect pair). */
export function registerMapSource(
  container: HTMLElement,
  source: GeoJSONSourceLike | null
): void {
  if (source) {
    sourcesByContainer.set(container, source);
    activeKey = container;
  } else {
    sourcesByContainer.delete(container);
    // Only detach the active pointer if the unregistering container
    // was the active one. A stale cleanup from a different page must
    // not clear the active mount.
    if (activeKey === container) activeKey = null;
  }
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
    // SSR (where activeKey is null) and during the brief
    // window between a route change and the new map's mount.
    // Look up the source by the activeKey pointer — the
    // WeakMap entry is still alive as long as the container
    // DOM element is referenced somewhere (e.g. by React's
    // ref). When the page unmounts cleanly, the unmount
    // effect calls `registerMapSource(container, null)` and
    // activeKey is cleared in the same call.
    if (activeKey) {
      const source = sourcesByContainer.get(activeKey as HTMLElement);
      source?.setData(featureCollection);
    }
  }
}));
