"use client";

/**
 * CinematicMapSection — scroll-driven chapter surface for the trip
 * detail page. Phase 1e migration: this file used to render
 * `<CinematicMap>` from `@repo/maps` (Mapbox). It now renders
 * `<WorkspaceTripCanvas>` from the local `_components` folder,
 * which is a thin wrapper around `@repo/spatial-engine`'s
 * `WorkspaceCanvas` (MapLibre).
 *
 * The section still owns:
 *   - the `useScroll` integration that maps progress to chapters
 *   - the `ChapterNav` dots + `<AnimatePresence>` caption
 *   - the `?chapter=` deep-link URL sync + `cinematic_chapter_activated`
 *     analytics event
 *
 * What changed:
 *   - `<CinematicMap>` is gone, replaced by `<WorkspaceTripCanvas>`
 *     with an imperative `flyTo`/`jumpTo` handle.
 *   - The kill-switch (`MAPBOX_KILL_SWITCH=1`,
 *     `NEXT_PUBLIC_MAPBOX_KILL_SWITCH=1`) is gone — the spatial
 *     engine has no equivalent failure mode; CARTO basemaps are
 *     open data.
 *   - `cinematic_map_lazy_mounted` and `cinematic_map_load_completed`
 *     events are gone; the spatial engine fires its own
 *     `spatial_engine_mounted` event from inside the canvas.
 *   - The `isMapProviderEnabled()` token gate is gone — no token
 *     is required to render the spatial engine.
 */

import * as React from "react";
import { ChapterNav } from "@repo/ui/components/chapter-nav";
import { useReducedMotion } from "@repo/ui/hooks/use-reduced-motion";
import { m, AnimatePresence, useScroll } from "motion/react";
import type { TripDay } from "@repo/types";

import {
  progressToActiveIndex,
  stopsToChapters,
  type ChapterCameraTarget
} from "../_lib/chapter-mapping";
import WorkspaceTripCanvas, {
  type WorkspaceTripCanvasHandle
} from "./workspace-trip-canvas";
import {
  useFilmstripSourceSync,
  type FilmstripStopForMap
} from "@/lib/hooks/useFilmstripSourceSync";
import {
  useTargetCoordinatesCameraSync
} from "@/lib/hooks/useTargetCoordinatesCameraSync";
import { useMapStore } from "@/store/useMapStore";

type ChapterActivationSource = "scroll" | "click" | "keyboard" | "deep-link";

const ACTIVE_PROGRESS_START = 0.05;
const ACTIVE_PROGRESS_END = 0.95;

function parseChapterIndex(search: string, chapterCount: number): number {
  if (chapterCount <= 0) return -1;

  const rawChapter = new URLSearchParams(search).get("chapter");
  if (rawChapter === null) return -1;

  const chapterNumber = Number(rawChapter);
  if (!Number.isInteger(chapterNumber)) return -1;

  const index = chapterNumber - 1;
  return index >= 0 && index < chapterCount ? index : -1;
}

export function StaticFallback({ days: _days }: { days: TripDay[] }) {
  return (
    <div
      data-testid="static-fallback-svg"
      className="flex flex-col items-center justify-center h-full bg-muted/30 rounded-lg"
    >
      <svg
        width="64"
        height="64"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="text-muted-foreground/50"
      >
        <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
        <circle cx="12" cy="10" r="3" />
      </svg>
      <p className="text-sm text-muted-foreground mt-2">Map preview unavailable for this trip</p>
    </div>
  );
}

interface CinematicMapSectionProps {
  days: TripDay[];
  tripId: string;
  reducedMotion: boolean;
  selectedDayIndex?: number;
  /**
   * Optional filmstrip stops. When provided, the section subscribes
   * to `useMapStore.activeStopId` and pushes a single-point
   * GeoJSON feature collection to the map's `stops` source so
   * clicking a filmstrip card highlights the corresponding point.
   * The hook is a no-op when the stops have no coordinates — the
   * wiring is in place for when stop coordinates land in the
   * trip brief / itinerary data shape.
   */
  filmstripStops?: readonly FilmstripStopForMap[];
}

/**
 * Renamed to `WorkspaceTripCanvasSection` to reflect the new
 * spatial-engine surface. The default export keeps the legacy
 * name so the page (which imports it as `CinematicMapSection`)
 * doesn't need a coordinated edit.
 */
export default function CinematicMapSection({
  days,
  tripId,
  reducedMotion,
  selectedDayIndex,
  filmstripStops
}: CinematicMapSectionProps) {
  // Hooks must be called unconditionally (React rules)
  const chapters = React.useMemo<ChapterCameraTarget[]>(
    () => stopsToChapters(days),
    [days]
  );

  // Wire the filmstrip's `useMapStore.activeStopId` to the map's
  // `stops` GeoJSON source. Subscribes via the high-frequency
  // Zustand path so the highlight tracks the click without
  // triggering React re-renders. No-op when stops have no
  // coordinates (the trip brief data shape doesn't carry them
  // today; the hook will activate the moment coordinates land).
  useFilmstripSourceSync(filmstripStops ?? []);
  const sectionRef = React.useRef<HTMLDivElement>(null);
  const reducedMotionPreference = useReducedMotion();
  const effectiveReducedMotion = reducedMotion || reducedMotionPreference;
  const lastSourceRef = React.useRef<ChapterActivationSource>("scroll");
  const previousActiveChapterIdRef = React.useRef<string | null>(null);
  const canvasRef = React.useRef<WorkspaceTripCanvasHandle | null>(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"]
  });
  const [activeChapterId, setActiveChapterId] = React.useState<string>(
    chapters.find((chapter) => selectedDayIndex === undefined || chapter.id.startsWith(`day-${selectedDayIndex}-`))?.id ?? chapters[0]?.id ?? ""
  );

  React.useEffect(() => {
    if (selectedDayIndex === undefined) return;
    const dayChapter = chapters.find((chapter) => chapter.id.startsWith(`day-${selectedDayIndex}-`));
    if (dayChapter) {
      lastSourceRef.current = "deep-link";
      setActiveChapterId(dayChapter.id);
    }
  }, [chapters, selectedDayIndex]);

  React.useEffect(() => {
    const firstChapterId = chapters[0]?.id ?? "";
    setActiveChapterId((currentId) =>
      chapters.some((chapter) => chapter.id === currentId) ? currentId : firstChapterId
    );
  }, [chapters]);

  React.useEffect(() => {
    if (typeof window === "undefined") return;

    const chapterIndex = parseChapterIndex(window.location.search, chapters.length);
    const chapterId = chapterIndex >= 0 ? chapters[chapterIndex]?.id : undefined;
    if (!chapterId) return;

    lastSourceRef.current = "deep-link";
    setActiveChapterId(chapterId);

    // T14: Focus section on valid deep-link mount without stealing focus otherwise
    sectionRef.current?.focus({ preventScroll: true });
  }, [chapters]);

  React.useEffect(() => {
    if (effectiveReducedMotion || chapters.length === 0) return;

    return scrollYProgress.on("change", (progress: number) => {
      if (progress < ACTIVE_PROGRESS_START || progress > ACTIVE_PROGRESS_END) {
        if (typeof window !== "undefined") {
          const nextUrl = new URL(window.location.href);
          if (nextUrl.searchParams.has("chapter")) {
            nextUrl.searchParams.delete("chapter");
            window.history.replaceState(
              null,
              "",
              `${nextUrl.pathname}${nextUrl.search}${nextUrl.hash}`
            );
          }
        }
        return;
      }

      const lifecycleProgress = Math.min(
        ACTIVE_PROGRESS_END,
        Math.max(ACTIVE_PROGRESS_START, progress)
      );
      const activeProgress =
        (lifecycleProgress - ACTIVE_PROGRESS_START) /
        (ACTIVE_PROGRESS_END - ACTIVE_PROGRESS_START);
      const activeIndex = progressToActiveIndex(activeProgress, chapters.length);
      const chapterId = activeIndex >= 0 ? chapters[activeIndex]?.id : undefined;
      if (!chapterId) return;

      setActiveChapterId((currentId) => {
        if (currentId === chapterId) return currentId;
        lastSourceRef.current = "scroll";
        return chapterId;
      });
    });
  }, [chapters, effectiveReducedMotion, scrollYProgress]);

  React.useEffect(() => {
    if (typeof window === "undefined") return;

    const activeIndex = chapters.findIndex((chapter) => chapter.id === activeChapterId);
    if (activeIndex === -1) return;
    if (previousActiveChapterIdRef.current === activeChapterId) return;
    if (previousActiveChapterIdRef.current === null) {
      previousActiveChapterIdRef.current = activeChapterId;
      return;
    }

    previousActiveChapterIdRef.current = activeChapterId;

    const nextUrl = new URL(window.location.href);
    nextUrl.searchParams.set("chapter", String(activeIndex + 1));
    window.history.replaceState(
      null,
      "",
      `${nextUrl.pathname}${nextUrl.search}${nextUrl.hash}`
    );

    const source = lastSourceRef.current;
    // The spatial engine emits its own mount event so the only
    // thing the section still fires is the
    // `cinematic_chapter_activated` beat, which keeps the same
    // event name + property shape as the Mapbox-era code.
    import("@repo/analytics").then(({ resolveDefaultAnalyticsProvider, tryCapture }) => {
      const provider = resolveDefaultAnalyticsProvider();
      void tryCapture(provider, {
        name: "cinematic_chapter_activated",
        distinctId: `trip:${tripId}`,
        properties: {
          tripId,
          chapterIndex: activeIndex,
          source
        }
      });
    });
    lastSourceRef.current = "scroll";
  }, [activeChapterId, chapters, tripId]);

  // Drive the camera imperatively when the active chapter
  // changes. The first time around the canvas has already
  // landed on the chapter via `initialFocus`; for subsequent
  // changes we use the imperative handle so the engine stays
  // mounted and the camera glides chapter-to-chapter.
  React.useEffect(() => {
    if (chapters.length === 0) return;
    const activeChapter = chapters.find((chapter) => chapter.id === activeChapterId);
    if (!activeChapter) return;

    const handle = canvasRef.current;
    if (!handle) return;

    if (effectiveReducedMotion) {
      handle.jumpTo({ chapter: activeChapter });
    } else {
      void handle.flyTo({ chapter: activeChapter });
    }
  }, [activeChapterId, chapters, effectiveReducedMotion]);

  // Bridge `useMapStore.targetCoordinates` (set by the bento
  // destination grid on the home page and by filmstrip card
  // clicks on this page) into a camera flight. The
  // race-safety + sentinel guards live in the hook so they
  // can be unit-tested in isolation.
  useTargetCoordinatesCameraSync(() => canvasRef.current);

  // Stitch 1.4 — pace & tone drive a camera settle so the
  // workspace canvas visually reacts to the segmented control.
  // Active zooms in +0.6, Relaxed zooms out -0.6 (clamped by
  // MapLibre). Hidden Gems tilts the camera 35° (more 3D),
  // Classics flattens to 0°. The flight uses the active
  // chapter's center so the camera doesn't drift toward the
  // origin when the user scrolls. Suppressed under
  // `reducedMotion` — matching the workspace-canvas-client
  // pattern.
  const paceTone = useMapStore((s) => s.paceTone);
  const paceToneChapter = React.useMemo(
    () => chapters.find((c) => c.id === activeChapterId) ?? chapters[0],
    [chapters, activeChapterId]
  );
  // Suppress the camera flight on the first mount — the workspace
  // canvas client has the same trade-off but the trip page lands
  // here on chapter scroll-in, where the user can see the flight.
  // We only fire the effect on subsequent pace/tone changes that
  // match a user click.
  const isFirstPaceToneRef = React.useRef(true);
  React.useEffect(() => {
    if (effectiveReducedMotion) return;
    if (!paceToneChapter) return;
    if (isFirstPaceToneRef.current) {
      isFirstPaceToneRef.current = false;
      return;
    }
    const handle = canvasRef.current;
    if (!handle) return;
    const zoomOffset = paceTone.pace === "Active" ? 0.6 : -0.6;
    const targetPitch = paceTone.tone === "Hidden Gems" ? 35 : 0;
    void handle.flyTo({
      chapter: {
        id: paceToneChapter.id,
        center: paceToneChapter.center,
        zoom: paceToneChapter.zoom + zoomOffset,
        pitch: targetPitch,
        duration: 800
      }
    });
  }, [paceTone, effectiveReducedMotion, paceToneChapter]);

  const scrollToChapter = React.useCallback(
    (chapterIndex: number, source: "click" | "keyboard"): void => {
      if (chapterIndex < 0 || chapterIndex >= chapters.length) return;

      const targetChapterId = chapters[chapterIndex]?.id;
      if (!targetChapterId) return;

      lastSourceRef.current = source;
      setActiveChapterId(targetChapterId);

      const section = sectionRef.current;
      if (!section || typeof window === "undefined") return;

      const sectionTop = section.getBoundingClientRect().top + window.scrollY;
      const progress = chapters.length <= 1 ? 0 : chapterIndex / (chapters.length - 1);
      const targetProgress =
        ACTIVE_PROGRESS_START + progress * (ACTIVE_PROGRESS_END - ACTIVE_PROGRESS_START);
      window.scrollTo({
        top:
          sectionTop -
          window.innerHeight +
          (section.offsetHeight + window.innerHeight) * targetProgress,
        behavior: effectiveReducedMotion ? "auto" : "smooth"
      });
    },
    [chapters, effectiveReducedMotion]
  );

  const handleChapterSelect = React.useCallback(
    (id: string, source: "click" | "keyboard"): void => {
      const chapterIndex = chapters.findIndex((chapter) => chapter.id === id);
      scrollToChapter(chapterIndex, source);
    },
    [chapters, scrollToChapter]
  );

  const handleKeyDown = React.useCallback(
    (e: React.KeyboardEvent<HTMLElement>) => {
      if (chapters.length === 0) return;

      const currentIndex = chapters.findIndex((c: ChapterCameraTarget) => c.id === activeChapterId);
      let targetIndex = currentIndex !== -1 ? currentIndex : 0;
      let handled = false;

      switch (e.key) {
        case "ArrowDown":
        case "ArrowRight":
          targetIndex = Math.min(targetIndex + 1, chapters.length - 1);
          handled = true;
          break;
        case "ArrowUp":
        case "ArrowLeft":
          targetIndex = Math.max(targetIndex - 1, 0);
          handled = true;
          break;
        case "Home":
          targetIndex = 0;
          handled = true;
          break;
        case "End":
          targetIndex = chapters.length - 1;
          handled = true;
          break;
        case "PageDown":
          targetIndex = Math.min(targetIndex + 3, chapters.length - 1);
          handled = true;
          break;
        case "PageUp":
          targetIndex = Math.max(targetIndex - 3, 0);
          handled = true;
          break;
      }

      if (handled) {
        e.preventDefault();
        // T14: section-level keys; ChapterNav has its own keys (T17); deep-link + URL + analytics owned by T13
        scrollToChapter(targetIndex, "keyboard");
      }
    },
    [activeChapterId, chapters, scrollToChapter]
  );

  if (chapters.length === 0) {
    return (
      <div
        ref={sectionRef}
        className="relative w-full h-[60vh] md:h-[70vh]"
        style={{ position: "relative" }}
      >
        <section
          role="region"
          aria-label="Cinematic trip map"
          tabIndex={-1}
          className="h-full w-full"
        >
          <StaticFallback days={days} />
        </section>
      </div>
    );
  }

  const activeChapter = chapters.find((c: ChapterCameraTarget) => c.id === activeChapterId) || chapters[0];

  const dayMatch = activeChapter?.id?.match(/day-(\d+)-/);
  const dayDisplay = dayMatch && dayMatch[1] ? `Day ${parseInt(dayMatch[1], 10)}` : "";
  const activeDayIndex = dayMatch && dayMatch[1] ? parseInt(dayMatch[1], 10) : selectedDayIndex ?? 1;
  const activeDay = days.find((day) => day.dayIndex === activeDayIndex) ?? days[0];

  return (
    <div
      ref={sectionRef}
      className="relative w-full h-[60vh] md:h-[70vh]"
      style={{ position: "relative" }}
    >
      <section
        role="region"
        aria-label="Cinematic trip map"
        data-testid="trip-map-route"
        tabIndex={-1}
        onKeyDown={handleKeyDown}
        className="h-full w-full sticky top-[var(--header-h,0)]"
      >
        <WorkspaceTripCanvas
          ref={canvasRef}
          tripId={tripId}
          chapters={chapters}
          activeChapterId={activeChapterId}
          reducedMotion={effectiveReducedMotion}
          onChapterChange={(id: string) => {
            lastSourceRef.current = "scroll";
            setActiveChapterId(id);
          }}
          className="absolute inset-0"
        />

        <ChapterNav
          chapters={chapters.map((c: ChapterCameraTarget) => ({ id: c.id, label: c.title ?? "" }))}
          activeChapterId={activeChapterId}
          onSelect={handleChapterSelect}
          className="absolute right-4 top-4 hidden md:flex"
        />

        <div className="absolute left-4 top-4 flex flex-wrap gap-2" aria-label="Map filters">
          <button type="button" className="rounded-full bg-background/90 px-3 py-2 text-xs font-medium shadow-sm" aria-label="Selected day">{dayDisplay || "Today"}</button>
          <button type="button" className="rounded-full bg-background/90 px-3 py-2 text-xs font-medium shadow-sm" aria-label="Transport filter">Transport</button>
          <button type="button" className="rounded-full bg-background/90 px-3 py-2 text-xs font-medium shadow-sm" aria-label="Route layers filter">Route layers</button>
        </div>

        <ol aria-label="Stops on map" className="absolute right-4 bottom-4 max-h-48 w-[min(20rem,calc(100%-2rem))] overflow-auto rounded-xl bg-background/90 p-3 text-sm shadow-lg">
          {(activeDay?.stops ?? []).map((stop, index) => {
            const stopId = `day-${activeDay?.dayIndex}-${index}`;
            const coordinates = typeof stop === "string" || stop.lng === undefined || stop.lat === undefined ? undefined : ([stop.lng, stop.lat] as const);
            return <li key={`${activeDay?.dayIndex}-${index}`} className="border-b border-black/10 py-2 last:border-0"><button type="button" className="w-full text-left" disabled={!coordinates} onClick={() => coordinates && useMapStore.getState().selectStop(stopId, coordinates)}>{typeof stop === "string" ? stop : stop.placeName}</button></li>;
          })}
        </ol>

        <div className="absolute left-4 bottom-4 pointer-events-none">
          {effectiveReducedMotion ? (
            <div
              data-testid="chapter-caption"
              className="bg-background/80 backdrop-blur-md px-4 py-2 rounded-lg shadow-sm border"
            >
              <div className="text-xs text-muted-foreground font-medium uppercase tracking-wider">
                {dayDisplay}
              </div>
              <div className="text-lg font-semibold">{activeChapter?.title}</div>
            </div>
          ) : (
            <AnimatePresence mode="wait">
              <m.div
                key={activeChapterId}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.3 }}
                data-testid="chapter-caption"
                className="bg-background/80 backdrop-blur-md px-4 py-2 rounded-lg shadow-sm border"
              >
                <div className="text-xs text-muted-foreground font-medium uppercase tracking-wider">
                  {dayDisplay}
                </div>
                <div className="text-lg font-semibold">{activeChapter?.title}</div>
              </m.div>
            </AnimatePresence>
          )}
        </div>
      </section>
    </div>
  );
}
