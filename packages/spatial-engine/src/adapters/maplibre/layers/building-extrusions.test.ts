import { describe, expect, it, vi } from "vitest";
import type { Map as MapLibreMap } from "maplibre-gl";

import { BUILDING_EXTRUSION_LAYER_ID, BuildingExtrusionLayer } from "./building-extrusions";

describe("BuildingExtrusionLayer", () => {
  it("is inert until the approved basemap exposes its source", () => {
    const addLayer = vi.fn();
    const map = {
      getSource: vi.fn(() => undefined),
      getLayer: vi.fn(() => undefined),
      getStyle: vi.fn(() => ({ layers: [] })),
      addLayer,
      removeLayer: vi.fn()
    };
    new BuildingExtrusionLayer().onAttach({ map: map as unknown as MapLibreMap, setData: vi.fn(), setVisibility: vi.fn() });
    expect(addLayer).not.toHaveBeenCalled();
  });

  it("is inert when the source exists without an approved source layer", () => {
    const addLayer = vi.fn();
    const map = {
      getSource: vi.fn(() => ({})),
      getLayer: vi.fn(() => undefined),
      getStyle: vi.fn(() => ({ layers: [] })),
      addLayer,
      removeLayer: vi.fn()
    };
    new BuildingExtrusionLayer().onAttach({ map: map as unknown as MapLibreMap, setData: vi.fn(), setVisibility: vi.fn() });
    expect(addLayer).not.toHaveBeenCalled();
  });

  it("adds a low-opacity fill extrusion against the configured source layer", () => {
    const addLayer = vi.fn();
    const map = {
      getSource: vi.fn(() => ({})),
      getLayer: vi.fn(() => undefined),
      getStyle: vi.fn(() => ({ layers: [{ id: "buildings-fill", type: "fill", source: "protomaps", "source-layer": "buildings" }] })),
      addLayer,
      removeLayer: vi.fn()
    };
    new BuildingExtrusionLayer({ sourceId: "protomaps", sourceLayer: "buildings" }).onAttach({ map: map as unknown as MapLibreMap, setData: vi.fn(), setVisibility: vi.fn() });
    expect(addLayer).toHaveBeenCalledWith(expect.objectContaining({
      id: BUILDING_EXTRUSION_LAYER_ID,
      type: "fill-extrusion",
      source: "protomaps",
      "source-layer": "buildings",
      minzoom: 14
    }));
  });
});
