import type { Map as MapLibreMap } from "maplibre-gl";

import type { SpatialFeatureCollection, SpatialLayer, SpatialLayerContext } from "../../../core/types";

export const BUILDING_EXTRUSION_LAYER_ID = "spatial-engine:buildings:extrusion";

export interface BuildingExtrusionLayerOptions {
  sourceId?: string;
  sourceLayer?: string;
  color?: string;
  opacity?: number;
  minzoom?: number;
}

/**
 * Optional Phase 3 building treatment. It is inert unless the approved style
 * exposes the configured source/source-layer and the caller registers it.
 */
export class BuildingExtrusionLayer implements SpatialLayer {
  readonly id = BUILDING_EXTRUSION_LAYER_ID;
  private readonly options: Required<BuildingExtrusionLayerOptions>;

  constructor(options: BuildingExtrusionLayerOptions = {}) {
    this.options = {
      sourceId: options.sourceId ?? "protomaps",
      sourceLayer: options.sourceLayer ?? "buildings",
      color: options.color ?? "#b9aa8a",
      opacity: options.opacity ?? 0.58,
      minzoom: options.minzoom ?? 14
    };
  }

  onAttach(ctx: SpatialLayerContext & { map: MapLibreMap }): void {
    this.ensureLayer(ctx.map);
  }

  onUpdate(ctx: SpatialLayerContext & { map: MapLibreMap }, _collection: SpatialFeatureCollection): void {
    // The layer reads approved building geometry from the basemap source; it
    // does not accept or invent an application-owned building collection.
    this.ensureLayer(ctx.map);
  }

  onDetach(ctx: SpatialLayerContext & { map: MapLibreMap }): void {
    if (ctx.map.getLayer(this.id)) ctx.map.removeLayer(this.id);
  }

  private ensureLayer(map: MapLibreMap): void {
    if (
      map.getLayer(this.id) ||
      !map.getSource(this.options.sourceId) ||
      !this.hasApprovedSourceLayer(map)
    ) return;
    map.addLayer({
      id: this.id,
      type: "fill-extrusion",
      source: this.options.sourceId,
      "source-layer": this.options.sourceLayer,
      minzoom: this.options.minzoom,
      paint: {
        "fill-extrusion-color": this.options.color,
        "fill-extrusion-height": ["coalesce", ["get", "render_height"], ["get", "height"], 0],
        "fill-extrusion-base": ["coalesce", ["get", "render_min_height"], ["get", "min_height"], 0],
        "fill-extrusion-opacity": this.options.opacity,
        "fill-extrusion-vertical-gradient": true
      }
    });
  }

  private hasApprovedSourceLayer(map: MapLibreMap): boolean {
    return (map.getStyle().layers ?? []).some(
      (layer) => {
        if (!("source" in layer) || !("source-layer" in layer)) return false;
        return (
          layer.source === this.options.sourceId &&
          layer["source-layer"] === this.options.sourceLayer
        );
      }
    );
  }
}
