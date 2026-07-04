// @vitest-environment jsdom
/**
 * End-to-end test for the filmstrip → map source pipeline.
 *
 * The pure `buildActiveStopFC` tests in
 * `useFilmstripSourceSync.test.ts` cover the FC builder.
 * This test exercises the full pipeline: a renderHook
 * that mounts `useFilmstripSourceSync`, a `useMapStore`
 * mutation of `activeStopId`, and a fake registered
 * `setSourceData` source that captures the data the
 * store pushes.
 *
 * The test would catch:
 *   - the hook failing to subscribe to `activeStopId`
 *   - the hook failing to call `setSourceData`
 *   - the `useMapSourceSync` JSON.stringify equality
 *     check swallowing the change
 *   - the registered source not being routed the new
 *     data (a real source registry race)
 */
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { act, renderHook } from "@testing-library/react";
import {
  registerMapSource,
  useMapStore,
  type GeoJSONSourceLike
} from "../../store/useMapStore";
import {
  useFilmstripSourceSync,
  type FilmstripStopForMap
} from "./useFilmstripSourceSync";

const STOPS: readonly FilmstripStopForMap[] = [
  {
    id: "day-1-stop-0",
    placeName: "Hotel check-in",
    startTime: "14:00"
  },
  {
    id: "day-1-stop-1",
    placeName: "Belém Tower",
    startTime: "16:00",
    coordinates: [-9.2149, 38.6916]
  },
  {
    id: "day-1-stop-2",
    placeName: "Fado dinner",
    startTime: "20:00",
    coordinates: [-9.1467, 38.7104]
  }
];

interface StubSource extends GeoJSONSourceLike {
  calls: GeoJSON.FeatureCollection[];
}

function makeStubSource(): StubSource {
  const calls: GeoJSON.FeatureCollection[] = [];
  return {
    calls,
    setData(data: GeoJSON.FeatureCollection) {
      calls.push(data);
    }
  };
}

function fakeContainer(label: string): HTMLElement {
  return { __label: label } as unknown as HTMLElement;
}

describe("useFilmstripSourceSync end-to-end", () => {
  beforeEach(() => {
    useMapStore.setState({
      activeStopId: null,
      targetCoordinates: null
    });
  });

  afterEach(() => {
    // Clear all known registrations so each test starts clean.
    registerMapSource(fakeContainer("clear"), null);
  });

  it("pushes a 1-point FC to the registered source when activeStopId changes to a stop with coords", () => {
    const container = fakeContainer("e2e-1");
    const source = makeStubSource();
    registerMapSource(container, source);

    renderHook(() => useFilmstripSourceSync(STOPS));

    // Initial mount: an empty FC is pushed (the active
    // stop is null, so no feature is emitted).
    expect(source.calls.length).toBeGreaterThanOrEqual(1);
    expect(source.calls.at(-1)?.features).toEqual([]);

    act(() => {
      useMapStore.setState({ activeStopId: "day-1-stop-1" });
    });

    // The last call should be a single Point at Belém Tower.
    const last = source.calls.at(-1);
    expect(last?.features).toHaveLength(1);
    expect(last?.features[0]).toMatchObject({
      type: "Feature",
      id: "day-1-stop-1",
      geometry: {
        type: "Point",
        coordinates: [-9.2149, 38.6916]
      },
      properties: {
        title: "Belém Tower",
        startTime: "16:00"
      }
    });
  });

  it("pushes an empty FC when the active stop has no coordinates", () => {
    const container = fakeContainer("e2e-2");
    const source = makeStubSource();
    registerMapSource(container, source);

    renderHook(() => useFilmstripSourceSync(STOPS));

    act(() => {
      useMapStore.setState({ activeStopId: "day-1-stop-0" });
    });

    // The stop has no coordinates; the hook emits an
    // empty FC so the map clears any previous highlight.
    const last = source.calls.at(-1);
    expect(last?.features).toEqual([]);
  });

  it("pushes an empty FC when the active stop is cleared (back to null)", () => {
    const container = fakeContainer("e2e-3");
    const source = makeStubSource();
    registerMapSource(container, source);

    renderHook(() => useFilmstripSourceSync(STOPS));

    act(() => {
      useMapStore.setState({ activeStopId: "day-1-stop-1" });
    });
    expect(source.calls.at(-1)?.features).toHaveLength(1);

    act(() => {
      useMapStore.setState({ activeStopId: null });
    });
    expect(source.calls.at(-1)?.features).toEqual([]);
  });

  it("updates the FC when the user clicks a different stop", () => {
    const container = fakeContainer("e2e-4");
    const source = makeStubSource();
    registerMapSource(container, source);

    renderHook(() => useFilmstripSourceSync(STOPS));

    act(() => {
      useMapStore.setState({ activeStopId: "day-1-stop-1" });
    });
    expect(source.calls.at(-1)?.features[0]?.id).toBe("day-1-stop-1");

    act(() => {
      useMapStore.setState({ activeStopId: "day-1-stop-2" });
    });
    // The map should now show the Fado dinner stop.
    expect(source.calls.at(-1)?.features[0]?.id).toBe("day-1-stop-2");
    expect(source.calls.at(-1)?.geometry).toBeUndefined();
    expect(
      (source.calls.at(-1)?.features[0] as GeoJSON.Feature | undefined)
        ?.geometry
    ).toMatchObject({
      type: "Point",
      coordinates: [-9.1467, 38.7104]
    });
  });

  it("does not re-push when the same active stop is re-set (JSON equality optimization)", () => {
    const container = fakeContainer("e2e-5");
    const source = makeStubSource();
    registerMapSource(container, source);

    renderHook(() => useFilmstripSourceSync(STOPS));

    act(() => {
      useMapStore.setState({ activeStopId: "day-1-stop-1" });
    });
    const callsAfterFirstSet = source.calls.length;

    // Re-set the same active stop. The hook's
    // `useMapSourceSync` compares by JSON.stringify;
    // since the FC is identical, the source should
    // NOT receive another call.
    act(() => {
      useMapStore.setState({ activeStopId: "day-1-stop-1" });
    });
    expect(source.calls.length).toBe(callsAfterFirstSet);
  });
});
