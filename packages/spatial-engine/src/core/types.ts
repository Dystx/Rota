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
   * Convenience for run-once camera intros. Throws if the engine hasn't
   * mounted yet. Resolves when the last beat has settled.
   */
  playChoreography(choreography: import("./camera-choreography").CameraChoreography): Promise<void>;
  unmount(): void;
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
}