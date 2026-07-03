"use client";

import * as React from "react";
import { useReducedMotion } from "@repo/ui";
import { CartoBasemapStyleProvider } from "../core/map-style-provider";
import { createDiscoveryEngine, type MapLibreSpatialEngine } from "../adapters/maplibre/spatial-engine";
import { CameraChoreography } from "../core/camera-choreography";
import { fixtureAllCollections } from "../fixtures/travelers";
import { CLICKABLE_LAYER_IDS } from "../index";
import type { ViewportState } from "../core/viewport";
import type { CameraTarget, MapStyleEndpoint } from "../core/types";

export interface GlobeWorkspaceProps {
  /** Theme selector — defaults to dark for the discovery hero. */
  theme?: "light" | "dark";
  /** Override the default style endpoint (e.g. tests, air-gapped environments). */
  styleOverride?: MapStyleEndpoint;
  /**
   * Composite initial camera target — takes precedence over the
   * `initialCenter` / `initialZoom` defaults when provided. Lets
   * callers deep-link the globe straight to a destination without
   * running the intro choreography.
   */
  initialFocus?: CameraTarget;
  /** Initial camera target — defaults to Portugal at low altitude. */
  initialCenter?: readonly [number, number];
  initialZoom?: number;
  /** Disable the intro camera choreography (world → Portugal zoom). */
  disableIntro?: boolean;
  className?: string;
  testId?: string;
  /**
   * Fired on every `moveend` with the latest viewport snapshot.
   * The home bento / Zustand store wires this to keep the consumer
   * selection in lock-step with what the user is actually looking at.
   */
  onViewportChange?: (viewport: ViewportState) => void;
  /**
   * Fired when the user clicks a layer feature (ambient pulse or
   * symbol badge). `stopId` is the feature's `id` property; coordinates
   * come from the click's `lngLat`. Layer id conventions are documented
   * in the spatial-engine fixtures; map ids to slugs in the consumer.
   */
  onStopClick?: (stopId: string, coordinates: readonly [number, number]) => void;
}

const DEFAULT_HOME_CENTER: readonly [number, number] = [-8.2245, 39.3999];
const DEFAULT_HOME_ZOOM = 1.6;
const INTRO_HOME_CENTER: readonly [number, number] = [-8.2245, 39.3999];
const INTRO_HOME_ZOOM = 4.2;

/**
 * RumiaGlobeWorkspace — the high-level entry point that owns one
 * SpatialEngine instance for its lifetime. The component only ever
 * touches the abstract `SpatialEngine` interface, so swapping the
 * renderer (MapLibre today, deck.gl or CesiumJS tomorrow) only changes
 * the factory call below — never this file.
 */
export function GlobeWorkspace({
  theme = "dark",
  styleOverride,
  initialFocus,
  initialCenter = DEFAULT_HOME_CENTER,
  initialZoom = DEFAULT_HOME_ZOOM,
  disableIntro = false,
  className,
  testId = "globe-workspace",
  onViewportChange,
  onStopClick
}: GlobeWorkspaceProps): React.ReactElement {
  // If `initialFocus` is set, it wins and the intro choreography is
  // skipped — the caller has already chosen where to land.
  const resolvedInitialTarget: CameraTarget = React.useMemo(
    () =>
      initialFocus
        ? initialFocus
        : { center: initialCenter, zoom: initialZoom },
    [initialFocus, initialCenter, initialZoom]
  );
  const resolvedDisableIntro = disableIntro || initialFocus !== undefined;
  const containerRef = React.useRef<HTMLDivElement | null>(null);
  const engineRef = React.useRef<MapLibreSpatialEngine | null>(null);
  const reducedMotion = useReducedMotion();
  const [mountError, setMountError] = React.useState<string | null>(null);

  React.useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let cancelled = false;
    const styleProvider = new CartoBasemapStyleProvider();
    const style = styleOverride ?? styleProvider.getStyle(theme);
    const engine = createDiscoveryEngine({
      style,
      initialTarget: resolvedInitialTarget,
      reducedMotion
    });
    engineRef.current = engine;
    const seeds = fixtureAllCollections();
    engine.seedTelemetry("travelers", seeds.travelers);
    engine.seedTelemetry("specialists", seeds.specialists);

    engine
      .mount(container)
      .then(async () => {
        if (cancelled) {
          engine.unmount();
          return;
        }
        const unsubscribe = engine.getTelemetry().subscribe("travelers", () => {
          // Phase 1: the AmbientPulseLayer receives the seeded collection
          // on subscribe; phase 2 will wire update fan-out to all layers
          // that opted into the channel.
        });

        // Forward the live viewport to the consumer (e.g. Zustand store)
        // so cross-page surfaces mirror what the user is actually looking
        // at. Each `moveend` (pan, zoom, rotate) snapshots the renderer.
        const map = engine.getRenderer();
        const detachViewport = map && onViewportChange
          ? (() => {
              const handler = () => {
                onViewportChange({
                  center: map.getCenter().toArray() as [number, number],
                  zoom: map.getZoom(),
                  pitch: map.getPitch(),
                  bearing: map.getBearing()
                });
              };
              map.on("moveend", handler);
              return () => map.off("moveend", handler);
            })()
          : () => undefined;

        // Dispatch a single consumer-facing `onStopClick` for any
        // clickable layer (ambient pulse, symbol badge, route stop).
        // The first hit wins; richer fan-out can land in phase 2.
        const detachClick = map && onStopClick
          ? (() => {
              const handler = (event: { point: { x: number; y: number }; lngLat: { lng: number; lat: number } }) => {
                const features = map.queryRenderedFeatures(
                  [event.point.x, event.point.y],
                  { layers: CLICKABLE_LAYER_IDS as string[] }
                );
                const feature = features[0];
                if (!feature) return;
                const rawId =
                  (feature as { id?: unknown }).id ??
                  (feature.properties as Record<string, unknown> | null)?.id;
                if (rawId === undefined || rawId === null) return;
                onStopClick(String(rawId), [event.lngLat.lng, event.lngLat.lat]);
              };
              map.on("click", handler);
              return () => map.off("click", handler);
            })()
          : () => undefined;

        // MapLibre measures the container once at mount. When the parent
        // layout hasn't settled yet (dynamic import, font load, etc.) the
        // canvas can be initialised at 0×0 or a partial width. Resize on
        // the next frame and on every observed size change so the globe
        // always fills its container.
        const refresh = () => engine.getRenderer()?.resize();
        refresh();
        const raf = requestAnimationFrame(refresh);

        let observer: ResizeObserver | null = null;
        if (typeof ResizeObserver !== "undefined") {
          observer = new ResizeObserver(() => refresh());
          observer.observe(container);
        }

        if (!resolvedDisableIntro) {
          const intro = new CameraChoreography()
            .beat("earth", { center: [0, 30] as const, zoom: 1.4, duration: reducedMotion ? 0 : 1400 })
            .beat("europe", { center: INTRO_HOME_CENTER, zoom: INTRO_HOME_ZOOM, duration: reducedMotion ? 0 : 1800 });
          try {
            await engine.playChoreography(intro);
          } catch {
            // Choreography is best-effort; never let it block the page.
          }
        }

        return () => {
          cancelAnimationFrame(raf);
          observer?.disconnect();
          detachViewport();
          detachClick();
          unsubscribe();
        };
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          setMountError(err instanceof Error ? err.message : "Failed to mount globe");
        }
      });

    return () => {
      cancelled = true;
      engine.unmount();
      engineRef.current = null;
    };
  }, [resolvedDisableIntro, resolvedInitialTarget, reducedMotion, styleOverride, theme, onViewportChange, onStopClick]);

  return (
    <div
      ref={containerRef}
      data-testid={testId}
      data-theme={theme}
      data-reduced-motion={reducedMotion ? "true" : "false"}
      data-intro={disableIntro ? "off" : "on"}
      className={
        className ??
        "relative h-[640px] w-full overflow-hidden rounded-[32px] border border-[var(--color-border)] bg-sage shadow-[0_24px_60px_rgba(7,17,19,0.06)]"
      }
    >
      {mountError ? (
        <div
          role="alert"
          className="absolute inset-0 flex items-center justify-center bg-linen-dark/90 text-center text-sm text-on-surface"
        >
          <div>
            <p className="font-headline-sm text-headline-sm mb-2">Globe unavailable</p>
            <p className="rota-muted">{mountError}</p>
          </div>
        </div>
      ) : null}
    </div>
  );
}

export default GlobeWorkspace;