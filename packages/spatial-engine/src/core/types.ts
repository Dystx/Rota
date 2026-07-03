/**
 * Spatial Engine — provider-agnostic core types.
 *
 * Goal: the rest of Rumia only depends on these interfaces, never on a
 * concrete mapping library. Today the only adapter is MapLibre GL JS, but
 * a future CesiumJS / deck.gl / custom WebGL adapter must satisfy the
 * same shapes.
 *
 * Versioning rule: any breaking change here is a major bump of the
 * Spatial Engine contract and must ship with a migration ADR.
 */

/** Color/visual tokens shared across providers — names map to @theme keys. */
export interface SpatialPalette {
  primary: string;
  primaryContainer: string;
  ochre: string;
  ochreLight: string;
  linen: string;
  sage: string;
  onPrimary: string;
  onSurface: string;
  onSurfaceVariant: string;
}

/** A vector tile + glyph + sprite style endpoint. */
export interface MapStyleEndpoint {
  readonly id: string;
  readonly name: string;
  readonly url: string;
  /** Optional attribution line — required for some basemaps. */
  readonly attribution?: string;
}

/** Resolves the active style endpoint based on theme + context. */
export interface MapStyleProvider {
  getStyle(theme: "light" | "dark"): MapStyleEndpoint;
}

/** A camera target — projection-aware, provider-agnostic. */
export interface CameraTarget {
  center?: readonly [number, number];
  zoom?: number;
  pitch?: number;
  bearing?: number;
  /** Animation duration in ms; 0 = jump. */
  duration?: number;
}

/** Methods every renderer-backed camera must support. */
export interface CameraController {
  focus(target: CameraTarget): Promise<void>;
  returnHome(): Promise<void>;
  followUser(active: boolean): void;
  fitBounds(bounds: [[number, number], [number, number]]): Promise<void>;
}

/** A single GeoJSON Feature in the live data stream. */
export type SpatialFeature = GeoJSON.Feature<GeoJSON.Point | GeoJSON.MultiPoint | GeoJSON.Polygon | GeoJSON.LineString, Record<string, unknown>>;

export interface SpatialFeatureCollection {
  type: "FeatureCollection";
  features: readonly SpatialFeature[];
}

/** Channels the live data stream can multiplex over. */
export type TelemetryChannel = "travelers" | "specialists" | "trips" | "weather" | "events";

/** Telemetry updates flow through this contract. */
export interface TelemetryService {
  /** Subscribe to a channel; returns an unsubscribe handle. */
  subscribe(channel: TelemetryChannel, listener: (collection: SpatialFeatureCollection) => void): () => void;
  /** Push a batch of updates for a channel — schedules a single setData() per animation frame. */
  publish(channel: TelemetryChannel, features: readonly SpatialFeature[]): void;
  /** Stop all streams (used on unmount / kill switch). */
  shutdown(): void;
}

/** Lifecycle every spatial layer must satisfy. */
export interface SpatialLayer {
  readonly id: string;
  onAttach(ctx: SpatialLayerContext): void;
  onUpdate(ctx: SpatialLayerContext, collection: SpatialFeatureCollection): void;
  onDetach(ctx: SpatialLayerContext): void;
}

/** Renderer-agnostic context the engine passes to each layer. */
export interface SpatialLayerContext {
  setData(collection: SpatialFeatureCollection): void;
  setVisibility(visible: boolean): void;
}

/** Coordinates the full lifecycle: mount, layer registry, telemetry wiring, camera, unmount. */
export interface SpatialEngine {
  readonly style: MapStyleEndpoint;
  mount(container: HTMLElement): Promise<void>;
  register(layer: SpatialLayer): void;
  setPalette(palette: SpatialPalette): void;
  getCamera(): CameraController;
  getTelemetry(): TelemetryService;
  /** Toggle visibility for a registered layer. */
  setLayerVisibility(layerId: string, visible: boolean): void;
  /** Move a registered layer to a new render-order index. */
  reorderLayer(layerId: string, toIndex: number): void;
  /** Push a telemetry snapshot into a registered layer. */
  applyLayerUpdate(layer: SpatialLayer, collection: SpatialFeatureCollection): void;
  /**
   * Switch the projection at runtime. Avoids a full canvas teardown —
   * MapLibre re-projects the existing tile/source data in place so the
   * layer registry, telemetry, and camera state survive the switch.
   * No-op if not mounted. The 2D ↔ 3D toggle in `hero-map.tsx` uses
   * this so toggling does not remount the engine (which would
   * re-download the style, recreate every custom WebGL layer, and
   * leak buffers if not torn down cleanly).
   */
  setProjectionType(type: "globe" | "mercator"): void;
  /**
   * Convenience for run-once camera intros. Throws if the engine hasn't
   * mounted yet. Resolves when the last beat has settled.
   */
  playChoreography(choreography: import("./camera-choreography").CameraChoreography): Promise<void>;
  unmount(): void;
}

/** Terrain configuration — turns on MapLibre's 3D terrain via a raster DEM. */
export interface TerrainOptions {
  /**
   * Raster DEM tile URL. Default: AWS Terrarium tiles
   * (https://elevation-tiles-prod.s3.amazonaws.com/terrarium/{z}/{x}/{y}.png) —
   * free, no API key, terrarium RGB encoding.
   */
  sourceUrl?: string;
  /** DEM source id. Default: 'spatial-engine:terrain-dem'. */
  sourceId?: string;
  /** Vertical exaggeration multiplier. Default: 1.4 (matches the Mapbox-era default). */
  exaggeration?: number;
  /** Disable to opt out (e.g. for the 2D workspace canvas where curvature obscures edits). */
  disabled?: boolean;
}

/** Fog / atmospheric perspective on the globe. Maps to MapLibre's
 * SkySpecification at runtime — the standard sky / fog fields only.
 * For the "softer halo" radial-gradient effect, layer a custom WebGL
 * layer on top (follow-up: port MapTiler SDK's RadialGradientLayer). */
export interface FogOptions {
  /** Color at the horizon + fog. Default: a soft slate blue that matches dark-matter basemaps. */
  color?: string;
  /** Color at the top of the atmosphere (high altitude). Default: deep indigo. */
  highColor?: string;
  /** How much the fog blends at the horizon. 0 = sharp line, 1 = fully diffused. Default: 0.8 (soft). */
  horizonBlend?: number;
  /** How the fog blends with the ground. 0 = map center, 1 = horizon. Default: 0.5. */
  fogGroundBlend?: number;
  /** Disable to opt out. */
  disabled?: boolean;
}

/** Soft halo + starfield layers — opt-in custom WebGL layers drawn on top
 * of the globe. Distinct from `FogOptions` (which maps to MapLibre's built-in
 * `sky` spec). The radial gradient and starfield are independent so callers
 * can mix and match (e.g. fog + gradient, no stars; gradient only; etc.). */
export interface AtmosphereOptions {
  /** Radial-gradient "softer halo" overlay. Default: undefined (off). */
  radialGradient?: import("../adapters/maplibre/layers/radial-gradient-atmosphere").RadialGradientAtmosphereOptions;
  /** ~26k star points on a unit sphere, depth-tested against the globe. Default: undefined (off). */
  starfield?: import("../adapters/maplibre/layers/starfield").StarfieldOptions;
  /** Disable the atmosphere entirely. Default: false. */
  disabled?: boolean;
}

/** Constructor options for any SpatialEngine implementation. */
export interface SpatialEngineOptions {
  style: MapStyleEndpoint;
  initialTarget?: CameraTarget;
  palette?: Partial<SpatialPalette>;
  reducedMotion?: boolean;
  /**
   * Projection mode. `globe` enables MapLibre's 3D globe projection (best
   * for Discovery / marketing). `mercator` keeps the flat 2D canvas
   * (precision editing — Workspace). Default: `globe`.
   */
  projection?: "globe" | "mercator";
  /** Enable 3D terrain via a raster DEM. Disabled by default on Workspace (mercator); enabled on Discovery (globe). */
  terrain?: TerrainOptions;
  /** Atmospheric fog + starfield on the globe. Default: enabled with soft config. */
  fog?: FogOptions;
  /** Opt-in radial gradient halo + starfield custom WebGL layers. Default: undefined (off). */
  atmosphere?: AtmosphereOptions;
}