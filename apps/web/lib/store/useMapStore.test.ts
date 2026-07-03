import { describe, expect, it, beforeEach } from "vitest";
import { useMapStore, registerMapSource, type GeoJSONSourceLike } from "../../store/useMapStore";

function makeStubSource(): GeoJSONSourceLike & { calls: GeoJSON.FeatureCollection[] } {
  const calls: GeoJSON.FeatureCollection[] = [];
  return {
    calls,
    setData(data: GeoJSON.FeatureCollection) {
      calls.push(data);
    }
  };
}

describe("useMapStore — setSourceData + registerMapSource", () => {
  beforeEach(() => {
    useMapStore.setState({
      activeStopId: null,
      targetCoordinates: null,
      activeDay: null
    });
    registerMapSource(null);
  });

  it("is a no-op when no source is registered", () => {
    // Should not throw, should not produce side effects.
    useMapStore.getState().setSourceData({
      type: "FeatureCollection",
      features: []
    });
  });

  it("calls setData on the registered source", () => {
    const source = makeStubSource();
    registerMapSource(source);
    const fc: GeoJSON.FeatureCollection = {
      type: "FeatureCollection",
      features: [
        {
          type: "Feature",
          properties: { stopId: "lx-alfama" },
          geometry: { type: "Point", coordinates: [-9.13, 38.71] }
        }
      ]
    };
    useMapStore.getState().setSourceData(fc);
    expect(source.calls).toEqual([fc]);
  });

  it("clears the registration on null", () => {
    const source = makeStubSource();
    registerMapSource(source);
    registerMapSource(null);
    useMapStore.getState().setSourceData({
      type: "FeatureCollection",
      features: []
    });
    expect(source.calls).toEqual([]);
  });

  it("selectStop sets activeStopId + targetCoordinates", () => {
    useMapStore.getState().selectStop("lx-alfama", [-9.13, 38.71]);
    expect(useMapStore.getState().activeStopId).toBe("lx-alfama");
    expect(useMapStore.getState().targetCoordinates).toEqual([-9.13, 38.71]);
  });

  it("clearActiveStop resets both fields", () => {
    useMapStore.getState().selectStop("lx-alfama", [-9.13, 38.71]);
    useMapStore.getState().clearActiveStop();
    expect(useMapStore.getState().activeStopId).toBeNull();
    expect(useMapStore.getState().targetCoordinates).toBeNull();
  });

  it("setActiveDay sets and clears", () => {
    useMapStore.getState().setActiveDay(2);
    expect(useMapStore.getState().activeDay).toBe(2);
    useMapStore.getState().setActiveDay(null);
    expect(useMapStore.getState().activeDay).toBeNull();
  });
});
