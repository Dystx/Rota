export * from "./provider";
export * from "./components/provider-map";
export * from "./components/cinematic-map";
export * from "./geocoding";

export async function prewarm(): Promise<void> {
  const imported = await import("mapbox-gl");
  const mapboxgl = imported.default ?? imported;

  mapboxgl.prewarm();
}
