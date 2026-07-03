import type { Map as MapLibreMap } from "maplibre-gl";
import { bindLayerToChannel } from "../spatial-engine";
import type { SpatialFeatureCollection, SpatialLayer, SpatialLayerContext, SpatialPalette } from "../../../core/types";

const SOURCE_ID = "spatial-engine:route:source";
const LINE_LAYER_ID = "spatial-engine:route:line";
const POINT_LAYER_ID = "spatial-engine:route:stops";

export interface RouteLayerOptions {
  palette: SpatialPalette;
  /** Property key on each feature carrying the visit order (1-based). */
  orderKey?: string;
}

/**
 * RouteLayer — draws an itinerary as a polyline + numbered stop markers.
 * Self-binds to the "trips" telemetry channel. Workspace mode (2D)
 * uses this for the day-by-day timeline overlay.
 */
export class RouteLayer implements SpatialLayer {
  readonly id = LINE_LAYER_ID;

  private readonly options: Required<RouteLayerOptions>;
  private readonly stopLayerId = POINT_LAYER_ID;

  constructor(options: RouteLayerOptions) {
    this.options = {
      palette: options.palette,
      orderKey: options.orderKey ?? "order"
    };
    bindLayerToChannel(this, "trips");
  }

  onAttach(ctx: SpatialLayerContext & { map: MapLibreMap }): void {
    const { map } = ctx;
    if (map.getSource(SOURCE_ID)) return;

    map.addSource(SOURCE_ID, {
      type: "geojson",
      data: { type: "FeatureCollection", features: [] }
    });

    map.addLayer({
      id: LINE_LAYER_ID,
      type: "line",
      source: SOURCE_ID,
      paint: {
        "line-color": this.options.palette.ochre,
        "line-width": 3,
        "line-opacity": 0.85,
        "line-dasharray": [0.6, 1.2]
      }
    });

    map.addLayer({
      id: this.stopLayerId,
      type: "circle",
      source: SOURCE_ID,
      paint: {
        "circle-radius": 5,
        "circle-color": this.options.palette.primaryContainer,
        "circle-stroke-width": 1.5,
        "circle-stroke-color": this.options.palette.linen
      }
    });
  }

  onUpdate(ctx: SpatialLayerContext & { map: MapLibreMap }, collection: SpatialFeatureCollection): void {
    const source = ctx.map.getSource(SOURCE_ID) as maplibregl.GeoJSONSource | undefined;
    if (!source) return;
    source.setData({
      type: "FeatureCollection",
      features: [...collection.features]
    });
  }

  onDetach(ctx: SpatialLayerContext & { map: MapLibreMap }): void {
    const { map } = ctx;
    if (map.getLayer(this.stopLayerId)) map.removeLayer(this.stopLayerId);
    if (map.getLayer(LINE_LAYER_ID)) map.removeLayer(LINE_LAYER_ID);
    if (map.getSource(SOURCE_ID)) map.removeSource(SOURCE_ID);
  }
}