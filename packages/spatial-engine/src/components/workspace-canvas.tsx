"use client";

import * as React from "react";
import type { Map as MapLibreMap } from "maplibre-gl";
import { useReducedMotion } from "@repo/ui";
import { CartoBasemapStyleProvider } from "../core/map-style-provider";
import { createWorkspaceEngine, type MapLibreSpatialEngine } from "../adapters/maplibre/spatial-engine";
import {
  ActivityPointsLayer,
  ACTIVITY_POINTS_LABEL_LAYER_ID,
  ACTIVITY_POINTS_LAYER_ID
} from "../adapters/maplibre/layers/activity-points";
import { AMBIENT_PULSE_LAYER_ID } from "../adapters/maplibre/layers/ambient-pulse";
import { ROUTE_STOPS_LAYER_ID } from "../adapters/maplibre/layers/route-layer";
import { SYMBOL_BADGES_LAYER_ID } from "../adapters/maplibre/layers/symbol-badges";
import { CameraChoreography } from "../core/camera-choreography";
import { fixtureRouteCollection } from "../fixtures/routes";
import { fixtureTravelerCollection, fixtureSpecialistCollection } from "../fixtures/travelers";
import type { ViewportState } from "../core/viewport";
import type {
  CameraTarget,
  FogOptions,
  MapStyleEndpoint,
  SpatialFeatureCollection,
  TerrainOptions
} from "../core/types";

/**
 * Imperative handle returned by `WorkspaceCanvas`'s `forwardRef`.
 * Lets callers (e.g. the cinematic trip page's `WorkspaceTripCanvas`)
 * drive the camera after mount without remounting the engine, and
 * re-seed the route layer when the trip's features change.
 */
export interface WorkspaceCanvasHandle {
  /**
   * Smoothly move the camera to the given target. Resolves once the
   * underlying MapLibre `flyTo` settles. Returns `Promise.resolve()`
   * when the engine is not mounted (e.g. the canvas is offscreen).
   */
  flyTo: (target: CameraTarget) => Promise<void>;
  /**
   * Instantly jump the camera. The trip cinematic uses this when the
   * user has `prefers-reduced-motion: reduce` or has keyboarded to a
   * far-away chapter. No-op when the engine isn't mounted.
   */
  jumpTo: (target: CameraTarget) => void;
  /** Fit a reviewed activity set or itinerary bounds into the viewport. */
  fitBounds: (bounds: [[number, number], [number, number]]) => Promise<void>;
  /** Return the camera to a north-up orientation without changing selection. */
  resetNorth: () => void;
  /**
   * Replace the route features in the `trips` telemetry channel
   * without remounting the engine. Pass `null` to fall back to the
   * deterministic Porto→Lisbon fixture.
   */
  seedRoute: (collection: SpatialFeatureCollection | null) => void;
}

export interface WorkspaceCanvasProps {
  /** Style endpoint override (tests, air-gapped environments). */
  styleOverride?: MapStyleEndpoint;
  /**
   * Composite initial camera target — takes precedence over the
   * `initialCenter` / `initialZoom` defaults when provided. Lets
   * callers (e.g. home bento cards → /explore/workspace?focus=lisbon)
   * skip the intro choreography and land directly on a destination.
   *
   * Only applied on first mount. Subsequent changes are ignored —
   * callers drive the camera via the imperative handle returned by
   * `forwardRef`. This is what lets the cinematic trip page
   * `flyTo` from one chapter to the next without remounting the
   * engine every time the scroll progress changes.
   */
  initialFocus?: CameraTarget;
  /** Initial camera target — defaults to Porto at mid zoom. */
  initialCenter?: readonly [number, number];
  initialZoom?: number;
  /**
   * Disable the intro camera choreography (Portugal context → route
   * fit → stop 1). Defaults to false so the demo page always animates;
   * real consumers can opt out for inline embeds. When `initialFocus`
   * is provided, the intro is skipped automatically — no need to set
   * this explicitly.
   */
  disableIntro?: boolean;
  /**
   * When provided, the route layer is seeded with this collection
   * instead of the deterministic fixture. Useful for trip pages that
   * need to render real (AI-enriched) coordinates.
   */
  routeFeatures?: SpatialFeatureCollection | null;
  /** Render the legacy itinerary route layer. Activity maps keep this false. */
  showRoute?: boolean;
  /** Render discovery-only traveler/specialist overlays. Activity maps keep this false. */
  showContextLayers?: boolean;
  /** Validated, reviewed activity points for the optional activity map layer. */
  activityPoints?: SpatialFeatureCollection | null;
  /** Controlled marker/card selection for activity points. */
  selectedActivityId?: string | null;
  className?: string;
  testId?: string;
  /** Accessible label override for product facades such as the activity map. */
  ariaLabel?: string;
  /**
   * Fired on every `moveend`. Lets a Zustand store mirror the live
   * viewport without prop-drilling through the cinematic trip page.
   */
  onViewportChange?: (viewport: ViewportState) => void;
  /**
   * Fired when the user clicks a stop / route / ambient pulse feature.
   * `stopId` is the feature's GeoJSON id; `coordinates` come from the
   * click's `lngLat`. Wire this to `selectStop` in the Zustand store.
   */
  onStopClick?: (stopId: string, coordinates: readonly [number, number]) => void;
  /** Fired when a reviewed activity marker is clicked. */
  onActivitySelect?: (activityId: string) => void;
  /** Fired when MapLibre style/WebGL mounting fails. */
  onMapError?: (message: string) => void;
  /**
   * 3D terrain. Default: DISABLED on the 2D workspace canvas (mercator
   * projection is for editing precision; mountains would obscure the
   * route). Pass a `TerrainOptions` object to opt in.
   */
  terrain?: TerrainOptions;
  /**
   * Atmospheric fog / sky. Default: DISABLED on mercator (sky is a 3D
   * feature; on flat 2D it has no effect). Pass a `FogOptions` object
   * to opt in.
   */
  fog?: FogOptions;
  /**
   * Override the projection. Default: `"mercator"` (the workspace is
   * a 2D editing surface). The engine factory initializes from this
   * prop; runtime changes after mount call `engine.setProjectionType`
   * so the engine itself does not remount. See `GlobeWorkspace` for
   * the full design rationale; the projection switch is the same
   * code path either way.
   */
  projection?: "globe" | "mercator";
  /**
   * Fired once after the engine mounts, with the live MapLibre map
   * handle. Consumers use this to register a "stops" source with
   * the cross-page `useMapStore` (the high-frequency Zustand→MapLibre
   * path; see `apps/web/store/useMapStore.ts`).
   *
   * Fires exactly once per mount. If the engine is unmounted before
   * the mount promise resolves, the callback does NOT fire.
   */
  onMapReady?: (map: MapLibreMap) => void;
}

const DEFAULT_HOME_CENTER: readonly [number, number] = [-8.6291, 41.1579];
const DEFAULT_HOME_ZOOM = 5.4;
const INTRO_CONTEXT_CENTER: readonly [number, number] = [-9.1393, 38.7223];
const INTRO_CONTEXT_ZOOM = 4.2;
const INTRO_FIT_CENTER: readonly [number, number] = [-8.6291, 39.85];
const INTRO_FIT_ZOOM = 6.4;
const INTRO_STOP_CENTER: readonly [number, number] = [-8.6291, 41.1579];
const INTRO_STOP_ZOOM = 11;

// These defaults participate in the mount effect dependency list. Keep them
// stable so an ordinary parent render cannot remount the MapLibre engine.
const DISABLED_TERRAIN: TerrainOptions = { disabled: true };
const DISABLED_FOG: FogOptions = { disabled: true };

/**
 * WorkspaceCanvas — the 2D counterpart to GlobeWorkspace. Renders an
 * itinerary in flat mercator projection so editing precision is not
 * lost to curvature. Same SpatialEngine abstraction; the projection
 * option is the only renderer-specific difference.
 */
export const WorkspaceCanvas = React.forwardRef<WorkspaceCanvasHandle, WorkspaceCanvasProps>(
  function WorkspaceCanvas(
    {
      styleOverride,
      initialFocus,
      initialCenter = DEFAULT_HOME_CENTER,
      initialZoom = DEFAULT_HOME_ZOOM,
      disableIntro = false,
      routeFeatures,
      showRoute = true,
      showContextLayers = true,
      activityPoints,
      selectedActivityId = null,
      className,
      testId = "workspace-canvas",
      ariaLabel,
      onViewportChange,
      onStopClick,
      onActivitySelect,
      onMapError,
      terrain,
      fog,
      projection,
      onMapReady
    },
    ref
  ) {
    // If `initialFocus` is set, it wins. Skip the intro choreography — the
    // caller has already chosen where to land.
    const resolvedInitialTarget: CameraTarget = initialFocus
      ? initialFocus
      : { center: initialCenter, zoom: initialZoom };
    const resolvedDisableIntro = disableIntro || initialFocus !== undefined;
    // Terrain + fog default to DISABLED on the 2D workspace (mercator
    // is for precision editing; sky/3D are globe-only). Pass a
    // TerrainOptions / FogOptions to opt in.
    const resolvedTerrain: TerrainOptions = terrain ?? DISABLED_TERRAIN;
    const resolvedFog: FogOptions = fog ?? DISABLED_FOG;
    const containerRef = React.useRef<HTMLDivElement | null>(null);
    const engineRef = React.useRef<MapLibreSpatialEngine | null>(null);
    const activityLayerRef = React.useRef<ActivityPointsLayer | null>(null);
    const reducedMotion = useReducedMotion();
    const [mountError, setMountError] = React.useState<string | null>(null);
    const callbacksRef = React.useRef({
      onMapReady,
      onViewportChange,
      onStopClick,
      onActivitySelect,
      onMapError
    });
    callbacksRef.current = {
      onMapReady,
      onViewportChange,
      onStopClick,
      onActivitySelect,
      onMapError
    };
    const clickableLayerIds = React.useMemo(() => [
      ...(showContextLayers ? [AMBIENT_PULSE_LAYER_ID, SYMBOL_BADGES_LAYER_ID] : []),
      ...(showRoute ? [ROUTE_STOPS_LAYER_ID] : []),
      ...(activityPoints ? [ACTIVITY_POINTS_LAYER_ID, ACTIVITY_POINTS_LABEL_LAYER_ID] : [])
    ], [activityPoints, showContextLayers, showRoute]);

    // Track which route collection we last seeded so we only re-publish
    // when the prop actually changes (otherwise every parent render
    // would invalidate the equality check).
    const lastSeededRef = React.useRef<SpatialFeatureCollection | null | undefined>(undefined);

    React.useImperativeHandle(
      ref,
      () => ({
        flyTo: (target) => {
          const engine = engineRef.current;
          if (!engine) return Promise.resolve();
          try {
            return engine.getCamera().focus({ ...target, duration: target.duration ?? 1200 });
          } catch {
            return Promise.resolve();
          }
        },
        jumpTo: (target) => {
          const engine = engineRef.current;
          if (!engine) return;
          try {
            engine.getCamera().focus({ ...target, duration: 0 });
          } catch {
            // engine unmounted mid-call — safe to ignore.
          }
        },
        fitBounds: (bounds) => {
          const engine = engineRef.current;
          if (!engine) return Promise.resolve();
          try {
            return engine.getCamera().fitBounds(bounds);
          } catch {
            return Promise.resolve();
          }
        },
        resetNorth: () => {
          const engine = engineRef.current;
          if (!engine) return;
          try {
            void engine.getCamera().focus({ bearing: 0, duration: 0 });
          } catch {
            // engine unmounted mid-call — safe to ignore.
          }
        },
        seedRoute: (collection) => {
          const engine = engineRef.current;
          if (!engine) return;
          if (collection) {
            engine.seedTelemetry("trips", collection);
          } else {
            engine.seedTelemetry("trips", fixtureRouteCollection());
          }
          lastSeededRef.current = collection ?? null;
        }
      }),
      []
    );

    React.useEffect(() => {
      const container = containerRef.current;
      if (!container) return;

      let cancelled = false;
      const styleProvider = new CartoBasemapStyleProvider();
      const style = styleOverride ?? styleProvider.getStyle("light");
      const activityLayer = activityPoints
        ? new ActivityPointsLayer({ selectedActivityId })
        : null;
      activityLayerRef.current = activityLayer;
      let mountedCleanup: (() => void) | null = null;
      const engine = createWorkspaceEngine({
        style,
        initialTarget: resolvedInitialTarget,
        reducedMotion,
        // The factory default is "mercator"; honor an explicit
        // `projection` prop so the engine starts in the right mode
        // on first mount (no wasted setProjection call after mount).
        projection: projection ?? "mercator",
        terrain: resolvedTerrain,
        fog: resolvedFog
      }, {
        includeRoute: showRoute,
        includeContextLayers: showContextLayers,
        activityPoints: activityLayer ?? undefined
      });
      engineRef.current = engine;

      // Prefer the caller-supplied route features, fall back to the
      // deterministic Porto→Lisbon fixture used by `/explore/workspace`.
      const initialRoute = showRoute ? routeFeatures ?? fixtureRouteCollection() : { type: "FeatureCollection" as const, features: [] };
      if (showContextLayers) {
        engine.seedTelemetry("travelers", fixtureTravelerCollection());
        engine.seedTelemetry("specialists", fixtureSpecialistCollection());
      }
      engine.seedTelemetry("trips", initialRoute);
      lastSeededRef.current = routeFeatures ?? null;

      engine
        .mount(container)
        .then(async () => {
          if (cancelled) {
            engine.unmount();
            return;
          }
          // Fire onMapReady once, with the live MapLibre handle. This
          // is the hook consumers use to register a "stops" source
          // with useMapStore. Fires after the `cancelled` short-
          // circuit so a mount-then-unmount race doesn't leak the
          // callback to a page that's already gone.
          const map = engine.getRenderer();
          const detachMapError = map
            ? (() => {
                const handler = (event: { error?: unknown }) => {
                  if (cancelled) return;
                  const error = event.error;
                  const message = error instanceof Error
                    ? error.message
                    : typeof error === "string"
                      ? error
                      : "Map tiles or the renderer failed to load.";
                  setMountError(message);
                  callbacksRef.current.onMapError?.(message);
                };
                map.on("error", handler);
                return () => map.off("error", handler);
              })()
            : () => undefined;

          if (map && callbacksRef.current.onMapReady) {
            callbacksRef.current.onMapReady(map);
          }

          if (activityLayer && activityPoints) {
            engine.applyLayerUpdate(activityLayer, activityPoints);
          }

          const unsubscribe = engine.getTelemetry().subscribe("trips", () => undefined);

          // Same moveend / click forwarding as GlobeWorkspace so the
          // Zustand store stays in lock-step with what the user sees.
          // `map` is already declared above (for the onMapReady
          // callback); reuse it here.
          const detachViewport = map
            ? (() => {
                const handler = () => {
                  const callback = callbacksRef.current.onViewportChange;
                  if (!callback) return;
                  callback({
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

          const detachClick = map
            ? (() => {
                const handler = (event: { point: { x: number; y: number }; lngLat: { lng: number; lat: number } }) => {
                  const callbacks = callbacksRef.current;
                  if (!callbacks.onStopClick && !callbacks.onActivitySelect) return;
                  const features = map.queryRenderedFeatures(
                    [event.point.x, event.point.y],
                    { layers: clickableLayerIds }
                  );
                  const feature = features[0];
                  if (!feature) return;
                  const properties = (feature.properties as Record<string, unknown> | null) ?? null;
                  const activityId = properties?.activityId;
                  if (typeof activityId === "string" && callbacks.onActivitySelect) {
                    callbacks.onActivitySelect(activityId);
                    return;
                  }
                  const rawId =
                    (feature as { id?: unknown }).id ??
                    properties?.id;
                  if (rawId === undefined || rawId === null) return;
                  callbacks.onStopClick?.(String(rawId), [event.lngLat.lng, event.lngLat.lat]);
                };
                map.on("click", handler);
                return () => map.off("click", handler);
              })()
            : () => undefined;

          // Same defensive pattern as GlobeWorkspace: gate on
          // `isMounted()` and wrap in try/catch so a ResizeObserver
          // tick that fires after the engine has been torn down
          // (or before the first MapLibre render finishes) doesn't
          // leak the `Cannot read properties of null (reading '0')`
          // from the projection's `_calcMatrices` into the
          // console.
          const refresh = () => {
            if (!engine.isMounted()) return;
            try {
              engine.getRenderer()?.resize();
            } catch {
              // MapLibre's projection is mid-teardown or not yet
              // initialized. Swallow — the next ResizeObserver
              // tick will retry.
            }
          };
          // Skip the immediate `refresh()` — wait one frame so
          // the first MapLibre render can complete.
          const raf = requestAnimationFrame(refresh);

          let observer: ResizeObserver | null = null;
          if (typeof ResizeObserver !== "undefined") {
            observer = new ResizeObserver(() => refresh());
            observer.observe(container);
          }

          let cleanedUp = false;
          const cleanup = () => {
            if (cleanedUp) return;
            cleanedUp = true;
            cancelAnimationFrame(raf);
            observer?.disconnect();
            detachMapError();
            detachViewport();
            detachClick();
            unsubscribe();
            if (mountedCleanup === cleanup) mountedCleanup = null;
          };
          mountedCleanup = cleanup;

          if (!resolvedDisableIntro) {
            const intro = new CameraChoreography()
              .beat("iberian-context", { center: INTRO_CONTEXT_CENTER, zoom: INTRO_CONTEXT_ZOOM }, { duration: reducedMotion ? 0 : 1500 })
              .beat("fit-route", { center: INTRO_FIT_CENTER, zoom: INTRO_FIT_ZOOM, duration: reducedMotion ? 0 : 1400 })
              .beat("first-stop", { center: INTRO_STOP_CENTER, zoom: INTRO_STOP_ZOOM, duration: reducedMotion ? 0 : 900 });
            try {
              await engine.playChoreography(intro);
            } catch {
              // Choreography is best-effort; never let it block the page.
            }
          }

          return cleanup;
        })
        .catch((err: unknown) => {
          if (!cancelled) {
            const message = err instanceof Error ? err.message : "Failed to mount workspace";
            setMountError(message);
            callbacksRef.current.onMapError?.(message);
          }
        });

      return () => {
        cancelled = true;
        mountedCleanup?.();
        mountedCleanup = null;
        engine.unmount();
        engineRef.current = null;
        activityLayerRef.current = null;
      };
    // We intentionally do not depend on `resolvedInitialTarget` /
    // `resolvedDisableIntro` / `routeFeatures` here — the initial
    // target is captured on first mount, and route features are
    // re-seeded by the dedicated effect below when the prop changes.
    // This stops the engine from remounting on every parent render.
    }, [reducedMotion, resolvedTerrain, resolvedFog, styleOverride, projection, showRoute, showContextLayers, clickableLayerIds]);

    // Runtime projection switch (post-mount). The mount effect above
    // handles the initial value; this effect fires on every subsequent
    // change to `projection` and calls `engine.setProjectionType` so
    // MapLibre re-projects in place — no canvas teardown, no layer
    // registry rebuild. The dependency list intentionally omits
    // `engineRef` and includes `projection` (the trigger we want to
    // react to).
    React.useEffect(() => {
      const engine = engineRef.current;
      if (!engine || projection === undefined) return;
      try {
        engine.setProjectionType(projection);
      } catch {
        // Engine not mounted yet (mount() is async); the mount effect
        // already passed the right projection to the factory, so a
        // pre-mount toggle is a no-op.
      }
    }, [projection]);

    // Re-seed the route layer when the parent swaps `routeFeatures`.
    // `null` is a valid value — it restores the deterministic fixture
    // so the canvas never goes empty.
    React.useEffect(() => {
      if (lastSeededRef.current === routeFeatures) return;
      const engine = engineRef.current;
      if (!engine) return;
      if (routeFeatures) {
        engine.seedTelemetry("trips", routeFeatures);
      } else {
        engine.seedTelemetry("trips", fixtureRouteCollection());
      }
      lastSeededRef.current = routeFeatures ?? null;
    }, [routeFeatures]);

    React.useEffect(() => {
      const engine = engineRef.current;
      const activityLayer = activityLayerRef.current;
      if (!engine || !activityLayer || !activityPoints) return;
      engine.applyLayerUpdate(activityLayer, activityPoints);
    }, [activityPoints]);

    React.useEffect(() => {
      activityLayerRef.current?.setSelectedActivityId(selectedActivityId);
    }, [selectedActivityId]);

    return (
      <div
        ref={containerRef}
        data-testid={testId}
        data-map-container=""
        role="application"
        aria-label={ariaLabel ?? `Interactive workspace map of ${initialFocus ? "the selected route" : "Portugal"} — use arrow keys to pan, plus and minus to zoom`}
        tabIndex={0}
        data-projection={projection ?? "mercator"}
        data-reduced-motion={reducedMotion ? "true" : "false"}
        data-intro={disableIntro ? "off" : "on"}
        className={
          className ??
          "relative h-[640px] w-full overflow-hidden rounded-[32px] border border-[var(--color-border)] bg-linen-dark shadow-[0_24px_60px_rgba(7,17,19,0.06)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ochre-light focus-visible:ring-offset-2"
        }
      >
        {mountError ? (
          <div
            role="alert"
            className="absolute inset-0 flex items-center justify-center bg-linen-dark/90 text-center text-sm text-on-surface"
          >
            <div>
              <p className="font-headline-sm text-headline-sm mb-2">Workspace unavailable</p>
              <p className="text-on-surface-variant leading-loose">{mountError}</p>
            </div>
          </div>
        ) : null}
      </div>
    );
  }
);

export default WorkspaceCanvas;
