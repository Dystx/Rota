import type { CHAPTER_CAMERA_DEFAULTS, CINEMATIC_STYLE, FOG_CONFIG, TERRAIN_CONFIG } from "../cinematic-config";

type LngLat = [number, number];

type BoundsLike = { extend: (lngLat: LngLat) => BoundsLike };

export type MapboxMarker = {
  setLngLat: (lngLat: LngLat) => MapboxMarker;
  addTo: (map: MapboxMap) => MapboxMarker;
  remove: () => void;
};

export type MapboxMap = {
  on: (event: "load", callback: () => void) => void;
  fitBounds: (bounds: BoundsLike, options?: Record<string, unknown>) => void;
  flyTo: (options: Record<string, unknown>) => void;
  jumpTo?: (options: Record<string, unknown>) => void;
  setTerrain?: (terrain: typeof TERRAIN_CONFIG) => void;
  setFog?: (fog: typeof FOG_CONFIG) => void;
  remove: () => void;
};

type MapboxModule = {
  default?: MapboxModule;
  accessToken: string;
  prewarm: () => void;
  Map: new (options: Record<string, unknown>) => MapboxMap;
  Marker: new (options?: Record<string, unknown>) => MapboxMarker;
  LngLatBounds: new (southWest: LngLat, northEast: LngLat) => BoundsLike;
};

export interface MountMapboxStop {
  id: string;
  label: string;
  lng: number;
  lat: number;
}

export interface MountMapboxOptions {
  container: HTMLElement;
  token: string;
  stops: MountMapboxStop[];
  mode: "static" | "cinematic";
  cameraDefaults: typeof CHAPTER_CAMERA_DEFAULTS;
  style: typeof CINEMATIC_STYLE;
  terrain: typeof TERRAIN_CONFIG;
  fog: typeof FOG_CONFIG;
  onLoad?: () => void;
}

export interface MountMapboxResult {
  map: MapboxMap;
  markers: MapboxMarker[];
}

async function loadMapbox(): Promise<MapboxModule> {
  const imported = (await import("mapbox-gl")) as unknown as MapboxModule;

  return imported.default ?? imported;
}

export async function prewarmMapbox(): Promise<void> {
  const mapboxgl = await loadMapbox();
  mapboxgl.prewarm();
}

export async function mountMapbox(options: MountMapboxOptions): Promise<MountMapboxResult | null> {
  const mapboxgl = await loadMapbox();

  const firstStop = options.stops[0];
  if (!firstStop) return null;

  mapboxgl.accessToken = options.token;
  const map = new mapboxgl.Map({
    container: options.container,
    style: options.style,
    center: [firstStop.lng, firstStop.lat],
    zoom: options.mode === "cinematic" ? options.cameraDefaults.zoom : 8,
    pitch: options.mode === "cinematic" ? options.cameraDefaults.pitch : 0,
    bearing: options.mode === "cinematic" ? options.cameraDefaults.bearing : 0,
    interactive: true,
  });

  map.on("load", () => {
    map.setTerrain?.(options.terrain);
    map.setFog?.(options.fog);

    const bounds = new mapboxgl.LngLatBounds(
      [firstStop.lng, firstStop.lat],
      [firstStop.lng, firstStop.lat],
    );
    options.stops.slice(1).forEach((stop) => bounds.extend([stop.lng, stop.lat]));

    if (options.mode === "static") {
      map.fitBounds(bounds, { padding: 80, duration: 0, animate: false });
    }

    options.onLoad?.();
  });

  const markers = options.stops.map((stop, index) => {
    const markerElement = document.createElement("button");
    markerElement.type = "button";
    markerElement.textContent = String(index + 1);
    markerElement.setAttribute("aria-label", `Focus ${stop.label}`);
    markerElement.className = "grid h-8 w-8 place-items-center rounded-full border-2 border-white bg-foreground text-xs font-bold text-white shadow-lg";
    markerElement.addEventListener("click", () => {
      map.flyTo({ center: [stop.lng, stop.lat], zoom: 14, duration: options.mode === "static" ? 0 : 900 });
    });

    return new mapboxgl.Marker({ element: markerElement }).setLngLat([stop.lng, stop.lat]).addTo(map);
  });

  return { map, markers };
}
