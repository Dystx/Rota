import type { MapStyleEndpoint, MapStyleProvider } from "./types";

/**
 * CARTO basemaps — open-source vector tiles, no per-map-view billing.
 *
 * Attribution requirements are baked into the endpoint so the engine can
 * surface them in the UI automatically (per CARTO's terms).
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