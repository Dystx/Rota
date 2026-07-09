"use client";

import * as React from "react";

interface IntersectionObserverGateProps {
  /**
   * `rootMargin` forwarded to the IntersectionObserver. Defaults to
   * `"100px"` to match the previous Mapbox-era `CinematicMap` mount
   * gate.
   */
  rootMargin?: string;
  /**
   * Render-prop / element that should be visible only after the
   * gate fires. Typically the live map canvas (MapLibre mounts
   * eagerly; gating it keeps the basemap tiles off the wire until
   * the user actually scrolls into the section).
   */
  children: React.ReactNode;
  /**
   * Placeholder rendered before the gate fires. Defaults to a
   * radial-gradient block that matches the Mapbox-era schematic
   * placeholder — `data-static-schematic` is the test hook.
   */
  fallback?: React.ReactNode;
  /**
   * When true, the gate fires immediately on mount (skips the
   * observer + the 1.5s fallback timer). Use for surfaces where
   * the section is the primary content of the page and a blank
   * 700px tall placeholder is unacceptable — the trip detail
   * page's cinematic route section.
   */
  forceMount?: boolean;
  className?: string;
}

/**
 * IntersectionObserverGate — viewport-gates its children.
 *
 * Extracted from the deleted `packages/maps/cinematic-map.tsx`
 * (the Mapbox-era component used the same pattern with
 * `rootMargin: "100px"`). The gate fires once on first intersection
 * and never re-closes; the children mount once and stay mounted.
 *
 * Used by `WorkspaceTripCanvas` to defer mounting the spatial
 * engine until the user scrolls into the route section — saves
 * tile bandwidth on slow connections and avoids a visible canvas
 * pop-in on the trip detail page.
 */
export function IntersectionObserverGate({
  rootMargin = "100px",
  children,
  fallback,
  forceMount = false,
  className
}: IntersectionObserverGateProps): React.ReactElement {
  const sentinelRef = React.useRef<HTMLDivElement | null>(null);
  const [isIntersecting, setIsIntersecting] = React.useState(forceMount);
  React.useEffect(() => {
    if (forceMount) {
      return;
    }
    const node = sentinelRef.current;
    if (!node) return;
    if (typeof IntersectionObserver === "undefined") {
      setIsIntersecting(true);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          setIsIntersecting(true);
          observer.disconnect();
        }
      },
      { rootMargin }
    );

    observer.observe(node);

    // Fallback: if the observer doesn't fire within 1.5s (e.g. the
    // user lands on the page with the section already above the
    // fold, or Playwright's full-page screenshot scrolls past
    // faster than the observer can fire), open the gate anyway.
    // The observer + fallback are idempotent — whoever fires first
    // wins, and the other is a no-op once `isIntersecting` is true.
    const fallbackTimer = window.setTimeout(() => {
      setIsIntersecting(true);
      observer.disconnect();
    }, 1500);

    return () => {
      observer.disconnect();
      window.clearTimeout(fallbackTimer);
    };
  }, [rootMargin, forceMount]);

  if (isIntersecting) {
    return <>{children}</>;
  }

  return (
    <div ref={sentinelRef} className={className} data-gate-state="waiting">
      {fallback ?? <DefaultSchematicFallback />}
    </div>
  );
}

/**
 * Default fallback — a soft radial-gradient placeholder that
 * matches the Mapbox-era `data-static-schematic` block. Extracted
 * verbatim from `packages/maps/src/components/cinematic-map.tsx`
 * (the gradient + border treatment was already on `@repo/ui` color
 * tokens, so no design drift).
 */
function DefaultSchematicFallback() {
  return (
    <div
      data-static-schematic=""
      data-static-placeholder=""
      role="img"
      aria-label="Loading route map"
      className="h-[600px] w-full overflow-hidden rounded-[32px] border border-[var(--color-border)]"
      style={{
        background:
          "radial-gradient(120% 80% at 50% 35%, var(--color-aqua, #cfeae3) 0%, var(--color-cream, #f3ede1) 55%, var(--color-paper, #f7faf9) 100%)"
      }}
      suppressHydrationWarning
    />
  );
}
