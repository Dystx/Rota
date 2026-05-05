import * as React from "react";
import { createRoot, type Root } from "react-dom/client";
import { act } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ProviderMap, type MapDayLayer } from "./provider-map";

Object.defineProperty(globalThis, "IS_REACT_ACT_ENVIRONMENT", { configurable: true, value: true });

const mapConstructor = vi.fn();
const markerConstructor = vi.fn();
const fitBounds = vi.fn();
const flyTo = vi.fn();
const setTerrain = vi.fn();
const setFog = vi.fn();
const removeMap = vi.fn();
const removeMarker = vi.fn();

vi.mock("@repo/ui", async () => {
  const React = await import("react");
  return {
    useReducedMotion: vi.fn(() => false),
    RouteMap: ({ children, className }: { children?: React.ReactNode; className?: string }) =>
      React.createElement("div", { "data-testid": "schematic-map-fallback", className }, children),
  };
});

vi.mock("mapbox-gl", () => {
  class LngLatBounds {
    extend = vi.fn(() => this);
  }

  class Marker {
    constructor(options?: Record<string, unknown>) {
      markerConstructor(options);
    }

    setLngLat = vi.fn(() => this);
    addTo = vi.fn(() => this);
    remove = removeMarker;
  }

  class Map {
    constructor(options: Record<string, unknown>) {
      mapConstructor(options);
    }

    on = vi.fn((event: string, callback: () => void) => {
      if (event === "load") {
        callback();
      }
    });
    fitBounds = fitBounds;
    flyTo = flyTo;
    setTerrain = setTerrain;
    setFog = setFog;
    remove = removeMap;
  }

  return {
    default: { Map, Marker, LngLatBounds, accessToken: "", prewarm: vi.fn() },
    Map,
    Marker,
    LngLatBounds,
    accessToken: "",
    prewarm: vi.fn(),
  };
});

const daysWithCoordinates: MapDayLayer[] = [
  {
    id: "day-1",
    title: "Day 1",
    stops: [
      { id: "lisbon", label: "Lisbon", lng: -9.1393, lat: 38.7223, x: 40, y: 50 },
      { id: "sintra", label: "Sintra", lng: -9.3817, lat: 38.8029, x: 55, y: 45 },
    ],
  },
];

describe("ProviderMap", () => {
  const originalToken = process.env.NEXT_PUBLIC_MAPBOX_PUBLIC_TOKEN;
  const originalKillSwitch = process.env.NEXT_PUBLIC_MAPBOX_KILL_SWITCH;
  let container: HTMLDivElement;
  let root: Root;

  beforeEach(() => {
    process.env.NEXT_PUBLIC_MAPBOX_PUBLIC_TOKEN = "pk.test.mapbox";
    delete process.env.NEXT_PUBLIC_MAPBOX_KILL_SWITCH;
    Object.defineProperty(window, "matchMedia", {
      configurable: true,
      value: vi.fn(() => ({
        matches: false,
        media: "(prefers-reduced-motion: reduce)",
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
      })),
    });
    container = document.createElement("div");
    document.body.appendChild(container);
    root = createRoot(container);
  });

  afterEach(() => {
    act(() => {
      root.unmount();
    });
    container.remove();
    process.env.NEXT_PUBLIC_MAPBOX_PUBLIC_TOKEN = originalToken;
    process.env.NEXT_PUBLIC_MAPBOX_KILL_SWITCH = originalKillSwitch;
    vi.clearAllMocks();
  });

  it("renders schematic fallback when token is absent", () => {
    delete process.env.NEXT_PUBLIC_MAPBOX_PUBLIC_TOKEN;

    act(() => {
      root.render(<ProviderMap days={daysWithCoordinates} mode="static" tripId="trip-1" />);
    });

    expect(container.querySelector("[data-testid='schematic-map-fallback']")).toBeTruthy();
    expect(mapConstructor).not.toHaveBeenCalled();
  });

  it("renders schematic fallback when days have no coordinates", () => {
    act(() => {
      root.render(<ProviderMap days={[{ id: "day-1", title: "Day 1", stops: [{ id: "a", label: "A" }] }]} mode="static" tripId="trip-1" />);
    });

    expect(container.querySelector("[data-testid='schematic-map-fallback']")).toBeTruthy();
    expect(mapConstructor).not.toHaveBeenCalled();
  });

  it("renders Static Images placeholder when kill switch is enabled", () => {
    process.env.NEXT_PUBLIC_MAPBOX_KILL_SWITCH = "1";

    act(() => {
      root.render(<ProviderMap days={daysWithCoordinates} mode="static" tripId="trip-1" />);
    });

    expect(container.querySelector("[data-testid='static-map-placeholder']")).toBeTruthy();
    expect(container.querySelector("img[alt='Static map preview for trip-1']")).toBeTruthy();
    expect(mapConstructor).not.toHaveBeenCalled();
  });

  it("forces static mode when reduced motion is enabled", async () => {
    const ui = await import("@repo/ui");
    vi.mocked(ui.useReducedMotion).mockReturnValue(true);

    act(() => {
      root.render(<ProviderMap days={daysWithCoordinates} mode="cinematic" tripId="trip-1" />);
    });

    await vi.waitFor(() => {
      expect(container.querySelector("[data-testid='provider-map']")?.getAttribute("data-mode")).toBe("static");
      expect(fitBounds).toHaveBeenCalledWith(expect.anything(), expect.objectContaining({ animate: false, duration: 0 }));
    });
  });

  it("dynamically imports mapbox-gl for standard render", async () => {
    act(() => {
      root.render(<ProviderMap days={daysWithCoordinates} mode="static" tripId="trip-1" />);
    });

    await vi.waitFor(() => {
      expect(mapConstructor).toHaveBeenCalledWith(expect.objectContaining({ style: "mapbox://styles/mapbox/standard" }));
    });
  });
});
