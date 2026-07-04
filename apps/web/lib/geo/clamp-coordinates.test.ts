import { describe, it, expect } from "vitest";
import { clampCoordinate, clampCoordinates } from "./clamp-coordinates";

describe("clampCoordinate", () => {
  it("truncates to 6 decimal places (1cm precision)", () => {
    expect(clampCoordinate(-8.224543212, "lng")).toBe(-8.224543);
    expect(clampCoordinate(39.399912345, "lat")).toBe(39.399912);
  });

  it("does not pad with zeros", () => {
    expect(clampCoordinate(-8.2, "lng")).toBe(-8.2);
    expect(clampCoordinate(39.0, "lat")).toBe(39);
  });

  it("rounds to zero (preserves sign for IEEE-754 compatibility)", () => {
    // -0.0000001 < half of 1e-6, so toFixed(6) yields "-0.000000" which
    // parseFloat converts to -0. This is mathematically equivalent to 0
    // and is preserved so downstream comparison logic isn't surprised.
    expect(Object.is(clampCoordinate(-0.0000001, "lng"), -0)).toBe(true);
    expect(clampCoordinate(0.0000001, "lng")).toBe(0);
  });

  it("passes through non-finite values (caller validates)", () => {
    expect(Number.isNaN(clampCoordinate(NaN, "lng"))).toBe(true);
    expect(clampCoordinate(Infinity, "lng")).toBe(Infinity);
  });

  it("handles antimeridian longitude unchanged (clamp is precision, not range)", () => {
    expect(clampCoordinate(180.0, "lng")).toBe(180);
    expect(clampCoordinate(-179.999999123, "lng")).toBe(-179.999999);
  });
});

describe("clampCoordinates", () => {
  it("clamps a pair to 6 decimal places each", () => {
    const [lng, lat] = clampCoordinates(-8.224543212, 39.399912345);
    expect(lng).toBe(-8.224543);
    expect(lat).toBe(39.399912);
  });

  it("preserves sign and order", () => {
    const [lng, lat] = clampCoordinates(-0.0000001, 0.0000001);
    expect(Object.is(lng, -0)).toBe(true);
    expect(lat).toBe(0);
  });
});
