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
}

/**
 * Iberian centroid (just west of Lisbon) used to seed both projections.
 * Matches `PORTUGAL_CENTER` in hero-map.tsx so the home page and the
 * Zustand store start the camera in the same place.
 */
const DEFAULT_CENTER: readonly [number, number] = [-8.165, 39.55];

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
  setTargetCoordinates: (coords) => set({ targetCoordinates: coords })
}));
