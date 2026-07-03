import { describe, expect, it } from "vitest";
import { PORTUGAL_BBOX, type OsmFeature, type EmbeddedFeature, type EmbeddingRequest, type EmbeddingResponse, type LoadResponse, type EmbeddingClient, type SupabaseLoader, type PlaceRow, type LoadRequest } from "./types";
import { flattenTagsForEmbedding, embedFeatures } from "./embed";
import { loadPlaces, featureToRow } from "./load";

/** Deterministic stub embedding client. Each input gets a
 *  1536-dim vector that's the input string length, repeated.
 *  Not realistic but reproducible. */
const stubEmbedder: EmbeddingClient = {
  async embed(request: EmbeddingRequest): Promise<EmbeddingResponse> {
    return {
      embeddings: request.inputs.map((input) => {
        const seed = input.length;
        return new Array(1536).fill(0).map((_, i) => ((seed + i) % 1000) / 1000);
      }),
      model: request.model,
      totalTokens: request.inputs.reduce((acc, input) => acc + input.split(/\s+/).length, 0)
    };
  }
};

/** Counting stub Supabase loader. Records every batch. */
function makeCountingLoader(): SupabaseLoader & { calls: LoadRequest[] } {
  const calls: LoadRequest[] = [];
  return {
    calls,
    async load(request: LoadRequest): Promise<LoadResponse> {
      calls.push(request);
      return {
        inserted: request.rows.length,
        updated: 0,
        failed: 0
      };
    }
  };
}

function makeOsmFeature(name: string, category: string, tags: Record<string, string> = {}): OsmFeature {
  return {
    osmId: `osm-${name.toLowerCase().replace(/\s+/g, "-")}`,
    name,
    category,
    tags,
    geometryWkt: `POINT(-9.5 ${36.96 + Math.random() * 5})`,
    country: "pt"
  };
}

describe("embed — flattenTagsForEmbedding", () => {
  it("puts name + category first, then the rest", () => {
    const out = flattenTagsForEmbedding(
      makeOsmFeature("Miradouro da Vitória", "tourism/viewpoint", {
        name: "Miradouro da Vitória",
        "name:en": "Miradouro da Vitória",
        "tourism": "viewpoint",
        wheelchair: "yes",
        fee: "no"
      })
    );
    expect(out).toMatch(/^name: Miradouro da Vitória;/);
    expect(out).toContain("category: tourism/viewpoint");
    expect(out).toContain("wheelchair: yes");
    expect(out).toContain("fee: no");
    // The duplicate `name` key from `tags` should be skipped
    // (we already have it from the feature.name field).
    const occurrences = (out.match(/name: Miradouro da Vitória/g) ?? []).length;
    expect(occurrences).toBe(1);
  });
});

describe("embed — embedFeatures", () => {
  it("returns empty EmbedResult for empty input", async () => {
    const result = await embedFeatures([], { client: stubEmbedder });
    expect(result.embedded).toHaveLength(0);
    expect(result.failed).toBe(0);
    expect(result.totalTokens).toBe(0);
  });

  it("embeds a single feature", async () => {
    const features = [makeOsmFeature("Test", "amenity/restaurant")];
    const result = await embedFeatures(features, { client: stubEmbedder });
    expect(result.embedded).toHaveLength(1);
    expect(result.embedded[0]?.embeddingModel).toBe("text-embedding-3-small");
    expect(result.embedded[0]?.embedding.length).toBe(1536);
    expect(result.failed).toBe(0);
  });

  it("batches and aggregates tokens across multiple features", async () => {
    const features = Array.from({ length: 250 }, (_, i) =>
      makeOsmFeature(`Place ${i}`, "amenity/cafe"));
    const result = await embedFeatures(features, { client: stubEmbedder });
    expect(result.embedded).toHaveLength(250);
    // 250 / 100 = 3 batches (100, 100, 50)
    expect(result.totalTokens).toBeGreaterThan(0);
  });

  it("marks the whole batch as failed when the client throws", async () => {
    const failing: EmbeddingClient = {
      async embed(): Promise<EmbeddingResponse> {
        throw new Error("rate limit");
      }
    };
    const features = Array.from({ length: 10 }, (_, i) =>
      makeOsmFeature(`Place ${i}`, "amenity/cafe"));
    const result = await embedFeatures(features, { client: failing });
    expect(result.embedded).toHaveLength(0);
    expect(result.failed).toBe(10);
  });
});

describe("load — featureToRow", () => {
  it("splits the category key into metadata.category_key", () => {
    const feature: EmbeddedFeature = {
      ...makeOsmFeature("X", "amenity/restaurant"),
      embedding: new Array(1536).fill(0.5),
      embeddingModel: "text-embedding-3-small"
    };
    const row = featureToRow(feature);
    expect(row.category).toBe("amenity/restaurant");
    expect(row.metadata.category_key).toBe("amenity");
    expect(row.metadata.category_value).toBe("restaurant");
    expect(row.countrySlug).toBe("pt");
    expect(row.embedding.length).toBe(1536);
  });
});

describe("load — loadPlaces", () => {
  const features: EmbeddedFeature[] = Array.from({ length: 3 }, (_, i) => ({
    ...makeOsmFeature(`Place ${i}`, "tourism/viewpoint"),
    embedding: new Array(1536).fill(0.1),
    embeddingModel: "text-embedding-3-small"
  }));

  it("returns empty LoadResult for empty input", async () => {
    const result = await loadPlaces([], { loader: makeCountingLoader() });
    expect(result).toEqual({ inserted: 0, updated: 0, failed: 0 });
  });

  it("calls the loader and aggregates counts", async () => {
    const loader = makeCountingLoader();
    const result = await loadPlaces(features, { loader });
    expect(result.inserted).toBe(3);
    expect(result.failed).toBe(0);
    expect(loader.calls).toHaveLength(1);
    expect(loader.calls[0]?.rows).toHaveLength(3);
  });

  it("marks the whole batch as failed when the loader throws", async () => {
    const failing: SupabaseLoader = {
      async load(): Promise<LoadResponse> {
        throw new Error("connection refused");
      }
    };
    const result = await loadPlaces(features, { loader: failing });
    expect(result.failed).toBe(3);
    expect(result.inserted).toBe(0);
  });
});

describe("PORTUGAL_BBOX", () => {
  it("is the documented Portugal mainland box", () => {
    expect(PORTUGAL_BBOX.minLat).toBe(36.9601);
    expect(PORTUGAL_BBOX.maxLat).toBe(42.1543);
    expect(PORTUGAL_BBOX.minLon).toBe(-9.5);
    expect(PORTUGAL_BBOX.maxLon).toBe(-6.1892);
  });
});
