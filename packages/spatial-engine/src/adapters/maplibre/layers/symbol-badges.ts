import type { Map as MapLibreMap } from "maplibre-gl";
import { bindLayerToChannel } from "../spatial-engine";
import type { SpatialFeatureCollection, SpatialLayer, SpatialLayerContext, SpatialPalette } from "../../../core/types";

const SOURCE_ID = "spatial-engine:symbol-badges:source";
const LAYER_ID = "spatial-engine:symbol-badges:layer";

export interface SymbolBadgesLayerOptions {
  palette: SpatialPalette;
  /** Feature property key carrying the country / region label. */
  labelKey?: string;
}

/**
 * Minimalist avatar / country badges rendered as a symbol layer. We use a
 * circle-based symbol style so we don't depend on a remote sprite sheet —
 * keeps the engine self-contained for the first greenfield deployment.
 */
export class SymbolBadgesLayer implements SpatialLayer {
  readonly id = LAYER_ID;

  private readonly options: Required<SymbolBadgesLayerOptions>;

  constructor(options: SymbolBadgesLayerOptions) {
    this.options = {
      palette: options.palette,
      labelKey: options.labelKey ?? "label"
    };
    bindLayerToChannel(this, "specialists");
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
        "circle-radius": [
          "interpolate",
          ["linear"],
          ["zoom"],
          0, 3,
          4, 6,
          8, 9
        ],
        "circle-color": this.options.palette.primaryContainer,
        "circle-opacity": 0.95,
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
    if (map.getLayer(LAYER_ID)) map.removeLayer(LAYER_ID);
    if (map.getSource(SOURCE_ID)) map.removeSource(SOURCE_ID);
  }
}