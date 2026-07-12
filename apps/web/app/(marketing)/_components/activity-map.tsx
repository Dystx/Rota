"use client";

import * as React from "react";
import {
  WorkspaceCanvas,
  type WorkspaceCanvasHandle,
  type SpatialFeatureCollection
} from "@repo/spatial-engine";
import { useReducedMotion } from "@repo/ui";

import {
  buildActivityMapModel,
  createActivityMapViewState,
  getActivityMapBounds,
  type ActivityMapInput,
  type ActivityMapModel
} from "./activity-map-model";
import { ActivityMapFallback } from "./activity-map-fallback";

export interface ActivityMapProps {
  /** The selected day, not the entire Portugal catalogue. */
  activities: readonly ActivityMapInput[];
  /** Controlled focus; the map never owns itinerary truth. */
  selectedActivityId: string | null;
  onSelectActivity: (activityId: string) => void;
  onClose?: () => void;
}

type MapViewport = {
  center: [number, number];
  zoom: number;
  pitch: number;
  bearing: number;
};

function cameraFocus(
  canvas: WorkspaceCanvasHandle | null,
  point: { coordinates: { lng: number; lat: number } },
  reducedMotion: boolean
) {
  if (!canvas) return;
  const target = {
    center: [point.coordinates.lng, point.coordinates.lat] as [number, number],
    zoom: 11.5,
    pitch: 0,
    bearing: 0,
    duration: reducedMotion ? 0 : 500
  };
  if (reducedMotion) {
    canvas.jumpTo?.(target);
  } else {
    if (typeof canvas.flyTo === "function") void canvas.flyTo(target);
  }
}

function MapAttribution() {
  return (
    <p data-map-attribution="true" className="text-xs leading-relaxed text-on-surface-variant">
      Basemap attribution: <a className="underline underline-offset-2" href="https://www.openstreetmap.org/copyright" target="_blank" rel="noreferrer">© OpenStreetMap contributors</a> · <a className="underline underline-offset-2" href="https://carto.com/attributions" target="_blank" rel="noreferrer">CARTO</a>. Activity locations are reviewed public-area approximations where labelled.
    </p>
  );
}

function MapControls({
  onClose,
  onFit,
  onResetNorth,
  onZoomIn,
  onZoomOut,
  onRetry
}: {
  onClose: () => void;
  onFit: () => void;
  onResetNorth: () => void;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onRetry?: () => void;
}) {
  return (
    <div className="flex flex-wrap gap-2" role="toolbar" aria-label="Activity map controls">
      <button type="button" onClick={onClose} className="min-h-11 rounded-full border border-[var(--color-border)] bg-linen px-4 py-2 text-sm font-medium text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ochre-light">View list</button>
      <button type="button" onClick={onFit} className="min-h-11 rounded-full border border-[var(--color-border)] bg-linen px-4 py-2 text-sm font-medium text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ochre-light">Fit this day</button>
      <button type="button" onClick={onResetNorth} className="min-h-11 rounded-full border border-[var(--color-border)] bg-linen px-4 py-2 text-sm font-medium text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ochre-light">Reset north</button>
      <button type="button" onClick={onZoomIn} aria-label="Zoom in" className="min-h-11 min-w-11 rounded-full border border-[var(--color-border)] bg-linen px-3 py-2 text-lg font-medium text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ochre-light">+</button>
      <button type="button" onClick={onZoomOut} aria-label="Zoom out" className="min-h-11 min-w-11 rounded-full border border-[var(--color-border)] bg-linen px-3 py-2 text-lg font-medium text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ochre-light">−</button>
      {onRetry ? <button type="button" onClick={onRetry} className="min-h-11 rounded-full border border-ochre-dark bg-linen px-4 py-2 text-sm font-medium text-ochre-dark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ochre-light">Retry map</button> : null}
    </div>
  );
}

function ActivityMapSurface({
  model,
  selectedActivityId,
  onSelectActivity,
  onClose
}: {
  model: ActivityMapModel;
  selectedActivityId: string | null;
  onSelectActivity: (activityId: string) => void;
  onClose: () => void;
}) {
  const reducedMotion = useReducedMotion();
  const canvasRef = React.useRef<WorkspaceCanvasHandle | null>(null);
  const initialView = React.useMemo(() => createActivityMapViewState(model.points, reducedMotion), [model.points, reducedMotion]);
  const [viewport, setViewport] = React.useState<MapViewport>({
    center: initialView.center,
    zoom: initialView.zoom,
    pitch: initialView.pitch,
    bearing: initialView.bearing
  });
  const [mapError, setMapError] = React.useState<string | null>(null);
  const [retryKey, setRetryKey] = React.useState(0);
  const previousSelection = React.useRef<string | null | undefined>(undefined);
  const handleViewportChange = React.useCallback((next: { center: readonly [number, number]; zoom: number; pitch: number; bearing: number }) => {
    setViewport({
      center: [next.center[0], next.center[1]],
      zoom: next.zoom,
      pitch: next.pitch,
      bearing: next.bearing
    });
  }, []);

  const focusSelected = React.useCallback((activityId: string | null) => {
    if (!activityId) return;
    const point = model.byActivityId.get(activityId);
    if (!point) return;
    cameraFocus(canvasRef.current, point, reducedMotion);
    window.requestAnimationFrame(() => {
      document.getElementById(`activity-map-item-${activityId}`)?.focus();
    });
  }, [model.byActivityId, reducedMotion]);

  React.useEffect(() => {
    if (previousSelection.current === undefined) {
      previousSelection.current = selectedActivityId;
      return;
    }
    if (previousSelection.current !== selectedActivityId) focusSelected(selectedActivityId);
    previousSelection.current = selectedActivityId;
  }, [focusSelected, selectedActivityId]);

  const handleActivitySelect = React.useCallback((activityId: string) => {
    if (!model.list.some((item) => item.activityId === activityId)) return;
    onSelectActivity(activityId);
    const point = model.byActivityId.get(activityId);
    if (point) cameraFocus(canvasRef.current, point, reducedMotion);
    window.requestAnimationFrame(() => {
      document.getElementById(`activity-map-item-${activityId}`)?.focus();
    });
  }, [model.byActivityId, onSelectActivity, reducedMotion]);

  const handleFit = React.useCallback(() => {
    const bounds = getActivityMapBounds(model.points);
    if (!bounds || !canvasRef.current) return;
    void canvasRef.current.fitBounds(bounds);
  }, [model.points]);

  const handleZoom = React.useCallback((delta: number) => {
    const target = {
      center: viewport.center,
      zoom: Math.max(1, Math.min(18, viewport.zoom + delta)),
      pitch: 0,
      bearing: viewport.bearing,
      duration: reducedMotion ? 0 : 220
    };
    if (reducedMotion) canvasRef.current?.jumpTo(target);
    else void canvasRef.current?.flyTo(target);
  }, [reducedMotion, viewport]);

  const activityFeatures = model.features as unknown as SpatialFeatureCollection;
  return (
    <div data-map-phase="1" className="space-y-4">
      <MapControls
        onClose={onClose}
        onFit={handleFit}
        onResetNorth={() => canvasRef.current?.resetNorth()}
        onZoomIn={() => handleZoom(1)}
        onZoomOut={() => handleZoom(-1)}
        onRetry={mapError ? () => { setMapError(null); setRetryKey((key) => key + 1); } : undefined}
      />
      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(18rem,24rem)] lg:items-start">
        <div className="space-y-3">
          <div className="relative overflow-hidden rounded-2xl border border-[var(--color-border)] bg-linen-dark shadow-[0_24px_60px_rgba(7,17,19,0.06)]">
            <WorkspaceCanvas
              key={retryKey}
              ref={canvasRef}
              activityPoints={activityFeatures}
              selectedActivityId={selectedActivityId}
              showRoute={false}
              projection="mercator"
              initialCenter={initialView.center}
              initialZoom={initialView.zoom}
              disableIntro
              testId="activity-map-canvas"
              ariaLabel="Activity map of the selected day"
              className="relative h-[420px] w-full overflow-hidden focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ochre-light focus-visible:ring-offset-2 sm:h-[520px]"
              onViewportChange={handleViewportChange}
              onActivitySelect={handleActivitySelect}
              onMapError={setMapError}
            />
            {mapError ? (
              <div role="alert" className="absolute inset-x-4 top-4 rounded-xl border border-ochre-light bg-linen/95 px-4 py-3 text-sm text-on-surface shadow-sm">
                The interactive map could not load. The complete activity list remains below.
              </div>
            ) : null}
          </div>
          <MapAttribution />
        </div>
        <ActivityMapFallback
          model={model}
          selectedActivityId={selectedActivityId}
          onSelectActivity={handleActivitySelect}
          error={mapError}
          onRetry={mapError ? () => { setMapError(null); setRetryKey((key) => key + 1); } : undefined}
          compact
        />
      </div>
      <p role="status" aria-live="polite" className="sr-only">
        {selectedActivityId ? `Selected ${model.byActivityId.get(selectedActivityId)?.title ?? "activity"}.` : "Activity map ready."}
      </p>
    </div>
  );
}

export function ActivityMap({
  activities,
  selectedActivityId,
  onSelectActivity,
  onClose = () => undefined
}: ActivityMapProps) {
  const model = React.useMemo(() => buildActivityMapModel(activities), [activities]);
  const selected = model.list.some((item) => item.activityId === selectedActivityId)
    ? selectedActivityId
    : model.points[0]?.activityId ?? selectedActivityId;

  if (model.fallback.required || model.points.length === 0) {
    return (
      <section aria-label="Activity map" data-map-mode="fallback" className="space-y-4">
        <button type="button" onClick={onClose} className="min-h-11 rounded-full border border-[var(--color-border)] bg-linen px-4 py-2 text-sm font-medium text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ochre-light">View list</button>
        <ActivityMapFallback model={model} selectedActivityId={selected} onSelectActivity={onSelectActivity} />
      </section>
    );
  }

  return (
    <section aria-label="Activity map" data-map-mode="map" className="space-y-4">
      <p className="sr-only">{model.points.length} selected activities in {model.points[0]?.locality ?? "Portugal"}; the list beside this map contains the same stops.</p>
      <ActivityMapSurface
        model={model}
        selectedActivityId={selected}
        onSelectActivity={onSelectActivity}
        onClose={onClose}
      />
    </section>
  );
}
