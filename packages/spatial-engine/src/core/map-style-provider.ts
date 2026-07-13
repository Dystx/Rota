import type { MapStyleEndpoint, MapStyleProvider } from "./types";

/**
 * CARTO basemaps — the current development candidate for the legacy MapLibre
 * surfaces. This provider is not a production licence decision: commercial
 * entitlement, quota, and data terms are tracked in
 * `docs/ops/map-provider-licensing.md`.
 *
 * Attribution requirements are baked into the endpoint so the engine can
 * surface them in the UI automatically. Keep this adapter behind the relevant
 * release gate until a provider is approved.
 */
export class CartoBasemapStyleProvider implements MapStyleProvider {
  getStyle(theme: "light" | "dark"): MapStyleEndpoint {
    if (theme === "dark") {
      return {
        id: "carto-dark-matter",
        name: "CARTO Dark Matter",
        url: "https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json",
        attribution:
          '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors © <a href="https://carto.com/attributions">CARTO</a>'
      };
    }
    return {
      id: "carto-positron",
      name: "CARTO Positron",
      url: "https://basemaps.cartocdn.com/gl/positron-gl-style/style.json",
      attribution:
        '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors © <a href="https://carto.com/attributions">CARTO</a>'
    };
  }
}

export interface ProtomapsBasemapStyleProviderOptions {
  /** Same-origin or loopback host that serves the reviewed style candidate. */
  readonly baseUrl: string;
  /** Path to the Rumia-owned style JSON. */
  readonly stylePath?: string;
}

/**
 * Self-hosted Protomaps candidate for a future approved release.
 *
 * This adapter is deliberately not selected by either React map surface. The
 * caller must inject it (and the matching reviewed attribution) after the
 * ODbL, bandwidth, refresh, and public-origin decisions are recorded.
 */
export class ProtomapsBasemapStyleProvider implements MapStyleProvider {
  private readonly baseUrl: string;
  private readonly stylePath: string;

  constructor(options: ProtomapsBasemapStyleProviderOptions) {
    this.baseUrl = options.baseUrl.replace(/\/$/, "");
    this.stylePath = options.stylePath ?? "/portugal-style.json";
  }

  getStyle(theme: "light" | "dark"): MapStyleEndpoint {
    return {
      id: `protomaps-portugal-${theme}`,
      name: "Rumia Portugal basemap",
      url: `${this.baseUrl}${this.stylePath.startsWith("/") ? "" : "/"}${this.stylePath}`,
      attribution:
        '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors · <a href="https://protomaps.com/about">Protomaps</a>'
    };
  }
}
