import { describe, expect, it } from "vitest";

import { ActivityPointsLayer, ACTIVITY_POINTS_LAYER_ID } from "./activity-points";

function createMapMock() {
  const sources = new Map<string, { setData: (data: unknown) => void }>();
  const layers = new Set<string>();
  const calls: unknown[] = [];
  const map = {
    addSource: (id: string) => {
      const source = { setData: (data: unknown) => calls.push(["setData", id, data]) };
      sources.set(id, source);
    },
    getSource: (id: string) => sources.get(id),
    addLayer: (layer: { id: string }) => layers.add(layer.id),
    getLayer: (id: string) => (layers.has(id) ? { id } : undefined),
    removeLayer: (id: string) => layers.delete(id),
    removeSource: (id: string) => sources.delete(id),
    setFeatureState: (target: unknown, state: unknown) => calls.push(["setFeatureState", target, state])
  };
  return { map, sources, layers, calls };
}

describe("ActivityPointsLayer", () => {
  it("creates stable numbered marker layers and updates the selected feature state", () => {
    const { map, calls, layers } = createMapMock();
    const layer = new ActivityPointsLayer();
    const collection = {
      type: "FeatureCollection" as const,
      features: [
        {
          type: "Feature" as const,
          id: "activity-1",
          geometry: { type: "Point" as const, coordinates: [-8.6, 41.1] },
          properties: { activityId: "activity-1", markerLabel: "1" }
        }
      ]
    };

    layer.onAttach({ map } as never);
    layer.onUpdate({ map } as never, collection);
    layer.setSelectedActivityId("activity-1", { map } as never);

    expect(layers.has(ACTIVITY_POINTS_LAYER_ID)).toBe(true);
    expect(calls.some((call) => Array.isArray(call) && call[0] === "setData")).toBe(true);
    expect(calls).toContainEqual([
      "setFeatureState",
      { source: "spatial-engine:activity-points:source", id: "activity-1" },
      { selected: true }
    ]);
  });

  it("removes its source and layers during teardown", () => {
    const { map, sources, layers } = createMapMock();
    const layer = new ActivityPointsLayer();

    layer.onAttach({ map } as never);
    layer.onDetach({ map } as never);

    expect(sources.size).toBe(0);
    expect(layers.size).toBe(0);
  });
});
