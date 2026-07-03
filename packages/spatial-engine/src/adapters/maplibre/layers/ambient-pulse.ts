import type { Map as MapLibreMap } from "maplibre-gl";
import { bindLayerToChannel } from "../spatial-engine";
import type { SpatialFeatureCollection, SpatialLayer, SpatialLayerContext, SpatialPalette } from "../../../core/types";

const SOURCE_ID = "spatial-engine:ambient-pulse:source";
const LAYER_ID = "spatial-engine:ambient-pulse:layer";
export const AMBIENT_PULSE_LAYER_ID = LAYER_ID;

export interface AmbientPulseLayerOptions {
  palette: SpatialPalette;
  /** Pixel radius of the ambient pulse dot. */
  radius?: number;
}

/**
 * Ambient pulse indicators — soft ochre dots that pulse to suggest live
 * presence without dominating the visual hierarchy.
 */
export class AmbientPulseLayer implements SpatialLayer {
  readonly id = LAYER_ID;

  private readonly options: Required<AmbientPulseLayerOptions>;

  constructor(options: AmbientPulseLayerOptions) {
    this.options = {
      palette: options.palette,
      radius: options.radius ?? 6
    };
    // Self-bind to the travelers channel so SpatialEngine.attachLayer
    // routes the live data stream here without manual wiring.
    bindLayerToChannel(this, "travelers");
  }

  onAttach(ctx: SpatialLayerContext & { map: MapLibreMap }): void {
    const { map } = ctx;
    if (map.getSource(SOURCE_ID)) return;

    map.addSource(SOURCE_ID, {
      type: "geojson",
      data: { type: "FeatureCollection", features: [] }
    });

    map.addLayer({
      id: LAYER_ID,
      type: "circle",
      source: SOURCE_ID,
      paint: {
        "circle-radius": this.options.radius,
        "circle-color": this.options.palette.ochre,
        "circle-opacity": 0.85,
        "circle-stroke-width": 1.2,
        "circle-stroke-color": this.options.palette.ochreLight,
        "circle-stroke-opacity": 0.6
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
    if (map.getLayer(LAYER_ID)) map.removeLayer(LAYER_ID);
    if (map.getSource(SOURCE_ID)) map.removeSource(SOURCE_ID);
  }
}