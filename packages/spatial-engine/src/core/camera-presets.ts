import type { CameraTarget } from "./types";

export type CameraDayPart = "morning" | "afternoon" | "evening" | "other";

/** A persisted, renderer-neutral camera beat for an explicit plan preview. */
export interface CameraPreset {
  id: string;
  stopId: string;
  dayPart: CameraDayPart;
  label: string;
  center: [number, number];
  zoom: number;
  pitch: number;
  bearing: number;
  durationMs: number;
}

export interface CameraPresetStop {
  id: string;
  label: string;
  center?: readonly [number, number] | null;
  startTime?: string | null;
  camera?: Partial<Pick<CameraPreset, "zoom" | "pitch" | "bearing" | "durationMs">>;
}

export interface CameraPresetDefaults {
  zoom?: number;
  pitch?: number;
  bearing?: number;
  durationMs?: number;
}

function dayPartForTime(value: string | null | undefined): CameraDayPart {
  if (!value) return "other";
  const match = /^(\d{1,2})(?::\d{2})?/u.exec(value.trim());
  const hour = match ? Number(match[1]) : Number.NaN;
  if (!Number.isFinite(hour)) return "other";
  if (hour < 12) return "morning";
  if (hour < 18) return "afternoon";
  return "evening";
}

function validCenter(center: readonly [number, number] | null | undefined): center is [number, number] {
  return Boolean(
    center &&
      center.length === 2 &&
      Number.isFinite(center[0]) &&
      Number.isFinite(center[1]) &&
      center[0] >= -180 &&
      center[0] <= 180 &&
      center[1] >= -90 &&
      center[1] <= 90
  );
}

/**
 * Build explicit camera beats from reviewed stop data. Invalid or unresolved
 * stops are omitted rather than receiving guessed coordinates. The caller
 * remains responsible for keeping the full textual stop list visible.
 */
export function buildCameraPresets(
  stops: readonly CameraPresetStop[],
  defaults: CameraPresetDefaults = {}
): CameraPreset[] {
  const fallback = {
    zoom: defaults.zoom ?? 12,
    pitch: defaults.pitch ?? 0,
    bearing: defaults.bearing ?? 0,
    durationMs: defaults.durationMs ?? 900
  };

  return stops.flatMap((stop, index) => {
    if (!validCenter(stop.center) || !stop.id.trim()) return [];
    const camera = stop.camera ?? {};
    return [{
      id: `camera-${stop.id}-${index + 1}`,
      stopId: stop.id,
      dayPart: dayPartForTime(stop.startTime),
      label: stop.label.trim() || `Stop ${index + 1}`,
      center: [stop.center[0], stop.center[1]],
      zoom: camera.zoom ?? fallback.zoom,
      pitch: camera.pitch ?? fallback.pitch,
      bearing: camera.bearing ?? fallback.bearing,
      durationMs: camera.durationMs ?? fallback.durationMs
    } satisfies CameraPreset];
  });
}

export function cameraPresetTarget(preset: CameraPreset, reducedMotion = false): CameraTarget {
  return {
    center: preset.center,
    zoom: preset.zoom,
    pitch: preset.pitch,
    bearing: preset.bearing,
    duration: reducedMotion ? 0 : preset.durationMs
  };
}
