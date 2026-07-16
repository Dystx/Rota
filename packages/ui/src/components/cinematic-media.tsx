'use client';

import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { cn } from "../lib/cn";
import { useMediaPreferences } from "../lib/media-preferences";

export type CinematicMotionPolicy =
  | "decorative-autoplay"
  | "poster-only"
  | "informative";

export type CinematicTextSafeZone = {
  x: number;
  y: number;
  width: number;
  height: number;
};

export type CinematicMediaSourceExtension = {
  webmSrc?: string;
  mobileSrc?: string;
  mobileWebmSrc?: string;
  mobilePoster?: string;
  loadStrategy?: "eager" | "near-viewport";
  pauseWhenHidden?: boolean;
  textSafeZone?: CinematicTextSafeZone;
  mobileTextSafeZone?: CinematicTextSafeZone;
};

export interface CinematicMediaProps extends CinematicMediaSourceExtension {
  /** A local, poster-backed MP4 derivative. */
  src: string;
  /** The preferred still frame, normally WebP. */
  poster: string;
  /** A broadly supported still fallback, normally JPEG. */
  fallbackSrc?: string;
  alt: string;
  caption?: ReactNode;
  credit?: ReactNode;
  width: number;
  height: number;
  sizes?: string;
  priority?: boolean;
  decorative?: boolean;
  motionPolicy?: CinematicMotionPolicy;
  className?: string;
  videoClassName?: string;
  posterClassName?: string;
  overlayClassName?: string;
  testId?: string;
}

function percentage(value: number): string {
  return `${Math.round(Math.min(1, Math.max(0, value)) * 100)}%`;
}

function zoneValue(zone: CinematicTextSafeZone | undefined): string | undefined {
  return zone
    ? [zone.x, zone.y, zone.width, zone.height].map(percentage).join(" ")
    : undefined;
}

function attemptPlay(video: HTMLVideoElement): void {
  try {
    const result = video.play();
    if (result && typeof result.catch === "function") {
      void result.catch(() => undefined);
    }
  } catch {
    // Browsers may reject autoplay synchronously; the poster remains valid.
  }
}

/**
 * A poster-first cinematic surface for editorial routes.
 *
 * The still is always the resilient baseline. A local muted loop is an
 * optional layer that disappears for reduced-motion/data preferences, while
 * the surrounding page remains fully usable without media or autoplay.
 */
export function CinematicMedia({
  src,
  poster,
  mobilePoster,
  fallbackSrc,
  mobileSrc,
  mobileWebmSrc,
  webmSrc,
  alt,
  caption,
  credit,
  width,
  height,
  sizes = "100vw",
  priority = false,
  decorative = false,
  motionPolicy = "decorative-autoplay",
  loadStrategy = priority ? "eager" : "near-viewport",
  pauseWhenHidden = true,
  textSafeZone,
  mobileTextSafeZone,
  className,
  videoClassName,
  posterClassName,
  overlayClassName,
  testId
}: CinematicMediaProps) {
  const { prefersReducedMotion, prefersReducedData, isLowPower } = useMediaPreferences();
  const autoplay =
    motionPolicy === "decorative-autoplay" &&
    !prefersReducedMotion &&
    !prefersReducedData &&
    !isLowPower;
  const [nearViewport, setNearViewport] = useState(loadStrategy === "eager");
  const [isIntersecting, setIsIntersecting] = useState(loadStrategy === "eager");
  const mediaRef = useRef<HTMLElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const shouldRenderVideo = autoplay && (loadStrategy === "eager" || nearViewport);

  useEffect(() => {
    if (!autoplay || loadStrategy === "eager") return;
    const media = mediaRef.current;
    if (!media) return;

    if (typeof IntersectionObserver === "undefined") {
      setNearViewport(true);
      setIsIntersecting(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        const intersecting = Boolean(entry?.isIntersecting);
        setNearViewport(intersecting);
        setIsIntersecting(intersecting);
      },
      { rootMargin: "300px" }
    );
    observer.observe(media);
    return () => observer.disconnect();
  }, [autoplay, loadStrategy]);

  useEffect(() => {
    if (!shouldRenderVideo || !pauseWhenHidden) return;
    const media = mediaRef.current;
    const video = videoRef.current;
    if (!media || !video) return;

    let observer: IntersectionObserver | undefined;
    const applyVisibility = (intersecting: boolean) => {
      setIsIntersecting(intersecting);
      if (!intersecting || document.visibilityState === "hidden" || !autoplay) {
        video.pause();
      } else {
        attemptPlay(video);
      }
    };

    if (typeof IntersectionObserver !== "undefined") {
      observer = new IntersectionObserver(([entry]) => {
        applyVisibility(Boolean(entry?.isIntersecting));
      });
      observer.observe(media);
    }

    const syncPlayback = () => {
      const visible = document.visibilityState !== "hidden";
      if (!visible || !isIntersecting || !autoplay) {
        video.pause();
        return;
      }
      attemptPlay(video);
    };
    const handleVisibilityChange = () => syncPlayback();
    document.addEventListener("visibilitychange", handleVisibilityChange);
    syncPlayback();
    return () => {
      observer?.disconnect();
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [autoplay, isIntersecting, pauseWhenHidden, shouldRenderVideo]);

  const textSafeStyle = (textSafeZone || mobileTextSafeZone)
    ? ({
        ...(textSafeZone
          ? {
              "--rumia-text-safe-x": percentage(textSafeZone.x),
              "--rumia-text-safe-y": percentage(textSafeZone.y),
              "--rumia-text-safe-width": percentage(textSafeZone.width),
              "--rumia-text-safe-height": percentage(textSafeZone.height)
            }
          : {}),
        ...(mobileTextSafeZone
          ? {
              "--rumia-text-safe-mobile-x": percentage(mobileTextSafeZone.x),
              "--rumia-text-safe-mobile-y": percentage(mobileTextSafeZone.y),
              "--rumia-text-safe-mobile-width": percentage(mobileTextSafeZone.width),
              "--rumia-text-safe-mobile-height": percentage(mobileTextSafeZone.height)
            }
          : {})
      } as CSSProperties)
    : undefined;

  return (
    <figure
      ref={mediaRef}
      className={cn("rumia-cinematic-media overflow-hidden", className)}
      data-motion-policy={motionPolicy}
      data-motion-enabled={autoplay ? "true" : "false"}
      data-load-strategy={loadStrategy}
      data-pause-when-hidden={pauseWhenHidden ? "true" : "false"}
      data-text-safe-zone={zoneValue(textSafeZone)}
      data-mobile-text-safe-zone={zoneValue(mobileTextSafeZone)}
      style={textSafeStyle}
      data-testid={testId}
      aria-hidden={decorative ? true : undefined}
    >
      <picture className="rumia-cinematic-media__poster-wrap block h-full w-full">
        {mobilePoster ? <source media="(max-width: 767px)" srcSet={mobilePoster} type="image/webp" sizes={sizes} /> : null}
        <source srcSet={poster} type="image/webp" sizes={sizes} />
        <img
          src={fallbackSrc ?? poster}
          alt={decorative ? "" : alt}
          width={width}
          height={height}
          sizes={sizes}
          loading={priority ? "eager" : "lazy"}
          fetchPriority={priority ? "high" : "auto"}
          decoding={priority ? "sync" : "async"}
          className={cn(
            "rumia-cinematic-media__poster h-full w-full object-cover",
            posterClassName
          )}
        />
      </picture>
      {shouldRenderVideo ? (
        <video
          ref={videoRef}
          className={cn(
            "rumia-cinematic-media__video pointer-events-none absolute inset-0 h-full w-full object-cover",
            videoClassName
          )}
          autoPlay
          muted
          loop
          playsInline
          preload={priority ? "auto" : "metadata"}
          poster={poster}
          aria-hidden="true"
          data-testid="cinematic-video"
        >
          {mobileWebmSrc ? <source media="(max-width: 767px)" src={mobileWebmSrc} type="video/webm" /> : null}
          {mobileSrc ? <source media="(max-width: 767px)" src={mobileSrc} type="video/mp4" /> : null}
          {webmSrc ? <source src={webmSrc} type="video/webm" /> : null}
          <source src={src} type="video/mp4" />
        </video>
      ) : null}
      {overlayClassName ? (
        <div
          aria-hidden
          className={cn("pointer-events-none absolute inset-0", overlayClassName)}
        />
      ) : null}
      {!decorative && (caption || credit) ? (
        <figcaption className="absolute inset-x-0 bottom-0 flex flex-col items-start justify-end gap-2 bg-gradient-to-t from-black/70 via-black/25 to-transparent px-5 pb-4 pt-12 text-white md:flex-row md:items-end md:justify-between md:gap-4 md:px-7 md:pb-6">
          {caption ? <span className="max-w-[38rem] font-body text-sm leading-6">{caption}</span> : <span />}
          {credit ? <span className="shrink-0 text-left font-mono-micro uppercase tracking-[0.14em] text-white/75 md:text-right">{credit}</span> : null}
        </figcaption>
      ) : null}
    </figure>
  );
}
