"use client";

/**
 * Map components for the `/trip/[tripId]/map` route.
 *
 * Phase 1e migration: this file used to wrap a Mapbox-era
 * `<ProviderMap>` (from `@repo/maps`) with a `<RouteMap>` facade
 * that chose between the live provider and the `@repo/ui`
 * schematic `RouteMap` based on `isMapProviderEnabled()`. The
 * spatial engine has no equivalent provider-vs-schematic split —
 * the canvas renders from CARTO open tiles and falls back to the
 * schematic only when the trip itself is missing.
 *
 * What changed:
 *   - `<RouteMap>` now reads trip data via `useTripRoute(tripId)`
 *     and renders a `<WorkspaceCanvas>` from `@repo/spatial-engine`
 *     when the route is non-null. When `useTripRoute` returns
 *     `null` (no trip, loading, error) we fall back to the
 *     `@repo/ui` schematic `RouteMap` so the panel + warnings
 *     still have a host to render into.
 *   - `<PrewarmLink>` is gone. MapLibre doesn't need a
 *     prewarm(); the day-pill `<Link>` is now a plain `next/link`.
 *   - The schematic fallback keeps the same `data-testid`
 *     (`schematic-map-fallback`) so existing visual tests still
 *     pass.
 */

import * as React from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { RouteMap as SchematicMap } from "@repo/ui";

import { useTripRoute } from "../_hooks/use-trip-route";
import type { WorkspaceCanvasHandle } from "@repo/spatial-engine";

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
 * spatial engine has data, renders a `WorkspaceCanvas` with the
 * route features seeded. Otherwise falls back to the static
 * schematic from `@repo/ui` so the warnings / panel still have a
 * host. `selectedDayId`, `days`, and `warnings` are passed
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
  const { data: routeFeatures, isLoading } = useTripRoute(tripId);
  const canvasRef = React.useRef<WorkspaceCanvasHandle | null>(null);

  // SSR + initial render: render the schematic so the page has
  // something to display before the spatial engine has finished
  // mounting. Once the route is non-null (or the trip is
  // confirmed missing / errored) we swap to the live canvas.
  if (routeFeatures === null && !isLoading) {
    return (
      <SchematicMap
        selectedDayId={selectedDayId}
        days={days}
        warnings={warnings}
        {...rest}
      >
        {children}
      </SchematicMap>
    );
  }

  return (
    <div
      data-testid="trip-workspace-canvas-frame"
      data-trip-id={tripId}
      data-mode="trip"
      className="relative flex h-[600px] w-full overflow-hidden rounded-[32px] border border-[var(--color-border)] bg-[rgba(247,250,249,0.96)] shadow-[0_24px_60px_rgba(7,17,19,0.06)]"
    >
      <WorkspaceCanvas
        ref={canvasRef}
        className="absolute inset-0 h-full w-full"
        testId="trip-workspace-canvas"
        routeFeatures={routeFeatures}
        disableIntro
      />
      <div className="relative z-10 h-full w-full pointer-events-none">{children}</div>
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
