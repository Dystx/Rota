"use client";

import * as React from "react";
import { RouteMap as SchematicMap, useReducedMotion } from "@repo/ui";
import { tryCapture, type AnalyticsProvider } from "@repo/analytics";
import { CHAPTER_CAMERA_DEFAULTS, CINEMATIC_STYLE, FOG_CONFIG, TERRAIN_CONFIG } from "../cinematic-config";
import { getMapProviderToken, getMapStaticImageUrl } from "../provider";
import { isKillSwitchActive } from "../kill-switch";
import type { MapboxMap, MapboxMarker } from "./mount-provider";

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
  jumpTo: (chapter: MapChapter) => void;
}

export interface ProviderMapProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'onLoad'> {
  selectedDayId?: string;
  days?: MapDayLayer[];
  warnings?: MapRouteWarning[];
  children?: React.ReactNode;
  mode?: "static" | "cinematic";
  onLoad?: () => void;
  tripId?: string;
  analytics?: AnalyticsProvider;
}

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
        if (process.env.NODE_ENV !== "production") {
          console["warn"](`ProviderMap omitted stop without coordinates: ${stop.label}`);
        }
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

function getStaticImageUrl(stops: CoordinateStop[]): string | null {
  const first = stops[0];
  if (!first) return null;
  const overlay = stops
    .slice(0, 10)
    .map((stop, index) => `pin-s-${index + 1}+111827(${stop.lng},${stop.lat})`)
    .join(",");
  return getMapStaticImageUrl({ lng: first.lng, lat: first.lat, zoom: 8, overlay });
}

function resolveChapterCoordinate(chapter: MapChapter, stops: CoordinateStop[]): { lng: number; lat: number } | null {
  const stop = chapter.stopId ? stops.find((item) => item.id === chapter.stopId) : undefined;
  const lng = chapter.lng ?? stop?.lng;
  const lat = chapter.lat ?? stop?.lat;

  return typeof lng === "number" && typeof lat === "number" && Number.isFinite(lng) && Number.isFinite(lat)
    ? { lng, lat }
    : null;
}

function toCameraOptions(chapter: MapChapter, center: { lng: number; lat: number }, duration: number): Record<string, unknown> {
  return {
    center: [center.lng, center.lat],
    zoom: chapter.zoom ?? CHAPTER_CAMERA_DEFAULTS.zoom,
    pitch: chapter.pitch ?? CHAPTER_CAMERA_DEFAULTS.pitch,
    bearing: chapter.bearing ?? CHAPTER_CAMERA_DEFAULTS.bearing,
    duration,
    curve: CHAPTER_CAMERA_DEFAULTS.curve,
  };
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
    analytics,
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
  const killSwitchActive = isKillSwitchActive();
  const killSwitchTelemetryFiredRef = React.useRef(false);
  const [staticImageFailed, setStaticImageFailed] = React.useState(false);

  React.useEffect(() => {
    if (!killSwitchActive || killSwitchTelemetryFiredRef.current || !analytics) return;
    killSwitchTelemetryFiredRef.current = true;
    void tryCapture(analytics, {
      name: "cinematic_kill_switch_triggered",
      distinctId: tripId ? `trip:${tripId}` : "anon-cinematic",
      properties: { reason: "manual", loadCount: 0, threshold: 0 },
    });
  }, [analytics, killSwitchActive, tripId]);

  React.useImperativeHandle(
    ref,
    () => ({
      flyTo({ chapter }) {
        if (effectiveMode !== "cinematic") {
          return;
        }

        const center = resolveChapterCoordinate(chapter, coordinateStops);
        if (!center) return;

        mapRef.current?.flyTo(toCameraOptions(chapter, center, chapter.duration ?? CHAPTER_CAMERA_DEFAULTS.duration));
      },
      jumpTo(chapter) {
        const center = resolveChapterCoordinate(chapter, coordinateStops);
        if (!center) return;

        const options = { ...toCameraOptions(chapter, center, 0), animate: false };
        const map = mapRef.current;
        if (map?.jumpTo) {
          map.jumpTo(options);
          return;
        }

        map?.flyTo(options);
      },
    }),
    [coordinateStops, effectiveMode],
  );

  React.useEffect(() => {
    if (!token || coordinateStops.length === 0 || killSwitchActive) {
      return;
    }

    let isMounted = true;
    let mapInstance: MapboxMap | null = null;
    let activeMarkers: MapboxMarker[] = [];

    async function mount(): Promise<void> {
      if (!token || !containerRef.current) return;

      const { mountMapbox, prewarmMapbox } = await import("./mount-provider");

      if (!isMounted || !containerRef.current) return;

      await prewarmMapbox();

      if (!isMounted || !containerRef.current) return;

      const result = await mountMapbox({
        container: containerRef.current,
        token,
        stops: coordinateStops.map(({ id, label, lng, lat }) => ({ id, label, lng, lat })),
        mode: effectiveMode,
        cameraDefaults: CHAPTER_CAMERA_DEFAULTS,
        style: CINEMATIC_STYLE,
        terrain: TERRAIN_CONFIG,
        fog: FOG_CONFIG,
        onLoad,
      });

      if (!result || !isMounted) {
        result?.markers.forEach((marker) => marker.remove());
        result?.map.remove();
        return;
      }

      mapInstance = result.map;
      activeMarkers = result.markers;
      mapRef.current = mapInstance;
      markersRef.current = activeMarkers;
    }

    void mount();

    return () => {
      isMounted = false;
      activeMarkers.forEach((marker) => marker.remove());
      markersRef.current = [];
      mapInstance?.remove();
      mapRef.current = null;
    };
  }, [coordinateStops, effectiveMode, killSwitchActive, onLoad, token]);

  if (!token || coordinateStops.length === 0) {
    return <SchematicMap selectedDayId={selectedDayId} days={toSchematicDays(days)} warnings={warnings} className={className} {...props}>{children}</SchematicMap>;
  }

  if (killSwitchActive) {
    const staticUrl = getStaticImageUrl(coordinateStops);
    const showImage = staticUrl !== null && !staticImageFailed;
    return (
      <div
        data-testid="static-map-placeholder"
        data-static-fallback={showImage ? "image" : "schematic"}
        className={`relative flex h-[600px] w-full overflow-hidden rounded-[32px] border border-[var(--color-border)] bg-[rgba(247,250,249,0.96)] shadow-[0_24px_60px_rgba(7,17,19,0.06)] ${className ?? ""}`}
        {...props}
      >
        {showImage ? (
          <img
            src={staticUrl}
            alt={`Static map preview for ${tripId ?? "trip"}`}
            className="absolute inset-0 h-full w-full object-cover"
            onError={() => setStaticImageFailed(true)}
          />
        ) : (
          <div
            data-static-schematic=""
            aria-label={`Static map preview for ${tripId ?? "trip"}`}
            role="img"
            className="absolute inset-0 h-full w-full"
            style={{
              background:
                "radial-gradient(120% 80% at 50% 35%, var(--color-aqua, #cfeae3) 0%, var(--color-cream, #f3ede1) 55%, var(--color-paper, #f7faf9) 100%)",
            }}
          />
        )}
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
