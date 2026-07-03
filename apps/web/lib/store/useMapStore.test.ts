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

/** Use a plain object as a fake container. The `registerMapSource`
 *  type signature is `HTMLElement` (the DOM type), but the runtime
 *  implementation only needs a stable object identity to use as a
 *  `WeakMap` key. The `unknown` cast keeps the test free of the
 *  jsdom dependency. */
function fakeContainer(label: string): HTMLElement {
  return { __label: label } as unknown as HTMLElement;
}

describe("useMapStore — setSourceData + registerMapSource", () => {
  beforeEach(() => {
    useMapStore.setState({
      activeStopId: null,
      targetCoordinates: null,
      activeDay: null
    });
    // Clear all known registrations so each test starts clean.
    // (WeakMap keys are container objects held by the test; the
    // store does not export a reset() — each test owns its own
    // container and clears it explicitly.)
  });

  it("is a no-op when no source is registered", () => {
    // Should not throw, should not produce side effects.
    useMapStore.getState().setSourceData({
      type: "FeatureCollection",
      features: []
    });
  });

  it("calls setData on the registered source", () => {
    const container = fakeContainer("A");
    const source = makeStubSource();
    registerMapSource(container, source);
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
    // Cleanup
    registerMapSource(container, null);
  });

  it("clears the registration on null", () => {
    const container = fakeContainer("A");
    const source = makeStubSource();
    registerMapSource(container, source);
    registerMapSource(container, null);
    useMapStore.getState().setSourceData({
      type: "FeatureCollection",
      features: []
    });
    expect(source.calls).toEqual([]);
  });

  it("survives mount/unmount race between two containers (the Risk C regression)", () => {
    // This is the regression test for the Risk C state de-registration
    // race. Sequence:
    //   1. Page A mounts and registers its source.
    //   2. Route change triggers page B mount AND page A unmount.
    //   3. In React 18+ concurrent mode the unmount cleanup of A
    //      can fire AFTER the mount effect of B, so a naive single-
    //      slot registry would have page A's cleanup clobber B's
    //      registration.
    //
    // Simulate the bad interleaving here:
    //   1. registerMapSource(A, sourceA)
    //   2. registerMapSource(B, sourceB)            ← A's cleanup has not fired yet
    //   3. registerMapSource(A, null)               ← A's stale cleanup finally fires
    //
    // The keyed registry must leave B's source intact.
    const containerA = fakeContainer("A");
    const containerB = fakeContainer("B");
    const sourceA = makeStubSource();
    const sourceB = makeStubSource();

    registerMapSource(containerA, sourceA);
    registerMapSource(containerB, sourceB);
    registerMapSource(containerA, null);

    const fc: GeoJSON.FeatureCollection = {
      type: "FeatureCollection",
      features: []
    };
    useMapStore.getState().setSourceData(fc);

    expect(sourceA.calls).toEqual([]);
    expect(sourceB.calls).toEqual([fc]);

    // Cleanup
    registerMapSource(containerB, null);
  });

  it("a stale unmount from a non-active container does not clear active", () => {
    // The other half of the race-safety property: a stale unmount
    // from a non-active container (e.g. a sibling that was rendered
    // before and is now unmounting in a delayed fashion) must not
    // detach the active source.
    const containerActive = fakeContainer("active");
    const containerStale = fakeContainer("stale");
    const sourceActive = makeStubSource();
    const sourceStale = makeStubSource();

    registerMapSource(containerStale, sourceStale);
    registerMapSource(containerActive, sourceActive); // active moves to containerActive
    registerMapSource(containerStale, null);          // stale unmount fires

    useMapStore.getState().setSourceData({
      type: "FeatureCollection",
      features: []
    });

    expect(sourceStale.calls).toEqual([]);
    expect(sourceActive.calls.length).toBe(1);

    // Cleanup
    registerMapSource(containerActive, null);
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
