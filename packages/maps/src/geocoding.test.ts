import { afterEach, describe, expect, it, vi } from "vitest";
import { GeocodingError, geocodeBatch, geocodePlace, offsetDuplicateCoords } from "./geocoding";

const okResponse = (body: unknown) =>
  ({ ok: true, status: 200, json: async () => body } as Response);

const errorResponse = (status: number, body: unknown) =>
  ({ ok: false, status, json: async () => body } as Response);

describe("geocoding", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("returns coords and confidence for a valid result", async () => {
    const fetchMock = vi.fn(async () => okResponse({ features: [{ relevance: 0.8, place_name: "Lisboa", geometry: { coordinates: [-9.1, 38.7] } }] }));
    const result = await geocodePlace({ placeName: "Lisboa", regionBias: ["lisboa"] }, { token: "pk.test", fetch: fetchMock as typeof fetch });
    expect(result).toEqual({ lng: -9.1, lat: 38.7, confidence: 0.8, matchedPlace: "Lisboa" });
  });

  it("returns null for low relevance", async () => {
    const fetchMock = vi.fn(async () => okResponse({ features: [{ relevance: 0.4, place_name: "Low", geometry: { coordinates: [-9.1, 38.7] } }] }));
    await expect(geocodePlace({ placeName: "Low" }, { token: "pk.test", fetch: fetchMock as typeof fetch })).resolves.toBeNull();
  });

  it("throws a typed error on 401", async () => {
    const fetchMock = vi.fn(async () => errorResponse(401, { message: "Unauthorized" }));
    await expect(geocodePlace({ placeName: "Lisboa" }, { token: "pk.test", fetch: fetchMock as typeof fetch })).rejects.toBeInstanceOf(GeocodingError);
    await expect(geocodePlace({ placeName: "Lisboa" }, { token: "pk.test", fetch: fetchMock as typeof fetch })).rejects.toMatchObject({ status: 401, message: "Unauthorized" });
  });

  it("resolves a batch of 10 inputs", async () => {
    const fetchMock = vi.fn(async () => okResponse({ features: [{ relevance: 0.9, place_name: "Place", geometry: { coordinates: [1, 2] } }] }));
    const results = await geocodeBatch(Array.from({ length: 10 }, (_, index) => ({ placeName: `Place ${index}` })), { token: "pk.test", fetch: fetchMock as typeof fetch });
    expect(results).toHaveLength(10);
    expect(results.every((entry) => entry?.lng === 1 && entry?.lat === 2)).toBe(true);
  });

  it("offsets duplicate coordinates for identical stops", () => {
    const result = offsetDuplicateCoords([
      { lng: -9, lat: 38, stopIndex: 1 },
      { lng: -9, lat: 38, stopIndex: 2 },
      { lng: -9, lat: 38, stopIndex: 3 },
    ]);

    expect(result).toHaveLength(3);
    expect(new Set(result.map((coord) => `${coord.lng},${coord.lat}`)).size).toBe(3);
  });
});
