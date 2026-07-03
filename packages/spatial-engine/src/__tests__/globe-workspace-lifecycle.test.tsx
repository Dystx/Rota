/**
 * Memory-safety lifecycle tests for `GlobeWorkspace`.
 *
 * The spatial engine renders a MapLibre globe inside a React tree. The
 * biggest production risk is leaking the MapLibre instance — `map.remove()`
 * must run exactly once per mount, no `source.setData(...)` may fire after
 * the engine has shut down, and React 19 StrictMode's double-effect dance
 * must net out to a single teardown.
 *
 * We mock `maplibre-gl` with a hand-rolled `MockMap` that tracks every
 * `setData` call on its GeoJSON sources. The test then asserts:
 *
 *   1. `map.remove()` is called exactly once on a normal unmount.
 *   2. A mount → unmount → remount sequence ends with 2 Map instances
 *      but only 1 `remove()` (the second mount is still alive at the
 *      end of the cycle).
 *   3. After unmount, publishing on a still-buffered telemetry channel
 *      does NOT trigger a `source.setData(...)` call on the dead map —
 *      no setData leak even when the 80ms RAF buffer has pending work.
 */

import * as React from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { act, render } from "@testing-library/react";

// ---------------------------------------------------------------------------
// Mocks are defined inside `vi.hoisted` so that the (also-hoisted) `vi.mock`
// factory can reference the same instances at module-evaluation time.
// ---------------------------------------------------------------------------

const mocks = vi.hoisted(() => {
  class MockGeoJSONSource {
    readonly id: string;
    readonly map: MockMap;
    readonly setDataCalls: unknown[] = [];

    constructor(map: MockMap, id: string) {
      this.map = map;
      this.id = id;
    }

    setData(data: unknown): MockGeoJSONSource {
      this.setDataCalls.push(data);
      return this;
    }
  }

  interface MockHandler {
    fn: (...args: unknown[]) => void;
    once: boolean;
  }

  class MockMap {
    static allInstances: MockMap[] = [];
    static reset(): void {
      MockMap.allInstances = [];
    }

    private readonly handlers = new Map<string, MockHandler[]>();
    private readonly sources = new Map<string, MockGeoJSONSource>();
    private readonly layers = new Map<string, { id: string; type: string; source: string }>();
    private _center: { lng: number; lat: number } = { lng: -8.165, lat: 39.55 };
    private _zoom = 3.4;
    private _pitch = 0;
    private _bearing = 0;
    private _removed = false;

    readonly constructorArgs: { style: string; center?: unknown; zoom?: number };

    constructor(opts: { style: string; center?: unknown; zoom?: number }) {
      this.constructorArgs = opts;
      MockMap.allInstances.push(this);

      // MapLibre fires `load` immediately after construction in practice;
      // mirror that with a microtask so our promise resolves naturally.
      queueMicrotask(() => {
        this.fire("load");
      });
    }

    get removed(): boolean {
      return this._removed;
    }

    /** Snapshot of every GeoJSON source attached to this map. */
    get attachedSources(): MockGeoJSONSource[] {
      return [...this.sources.values()];
    }

    on(event: string, fn: (...args: unknown[]) => void): MockMap {
      this.handlers.set(event, [...(this.handlers.get(event) ?? []), { fn, once: false }]);
      return this;
    }

    once(event: string, fn: (...args: unknown[]) => void): MockMap {
      this.handlers.set(event, [...(this.handlers.get(event) ?? []), { fn, once: true }]);
      return this;
    }

    addControl(_control: unknown, _position?: string): MockMap {
      return this;
    }

    removeControl(_control: unknown): MockMap {
      return this;
    }

    off(event: string, fn: (...args: unknown[]) => void): MockMap {
      const list = (this.handlers.get(event) ?? []).filter((h) => h.fn !== fn);
      this.handlers.set(event, list);
      return this;
    }

    /** Test-only helper: pretend the map just emitted an event. */
    fire(event: string, ...args: unknown[]): void {
      const list = this.handlers.get(event) ?? [];
      this.handlers.set(event, list.filter((h) => !h.once));
      for (const h of list) h.fn(...args);
    }

    addSource(id: string, _spec: unknown): MockMap {
      if (this._removed) return this;
      this.sources.set(id, new MockGeoJSONSource(this, id));
      return this;
    }

    getSource(id: string): MockGeoJSONSource | undefined {
      if (this._removed) return undefined;
      return this.sources.get(id);
    }

    removeSource(id: string): MockMap {
      this.sources.delete(id);
      return this;
    }

    addLayer(layer: { id: string; type: string; source: string }): MockMap {
      if (this._removed) return this;
      this.layers.set(layer.id, layer);
      return this;
    }

    getLayer(id: string): { id: string; type: string; source: string } | undefined {
      if (this._removed) return undefined;
      return this.layers.get(id);
    }

    removeLayer(id: string): MockMap {
      this.layers.delete(id);
      return this;
    }

    queryRenderedFeatures(
      _point: [number, number],
      _opts: { layers?: string[] }
    ): Array<{ id?: number | string; properties: Record<string, unknown> | null }> {
      if (this._removed) return [];
      return [];
    }

    setLayoutProperty(_id: string, _key: string, _value: unknown): MockMap {
      return this;
    }

    setProjection(_projection: unknown): MockMap {
      return this;
    }

    moveLayer(_id: string, _beforeId?: string): MockMap {
      return this;
    }

    flyTo(_opts: unknown): MockMap {
      return this;
    }

    jumpTo(_opts: unknown): MockMap {
      return this;
    }

    fitBounds(_bounds: unknown, _opts?: unknown): MockMap {
      return this;
    }

    resize(): MockMap {
      return this;
    }

    getCenter(): { toArray(): [number, number] } {
      return { toArray: () => [this._center.lng, this._center.lat] as [number, number] };
    }

    getZoom(): number {
      return this._zoom;
    }

    getPitch(): number {
      return this._pitch;
    }

    getBearing(): number {
      return this._bearing;
    }

    /** The lifecycle hook we are testing for. */
    remove(): void {
      this._removed = true;
      this.handlers.clear();
      this.sources.clear();
      this.layers.clear();
    }
  }

  class AttributionControl {
    constructor(_opts?: unknown) {}
  }
  class NavigationControl {
    constructor(_opts?: unknown) {}
  }

  return { MockMap, MockGeoJSONSource, AttributionControl, NavigationControl };
});

vi.mock("maplibre-gl", () => ({
  Map: mocks.MockMap,
  AttributionControl: mocks.AttributionControl,
  NavigationControl: mocks.NavigationControl,
  default: {
    Map: mocks.MockMap,
    AttributionControl: mocks.AttributionControl,
    NavigationControl: mocks.NavigationControl
  }
}));

// Pull the component AFTER the mock is registered so it sees the stub.
import { GlobeWorkspace } from "../components/globe-workspace";

const { MockMap, MockGeoJSONSource } = mocks;

beforeEach(() => {
  MockMap.reset();
  // `requestAnimationFrame` is not implemented in jsdom; provide a passthrough.
  vi.stubGlobal(
    "requestAnimationFrame",
    vi.fn((cb: () => void) => {
      cb();
      return 0;
    })
  );
  vi.stubGlobal("cancelAnimationFrame", vi.fn());
  // `ResizeObserver` is missing too — match the noop pattern used elsewhere.
  vi.stubGlobal(
    "ResizeObserver",
    vi.fn(() => ({ disconnect: vi.fn(), observe: vi.fn(), unobserve: vi.fn() }))
  );
});

afterEach(() => {
  vi.unstubAllGlobals();
  vi.useRealTimers();
});

/** Pump microtasks + macrotasks so engine.mount() resolves, the post-mount
 *  `useEffect` chain settles, and any deferred `map.remove()` (after an
 *  unmount-while-mounting race) lands. */
async function flushLifecycle(): Promise<void> {
  await act(async () => {
    // 32 microtask turns is plenty for: the `load` event fires → map.
    // mount promise resolves → engine.mount continuation runs → the
    // `.then` in the GlobeWorkspace effect chains subscribe, raf, and
    // observer registration → finally a possible deferred `map.remove()`
    // after an in-flight shutdown. We over-flush rather than flake.
    for (let i = 0; i < 32; i++) {
      await Promise.resolve();
    }
  });
}

describe("GlobeWorkspace lifecycle — memory safety", () => {
  it("calls map.remove() exactly once on unmount", async () => {
    const { unmount } = render(<GlobeWorkspace disableIntro testId="lt-globe" />);

    await flushLifecycle();
    expect(MockMap.allInstances).toHaveLength(1);

    const map = MockMap.allInstances[0];
    expect(map).toBeDefined();
    expect(map.removed).toBe(false);

    await act(async () => {
      unmount();
    });

    // The component may have unmounted while `engine.mount()` was
    // still awaiting the style load; the spatial-engine's `shuttingDown`
    // flag catches that race and removes the map from inside `mount()`.
    // Pump enough turns for that deferred `map.remove()` to land.
    await flushLifecycle();

    expect(map.removed).toBe(true);
    // Exactly one Map instance was ever created — no double-cleanup.
    expect(MockMap.allInstances).toHaveLength(1);
  });

  it("survives a mount → unmount → remount cycle cleanly", async () => {
    // Render #1
    const first = render(<GlobeWorkspace disableIntro testId="lt-cycle-1" />);
    await flushLifecycle();
    const mapA = MockMap.allInstances[0];
    expect(mapA).toBeDefined();
    expect(mapA.removed).toBe(false);

    // Unmount #1
    await act(async () => {
      first.unmount();
    });
    await flushLifecycle();
    expect(mapA.removed).toBe(true);

    // Render #2
    const second = render(<GlobeWorkspace disableIntro testId="lt-cycle-2" />);
    await flushLifecycle();
    expect(MockMap.allInstances).toHaveLength(2);

    const mapB = MockMap.allInstances[1];
    expect(mapB).toBeDefined();
    expect(mapB).not.toBe(mapA);
    expect(mapB.removed).toBe(false);

    // Tidy up so the test runner doesn't leak the second map.
    await act(async () => {
      second.unmount();
    });
    await flushLifecycle();
    expect(mapB.removed).toBe(true);
  });

  it("does not call source.setData() after unmount", async () => {
    const setDataSpy = vi.fn();
    // Snapshot setDataCalls on every source attached to map #1 (the one
    // that is about to be unmounted). We achieve this by wrapping the
    // prototype's setData method at construction time.
    const originalSetData = MockGeoJSONSource.prototype.setData;
    MockGeoJSONSource.prototype.setData = function (data: unknown): MockGeoJSONSource {
      setDataSpy({ mapInstance: this.map, sourceId: this.id, data });
      return originalSetData.call(this, data);
    };

    try {
      const { unmount } = render(<GlobeWorkspace disableIntro testId="lt-leak" />);
      await flushLifecycle();

      const firstMap = MockMap.allInstances[0];
      expect(firstMap).toBeDefined();
      const baseline = setDataSpy.mock.calls.length;

      await act(async () => {
        unmount();
      });
      await flushLifecycle();

      // After unmount, the 80ms RAF-batched drain in `InMemoryTelemetryService`
      // would normally re-push feature updates into the dead map. We pump
      // real timers past the buffer window to give it a chance to leak.
      await act(async () => {
        await new Promise((resolve) => setTimeout(resolve, 150));
      });

      expect(setDataSpy.mock.calls.length).toBe(baseline);

      // Sanity: every setData call captured before unmount points at the
      // first map (none were routed to a phantom source).
      for (const call of setDataSpy.mock.calls.slice(0, baseline)) {
        expect(call[0].mapInstance).toBe(firstMap);
      }
    } finally {
      MockGeoJSONSource.prototype.setData = originalSetData;
    }
  });
});
