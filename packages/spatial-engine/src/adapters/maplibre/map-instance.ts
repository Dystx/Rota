import maplibregl, { Map as MapLibreMap } from "maplibre-gl";
import type { CameraExecutor } from "../../core/camera-controller";
import type { CameraTarget, FogOptions, MapStyleEndpoint, TerrainOptions } from "../../core/types";

/** Free, no-API-key DEM tiles — RGB-encoded terrarium format hosted on AWS. */
const DEFAULT_TERRAIN_URL = "https://elevation-tiles-prod.s3.amazonaws.com/terrarium/{z}/{x}/{y}.png";
const DEFAULT_TERRAIN_SOURCE_ID = "spatial-engine:terrain-dem";
const DEFAULT_TERRAIN_EXAGGERATION = 1.4;

/**
 * Default sky / fog config. Soft slate-blue at the horizon fading to
 * deep indigo up high. Horizon blend is intentionally soft (0.8) so
 * the basemap is not washed out at the visible edge — the user can
 * crank it lower for a sharper terminator or higher for a moodier look.
 *
 * `space-color` and `star-intensity` are not part of MapLibre's
 * `SkySpecification`; they live on a custom radial-gradient layer
 * that can be added separately.
 */
const DEFAULT_FOG = {
  color: "rgb(60, 90, 120)",   // fog + horizon (soft slate blue)
  highColor: "rgb(25, 30, 45)", // sky (deep indigo at high altitude)
  horizonBlend: 0.8,            // 0 = horizon color, 1 = fog color
  fogGroundBlend: 0.5           // 0 = map center, 1 = horizon
};

export interface MapLibreInstanceOptions {
  container: HTMLElement;
  style: MapStyleEndpoint;
  initialTarget?: CameraTarget;
  reducedMotion?: boolean;
  projection?: "globe" | "mercator";
  /** 3D terrain via raster DEM. Disabled by default. */
  terrain?: TerrainOptions;
  /** Sky / fog / starfield for the globe. Disabled by default. */
  fog?: FogOptions;
}

/**
 * Mounts a MapLibre Map and exposes a CameraExecutor that proxies
 * flyTo/jumpTo/fitBounds.
 *
 * The 3D globe projection is enabled here per the architecture brief: a
 * single `setProjection({ type: "globe" })` call transforms the flat
 * canvas into a smooth interactive orb. Phase 2 will layer a soft fog
 * halo on top via a custom paint layer once the style-spec version is
 * bumped to a release that types fog as a top-level StyleSpecification
 * property.
 */
export async function mountMapLibreInstance(options: MapLibreInstanceOptions): Promise<{
  map: MapLibreMap;
  executor: CameraExecutor;
}> {
  const target = options.initialTarget ?? { center: [-8.2245, 39.3999] as [number, number], zoom: 1.6 };

  const map = new maplibregl.Map({
    container: options.container,
    style: options.style.url,
    center: target.center as [number, number],
    zoom: target.zoom ?? 1.6,
    pitch: target.pitch ?? 0,
    bearing: target.bearing ?? 0,
    attributionControl: false,
    cooperativeGestures: true
  });

  map.addControl(new maplibregl.AttributionControl({ compact: true }), "bottom-right");
  map.addControl(new maplibregl.NavigationControl({ visualizePitch: true }), "top-right");

  await new Promise<void>((resolve, reject) => {
    const onLoad = () => {
      map.off("error", onError);
      resolve();
    };
    const onError = (event: { error?: Error }) => {
      map.off("load", onLoad);
      reject(event.error ?? new Error("MapLibre style failed to load"));
    };
    map.once("load", onLoad);
    map.once("error", onError);
  });

  // Globe projection is opt-in. Workspace mode (mercator) keeps the flat
  // canvas so editing precision is not lost to curvature.
  if (options.projection === "mercator") {
    map.setProjection({ type: "mercator" });
  } else {
    map.setProjection({ type: "globe" });
  }

  // 3D terrain — raster DEM source + MapLibre's terrain renderer. The
  // DEM is terrarium-encoded (RGB → elevation), free on AWS, no API key.
  // Only on the globe; the mercator workspace deliberately stays flat
  // for editing precision unless the caller opts in.
  if (options.terrain && !options.terrain.disabled) {
    const sourceId = options.terrain.sourceId ?? DEFAULT_TERRAIN_SOURCE_ID;
    if (!map.getSource(sourceId)) {
      map.addSource(sourceId, {
        type: "raster-dem",
        tiles: [options.terrain.sourceUrl ?? DEFAULT_TERRAIN_URL],
        tileSize: 256,
        maxzoom: 14,
        encoding: "terrarium"
      });
    }
    map.setTerrain({
      source: sourceId,
      exaggeration: options.terrain.exaggeration ?? DEFAULT_TERRAIN_EXAGGERATION
    });
  }

  // Sky / fog — the global atmospheric perspective. In MapLibre v5 this
  // lives in the style's `sky` property (SkySpecification bundles
  // sky-color, horizon-color, fog-color, horizon-fog-blend,
  // fog-ground-blend). `setSky` applies it at runtime so we don't have
  // to fetch and rewrite the style URL.
  //
  // For a "softer halo" beyond the built-in fog, the original
  // implementation ports MapTiler's RadialGradientLayer as a custom
  // WebGL layer — that's a follow-up. The standard sky/fog below is
  // already a meaningful upgrade over the previous flat black.
  if (options.fog && !options.fog.disabled) {
    map.setSky({
      "sky-color": options.fog.highColor ?? DEFAULT_FOG.highColor,
      "horizon-color": options.fog.color ?? DEFAULT_FOG.color,
      "fog-color": options.fog.color ?? DEFAULT_FOG.color,
      "horizon-fog-blend": options.fog.horizonBlend ?? DEFAULT_FOG.horizonBlend,
      "fog-ground-blend": options.fog.fogGroundBlend ?? DEFAULT_FOG.fogGroundBlend
    });
  }

  const executor: CameraExecutor = {
    flyTo: (flyOptions) =>
      new Promise<void>((resolve) => {
        map.flyTo({
          center: flyOptions.center,
          zoom: flyOptions.zoom,
          pitch: flyOptions.pitch,
          bearing: flyOptions.bearing,
          duration: flyOptions.duration,
          essential: true
        });
        if (flyOptions.duration === 0) {
          resolve();
          return;
        }
        const startedAt = Date.now();
        const duration = flyOptions.duration ?? 1200;
        const tick = () => {
          if (Date.now() - startedAt >= duration) {
            map.off("moveend", tick);
            resolve();
            return;
          }
          map.once("moveend", tick);
        };
        map.once("moveend", tick);
      }),
    jumpTo: (jumpOptions) => {
      map.jumpTo({
        center: jumpOptions.center,
        zoom: jumpOptions.zoom,
        pitch: jumpOptions.pitch,
        bearing: jumpOptions.bearing
      });
    },
    fitBounds: (bounds, opts) =>
      new Promise<void>((resolve) => {
        map.fitBounds(bounds, {
          padding: opts?.padding ?? 80,
          duration: opts?.duration ?? 1200,
          essential: true
        });
        if (opts?.duration === 0) {
          resolve();
          return;
        }
        map.once("moveend", () => resolve());
      })
  };

  return { map, executor };
}