"use client";

import * as React from "react";
import { RouteMap as SchematicMap, useReducedMotion } from "@repo/ui";
import { CHAPTER_CAMERA_DEFAULTS, CINEMATIC_STYLE, FOG_CONFIG, TERRAIN_CONFIG } from "../cinematic-config";
import { getMapProviderToken } from "../provider";

export interface MapStopMarker {
  id: string;
  label: string;
  x?: number;
  y?: number;
  lng?: number;
  lat?: number;
  isActive?: boolean;
}

export interface MapDayLayer {
  id: string;
  title: string;
  stops: MapStopMarker[];
}

export interface MapRouteWarning {
  id: string;
  message: string;
  severity?: "high" | "medium" | "low";
}

export interface MapChapter {
  stopId?: string;
  lng?: number;
  lat?: number;
  zoom?: number;
  pitch?: number;
  bearing?: number;
  duration?: number;
}

export interface ProviderMapHandle {
  flyTo: (options: { chapter: MapChapter }) => void;
}

export interface ProviderMapProps extends React.HTMLAttributes<HTMLDivElement> {
  selectedDayId?: string;
  days?: MapDayLayer[];
  warnings?: MapRouteWarning[];
  children?: React.ReactNode;
  mode?: "static" | "cinematic";
  onLoad?: () => void;
  tripId?: string;
}

type LngLat = [number, number];

type BoundsLike = {
  extend: (lngLat: LngLat) => BoundsLike;
};

type MapboxMarker = {
  setLngLat: (lngLat: LngLat) => MapboxMarker;
  addTo: (map: MapboxMap) => MapboxMarker;
  remove: () => void;
};

type MapboxMap = {
  on: (event: "load", callback: () => void) => void;
  fitBounds: (bounds: BoundsLike, options?: Record<string, unknown>) => void;
  flyTo: (options: Record<string, unknown>) => void;
  setTerrain?: (terrain: typeof TERRAIN_CONFIG) => void;
  setFog?: (fog: typeof FOG_CONFIG) => void;
  remove: () => void;
};

type MapboxModule = {
  default?: MapboxModule;
  accessToken: string;
  Map: new (options: Record<string, unknown>) => MapboxMap;
  Marker: new (options?: Record<string, unknown>) => MapboxMarker;
  LngLatBounds: new (southWest: LngLat, northEast: LngLat) => BoundsLike;
};

type CoordinateStop = MapStopMarker & {
  dayId: string;
  dayTitle: string;
  index: number;
  lng: number;
  lat: number;
};

function hasCoordinate(value: MapStopMarker): value is MapStopMarker & { lng: number; lat: number } {
  return Number.isFinite(value.lng) && Number.isFinite(value.lat);
}

function fallbackCoordinate(stop: MapStopMarker): { lng: number; lat: number } | null {
  if (!Number.isFinite(stop.x) || !Number.isFinite(stop.y)) {
    return null;
  }

  return {
    lng: -9.5 + ((stop.x ?? 0) / 100) * 3,
    lat: 36.9 + ((100 - (stop.y ?? 0)) / 100) * 5,
  };
}

function getCoordinateStops(days: MapDayLayer[]): CoordinateStop[] {
  const stops: CoordinateStop[] = [];

  for (const day of days) {
    day.stops.forEach((stop) => {
      const coordinate = hasCoordinate(stop) ? stop : fallbackCoordinate(stop);

      if (!coordinate) {
        console.warn(`ProviderMap omitted stop without coordinates: ${stop.label}`);
        return;
      }

      stops.push({ ...stop, dayId: day.id, dayTitle: day.title, index: stops.length + 1, lng: coordinate.lng, lat: coordinate.lat });
    });
  }

  return stops;
}

function toSchematicDays(days: MapDayLayer[]): React.ComponentProps<typeof SchematicMap>["days"] {
  return days.map((day) => ({
    ...day,
    stops: day.stops.map((stop, index) => ({
      ...stop,
      x: stop.x ?? 18 + ((index * 19) % 64),
      y: stop.y ?? 22 + ((index * 17) % 56),
    })),
  }));
}

function getStaticImageUrl(token: string, stops: CoordinateStop[]): string {
  const markerOverlay = stops
    .slice(0, 10)
    .map((stop, index) => `pin-s-${index + 1}+111827(${stop.lng},${stop.lat})`)
    .join(",");
  const overlay = markerOverlay || "auto";
  return `https://api.mapbox.com/styles/v1/mapbox/standard/static/${overlay}/auto/1200x600?access_token=${encodeURIComponent(token)}`;
}

function normalizeMapboxModule(module: MapboxModule): MapboxModule {
  return module.default ?? module;
}

export const ProviderMap = React.forwardRef<ProviderMapHandle, ProviderMapProps>(function ProviderMap(
  {
    selectedDayId,
    days = [],
    warnings = [],
    className,
    children,
    mode = "static",
    onLoad,
    tripId,
    ...props
  },
  ref,
) {
  const token = getMapProviderToken();
  const reducedMotion = useReducedMotion();
  const effectiveMode = reducedMotion ? "static" : mode;
  const coordinateStops = React.useMemo(() => getCoordinateStops(days), [days]);
  const containerRef = React.useRef<HTMLDivElement | null>(null);
  const mapRef = React.useRef<MapboxMap | null>(null);
  const markersRef = React.useRef<MapboxMarker[]>([]);

  React.useImperativeHandle(
    ref,
    () => ({
      flyTo({ chapter }) {
        if (effectiveMode !== "cinematic") {
          return;
        }

        const stop = chapter.stopId ? coordinateStops.find((item) => item.id === chapter.stopId) : undefined;
        const lng = chapter.lng ?? stop?.lng;
        const lat = chapter.lat ?? stop?.lat;

        if (!Number.isFinite(lng) || !Number.isFinite(lat)) {
          return;
        }

        mapRef.current?.flyTo({
          center: [lng, lat],
          zoom: chapter.zoom ?? CHAPTER_CAMERA_DEFAULTS.zoom,
          pitch: chapter.pitch ?? CHAPTER_CAMERA_DEFAULTS.pitch,
          bearing: chapter.bearing ?? CHAPTER_CAMERA_DEFAULTS.bearing,
          duration: chapter.duration ?? CHAPTER_CAMERA_DEFAULTS.duration,
          curve: CHAPTER_CAMERA_DEFAULTS.curve,
        });
      },
    }),
    [coordinateStops, effectiveMode],
  );

  React.useEffect(() => {
    if (!token || coordinateStops.length === 0 || process.env.NEXT_PUBLIC_MAPBOX_KILL_SWITCH === "1") {
      return;
    }

    let isMounted = true;
    let mapInstance: MapboxMap | null = null;

    async function mountMap(): Promise<void> {
      if (!token) {
        return;
      }

      const imported = (await import("mapbox-gl")) as unknown as MapboxModule;
      const mapboxgl = normalizeMapboxModule(imported);

      if (!isMounted || !containerRef.current) {
        return;
      }

      const firstStop = coordinateStops[0];

      if (!firstStop) {
        return;
      }

      mapboxgl.accessToken = token;
      mapInstance = new mapboxgl.Map({
        container: containerRef.current,
        style: CINEMATIC_STYLE,
        center: [firstStop.lng, firstStop.lat],
        zoom: effectiveMode === "cinematic" ? CHAPTER_CAMERA_DEFAULTS.zoom : 8,
        pitch: effectiveMode === "cinematic" ? CHAPTER_CAMERA_DEFAULTS.pitch : 0,
        bearing: effectiveMode === "cinematic" ? CHAPTER_CAMERA_DEFAULTS.bearing : 0,
        interactive: true,
      });
      mapRef.current = mapInstance;

      mapInstance.on("load", () => {
        mapInstance?.setTerrain?.(TERRAIN_CONFIG);
        mapInstance?.setFog?.(FOG_CONFIG);

        const bounds = new mapboxgl.LngLatBounds(
          [firstStop.lng, firstStop.lat],
          [firstStop.lng, firstStop.lat],
        );
        coordinateStops.slice(1).forEach((stop) => bounds.extend([stop.lng, stop.lat]));

        if (effectiveMode === "static") {
          mapInstance?.fitBounds(bounds, { padding: 80, duration: 0, animate: false });
        }

        onLoad?.();
      });

      markersRef.current = coordinateStops.map((stop, index) => {
        const markerElement = document.createElement("button");
        markerElement.type = "button";
        markerElement.textContent = String(index + 1);
        markerElement.setAttribute("aria-label", `Focus ${stop.label}`);
        markerElement.className = "grid h-8 w-8 place-items-center rounded-full border-2 border-white bg-[#111827] text-xs font-bold text-white shadow-lg";
        markerElement.addEventListener("click", () => {
          mapInstance?.flyTo({ center: [stop.lng, stop.lat], zoom: 14, duration: effectiveMode === "static" ? 0 : 900 });
        });

        return new mapboxgl.Marker({ element: markerElement }).setLngLat([stop.lng, stop.lat]).addTo(mapInstance as MapboxMap);
      });
    }

    void mountMap();

    return () => {
      isMounted = false;
      markersRef.current.forEach((marker) => marker.remove());
      markersRef.current = [];
      mapInstance?.remove();
      mapRef.current = null;
    };
  }, [coordinateStops, effectiveMode, onLoad, token]);

  if (!token || coordinateStops.length === 0) {
    return <SchematicMap selectedDayId={selectedDayId} days={toSchematicDays(days)} warnings={warnings} className={className} {...props}>{children}</SchematicMap>;
  }

  if (process.env.NEXT_PUBLIC_MAPBOX_KILL_SWITCH === "1") {
    return (
      <div
        data-testid="static-map-placeholder"
        className={`relative flex h-[600px] w-full overflow-hidden rounded-[32px] border border-[var(--color-border)] bg-[rgba(247,250,249,0.96)] shadow-[0_24px_60px_rgba(7,17,19,0.06)] ${className ?? ""}`}
        {...props}
      >
        <img src={getStaticImageUrl(token, coordinateStops)} alt={`Static map preview for ${tripId ?? "trip"}`} className="absolute inset-0 h-full w-full object-cover" />
        <div className="absolute bottom-6 left-1/2 z-20 -translate-x-1/2 rounded-full border border-[var(--color-border)] bg-white/90 px-4 py-2 text-xs font-medium text-[var(--color-muted-foreground)] shadow-sm backdrop-blur-md">
          Static map preview shown while live map is disabled
        </div>
        <div className="relative z-10 h-full w-full pointer-events-none">{children}</div>
      </div>
    );
  }

  return (
    <div
      data-testid="provider-map"
      data-mode={effectiveMode}
      className={`relative flex h-[600px] w-full overflow-hidden rounded-[32px] border border-[var(--color-border)] bg-[rgba(247,250,249,0.96)] shadow-[0_24px_60px_rgba(7,17,19,0.06)] ${className ?? ""}`}
      {...props}
    >
      <div ref={containerRef} className="absolute inset-0" />

      {warnings.length > 0 ? (
        <div className="absolute top-6 left-1/2 z-20 flex -translate-x-1/2 flex-col gap-2">
          {warnings.map((warning) => (
            <div key={warning.id} className="rounded-full border border-[var(--color-border)] bg-white/90 px-4 py-2 text-xs font-medium shadow-md backdrop-blur-md">
              {warning.message}
            </div>
          ))}
        </div>
      ) : null}

      <div className="relative z-10 h-full w-full pointer-events-none">{children}</div>
    </div>
  );
});
