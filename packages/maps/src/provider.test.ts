import { describe, it, expect, vi, afterEach } from "vitest";
import { isMapProviderEnabled, getMapProviderToken } from "./provider";

describe("Map Provider", () => {
  const originalEnv = process.env;

  afterEach(() => {
    process.env = originalEnv;
    vi.restoreAllMocks();
  });

  it("returns false when MAPBOX_PUBLIC_TOKEN is not set", () => {
    process.env = { ...originalEnv };
    delete process.env.NEXT_PUBLIC_MAPBOX_PUBLIC_TOKEN;
    expect(isMapProviderEnabled()).toBe(false);
    expect(getMapProviderToken()).toBe(null);
  });

  it("returns true when MAPBOX_PUBLIC_TOKEN is set", () => {
    process.env = { ...originalEnv, NEXT_PUBLIC_MAPBOX_PUBLIC_TOKEN: "pk.test" };
    expect(isMapProviderEnabled()).toBe(true);
    expect(getMapProviderToken()).toBe("pk.test");
  });

  it("allows testing via forceMapboxProvider=1 in browser", () => {
    // Mock window
    vi.stubGlobal("window", {
      location: { search: "?forceMapboxProvider=1" }
    });
    
    expect(isMapProviderEnabled()).toBe(true);
    expect(getMapProviderToken()).toBe("pk.test.force_enabled_token_for_playwright");
  });
});
