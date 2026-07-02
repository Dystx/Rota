import { describe, it, expect, vi, afterEach } from "vitest";
import { isMapProviderEnabled, getMapProviderToken, getMapStaticImageUrl } from "./provider";

describe("Map Provider", () => {
  const originalEnvToken = process.env.NEXT_PUBLIC_MAPBOX_PUBLIC_TOKEN;
  const originalNodeEnv = process.env.NODE_ENV;

  afterEach(() => {
    process.env.NEXT_PUBLIC_MAPBOX_PUBLIC_TOKEN = originalEnvToken;
    process.env.NODE_ENV = originalNodeEnv;
    vi.restoreAllMocks();
  });

  it("returns null when MAPBOX_PUBLIC_TOKEN is not set", () => {
    delete process.env.NEXT_PUBLIC_MAPBOX_PUBLIC_TOKEN;
    expect(isMapProviderEnabled()).toBe(false);
    expect(getMapProviderToken()).toBe(null);
  });

  it("returns true when MAPBOX_PUBLIC_TOKEN is set to a public token", () => {
    process.env.NEXT_PUBLIC_MAPBOX_PUBLIC_TOKEN = "pk.test.123";
    expect(isMapProviderEnabled()).toBe(true);
    expect(getMapProviderToken()).toBe("pk.test.123");
  });

  it("returns null and rejects secret tokens starting with sk.", () => {
    process.env.NEXT_PUBLIC_MAPBOX_PUBLIC_TOKEN = "sk.test.123";
    expect(isMapProviderEnabled()).toBe(false);
    expect(getMapProviderToken()).toBe(null);
  });

  it("allows testing via forceMapboxProvider=1 in browser when not in production", () => {
    process.env.NODE_ENV = "development";
    vi.stubGlobal("window", {
      location: { search: "?forceMapboxProvider=1" }
    });
    
    expect(isMapProviderEnabled()).toBe(true);
    expect(getMapProviderToken()).toBe("pk.test.force_enabled_token_for_playwright");
  });

  it("ignores forceMapboxProvider=1 in production", () => {
    process.env.NODE_ENV = "production";
    delete process.env.NEXT_PUBLIC_MAPBOX_PUBLIC_TOKEN;
    vi.stubGlobal("window", {
      location: { search: "?forceMapboxProvider=1" }
    });
    
    expect(isMapProviderEnabled()).toBe(false);
    expect(getMapProviderToken()).toBe(null);
  });

  describe("getMapStaticImageUrl", () => {
    it("returns null when token is missing", () => {
      vi.unstubAllGlobals();
      delete process.env.NEXT_PUBLIC_MAPBOX_PUBLIC_TOKEN;
      expect(getMapStaticImageUrl({ lng: -9.1, lat: 38.7, zoom: 8 })).toBe(null);
    });

    it("returns null when token is a secret key", () => {
      vi.unstubAllGlobals();
      process.env.NEXT_PUBLIC_MAPBOX_PUBLIC_TOKEN = "sk.evil";
      expect(getMapStaticImageUrl({ lng: -9.1, lat: 38.7, zoom: 8 })).toBe(null);
    });

    it("returns null when coordinates are not finite", () => {
      vi.unstubAllGlobals();
      process.env.NEXT_PUBLIC_MAPBOX_PUBLIC_TOKEN = "pk.test.123";
      expect(getMapStaticImageUrl({ lng: NaN, lat: 38.7, zoom: 8 })).toBe(null);
      expect(getMapStaticImageUrl({ lng: -9.1, lat: Infinity, zoom: 8 })).toBe(null);
    });

    it("builds a Mapbox static URL with a public token", () => {
      vi.unstubAllGlobals();
      process.env.NEXT_PUBLIC_MAPBOX_PUBLIC_TOKEN = "pk.test.123";
      const url = getMapStaticImageUrl({ lng: -9.1, lat: 38.7, zoom: 8 });
      expect(url).toContain("https://api.mapbox.com/styles/v1/mapbox/light-v11/static/");
      expect(url).toContain("-9.1,38.7,8");
      expect(url).toContain("1200x600");
      expect(url).toContain("access_token=pk.test.123");
    });

    it("includes overlay markers when provided", () => {
      vi.unstubAllGlobals();
      process.env.NEXT_PUBLIC_MAPBOX_PUBLIC_TOKEN = "pk.test.123";
      const url = getMapStaticImageUrl({ lng: -9.1, lat: 38.7, zoom: 8, overlay: "pin-s-1+111827(-9.1,38.7)" });
      expect(url).toContain("pin-s-1+111827(-9.1,38.7)/-9.1,38.7,8");
    });
  });
});
