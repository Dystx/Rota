"use client";

import * as React from "react";
import { useReducedMotion } from "@repo/ui";
import { CartoBasemapStyleProvider } from "../core/map-style-provider";
import { createDiscoveryEngine, type MapLibreSpatialEngine } from "../adapters/maplibre/spatial-engine";
import { CameraChoreography } from "../core/camera-choreography";
import { fixtureAllCollections } from "../fixtures/travelers";
import { CLICKABLE_LAYER_IDS } from "../index";
import type { ViewportState } from "../core/viewport";
import type {
  AtmosphereOptions,
  CameraTarget,
  FogOptions,
  MapStyleEndpoint,
  TerrainOptions
} from "../core/types";

/**
 * Default terrain config for the Discovery globe. AWS Terrarium tiles
 * (free, no API key) at 1.4x vertical exaggeration — same as the
 * Mapbox-era baseline so mountains feel familiar, not cartoonish.
 */
const DEFAULT_TERRAIN: TerrainOptions = {
  exaggeration: 1.4
};

/**
 * Default fog / sky for the Discovery globe. Soft slate blue at the
 * horizon fading to deep indigo up high; soft horizon blend (0.8) so
 * the basemap isn't washed out at the visible edge. `space-color` and
 * `star-intensity` are not part of MapLibre's standard SkySpecification
 * — they live on a follow-up custom radial-gradient layer.
 */
const DEFAULT_FOG: FogOptions = {
  color: "rgb(60, 90, 120)",
  highColor: "rgb(25, 30, 45)",
  horizonBlend: 0.8,
  fogGroundBlend: 0.5
};

/**
 * Default atmosphere — soft radial-gradient halo + ~26k Fibonacci-sphere
 * stars. Both layers are independent opt-ins (you can pass `{ starfield }`
 * only, or `{ radialGradient }` only). Pass `atmosphere: undefined` to
 * skip the layers entirely (the default).
 *
 * The colors here mirror `DEFAULT_FOG` so the halo blends into the
 * MapLibre sky rather than fighting it.
 */
export const DEFAULT_ATMOSPHERE: AtmosphereOptions = {
  radialGradient: {
    innerColor: "rgb(60, 90, 120)",
    outerColor: "rgb(5, 8, 15)",
    intensity: 0.6,
    radius: 0.7
  },
  starfield: {
    count: 26000,
    minBrightness: 0.3,
    maxBrightness: 1.0,
    seed: 1
  }
};

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
  /**
   * 3D terrain via raster DEM. Default: enabled (AWS Terrarium tiles,
   * 1.4x exaggeration). Pass `{ disabled: true }` to opt out, or a
   * partial `TerrainOptions` to override specific fields.
   */
  terrain?: TerrainOptions;
  /**
   * Atmospheric fog / sky / starfield. Default: enabled with the soft
   * config above. Pass `{ disabled: true }` to opt out, or a partial
   * `FogOptions` to override specific fields.
   */
  fog?: FogOptions;
  /**
   * Soft radial-gradient halo + starfield custom WebGL layers. Default:
   * undefined (no atmosphere layers). Pass `DEFAULT_ATMOSPHERE` to opt
   * in to the soft default, or a partial `AtmosphereOptions` to mix
   * and match the radial gradient and starfield independently.
   */
  atmosphere?: AtmosphereOptions;
  /**
   * Override the projection. Default: `"globe"`. The engine factory
   * (`createDiscoveryEngine`) sets the initial projection from this
   * prop; runtime changes after mount call `engine.setProjectionType`
   * so the engine itself does not remount. The `hero-map.tsx` 2D ↔ 3D
   * toggle relies on this to avoid rebuilding the layer registry and
   * re-allocating the WebGL custom layers on every projection switch.
   */
  projection?: "globe" | "mercator";
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
  terrain,
  fog,
  atmosphere,
  className,
  testId = "globe-workspace",
  onViewportChange,
  onStopClick,
  projection
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
  // Terrain + fog default to ON with the soft defaults above. Pass
  // `{ disabled: true }` to opt out, or a partial object to override.
  const resolvedTerrain: TerrainOptions = terrain ?? DEFAULT_TERRAIN;
  const resolvedFog: FogOptions = fog ?? DEFAULT_FOG;
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
      reducedMotion,
      // The factory default is "globe"; honor an explicit `projection`
      // prop so the engine starts in the right mode on first mount
      // (no wasted setProjection call after mount).
      projection: projection ?? "globe",
      terrain: resolvedTerrain,
      fog: resolvedFog,
      atmosphere
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
  }, [resolvedDisableIntro, resolvedInitialTarget, reducedMotion, resolvedTerrain, resolvedFog, atmosphere, styleOverride, theme, onViewportChange, onStopClick, projection]);

  // Runtime projection switch (post-mount). The mount effect above
  // handles the initial value; this effect fires on every subsequent
  // change to `projection` and calls `engine.setProjectionType` so
  // MapLibre re-projects in place — no canvas teardown, no layer
  // registry rebuild, no WebGL buffer churn. The 2D ↔ 3D toggle in
  // `hero-map.tsx` is the primary consumer; it used to remount the
  // component (forcing a full WebGL lifecycle) and now just flips
  // this prop. The dependency list intentionally omits `engineRef`
  // and `projection` (the engine mutates those internally, and
  // `projection` is the trigger we want to react to).
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

  return (
    <div
      ref={containerRef}
      data-testid={testId}
      role="application"
      aria-label={`Interactive globe map of ${initialFocus ? "the selected destination" : "Portugal"} — use arrow keys to pan, plus and minus to zoom`}
      tabIndex={0}
      data-theme={theme}
      data-reduced-motion={reducedMotion ? "true" : "false"}
      data-intro={disableIntro ? "off" : "on"}
      className={
        className ??
        "relative h-[640px] w-full overflow-hidden rounded-[32px] border border-[var(--color-border)] bg-sage shadow-[0_24px_60px_rgba(7,17,19,0.06)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ochre-light focus-visible:ring-offset-2"
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