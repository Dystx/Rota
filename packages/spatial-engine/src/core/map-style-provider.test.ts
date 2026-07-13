import { describe, expect, it } from "vitest";

import {
  CartoBasemapStyleProvider,
  ProtomapsBasemapStyleProvider
} from "./map-style-provider";

describe("map style providers", () => {
  it("keeps the development CARTO candidate explicit", () => {
    const style = new CartoBasemapStyleProvider().getStyle("light");

    expect(style.id).toBe("carto-positron");
    expect(style.url).toContain("cartocdn.com");
    expect(style.attribution).toContain("OpenStreetMap");
  });

  it("builds a self-hosted Protomaps candidate without selecting it globally", () => {
    const provider = new ProtomapsBasemapStyleProvider({
      baseUrl: "http://127.0.0.1:3010/",
      stylePath: "portugal-style.json"
    });
    const style = provider.getStyle("light");

    expect(style).toMatchObject({
      id: "protomaps-portugal-light",
      url: "http://127.0.0.1:3010/portugal-style.json"
    });
    expect(style.attribution).toContain("Protomaps");
  });
});
