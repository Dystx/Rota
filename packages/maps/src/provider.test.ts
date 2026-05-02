import { describe, it, expect, vi, afterEach } from "vitest";
import { isMapProviderEnabled, getMapProviderToken } from "./provider";

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
});
