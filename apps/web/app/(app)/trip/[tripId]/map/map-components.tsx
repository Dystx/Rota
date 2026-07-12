"use client";

/**
 * Map components for the `/trip/[tripId]/map` route.
 *
 * Phase 1e migration (complete): the legacy Mapbox-era
 * `<ProviderMap>` and `<CinematicMap>` from `@repo/maps` were
 * absorbed into the spatial engine. `<RouteMap>` below now
 * reads trip data via `useTripRoute(tripId)` and renders a
 * `<WorkspaceCanvas>` from `@repo/spatial-engine` when stop points
 * are available. The legacy source has no validated route segments,
 * so the canvas never receives a fabricated connector. When the
 * route status is unavailable we fall back to the `@repo/ui`
 * schematic `RouteMap` so the panel + warnings still have a host.
 *
 * The schematic fallback keeps the same `data-testid`
 * (`schematic-map-fallback`) so existing visual tests still
 * pass. See `packages/spatial-engine/README.md § 10` for the
 * full migration history.
 */

import * as React from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { RouteMap as SchematicMap } from "@repo/ui";

import { useTripRoute } from "../_hooks/use-trip-route";
import { tripRouteStatusMessage } from "../_lib/trip-to-features";
import { useReducedMotion } from "@repo/ui";
import {
  cameraPresetTarget,
  type CameraPreset,
  type MapTelemetryHandler,
  type SpatialFeatureCollection,
  type WorkspaceCanvasHandle
} from "@repo/spatial-engine";
import { captureMapTelemetry } from "@/app/_lib/map-telemetry";
import { RouteStoryControls } from "./route-story-controls";

const EMPTY_ROUTE_FEATURES: SpatialFeatureCollection = {
  type: "FeatureCollection",
  features: []
};

const WorkspaceCanvas = dynamic(
  () => import("@repo/spatial-engine").then((mod) => mod.WorkspaceCanvas),
  { ssr: false, loading: () => <WorkspaceCanvasSkeleton /> }
);

function WorkspaceCanvasSkeleton() {
  return (
    <div
      data-testid="trip-workspace-canvas-skeleton"
      className="h-[600px] w-full bg-gradient-to-b from-linen-dark to-sage"
      aria-label="Loading route map"
    />
  );
}

interface RouteMapProps extends React.ComponentProps<typeof SchematicMap> {
  /** Trip id used to fetch the live route via `useTripRoute`. */
  tripId: string;
  /** Explicit Phase 2 story capability; remains off until route geometry is ready. */
  storyEnabled?: boolean;
  storyPresets?: readonly CameraPreset[];
  /** Explicit Phase 3 building treatment; remains off until style approval. */
  showBuildingExtrusions?: boolean;
  /** Optional additional sink for browser tests or host integrations. */
  onMapTelemetry?: MapTelemetryHandler;
}

/**
 * `<RouteMap>` — the live-or-schematic facade for the trip map
 * page. Reads the trip route via `useTripRoute(tripId)`. When the
 * spatial engine has stop-point data, renders a `WorkspaceCanvas`
 * with those points seeded and exposes the partial-route status.
 * Otherwise it falls back to the static schematic from `@repo/ui`
 * so the warnings / panel still have a host. `selectedDayId`, `days`,
 * and `warnings` are passed
 * through to the schematic only — the spatial engine ignores
 * them and builds its own features from the trip itinerary.
 */
export function RouteMap({
  tripId,
  selectedDayId,
  days,
  warnings,
  children,
  storyEnabled = false,
  storyPresets = [],
  showBuildingExtrusions = false,
  onMapTelemetry,
  ...rest
}: RouteMapProps) {
  const { data: routeFeatures, status: routeStatus, isLoading } = useTripRoute(tripId);
  const canvasRef = React.useRef<WorkspaceCanvasHandle | null>(null);
  const reducedMotion = useReducedMotion();
  const [storyIndex, setStoryIndex] = React.useState(-1);
  const storyReady = storyEnabled && routeStatus === "ready" && storyPresets.length > 0;
  const handleMapTelemetry = React.useCallback((event: Parameters<typeof captureMapTelemetry>[0]) => {
    captureMapTelemetry(event, tripId);
    onMapTelemetry?.(event);
  }, [onMapTelemetry, tripId]);

  const focusStoryPreset = React.useCallback((index: number) => {
    const preset = storyPresets[index];
    if (!preset) return;
    setStoryIndex(index);
    handleMapTelemetry({
      type: "camera-focus",
      surface: "trip-map",
      reason: "story",
      targetId: preset.stopId
    });
    void canvasRef.current?.flyTo(cameraPresetTarget(preset, reducedMotion));
  }, [handleMapTelemetry, reducedMotion, storyPresets]);

  const startStory = React.useCallback(() => {
    handleMapTelemetry({ type: "intent", surface: "trip-map", intent: "story-start" });
    focusStoryPreset(0);
  }, [focusStoryPreset, handleMapTelemetry]);

  const stopStory = React.useCallback(() => {
    setStoryIndex(-1);
    handleMapTelemetry({ type: "intent", surface: "trip-map", intent: "story-stop" });
  }, [handleMapTelemetry]);

  // SSR + initial render: render the schematic so the page has
  // something to display before the spatial engine has finished
  // mounting. Once the route is non-null (or the trip is
  // confirmed missing / errored) we swap to the live canvas.
  if (routeStatus === "unavailable" && !isLoading) {
    return (
      <SchematicMap
        selectedDayId={selectedDayId}
        days={days}
        warnings={warnings}
        {...rest}
        data-map-capable="true"
        data-route-status={routeStatus}
      >
        <p
          role="status"
          data-testid="trip-route-status"
          className="absolute bottom-16 left-4 right-4 z-20 rounded-xl border border-[var(--color-border)] bg-[rgba(247,250,249,0.94)] px-4 py-3 text-sm text-[var(--color-muted-foreground)] shadow-sm"
        >
          {tripRouteStatusMessage(routeStatus)}
        </p>
        {children}
      </SchematicMap>
    );
  }

  return (
    <div
      data-testid="trip-workspace-canvas-frame"
      data-trip-id={tripId}
      data-mode="trip"
      data-map-capable="true"
      data-route-status={routeStatus}
      className="relative flex h-[600px] w-full overflow-hidden rounded-[32px] border border-[var(--color-border)] bg-[rgba(247,250,249,0.96)] shadow-[0_24px_60px_rgba(7,17,19,0.06)]"
    >
      <WorkspaceCanvas
        ref={canvasRef}
        className="absolute inset-0 h-full w-full"
        testId="trip-workspace-canvas"
        routeFeatures={routeFeatures ?? EMPTY_ROUTE_FEATURES}
        showBuildingExtrusions={showBuildingExtrusions}
        telemetrySurface="trip-map"
        onMapTelemetry={handleMapTelemetry}
        disableIntro
      />
      <div className="relative z-10 h-full w-full pointer-events-none">{children}</div>
      {storyReady ? (
        <div className="pointer-events-auto absolute left-4 top-4 z-30 w-[min(25rem,calc(100%-2rem))]">
          <RouteStoryControls
            presets={storyPresets}
            activeIndex={storyIndex}
            started={storyIndex >= 0}
            onStart={startStory}
            onPrevious={() => focusStoryPreset(Math.max(0, storyIndex - 1))}
            onNext={() => focusStoryPreset(Math.min(storyPresets.length - 1, storyIndex + 1))}
            onStop={stopStory}
          />
        </div>
      ) : null}
      {routeStatus === "partial" ? (
        <p
          role="status"
          data-testid="trip-route-status"
          className="pointer-events-none absolute bottom-4 left-4 right-4 z-20 rounded-xl border border-[var(--color-border)] bg-[rgba(247,250,249,0.94)] px-4 py-3 text-sm text-[var(--color-muted-foreground)] shadow-sm"
        >
          {tripRouteStatusMessage(routeStatus)}
        </p>
      ) : null}
    </div>
  );
}

/**
 * `<PrewarmLink>` was a Mapbox-era wrapper that called
 * `prewarm()` on hover/focus. MapLibre doesn't need a prewarm
 * step, so the day-pill links on the map page are now plain
 * `next/link` instances. We keep this thin re-export so the
 * page file doesn't have to coordinate its import path with
 * this module's removal — it just becomes a passthrough.
 */
export const PrewarmLink = React.forwardRef<HTMLAnchorElement, React.ComponentProps<typeof Link>>(
  function PrewarmLink(props, ref) {
    return <Link ref={ref} {...props} />;
  }
);

export const MapPanel = dynamic(
  () => import("@repo/ui").then((mod) => ({ default: mod.MapPanel })),
  { ssr: false }
);
