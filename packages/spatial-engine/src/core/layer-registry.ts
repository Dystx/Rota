import type { SpatialEngine, SpatialLayer, TelemetryService } from "./types";

/**
 * LayerRegistry — single source of truth for which layers are attached
 * to a SpatialEngine, in what order, and whether they're visible.
 *
 * Decoupling registration from the engine lets future modules (camera
 * choreography, telemetry replay) iterate over the same ordered view
 * of the world without touching the engine surface.
 */
export class LayerRegistry {
  private readonly engine: SpatialEngine;
  private readonly layers: SpatialLayer[] = [];
  private readonly visibility = new Map<string, boolean>();

  constructor(engine: SpatialEngine) {
    this.engine = engine;
  }

  /** Register a layer. If the engine is mounted, the layer is attached immediately. */
  register(layer: SpatialLayer): void {
    if (this.layers.some((existing) => existing?.id === layer.id)) return;
    this.layers.push(layer);
    this.visibility.set(layer.id, true);
    this.engine.register(layer);
  }

  /** Toggle visibility for a registered layer without detaching it. */
  enable(layerId: string, visible: boolean): void {
    if (!this.visibility.has(layerId)) return;
    this.visibility.set(layerId, visible);
    // Renderers consume visibility through setLayoutProperty; the
    // SpatialEngine.expose hook forwards the call so layer code stays
    // renderer-agnostic.
    this.engine.setLayerVisibility(layerId, visible);
  }

  /** Reorder the layer stack. Indices outside the range are clamped. */
  reorder(layerId: string, toIndex: number): void {
    const fromIndex = this.layers.findIndex((layer) => layer?.id === layerId);
    if (fromIndex === -1) return;
    const spliced = this.layers.splice(fromIndex, 1);
    const layer = spliced[0];
    if (!layer) return;
    const clamped = Math.max(0, Math.min(toIndex, this.layers.length));
    this.layers.splice(clamped, 0, layer);
    this.engine.reorderLayer(layerId, clamped);
  }

  /** Snapshot of the current layer stack, in render order. */
  list(): readonly SpatialLayer[] {
    return [...this.layers];
  }

  /** Visibility for a given layer. Returns undefined if not registered. */
  isVisible(layerId: string): boolean | undefined {
    return this.visibility.get(layerId);
  }

  /**
   * Fan-out helper: subscribe a layer to a telemetry channel and route
   * the latest snapshot into layer.onUpdate. Complements the engine's
   * default subscription so callers can opt-in explicitly when they
   * want full control over the data flow (e.g. transformed snapshots,
   * rate-limited updates, snapshot diffing).
   */
  bindTelemetry(layer: SpatialLayer, telemetry: TelemetryService, channel: Parameters<TelemetryService["subscribe"]>[0]): () => void {
    return telemetry.subscribe(channel, (collection) => {
      this.engine.applyLayerUpdate(layer, collection);
    });
  }
}