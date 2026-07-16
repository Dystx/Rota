import type { ReactNode } from "react";
import { cn } from "../lib/cn";

export interface EditorialMediaProps {
  src: string;
  fallbackSrc?: string;
  alt: string;
  caption?: ReactNode;
  credit?: ReactNode;
  width: number;
  height: number;
  sizes?: string;
  priority?: boolean;
  decorative?: boolean;
  className?: string;
  imageClassName?: string;
  overlayClassName?: string;
  testId?: string;
}

/**
 * A provenance-friendly image surface for editorial chapters.
 *
 * The component intentionally stays image-only for the first media slice.
 * Video belongs to a later, poster-first experiment and should not leak into
 * every route by default. A fallback source and reserved dimensions keep the
 * visual anchor useful when the preferred format is unavailable.
 */
export function EditorialMedia({
  src,
  fallbackSrc,
  alt,
  caption,
  credit,
  width,
  height,
  sizes = "100vw",
  priority = false,
  decorative = false,
  className,
  imageClassName,
  overlayClassName,
  testId
}: EditorialMediaProps) {
  return (
    <figure
      className={cn("overflow-hidden", className)}
      data-testid={testId}
      aria-hidden={decorative ? true : undefined}
    >
      <picture className="block h-full w-full">
        <source srcSet={src} type="image/webp" sizes={sizes} />
        <img
          src={fallbackSrc ?? src}
          alt={decorative ? "" : alt}
          width={width}
          height={height}
          sizes={sizes}
          loading={priority ? "eager" : "lazy"}
          fetchPriority={priority ? "high" : "auto"}
          decoding={priority ? "sync" : "async"}
          className={cn("h-full w-full object-cover", imageClassName)}
        />
      </picture>
      {overlayClassName ? (
        <div aria-hidden className={cn("pointer-events-none absolute inset-0", overlayClassName)} />
      ) : null}
      {!decorative && (caption || credit) ? (
        <figcaption className="absolute inset-x-0 bottom-0 flex flex-col items-start justify-end gap-2 bg-gradient-to-t from-black/70 via-black/25 to-transparent px-5 pb-4 pt-12 text-white md:flex-row md:items-end md:justify-between md:gap-4 md:px-7 md:pb-6">
          {caption ? <span className="max-w-[38rem] font-body text-sm leading-6">{caption}</span> : <span />}
          {credit ? <span className="shrink-0 text-left font-mono-micro text-mono-micro uppercase tracking-[0.14em] text-white/75 md:text-right">{credit}</span> : null}
        </figcaption>
      ) : null}
    </figure>
  );
}
