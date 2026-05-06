"use client";

import * as React from "react";
import {
  CinematicMap,
  isKillSwitchActive,
  isMapProviderEnabled,
  progressToActiveIndex,
  stopsToChapters,
} from "@repo/maps";
import { resolveDefaultAnalyticsProvider, tryCapture } from "@repo/analytics";
import { ChapterNav } from "@repo/ui/components/chapter-nav";
import { useReducedMotion } from "@repo/ui/hooks/use-reduced-motion";
import { m, AnimatePresence, useScroll } from "motion/react";
import type { TripDay } from "@repo/types";

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

export function StaticFallback({ days }: { days: TripDay[] }) {
  return (
    <div data-testid="static-fallback-svg" className="flex flex-col items-center justify-center h-full bg-muted/30 rounded-lg">
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
}

export default function CinematicMapSection({ days, tripId, reducedMotion }: CinematicMapSectionProps) {
  const killSwitch = isKillSwitchActive();
  const mapEnabled = isMapProviderEnabled();
  const killSwitchTelemetryFiredRef = React.useRef(false);

  React.useEffect(() => {
    if (!killSwitch || killSwitchTelemetryFiredRef.current) return;
    killSwitchTelemetryFiredRef.current = true;
    const provider = resolveDefaultAnalyticsProvider();
    void tryCapture(provider, {
      name: "cinematic_kill_switch_triggered",
      distinctId: `trip:${tripId}`,
      properties: { reason: "manual", loadCount: 0, threshold: 0 },
    });
  }, [killSwitch, tripId]);

  // Hooks must be called unconditionally (React rules)
  const chapters = React.useMemo(() => stopsToChapters(days), [days]);
  const sectionRef = React.useRef<HTMLDivElement>(null);
  const reducedMotionPreference = useReducedMotion();
  const effectiveReducedMotion = reducedMotion || reducedMotionPreference;
  const lastSourceRef = React.useRef<ChapterActivationSource>("scroll");
  const previousActiveChapterIdRef = React.useRef<string | null>(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"],
  });
  const [activeChapterId, setActiveChapterId] = React.useState<string>(chapters[0]?.id ?? '');

  React.useEffect(() => {
    const firstChapterId = chapters[0]?.id ?? "";
    setActiveChapterId((currentId) => (chapters.some((chapter) => chapter.id === currentId) ? currentId : firstChapterId));
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
            window.history.replaceState(null, "", `${nextUrl.pathname}${nextUrl.search}${nextUrl.hash}`);
          }
        }
        return;
      }

      const lifecycleProgress = Math.min(ACTIVE_PROGRESS_END, Math.max(ACTIVE_PROGRESS_START, progress));
      const activeProgress =
        (lifecycleProgress - ACTIVE_PROGRESS_START) / (ACTIVE_PROGRESS_END - ACTIVE_PROGRESS_START);
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
    window.history.replaceState(null, "", `${nextUrl.pathname}${nextUrl.search}${nextUrl.hash}`);

    const source = lastSourceRef.current;
    const provider = resolveDefaultAnalyticsProvider();
    void tryCapture(provider, {
      name: "cinematic_chapter_activated",
      distinctId: `trip:${tripId}`,
      properties: {
        tripId,
        chapterIndex: activeIndex,
        source,
      },
    });
    lastSourceRef.current = "scroll";
  }, [activeChapterId, chapters, tripId]);

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
      const targetProgress = ACTIVE_PROGRESS_START + progress * (ACTIVE_PROGRESS_END - ACTIVE_PROGRESS_START);
      window.scrollTo({
        top: sectionTop - window.innerHeight + (section.offsetHeight + window.innerHeight) * targetProgress,
        behavior: effectiveReducedMotion ? "auto" : "smooth",
      });
    },
    [chapters, effectiveReducedMotion],
  );

  const handleChapterSelect = React.useCallback(
    (id: string, source: "click" | "keyboard"): void => {
      const chapterIndex = chapters.findIndex((chapter) => chapter.id === id);
      scrollToChapter(chapterIndex, source);
    },
    [chapters, scrollToChapter],
  );

  const handleKeyDown = React.useCallback((e: React.KeyboardEvent<HTMLElement>) => {
    if (chapters.length === 0) return;

    const currentIndex = chapters.findIndex(c => c.id === activeChapterId);
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
  }, [activeChapterId, chapters, scrollToChapter]);

  if (killSwitch || !mapEnabled || chapters.length === 0) {
    return (
      <div ref={sectionRef} className="relative w-full h-[60vh] md:h-[70vh]" style={{ position: 'relative' }}>
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

  const activeChapter = chapters.find((c) => c.id === activeChapterId) || chapters[0];
  
  const dayMatch = activeChapter?.id?.match(/day-(\d+)-/);
  const dayDisplay = dayMatch && dayMatch[1] ? `Day ${parseInt(dayMatch[1], 10) + 1}` : '';

  return (
    <div ref={sectionRef} className="relative w-full h-[60vh] md:h-[70vh]" style={{ position: 'relative' }}>
      <section 
        role="region" 
        aria-label="Cinematic trip map" 
        tabIndex={-1}
        onKeyDown={handleKeyDown}
        className="h-full w-full sticky top-[var(--header-h,0)]"
      >
        <CinematicMap 
          chapters={chapters} 
          activeChapterId={activeChapterId} 
          tripId={tripId} 
          reducedMotion={effectiveReducedMotion} 
          onChapterChange={(id) => {
            lastSourceRef.current = "scroll";
            setActiveChapterId(id);
          }} 
          className="absolute inset-0" 
        />
        
        <ChapterNav 
          chapters={chapters.map(c => ({ id: c.id, label: c.title ?? '' }))} 
          activeChapterId={activeChapterId} 
          onSelect={handleChapterSelect} 
          className="absolute right-4 top-4 hidden md:flex" 
        />

        <div className="absolute left-4 bottom-4 pointer-events-none">
          {effectiveReducedMotion ? (
            <div data-testid="chapter-caption" className="bg-background/80 backdrop-blur-md px-4 py-2 rounded-lg shadow-sm border">
              <div className="text-xs text-muted-foreground font-medium uppercase tracking-wider">{dayDisplay}</div>
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
                <div className="text-xs text-muted-foreground font-medium uppercase tracking-wider">{dayDisplay}</div>
                <div className="text-lg font-semibold">{activeChapter?.title}</div>
              </m.div>
            </AnimatePresence>
          )}
        </div>
      </section>
    </div>
  );
}
