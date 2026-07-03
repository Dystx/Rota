import type { Map as MapLibreMap } from "maplibre-gl";
import { AmbientPulseLayer } from "./layers/ambient-pulse";
import { RouteLayer } from "./layers/route-layer";
import { SymbolBadgesLayer } from "./layers/symbol-badges";
import {
  RadialGradientAtmosphereLayer,
  type RadialGradientAtmosphereOptions
} from "./layers/radial-gradient-atmosphere";
import { StarfieldLayer, type StarfieldOptions } from "./layers/starfield";
import { mountMapLibreInstance } from "./map-instance";
import { SpatialCameraController } from "../../core/camera-controller";
import { InMemoryTelemetryService } from "../../core/telemetry-service";
import type {
  AtmosphereOptions,
  CameraController,
  CameraTarget,
  SpatialEngine,
  SpatialEngineOptions,
  SpatialFeatureCollection,
  SpatialLayer,
  SpatialLayerContext,
  SpatialPalette,
  TelemetryService
} from "../../core/types";

interface LayerRegistration {
  layer: SpatialLayer;
  unsubscribe?: () => void;
}

/** Active custom-layer instances owned by the engine so `unmount` can
 *  cleanly tear them down via the map's own `removeLayer` lifecycle. */
interface AtmosphereRegistration {
  radial: RadialGradientAtmosphereLayer | null;
  starfield: StarfieldLayer | null;
}

/** Channels a layer listens to; defaults to "travelers" when omitted. */
const LAYER_CHANNEL_BINDINGS = new WeakMap<SpatialLayer, Parameters<TelemetryService["subscribe"]>[0]>();

/** Bind a layer to a specific telemetry channel (call from layer factory). */
export function bindLayerToChannel(layer: SpatialLayer, channel: Parameters<TelemetryService["subscribe"]>[0]): void {
  LAYER_CHANNEL_BINDINGS.set(layer, channel);
}

/** Ordered list of registered layer ids, in render order. */
function layerIdsInOrder(layers: Map<string, LayerRegistration>): string[] {
  return [...layers.keys()];
}

const DEFAULT_PALETTE: SpatialPalette = {
  primary: "#16281f",
  primaryContainer: "#2b3e34",
  ochre: "#ce933f",
  ochreLight: "#eab875",
  linen: "#efece6",
  sage: "#e8fff0",
  onPrimary: "#ffffff",
  onSurface: "#0c1f16",
  onSurfaceVariant: "#2b3e34"
};

/**
 * MapLibre-backed SpatialEngine. This is the only place that knows the
 * renderer is MapLibre; everything above this line sees only the abstract
 * SpatialEngine / CameraController / TelemetryService / SpatialLayer
 * interfaces from `core/types.ts`.
 */
export class MapLibreSpatialEngine implements SpatialEngine {
  readonly style: SpatialEngineOptions["style"];

  private readonly options: SpatialEngineOptions;
  private readonly telemetry: InMemoryTelemetryService;
  private readonly layers = new Map<string, LayerRegistration>();
  private readonly atmosphere: AtmosphereRegistration = { radial: null, starfield: null };
  private map: MapLibreMap | null = null;
  private camera: SpatialCameraController | null = null;
  private mounted = false;
  private shuttingDown = false;
  private palette: SpatialPalette;

  constructor(options: SpatialEngineOptions) {
    this.options = options;
    this.style = options.style;
    this.telemetry = new InMemoryTelemetryService();
    this.palette = { ...DEFAULT_PALETTE, ...(options.palette ?? {}) };
  }

  async mount(container: HTMLElement): Promise<void> {
    if (this.mounted || this.shuttingDown) return;

    const { map, executor } = await mountMapLibreInstance({
      container,
      style: this.options.style,
      initialTarget: this.options.initialTarget,
      reducedMotion: this.options.reducedMotion,
      projection: this.options.projection ?? "globe",
      terrain: this.options.terrain,
      fog: this.options.fog
    });

    // `unmount()` may have been called while we were awaiting the
    // style load — React often tears a component down before the async
    // mount resolves. Honor that signal here so we never leak a Map
    // the consumer already asked us to throw away.
    if (this.shuttingDown) {
      map.remove();
      return;
    }

    this.map = map;
    this.camera = new SpatialCameraController(executor, {
      reducedMotion: this.options.reducedMotion ?? false,
      homeTarget: this.options.initialTarget
    });

    for (const { layer } of this.layers.values()) {
      this.attachLayer(layer);
    }

    // Atmosphere custom layers — opt-in via `options.atmosphere`. These
    // do not go through the SpatialLayer registry because they are
    // CustomLayerInterface, not standard paint layers.
    this.attachAtmosphere(this.options.atmosphere);

    this.mounted = true;
  }

  register(layer: SpatialLayer): void {
    if (this.layers.has(layer.id)) return;
    const registration: LayerRegistration = { layer };
    this.layers.set(layer.id, registration);

    if (this.mounted) {
      this.attachLayer(layer);
    }
    void layer; // keep param named for clarity; MapLibre registration happens via attachLayer
  }

  setPalette(palette: SpatialPalette): void {
    this.palette = palette;
    // Real implementation would push paint-property updates to each layer;
    // phase 1 just stores the latest palette for components that read it.
  }

  setLayerVisibility(layerId: string, visible: boolean): void {
    if (!this.mounted || !this.map) return;
    if (!this.map.getLayer(layerId)) return;
    this.map.setLayoutProperty(layerId, "visibility", visible ? "visible" : "none");
  }

  reorderLayer(layerId: string, toIndex: number): void {
    if (!this.mounted || !this.map) return;
    if (!this.map.getLayer(layerId)) return;
    if (!this.layers.has(layerId)) return;

    const ids = layerIdsInOrder(this.layers);
    const fromIndex = ids.indexOf(layerId);
    if (fromIndex === -1) return;
    const clamped = Math.max(0, Math.min(toIndex, ids.length - 1));
    const spliced = ids.splice(fromIndex, 1);
    const removed = spliced[0];
    if (!removed) return;
    ids.splice(clamped, 0, removed);

    // Move the layer to be just below the layer that should sit after it.
    // If we want it at the top, pass no `beforeId` to moveLayer.
    const nextId = ids[clamped + 1];
    if (nextId && nextId !== layerId) {
      this.map.moveLayer(layerId, nextId);
    } else if (!nextId) {
      this.map.moveLayer(layerId);
    }
  }

  applyLayerUpdate(layer: SpatialLayer, collection: SpatialFeatureCollection): void {
    if (!this.mounted || !this.map) return;
    layer.onUpdate(this.makeContext(), collection);
  }

  async playChoreography(choreography: import("../../core/camera-choreography").CameraChoreography): Promise<void> {
    if (!this.camera) {
      throw new Error("SpatialEngine.playChoreography() called before mount()");
    }
    await choreography.play(this.camera);
  }

  getCamera(): CameraController {
    if (!this.camera) {
      throw new Error("SpatialEngine.getCamera() called before mount()");
    }
    return this.camera;
  }

  getTelemetry(): TelemetryService {
    return this.telemetry;
  }

  /**
   * Renderer handle for advanced integrations (e.g. ResizeObserver in the
   * GlobeWorkspace React component). Most consumers should use the
   * abstract CameraController / TelemetryService instead.
   */
  getRenderer(): MapLibreMap | null {
    return this.map;
  }

  /** Internal helper used by GlobeWorkspace fixtures to seed a channel. */
  seedTelemetry(channel: Parameters<TelemetryService["subscribe"]>[0], collection: SpatialFeatureCollection): void {
    this.telemetry.seed(channel, collection);
  }

  unmount(): void {
    if (this.shuttingDown) return;
    this.shuttingDown = true;
    // The lifecycle invariant: `map.remove()` MUST run exactly once per
    // mount, regardless of the order between `unmount()` and the async
    // `mount()` promise. Two cases:
    //   1. `this.mounted === true` (mount completed): this.map is set;
    //      we remove it here and null it out so the deferred path in
    //      `mount()` can't double-remove (it checks `this.shuttingDown`
    //      but doesn't check whether the map was already removed).
    //   2. `this.mounted === false` (mount in flight): this.map is null;
    //      we skip the remove here. The deferred path in `mount()`
    //      will see `this.shuttingDown` and call `map.remove()` on the
    //      local `map` variable when the await resolves.
    if (this.mounted) {
      for (const { layer, unsubscribe } of this.layers.values()) {
        unsubscribe?.();
        layer.onDetach(this.makeContext());
      }
      this.layers.clear();
      this.detachAtmosphere();
      this.telemetry.shutdown();
      this.mounted = false;
    }
    this.map?.remove();
    this.map = null;
    this.camera = null;
  }

  /**
   * Internal: attach a layer to the live map and wire it to its bound
   * telemetry channel (defaults to "travelers"). The first push replays
   * any seeded data so the layer has content from the first frame.
   */
  private attachLayer(layer: SpatialLayer): void {
    const channel = LAYER_CHANNEL_BINDINGS.get(layer) ?? "travelers";
    layer.onAttach(this.makeContext());
    const unsubscribe = this.telemetry.subscribe(channel, (collection) => {
      layer.onUpdate(this.makeContext(), collection);
    });
    const registration = this.layers.get(layer.id);
    if (registration) {
      registration.unsubscribe = unsubscribe;
    }
  }

  /**
   * Build & add the opt-in atmosphere custom layers (radial gradient halo
   * + starfield). Both go through `map.addLayer` directly with their
   * `CustomLayerInterface` spec. The starfield is added FIRST so it renders
   * behind the radial gradient (MapLibre renders custom layers in id
   * order; the gradient's id sorts after the starfield's id).
   */
  private attachAtmosphere(options: AtmosphereOptions | undefined): void {
    if (!this.map) return;
    if (!options || options.disabled) return;

    if (options.starfield && !options.starfield.disabled) {
      const layer = new StarfieldLayer(options.starfield as StarfieldOptions);
      if (!this.map.getLayer(layer.id)) {
        this.map.addLayer(layer.layerSpec);
      }
      this.atmosphere.starfield = layer;
    }

    if (options.radialGradient && !options.radialGradient.disabled) {
      const layer = new RadialGradientAtmosphereLayer(options.radialGradient as RadialGradientAtmosphereOptions);
      if (!this.map.getLayer(layer.id)) {
        this.map.addLayer(layer.layerSpec);
      }
      this.atmosphere.radial = layer;
    }
  }

  /**
   * Tear down the atmosphere custom layers so the WebGL resources
   * (programs, buffers) the layers allocated in `onAdd` are released
   * before the map itself is removed.
   */
  private detachAtmosphere(): void {
    if (!this.map) {
      this.atmosphere.radial = null;
      this.atmosphere.starfield = null;
      return;
    }
    const map = this.map;
    if (this.atmosphere.radial) {
      const id = this.atmosphere.radial.id;
      if (map.getLayer(id)) map.removeLayer(id);
      this.atmosphere.radial = null;
    }
    if (this.atmosphere.starfield) {
      const id = this.atmosphere.starfield.id;
      if (map.getLayer(id)) map.removeLayer(id);
      this.atmosphere.starfield = null;
    }
  }

  private makeContext(): SpatialLayerContext & { map: MapLibreMap; palette: SpatialPalette } {
    if (!this.map) {
      throw new Error("SpatialEngine.makeContext() called before mount()");
    }
    return {
      map: this.map,
      palette: this.palette,
      setData: (collection) => {
        // Layers reach into their own source; this hook lets future
        // overlays share a single source if we want a unified registry.
      },
      setVisibility: (visible) => {
        if (!this.map) return;
        const visibility = visible ? "visible" : "none";
        for (const id of this.layers.keys()) {
          if (this.map.getLayer(id)) this.map.setLayoutProperty(id, "visibility", visibility);
        }
      }
    };
  }
}

/** Convenience constructor that wires the standard ambient + badges layers. */
export function createDiscoveryEngine(options: SpatialEngineOptions): MapLibreSpatialEngine {
  const engine = new MapLibreSpatialEngine(options);
  engine.register(new AmbientPulseLayer({ palette: DEFAULT_PALETTE }));
  engine.register(new SymbolBadgesLayer({ palette: DEFAULT_PALETTE }));
  return engine;
}

/** WorkspaceCanvas engine: 2D, no globe projection, all three standard layers + itinerary route. */
export function createWorkspaceEngine(options: SpatialEngineOptions): MapLibreSpatialEngine {
  const engine = new MapLibreSpatialEngine(options);
  engine.register(new AmbientPulseLayer({ palette: DEFAULT_PALETTE }));
  engine.register(new SymbolBadgesLayer({ palette: DEFAULT_PALETTE }));
  engine.register(new RouteLayer({ palette: DEFAULT_PALETTE }));
  return engine;
}

export type { CameraTarget, SpatialEngineOptions, SpatialPalette };