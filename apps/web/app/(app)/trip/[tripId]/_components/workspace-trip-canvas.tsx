"use client";

/**
 * WorkspaceTripCanvas — the spatial-engine surface for the trip
 * detail page's cinematic section.
 *
 * Replaces `@repo/maps/CinematicMap` (Mapbox-era) with a MapLibre
 * `WorkspaceCanvas` from `@repo/spatial-engine`. The component
 * accepts the same chapter inputs the section already produces
 * (`stopsToChapters(days)`), drives the camera via an imperative
 * handle so scroll-progress changes feel like the Mapbox `flyTo`,
 * and re-seeds the route layer when the underlying trip data
 * changes (so a specialist edit re-renders the line + stops
 * without remounting the engine).
 *
 * Architecture:
 *   1. `useTripRoute(tripId)` resolves the trip's
 *      `SpatialFeatureCollection` (one LineString + one Point per
 *      geocoded stop). Returns `null` when the trip doesn't exist
 *      or hasn't been geocoded yet — the consumer falls back to
 *      a static schematic in that case.
 *   2. `WorkspaceCanvas` (dynamic-imported) owns the MapLibre
 *      engine. The `routeFeatures` prop re-seeds the `trips`
 *      telemetry channel without remounting.
 *   3. `IntersectionObserverGate` defers engine mount until the
 *      user scrolls into the section, matching the previous
 *      Mapbox-era lazy-mount behaviour.
 *   4. The imperative handle returned by `forwardRef` lets the
 *      section's scroll listener `flyTo({ chapter.camera })`
 *      with the smooth Mapbox-style animation.
 */

import * as React from "react";
import dynamic from "next/dynamic";
import { useTripRoute } from "../_hooks/use-trip-route";
import type { ChapterCameraTarget } from "../_lib/chapter-mapping";
import { IntersectionObserverGate } from "./intersection-observer-gate";
import type { WorkspaceCanvasHandle } from "@repo/spatial-engine";

export interface WorkspaceTripCanvasProps {
  tripId: string;
  chapters: ChapterCameraTarget[];
  activeChapterId: string;
  reducedMotion: boolean;
  onChapterChange?: (chapterId: string, source: ChapterChangeSource) => void;
  className?: string;
}

export type ChapterChangeSource = "scroll" | "click" | "keyboard" | "deep-link";

/**
 * `WorkspaceTripCanvasHandle` — the imperative surface the section
 * uses to drive the camera. `flyTo` matches the Mapbox-era name;
 * `jumpTo` is the instant variant the section uses when the user
 * has `prefers-reduced-motion: reduce` enabled.
 */
export interface WorkspaceTripCanvasHandle {
  flyTo: (target: { chapter: ChapterCameraTarget }) => Promise<void>;
  jumpTo: (target: { chapter: ChapterCameraTarget }) => void;
}

const WorkspaceCanvas = dynamic(
  () => import("@repo/spatial-engine").then((mod) => mod.WorkspaceCanvas),
  {
    ssr: false,
    loading: () => <WorkspaceTripCanvasSkeleton />
  }
);

function WorkspaceTripCanvasSkeleton() {
  return (
    <div
      data-testid="trip-workspace-canvas-skeleton"
      className="h-full w-full bg-gradient-to-b from-linen-dark to-sage"
      aria-label="Loading trip map"
    />
  );
}

/**
 * Find the chapter that matches `activeChapterId`. Returns
 * `undefined` when the active id is no longer in the list — the
 * caller should fall back to the first chapter.
 */
function resolveActiveChapter(
  chapters: readonly ChapterCameraTarget[],
  activeChapterId: string
): ChapterCameraTarget | undefined {
  return chapters.find((chapter) => chapter.id === activeChapterId) ?? chapters[0];
}

/**
 * Convert a `ChapterCameraTarget` to a MapLibre `CameraTarget`.
 * `center` and `zoom` are required; `pitch`, `bearing`, and
 * `duration` are optional. Reduced-motion callers can pass
 * `duration: 0` for an instant jump.
 */
function chapterToCameraTarget(chapter: ChapterCameraTarget): {
  center: [number, number];
  zoom: number;
  pitch?: number;
  bearing?: number;
  duration?: number;
} {
  return {
    center: chapter.center,
    zoom: chapter.zoom,
    pitch: chapter.pitch,
    bearing: chapter.bearing,
    duration: chapter.duration
  };
}

export const WorkspaceTripCanvas = React.forwardRef<
  WorkspaceTripCanvasHandle,
  WorkspaceTripCanvasProps
>(function WorkspaceTripCanvas(
  { tripId, chapters, activeChapterId, reducedMotion, onChapterChange: _onChapterChange, className },
  ref
) {
  const canvasRef = React.useRef<WorkspaceCanvasHandle | null>(null);
  const { data: routeFeatures, isLoading, error } = useTripRoute(tripId);

  // Map `reducedMotion` (prop) to MapLibre's `duration: 0` so the
  // imperative calls below automatically jump instead of flying.
  const effectiveDuration = reducedMotion ? 0 : undefined;

  React.useImperativeHandle(
    ref,
    () => ({
      flyTo: async ({ chapter }) => {
        const handle = canvasRef.current;
        if (!handle) return;
        await handle.flyTo({
          ...chapterToCameraTarget(chapter),
          duration: chapter.duration ?? effectiveDuration ?? 2400
        });
      },
      jumpTo: ({ chapter }) => {
        const handle = canvasRef.current;
        if (!handle) return;
        handle.jumpTo({
          ...chapterToCameraTarget(chapter),
          duration: 0
        });
      }
    }),
    [effectiveDuration]
  );

  // Compute the initial camera target from the active chapter so
  // the canvas lands on the right stop on first mount. The
  // imperative handle takes over for subsequent changes — we
  // intentionally pass this only once and let the handle drive
  // the rest of the cinematic.
  const activeChapter = resolveActiveChapter(chapters, activeChapterId);
  const initialFocus = React.useMemo(() => {
    if (!activeChapter) return undefined;
    return {
      center: activeChapter.center,
      zoom: activeChapter.zoom,
      pitch: activeChapter.pitch,
      bearing: activeChapter.bearing
    };
  }, [activeChapter]);

  // Trip has no data at all (e.g. a specialist deleted it, or
  // geocoding failed for every stop). Fall back to the radial-
  // gradient schematic — the previous Mapbox-era behaviour
  // rendered a static image in this state, and the spatial
  // engine has no equivalent, so the schematic is the closest
  // graceful-degradation path.
  if (!isLoading && (error || routeFeatures === null) && chapters.length === 0) {
    return (
      <div
        data-testid="trip-workspace-canvas-frame"
        data-trip-id={tripId}
        data-mode="schematic"
        className={className}
      >
        <div
          data-static-schematic=""
          role="img"
          aria-label={`Route preview unavailable for ${tripId}`}
          className="h-[600px] w-full overflow-hidden rounded-[32px] border border-[var(--color-border)]"
          style={{
            background:
              "radial-gradient(120% 80% at 50% 35%, var(--color-aqua, #cfeae3) 0%, var(--color-cream, #f3ede1) 55%, var(--color-paper, #f7faf9) 100%)"
          }}
        />
      </div>
    );
  }

  return (
    <div
      data-testid="trip-workspace-canvas-frame"
      data-trip-id={tripId}
      data-mode="trip"
      className={className}
    >
      <IntersectionObserverGate
        rootMargin="100px"
        fallback={
          <div
            data-static-schematic=""
            data-static-placeholder=""
            role="img"
            aria-label={`Loading route preview for ${tripId}`}
            className="h-[600px] w-full overflow-hidden rounded-[32px] border border-[var(--color-border)]"
            style={{
              background:
                "radial-gradient(120% 80% at 50% 35%, var(--color-aqua, #cfeae3) 0%, var(--color-cream, #f3ede1) 55%, var(--color-paper, #f7faf9) 100%)"
            }}
            suppressHydrationWarning
          />
        }
      >
        <React.Suspense fallback={<WorkspaceTripCanvasSkeleton />}>
          <WorkspaceCanvas
            ref={canvasRef}
            className="h-[600px] w-full"
            testId="trip-workspace-canvas"
            initialFocus={initialFocus}
            routeFeatures={routeFeatures}
            disableIntro
          />
        </React.Suspense>
      </IntersectionObserverGate>
    </div>
  );
});

export default WorkspaceTripCanvas;
