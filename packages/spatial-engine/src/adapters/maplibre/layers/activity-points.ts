import type { GeoJSONSource, Map as MapLibreMap } from "maplibre-gl";

import { bindLayerToChannel } from "../layer-channel";
import type {
  SpatialFeatureCollection,
  SpatialLayer,
  SpatialLayerContext,
  SpatialPalette
} from "../../../core/types";

export const ACTIVITY_POINTS_SOURCE_ID = "spatial-engine:activity-points:source";
export const ACTIVITY_POINTS_LAYER_ID = "spatial-engine:activity-points:markers";
export const ACTIVITY_POINTS_LABEL_LAYER_ID = "spatial-engine:activity-points:labels";

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

export interface ActivityPointsLayerOptions {
  palette?: Partial<SpatialPalette>;
  selectedActivityId?: string | null;
}

/**
 * Numbered, reviewed activity points for the optional workspace map.
 *
 * The layer intentionally owns points only. It never creates a connecting
 * line, infers route geometry, or changes itinerary order.
 */
export class ActivityPointsLayer implements SpatialLayer {
  readonly id = ACTIVITY_POINTS_LAYER_ID;

  private readonly palette: SpatialPalette;
  private selectedActivityId: string | null;
  private map: MapLibreMap | null = null;
  private featureIds: string[] = [];

  constructor(options: ActivityPointsLayerOptions = {}) {
    this.palette = { ...DEFAULT_PALETTE, ...(options.palette ?? {}) };
    this.selectedActivityId = options.selectedActivityId ?? null;
    // Activity points are updated by the WorkspaceCanvas after validation;
    // use an otherwise idle channel so route/traveller fixtures cannot leak
    // into this layer.
    bindLayerToChannel(this, "events");
  }

  onAttach(ctx: SpatialLayerContext & { map: MapLibreMap }): void {
    const { map } = ctx;
    this.map = map;
    if (!map.getSource(ACTIVITY_POINTS_SOURCE_ID)) {
      map.addSource(ACTIVITY_POINTS_SOURCE_ID, {
        type: "geojson",
        data: { type: "FeatureCollection", features: [] },
        promoteId: "activityId"
      });
    }
    if (!map.getLayer(ACTIVITY_POINTS_LAYER_ID)) {
      map.addLayer({
        id: ACTIVITY_POINTS_LAYER_ID,
        type: "circle",
        source: ACTIVITY_POINTS_SOURCE_ID,
        paint: {
          "circle-radius": ["interpolate", ["linear"], ["zoom"], 4, 10, 11, 17],
          "circle-color": [
            "case",
            ["boolean", ["feature-state", "selected"], false],
            this.palette.ochre,
            this.palette.primaryContainer
          ],
          "circle-stroke-color": this.palette.linen,
          "circle-stroke-width": 2,
          "circle-opacity": 0.98
        }
      });
    }
    if (!map.getLayer(ACTIVITY_POINTS_LABEL_LAYER_ID)) {
      map.addLayer({
        id: ACTIVITY_POINTS_LABEL_LAYER_ID,
        type: "symbol",
        source: ACTIVITY_POINTS_SOURCE_ID,
        layout: {
          "text-field": ["get", "markerLabel"],
          "text-size": 12,
          "text-font": ["Open Sans Regular"],
          "text-allow-overlap": true,
          "text-ignore-placement": true
        },
        paint: {
          "text-color": this.palette.linen,
          "text-halo-color": this.palette.primaryContainer,
          "text-halo-width": 0.5
        }
      });
    }
  }

  onUpdate(ctx: SpatialLayerContext & { map: MapLibreMap }, collection: SpatialFeatureCollection): void {
    this.map = ctx.map;
    const source = ctx.map.getSource(ACTIVITY_POINTS_SOURCE_ID) as GeoJSONSource | undefined;
    if (!source) return;

    const features = collection.features.map((feature) => ({
      ...feature,
      id: feature.id ?? feature.properties?.activityId,
      properties: {
        ...(feature.properties ?? {}),
        selected: feature.id === this.selectedActivityId || feature.properties?.activityId === this.selectedActivityId
      }
    }));
    this.featureIds = features
      .map((feature) => String(feature.id ?? (feature.properties as Record<string, unknown>).activityId ?? ""))
      .filter(Boolean);
    source.setData({ type: "FeatureCollection", features: features as GeoJSON.Feature[] });
    this.applyFeatureStates(ctx.map);
  }

  /** Updates marker emphasis without changing the source or itinerary data. */
  setSelectedActivityId(activityId: string | null, ctx?: { map: MapLibreMap }): void {
    this.selectedActivityId = activityId;
    const map = ctx?.map ?? this.map;
    if (map) this.applyFeatureStates(map);
  }

  onDetach(ctx: SpatialLayerContext & { map: MapLibreMap }): void {
    const { map } = ctx;
    if (map.getLayer(ACTIVITY_POINTS_LABEL_LAYER_ID)) map.removeLayer(ACTIVITY_POINTS_LABEL_LAYER_ID);
    if (map.getLayer(ACTIVITY_POINTS_LAYER_ID)) map.removeLayer(ACTIVITY_POINTS_LAYER_ID);
    if (map.getSource(ACTIVITY_POINTS_SOURCE_ID)) map.removeSource(ACTIVITY_POINTS_SOURCE_ID);
    this.featureIds = [];
    this.map = null;
  }

  private applyFeatureStates(map: MapLibreMap): void {
    for (const id of this.featureIds) {
      try {
        map.setFeatureState(
          { source: ACTIVITY_POINTS_SOURCE_ID, id },
          { selected: id === this.selectedActivityId }
        );
      } catch {
        // MapLibre can receive a state update between source teardown and
        // unmount. The next source update reapplies the same state safely.
      }
    }
  }
}
