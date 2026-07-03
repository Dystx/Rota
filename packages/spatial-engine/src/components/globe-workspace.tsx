"use client";

import * as React from "react";
import { useReducedMotion } from "@repo/ui";
import { CartoBasemapStyleProvider } from "../core/map-style-provider";
import { createDiscoveryEngine, type MapLibreSpatialEngine } from "../adapters/maplibre/spatial-engine";
import { CameraChoreography } from "../core/camera-choreography";
import { fixtureAllCollections } from "../fixtures/travelers";
import type { MapStyleEndpoint } from "../core/types";

export interface GlobeWorkspaceProps {
  /** Theme selector — defaults to dark for the discovery hero. */
  theme?: "light" | "dark";
  /** Override the default style endpoint (e.g. tests, air-gapped environments). */
  styleOverride?: MapStyleEndpoint;
  /** Initial camera target — defaults to Portugal at low altitude. */
  initialCenter?: readonly [number, number];
  initialZoom?: number;
  /** Disable the intro camera choreography (world → Portugal zoom). */
  disableIntro?: boolean;
  className?: string;
  testId?: string;
}

const DEFAULT_HOME_CENTER: readonly [number, number] = [-8.2245, 39.3999];
const DEFAULT_HOME_ZOOM = 1.6;
const INTRO_HOME_CENTER: readonly [number, number] = [-8.2245, 39.3999];
const INTRO_HOME_ZOOM = 4.2;

/**
 * RumiaGlobeWorkspace — the high-level entry point that owns one
 * SpatialEngine instance for its lifetime. The component only ever
 * touches the abstract `SpatialEngine` interface, so swapping the
 * renderer (MapLibre today, deck.gl or CesiumJS tomorrow) only changes
 * the factory call below — never this file.
 */
export function GlobeWorkspace({
  theme = "dark",
  styleOverride,
  initialCenter = DEFAULT_HOME_CENTER,
  initialZoom = DEFAULT_HOME_ZOOM,
  disableIntro = false,
  className,
  testId = "globe-workspace"
}: GlobeWorkspaceProps): React.ReactElement {
  const containerRef = React.useRef<HTMLDivElement | null>(null);
  const engineRef = React.useRef<MapLibreSpatialEngine | null>(null);
  const reducedMotion = useReducedMotion();
  const [mountError, setMountError] = React.useState<string | null>(null);

  React.useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let cancelled = false;
    const styleProvider = new CartoBasemapStyleProvider();
    const style = styleOverride ?? styleProvider.getStyle(theme);
    const engine = createDiscoveryEngine({
      style,
      initialTarget: { center: initialCenter, zoom: initialZoom },
      reducedMotion
    });
    engineRef.current = engine;
    const seeds = fixtureAllCollections();
    engine.seedTelemetry("travelers", seeds.travelers);
    engine.seedTelemetry("specialists", seeds.specialists);

    engine
      .mount(container)
      .then(async () => {
        if (cancelled) {
          engine.unmount();
          return;
        }
        const unsubscribe = engine.getTelemetry().subscribe("travelers", () => {
          // Phase 1: the AmbientPulseLayer receives the seeded collection
          // on subscribe; phase 2 will wire update fan-out to all layers
          // that opted into the channel.
        });

        // MapLibre measures the container once at mount. When the parent
        // layout hasn't settled yet (dynamic import, font load, etc.) the
        // canvas can be initialised at 0×0 or a partial width. Resize on
        // the next frame and on every observed size change so the globe
        // always fills its container.
        const refresh = () => engine.getRenderer()?.resize();
        refresh();
        const raf = requestAnimationFrame(refresh);

        let observer: ResizeObserver | null = null;
        if (typeof ResizeObserver !== "undefined") {
          observer = new ResizeObserver(() => refresh());
          observer.observe(container);
        }

        if (!disableIntro) {
          const intro = new CameraChoreography()
            .beat("earth", { center: [0, 30] as const, zoom: 1.4, duration: reducedMotion ? 0 : 1400 })
            .beat("europe", { center: INTRO_HOME_CENTER, zoom: INTRO_HOME_ZOOM, duration: reducedMotion ? 0 : 1800 });
          try {
            await engine.playChoreography(intro);
          } catch {
            // Choreography is best-effort; never let it block the page.
          }
        }

        return () => {
          cancelAnimationFrame(raf);
          observer?.disconnect();
          unsubscribe();
        };
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          setMountError(err instanceof Error ? err.message : "Failed to mount globe");
        }
      });

    return () => {
      cancelled = true;
      engine.unmount();
      engineRef.current = null;
    };
  }, [disableIntro, initialCenter, initialZoom, reducedMotion, styleOverride, theme]);

  return (
    <div
      ref={containerRef}
      data-testid={testId}
      data-theme={theme}
      data-reduced-motion={reducedMotion ? "true" : "false"}
      data-intro={disableIntro ? "off" : "on"}
      className={
        className ??
        "relative h-[640px] w-full overflow-hidden rounded-[32px] border border-[var(--color-border)] bg-sage shadow-[0_24px_60px_rgba(7,17,19,0.06)]"
      }
    >
      {mountError ? (
        <div
          role="alert"
          className="absolute inset-0 flex items-center justify-center bg-linen-dark/90 text-center text-sm text-on-surface"
        >
          <div>
            <p className="font-headline-sm text-headline-sm mb-2">Globe unavailable</p>
            <p className="rota-muted">{mountError}</p>
          </div>
        </div>
      ) : null}
    </div>
  );
}

export default GlobeWorkspace;