import * as React from "react";
import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { createFakeAnalyticsProvider } from "@repo/analytics";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { CinematicMap, type ChapterCameraTarget } from "./cinematic-map";

Object.defineProperty(globalThis, "IS_REACT_ACT_ENVIRONMENT", { configurable: true, value: true });

const flyTo = vi.fn();
const jumpTo = vi.fn();
const providerMapRender = vi.fn();
let providerHandle: { flyTo: typeof flyTo; jumpTo: typeof jumpTo } | null = null;

vi.mock("./provider-map", async () => {
  const React = await import("react");
  const MockProviderMap = React.forwardRef(function MockProviderMap(props: { mode?: string; tripId?: string }, ref) {
    providerMapRender(props);
    providerHandle = { flyTo, jumpTo };
    React.useImperativeHandle(ref, () => providerHandle, []);
    return React.createElement("div", { "data-testid": "provider-map", "data-mode": props.mode, "data-trip-id": props.tripId });
  });
  return { ProviderMap: MockProviderMap };
});

vi.mock("../provider", () => ({
  getMapProviderToken: vi.fn(() => "pk.test.mapbox"),
}));

vi.mock("mapbox-gl", () => {
  throw new Error("mapbox-gl should not import before viewport entry");
});

class MockIntersectionObserver {
  static instances: MockIntersectionObserver[] = [];
  private readonly callback: IntersectionObserverCallback;

  constructor(callback: IntersectionObserverCallback) {
    this.callback = callback;
    MockIntersectionObserver.instances.push(this);
  }

  observe = vi.fn();
  disconnect = vi.fn();
  unobserve = vi.fn();
  takeRecords = vi.fn((): IntersectionObserverEntry[] => []);
  root = null;
  rootMargin = "100px";
  thresholds = [];

  enter(): void {
    this.callback([{ isIntersecting: true } as IntersectionObserverEntry], this);
  }
}

const chapters: ChapterCameraTarget[] = [
  { id: "intro", center: [-9.1393, 38.7223], zoom: 11, pitch: 40, bearing: 5, duration: 900 },
  { id: "sintra", center: [-9.3817, 38.8029], zoom: 13, pitch: 55, bearing: 20, duration: 1200 },
];

describe("CinematicMap", () => {
  let container: HTMLDivElement;
  let root: Root;
  const originalIntersectionObserver = globalThis.IntersectionObserver;

  beforeEach(() => {
    vi.clearAllMocks();
    providerHandle = null;
    MockIntersectionObserver.instances = [];
    Object.defineProperty(window, "innerWidth", { configurable: true, value: 1440 });
    globalThis.IntersectionObserver = MockIntersectionObserver as unknown as typeof IntersectionObserver;
    container = document.createElement("div");
    document.body.appendChild(container);
    root = createRoot(container);
  });

  afterEach(() => {
    act(() => root.unmount());
    container.remove();
    globalThis.IntersectionObserver = originalIntersectionObserver;
  });

  function renderMap(props?: Partial<React.ComponentProps<typeof CinematicMap>>): void {
    act(() => {
      root.render(<CinematicMap chapters={chapters} activeChapterId="intro" tripId="trip-1" reducedMotion={false} {...props} />);
    });
  }

  function enterViewport(): void {
    act(() => {
      MockIntersectionObserver.instances[0]?.enter();
    });
  }

  it("activeChapterId change calls flyTo with the target looked up by id", () => {
    renderMap();
    enterViewport();
    flyTo.mockClear();

    act(() => {
      root.render(<CinematicMap chapters={chapters} activeChapterId="sintra" tripId="trip-1" reducedMotion={false} />);
    });

    expect(flyTo).toHaveBeenCalledWith({ chapter: expect.objectContaining({ lng: -9.3817, lat: 38.8029, zoom: 13 }) });
  });

  it("uses jumpTo instead of flyTo for reduced motion", () => {
    renderMap({ activeChapterId: "sintra", reducedMotion: true });
    enterViewport();

    expect(jumpTo).toHaveBeenCalledWith(expect.objectContaining({ lng: -9.3817, lat: 38.8029 }));
    expect(flyTo).not.toHaveBeenCalled();
  });

  it("renders a Static Images placeholder before mount without importing mapbox-gl", () => {
    renderMap();

    expect(container.querySelector("img[data-static-placeholder]")).toBeTruthy();
    expect(container.querySelector("img")?.getAttribute("loading")).toBe("lazy");
    expect(providerMapRender).not.toHaveBeenCalled();
  });

  it("mounts the real map on viewport entry and emits lazy mounted telemetry", async () => {
    const analytics = createFakeAnalyticsProvider();
    renderMap({ analytics });
    enterViewport();

    await vi.waitFor(() => {
      expect(container.querySelector("[data-testid='provider-map']")).toBeTruthy();
      expect(analytics.outbox).toContainEqual(expect.objectContaining({
        name: "cinematic_map_lazy_mounted",
        properties: { tripId: "trip-1", viewport: "desktop", hasCoords: true },
      }));
    });
  });

  it("emits load completed telemetry when tiles load", async () => {
    const analytics = createFakeAnalyticsProvider();
    let completeTiles: ((tilesLoaded: number) => void) | undefined;
    renderMap({ analytics, onTilesLoaded: (callback) => { completeTiles = callback; return undefined; } });
    enterViewport();

    act(() => completeTiles?.(7));

    await vi.waitFor(() => {
      expect(analytics.outbox).toContainEqual(expect.objectContaining({
        name: "cinematic_map_load_completed",
        properties: expect.objectContaining({ tripId: "trip-1", tilesLoaded: 7 }),
      }));
    });
  });

  it("does not emit cinematic_chapter_activated", async () => {
    const analytics = createFakeAnalyticsProvider();
    renderMap({ analytics });
    enterViewport();

    await vi.waitFor(() => expect(analytics.outbox.length).toBeGreaterThan(0));
    expect(analytics.outbox.some((event) => event.name === "cinematic_chapter_activated")).toBe(false);
  });
});
