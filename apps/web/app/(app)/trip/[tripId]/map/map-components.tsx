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
import type { SpatialFeatureCollection, WorkspaceCanvasHandle } from "@repo/spatial-engine";

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
  ...rest
}: RouteMapProps) {
  const { data: routeFeatures, status: routeStatus, isLoading } = useTripRoute(tripId);
  const canvasRef = React.useRef<WorkspaceCanvasHandle | null>(null);

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
        disableIntro
      />
      <div className="relative z-10 h-full w-full pointer-events-none">{children}</div>
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
