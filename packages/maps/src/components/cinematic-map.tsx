"use client";

import * as React from "react";
import { tryCapture, type AnalyticsProvider } from "@repo/analytics";
import { cameraForChapter, type ChapterCameraTarget } from "../chapter-mapping";
import { getMapStaticImageUrl } from "../provider";
import { ProviderMap, type MapDayLayer, type ProviderMapHandle } from "./provider-map";

type ChapterChangeSource = "scroll" | "click" | "keyboard" | "deep-link";
type ViewportBucket = "mobile" | "tablet" | "desktop";

export interface CinematicMapProps {
  chapters: ChapterCameraTarget[];
  activeChapterId: string;
  tripId: string;
  reducedMotion: boolean;
  onChapterChange?: (chapterId: string, source: ChapterChangeSource) => void;
  className?: string;
  analytics?: AnalyticsProvider;
  onTilesLoaded?: (callback: (tilesLoaded: number) => void) => void;
}

function hasCoords(chapter: ChapterCameraTarget): boolean {
  return Number.isFinite(chapter.center[0]) && Number.isFinite(chapter.center[1]);
}

function viewportBucket(): ViewportBucket {
  if (typeof window === "undefined") return "desktop";
  if (window.innerWidth < 768) return "mobile";
  if (window.innerWidth < 1024) return "tablet";
  return "desktop";
}

function staticImageUrl(chapters: ChapterCameraTarget[]): string | null {
  const first = chapters.find(hasCoords);
  const [lng, lat] = first?.center ?? [-9.1393, 38.7223];
  const zoom = first?.zoom ?? 8;
  return getMapStaticImageUrl({ lng, lat, zoom });
}

function daysFromChapters(chapters: ChapterCameraTarget[]): MapDayLayer[] {
  return [
    {
      id: "cinematic",
      title: "Cinematic route",
      stops: chapters.map((chapter, index) => ({
        id: chapter.id,
        label: chapter.id,
        lng: chapter.center[0],
        lat: chapter.center[1],
        x: 18 + ((index * 19) % 64),
        y: 22 + ((index * 17) % 56),
      })),
    },
  ];
}

function toMapChapter(chapter: ChapterCameraTarget): { chapter: { lng: number; lat: number; zoom?: number; pitch?: number; bearing?: number; duration?: number } } {
  return {
    chapter: {
      lng: chapter.center[0],
      lat: chapter.center[1],
      zoom: chapter.zoom,
      pitch: chapter.pitch,
      bearing: chapter.bearing,
      duration: chapter.duration,
    },
  };
}

export function CinematicMap({
  chapters,
  activeChapterId,
  tripId,
  reducedMotion,
  onChapterChange: _onChapterChange,
  className,
  analytics,
  onTilesLoaded,
}: CinematicMapProps): React.ReactElement {
  const [staticImageFailed, setStaticImageFailed] = React.useState(false);
  const [isVisible, setIsVisible] = React.useState(false);
  const sentinelRef = React.useRef<HTMLDivElement | null>(null);
  const mapRef = React.useRef<ProviderMapHandle | null>(null);
  const loadStartedAtRef = React.useRef(0);

  React.useEffect(() => {
    const node = sentinelRef.current;
    if (!node) return;
    if (typeof IntersectionObserver === "undefined") {
      setIsVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { rootMargin: "100px" },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  React.useEffect(() => {
    if (!isVisible) return;
    loadStartedAtRef.current = typeof performance === "undefined" ? Date.now() : performance.now();
    if (!analytics) return;

    void tryCapture(analytics, {
      name: "cinematic_map_lazy_mounted",
      distinctId: `trip:${tripId}`,
      properties: { tripId, viewport: viewportBucket(), hasCoords: chapters.some(hasCoords) },
    });
  }, [analytics, chapters, isVisible, tripId]);

  React.useEffect(() => {
    if (!isVisible) return undefined;
    return onTilesLoaded?.((tilesLoaded) => {
      if (!analytics) return;
      const now = typeof performance === "undefined" ? Date.now() : performance.now();
      void tryCapture(analytics, {
        name: "cinematic_map_load_completed",
        distinctId: `trip:${tripId}`,
        properties: { tripId, durationMs: Math.max(0, Math.round(now - loadStartedAtRef.current)), tilesLoaded },
      });
    });
  }, [analytics, isVisible, onTilesLoaded, tripId]);

  React.useEffect(() => {
    if (!isVisible) return;
    const chapter = chapters.find((item) => item.id === activeChapterId);
    if (!chapter) return;

    const target = cameraForChapter(chapter);
    const handle = mapRef.current;
    if (!handle) return;

    if (reducedMotion && handle.jumpTo) {
      handle.jumpTo(toMapChapter(target).chapter);
      return;
    }

    handle.flyTo(toMapChapter(target));
  }, [activeChapterId, chapters, isVisible, reducedMotion]);

  if (!isVisible) {
    const url = staticImageUrl(chapters);
    const showSchematic = url === null || staticImageFailed;
    return (
      <div ref={sentinelRef} className={className} data-static-fallback={showSchematic ? "schematic" : "image"}>
        {showSchematic ? (
          <div
            data-static-placeholder=""
            data-static-schematic=""
            role="img"
            aria-label={`Static map preview for ${tripId}`}
            className="h-[600px] w-full overflow-hidden rounded-[32px] border border-[var(--color-border)]"
            style={{
              background:
                "radial-gradient(120% 80% at 50% 35%, var(--color-aqua, #cfeae3) 0%, var(--color-cream, #f3ede1) 55%, var(--color-paper, #f7faf9) 100%)",
            }}
            suppressHydrationWarning
          />
        ) : (
          <img
            src={url}
            data-static-placeholder=""
            loading="lazy"
            alt={`Static map preview for ${tripId}`}
            onError={() => setStaticImageFailed(true)}
            suppressHydrationWarning
          />
        )}
      </div>
    );
  }

  return <ProviderMap ref={mapRef} days={daysFromChapters(chapters)} mode="cinematic" tripId={tripId} analytics={analytics} className={className} />;
}

export type { ChapterCameraTarget };
