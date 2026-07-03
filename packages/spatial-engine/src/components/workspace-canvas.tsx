"use client";

import * as React from "react";
import { useReducedMotion } from "@repo/ui";
import { CartoBasemapStyleProvider } from "../core/map-style-provider";
import { createWorkspaceEngine, type MapLibreSpatialEngine } from "../adapters/maplibre/spatial-engine";
import { CameraChoreography } from "../core/camera-choreography";
import { fixtureRouteCollection } from "../fixtures/routes";
import { fixtureTravelerCollection, fixtureSpecialistCollection } from "../fixtures/travelers";
import type { CameraTarget, MapStyleEndpoint } from "../core/types";

export interface WorkspaceCanvasProps {
  /** Style endpoint override (tests, air-gapped environments). */
  styleOverride?: MapStyleEndpoint;
  /**
   * Composite initial camera target — takes precedence over the
   * `initialCenter` / `initialZoom` defaults when provided. Lets
   * callers (e.g. home bento cards → /explore/workspace?focus=lisbon)
   * skip the intro choreography and land directly on a destination.
   */
  initialFocus?: CameraTarget;
  /** Initial camera target — defaults to Porto at mid zoom. */
  initialCenter?: readonly [number, number];
  initialZoom?: number;
  /**
   * Disable the intro camera choreography (Portugal context → route
   * fit → stop 1). Defaults to false so the demo page always animates;
   * real consumers can opt out for inline embeds. When `initialFocus`
   * is provided, the intro is skipped automatically — no need to set
   * this explicitly.
   */
  disableIntro?: boolean;
  className?: string;
  testId?: string;
}

const DEFAULT_HOME_CENTER: readonly [number, number] = [-8.6291, 41.1579];
const DEFAULT_HOME_ZOOM = 5.4;
const INTRO_CONTEXT_CENTER: readonly [number, number] = [-9.1393, 38.7223];
const INTRO_CONTEXT_ZOOM = 4.2;
const INTRO_FIT_CENTER: readonly [number, number] = [-8.6291, 39.85];
const INTRO_FIT_ZOOM = 6.4;
const INTRO_STOP_CENTER: readonly [number, number] = [-8.6291, 41.1579];
const INTRO_STOP_ZOOM = 11;

/**
 * WorkspaceCanvas — the 2D counterpart to GlobeWorkspace. Renders an
 * itinerary in flat mercator projection so editing precision is not
 * lost to curvature. Same SpatialEngine abstraction; the projection
 * option is the only renderer-specific difference.
 */
export function WorkspaceCanvas({
  styleOverride,
  initialFocus,
  initialCenter = DEFAULT_HOME_CENTER,
  initialZoom = DEFAULT_HOME_ZOOM,
  disableIntro = false,
  className,
  testId = "workspace-canvas"
}: WorkspaceCanvasProps): React.ReactElement {
  // If `initialFocus` is set, it wins. Skip the intro choreography — the
  // caller has already chosen where to land.
  const resolvedInitialTarget: CameraTarget = initialFocus
    ? initialFocus
    : { center: initialCenter, zoom: initialZoom };
  const resolvedDisableIntro = disableIntro || initialFocus !== undefined;
  const containerRef = React.useRef<HTMLDivElement | null>(null);
  const engineRef = React.useRef<MapLibreSpatialEngine | null>(null);
  const reducedMotion = useReducedMotion();
  const [mountError, setMountError] = React.useState<string | null>(null);

  React.useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let cancelled = false;
    const styleProvider = new CartoBasemapStyleProvider();
    const style = styleOverride ?? styleProvider.getStyle("light");
    const engine = createWorkspaceEngine({
      style,
      initialTarget: resolvedInitialTarget,
      reducedMotion,
      projection: "mercator"
    });
    engineRef.current = engine;

    engine.seedTelemetry("travelers", fixtureTravelerCollection());
    engine.seedTelemetry("specialists", fixtureSpecialistCollection());
    engine.seedTelemetry("trips", fixtureRouteCollection());

    engine
      .mount(container)
      .then(async () => {
        if (cancelled) {
          engine.unmount();
          return;
        }
        const unsubscribe = engine.getTelemetry().subscribe("trips", () => undefined);

        const refresh = () => engine.getRenderer()?.resize();
        refresh();
        const raf = requestAnimationFrame(refresh);

        let observer: ResizeObserver | null = null;
        if (typeof ResizeObserver !== "undefined") {
          observer = new ResizeObserver(() => refresh());
          observer.observe(container);
        }

        if (!resolvedDisableIntro) {
          const intro = new CameraChoreography()
            .beat("iberian-context", { center: INTRO_CONTEXT_CENTER, zoom: INTRO_CONTEXT_ZOOM }, { duration: reducedMotion ? 0 : 1500 })
            .beat("fit-route", { center: INTRO_FIT_CENTER, zoom: INTRO_FIT_ZOOM, duration: reducedMotion ? 0 : 1400 })
            .beat("first-stop", { center: INTRO_STOP_CENTER, zoom: INTRO_STOP_ZOOM, duration: reducedMotion ? 0 : 900 });
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
          setMountError(err instanceof Error ? err.message : "Failed to mount workspace");
        }
      });

    return () => {
      cancelled = true;
      engine.unmount();
      engineRef.current = null;
    };
  }, [resolvedDisableIntro, resolvedInitialTarget, reducedMotion, styleOverride]);

  return (
    <div
      ref={containerRef}
      data-testid={testId}
      data-projection="mercator"
      data-reduced-motion={reducedMotion ? "true" : "false"}
      data-intro={disableIntro ? "off" : "on"}
      className={
        className ??
        "relative h-[640px] w-full overflow-hidden rounded-[32px] border border-[var(--color-border)] bg-linen-dark shadow-[0_24px_60px_rgba(7,17,19,0.06)]"
      }
    >
      {mountError ? (
        <div
          role="alert"
          className="absolute inset-0 flex items-center justify-center bg-linen-dark/90 text-center text-sm text-on-surface"
        >
          <div>
            <p className="font-headline-sm text-headline-sm mb-2">Workspace unavailable</p>
            <p className="rota-muted">{mountError}</p>
          </div>
        </div>
      ) : null}
    </div>
  );
}

export default WorkspaceCanvas;