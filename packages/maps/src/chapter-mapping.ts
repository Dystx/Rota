import { CHAPTER_CAMERA_DEFAULTS } from "./cinematic-config";

export type ChapterMappableStop = {
  stopName?: string;
  placeName?: string;
  lng?: number;
  lat?: number;
};

export type ChapterMappableDay = {
  dayIndex: number;
  stops: ChapterMappableStop[];
};

export type ChapterCameraTarget = {
  id: string;
  center: [number, number];
  zoom: number;
  pitch?: number;
  bearing?: number;
  duration?: number;
  title?: string;
};

type Chapter = {
  chapterIndex: number;
  stopName: string;
  lng?: number;
  lat?: number;
  dayIndex: number;
};

type CameraTarget = {
  zoom: number;
  pitch: number;
  bearing: number;
  duration: number;
  curve: number;
  center?: [number, number];
};

type CameraState = {
  zoom: number;
  pitch: number;
  bearing: number;
  lng: number;
  lat: number;
};

const CROSS_REGION_DISTANCE_KM = 200;
const CROSS_REGION_DURATION_MS = 3600;
const CROSS_REGION_CURVE = 1.76;

function toRadians(value: number): number {
  return (value * Math.PI) / 180;
}

function toDegrees(value: number): number {
  return (value * 180) / Math.PI;
}

function haversineDistanceKm(from: { lng: number; lat: number }, to: { lng: number; lat: number }): number {
  const earthRadiusKm = 6371;
  const deltaLat = toRadians(to.lat - from.lat);
  const deltaLng = toRadians(to.lng - from.lng);
  const lat1 = toRadians(from.lat);
  const lat2 = toRadians(to.lat);

  const a =
    Math.sin(deltaLat / 2) * Math.sin(deltaLat / 2) +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(deltaLng / 2) * Math.sin(deltaLng / 2);

  return 2 * earthRadiusKm * Math.asin(Math.min(1, Math.sqrt(a)));
}

function initialBearingDegrees(from: { lng: number; lat: number }, to: { lng: number; lat: number }): number {
  const deltaLng = toRadians(to.lng - from.lng);
  const lat1 = toRadians(from.lat);
  const lat2 = toRadians(to.lat);
  const y = Math.sin(deltaLng) * Math.cos(lat2);
  const x = Math.cos(lat1) * Math.sin(lat2) - Math.sin(lat1) * Math.cos(lat2) * Math.cos(deltaLng);
  return normalizeBearing(toDegrees(Math.atan2(y, x)));
}

function normalizeBearing(bearing: number): number {
  const normalized = bearing % 360;
  return normalized < 0 ? normalized + 360 : normalized;
}

export function stopsToChapters(days: readonly ChapterMappableDay[]): ChapterCameraTarget[] {
  const chapters: ChapterCameraTarget[] = [];

  for (const day of days) {
    let stopIndex = 0;
    for (const stop of day.stops) {
      if (stop.lng !== undefined && stop.lat !== undefined) {
        chapters.push({
          id: `day-${day.dayIndex}-stop-${stopIndex}`,
          center: [stop.lng, stop.lat],
          zoom: CHAPTER_CAMERA_DEFAULTS.zoom,
          title: stop.stopName || stop.placeName || 'Unknown Stop',
          pitch: CHAPTER_CAMERA_DEFAULTS.pitch,
          bearing: CHAPTER_CAMERA_DEFAULTS.bearing,
          duration: CHAPTER_CAMERA_DEFAULTS.duration,
        });
      }
      stopIndex++;
    }
  }

  return chapters;
}

export function cameraForChapter(chapter: ChapterCameraTarget): ChapterCameraTarget;
export function cameraForChapter(chapter: Chapter, prev?: Chapter): CameraTarget;
export function cameraForChapter(chapter: Chapter | ChapterCameraTarget, prev?: Chapter): CameraTarget | ChapterCameraTarget {
  if ("center" in chapter) {
    return {
      ...chapter,
      pitch: chapter.pitch ?? CHAPTER_CAMERA_DEFAULTS.pitch,
      bearing: chapter.bearing ?? CHAPTER_CAMERA_DEFAULTS.bearing,
      duration: chapter.duration ?? CHAPTER_CAMERA_DEFAULTS.duration,
    };
  }

  const center: [number, number] | undefined =
    chapter.lng !== undefined && chapter.lat !== undefined ? [chapter.lng, chapter.lat] : undefined;

  const baseCamera: CameraTarget = {
    zoom: CHAPTER_CAMERA_DEFAULTS.zoom,
    pitch: CHAPTER_CAMERA_DEFAULTS.pitch,
    bearing: CHAPTER_CAMERA_DEFAULTS.bearing,
    duration: CHAPTER_CAMERA_DEFAULTS.duration,
    curve: CHAPTER_CAMERA_DEFAULTS.curve,
    center,
  };

  if (
    prev?.lng !== undefined &&
    prev?.lat !== undefined &&
    chapter.lng !== undefined &&
    chapter.lat !== undefined
  ) {
    const distanceKm = haversineDistanceKm(
      { lng: prev.lng, lat: prev.lat },
      { lng: chapter.lng, lat: chapter.lat },
    );

    baseCamera.bearing = initialBearingDegrees({ lng: prev.lng, lat: prev.lat }, { lng: chapter.lng, lat: chapter.lat });

    if (distanceKm > CROSS_REGION_DISTANCE_KM) {
      baseCamera.duration = CROSS_REGION_DURATION_MS;
      baseCamera.curve = CROSS_REGION_CURVE;
    }
  }

  return baseCamera;
}

export function interpolateCamera(from: CameraState, to: CameraState, progress: number): CameraState {
  const clampedProgress = Math.min(1, Math.max(0, progress));
  const bearingDelta = ((to.bearing - from.bearing + 540) % 360) - 180;

  return {
    zoom: from.zoom + (to.zoom - from.zoom) * clampedProgress,
    pitch: from.pitch + (to.pitch - from.pitch) * clampedProgress,
    bearing: normalizeBearing(from.bearing + bearingDelta * clampedProgress),
    lng: from.lng + (to.lng - from.lng) * clampedProgress,
    lat: from.lat + (to.lat - from.lat) * clampedProgress,
  };
}

export function progressToActiveIndex(progress: number, count: number): number {
  if (count <= 0) return -1;
  if (count === 1) return 0;

  const clampedProgress = Math.min(1, Math.max(0, progress));
  return Math.min(count - 1, Math.floor(clampedProgress * count));
}
