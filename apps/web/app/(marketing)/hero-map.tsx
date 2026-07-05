"use client";

import dynamic from "next/dynamic";
import * as React from "react";
import { useMapStore } from "@/store/useMapStore";
import { getDestinationPreset } from "@repo/spatial-engine";

/**
 * Structural type for the parts of a MapLibre Map we touch
 * from the hero. The web app doesn't import `maplibre-gl`
 * directly (it comes in via `@repo/spatial-engine`), so we
 * type what we need locally instead of pulling the full
 * `Map` type across the package boundary.
 */
interface HeroMapLibreLike {
  getStyle: () => {
    layers?: Array<{ id: string; type: string }>;
  } | undefined;
  setPaintProperty: (layerId: string, prop: string, value: unknown) => void;
  on: (event: string, callback: () => void) => void;
  flyTo: (opts: {
    center: [number, number];
    zoom?: number;
    duration?: number;
    essential?: boolean;
  }) => void;
}

// MapLibre is browser-only — same SSR guard used on /explore.
const GlobeWorkspace = dynamic(
  () => import("@repo/spatial-engine").then((mod) => mod.GlobeWorkspace),
  { ssr: false, loading: () => <HeroSkeleton projection="globe" /> }
);

export type HeroProjection = "globe" | "mercator";

export interface HeroMapProps {
  initialProjection?: HeroProjection;
}

/**
 * Hero's 2D/3D camera focus — exported so the marketing page can
 * deep-link the globe straight to a destination without running
 * the intro choreography.
 *
 * Slugs come from `getDestinationPreset(slug)` in `@repo/spatial-engine`.
 * The first two entries (portugal, iberian) are the home hero's
 * short list; the full archive lives in the bento grid below.
 */
export type HeroFocusSlug = "portugal" | "iberian" | string;

interface ResolvedFocus {
  center: readonly [number, number];
  zoom: number;
  bearing?: number;
}

const DEFAULT_HERO_FOCUS: ResolvedFocus = {
  // Portugal's centroid pulled slightly west to bias the visible
  // area toward the Atlantic coast; zoom 6.5 fills the visible
  // area with Portugal itself (zoom 5.6 left Spain dominating).
  center: [-8.3, 39.8],
  zoom: 6.5,
  bearing: -8
};

/**
 * Resolve a focus slug to a (center, zoom, bearing) tuple. Falls back
 * to the Iberian default if the slug is unknown so the camera always
 * lands somewhere sensible.
 */
function resolveHeroFocus(slug: HeroFocusSlug | null | undefined): ResolvedFocus {
  if (!slug) return DEFAULT_HERO_FOCUS;
  const preset = getDestinationPreset(slug);
  if (preset?.camera?.center) {
    return {
      center: [preset.camera.center[0], preset.camera.center[1]],
      zoom: preset.camera.zoom ?? DEFAULT_HERO_FOCUS.zoom,
      bearing: preset.camera.bearing
    };
  }
  return DEFAULT_HERO_FOCUS;
}

/**
 * HeroMap — the interactive canopies that replace the static sunset
 * hero image on /. Defaults to the 3D globe (Discovery) per the
 * executive summary's "The application opens with an immersive
 * interactive globe" directive. A pill toggle in the top-right
 * switches to the 2D workspace view without unmounting the layer
 * registry — the engine survives across projections.
 *
 * The hero also listens to the cross-page `targetCoordinates` store
 * field. When the marketing page (or any cross-page consumer)
 * calls `selectStop(slug, coords)`, the hero map flies to the
 * resolved focus. The captured-target guard in the cleanup effect
 * prevents a stale fly-to if a new target arrives mid-flight.
 */
export function HeroMap({ initialProjection = "globe" }: HeroMapProps) {
  const [projection, setProjection] = React.useState<HeroProjection>(initialProjection);

  // Wire the visible map surface back to the cross-page Zustand
  // store. Subscribers stay stable across renders — no need to
  // memoise the handlers.
  const onStopClick = useMapStore((state) => state.selectStop);

  return (
    <div
      className="absolute inset-0 z-0"
      data-testid="hero-map"
      data-map-container=""
      data-projection={projection}
    >
      <HeroGlobeWithSync
        projection={projection}
        onStopClick={onStopClick}
        onProjectionChange={setProjection}
      />

      <ProjectionToggle value={projection} onChange={setProjection} />
    </div>
  );
}

/**
 * The hero globe + a useEffect that flies the camera to the latest
 * `targetCoordinates` (from the Zustand store). Wrapped in its own
 * component so the camera-sync effect re-binds cleanly when the
 * projection toggles between globe and mercator — the engine is
 * preserved across projection changes (per the comment in
 * `GlobeWorkspace`'s `projection` prop) but `onMapReady` re-fires,
 * and the effect needs the fresh handle.
 */
function HeroGlobeWithSync({
  projection,
  onStopClick,
  onProjectionChange
}: {
  projection: HeroProjection;
  onStopClick: (id: string, coords: readonly [number, number]) => void;
  onProjectionChange: (next: HeroProjection) => void;
}) {
  const targetCoordinates = useMapStore((state) => state.targetCoordinates);
  const setTargetCoordinates = useMapStore((state) => state.setTargetCoordinates);
  // Loose ref — the actual handle type is a MapLibre map from
  // inside the spatial engine; we only call `flyTo` on it.
  const mapRef = React.useRef<HeroMapLibreLike | null>(null);

  // Track the target we last kicked off, so a stale `targetCoordinates
  // === null` cleanup doesn't fire mid-flight (the workspace camera-
  // sync hook uses the same pattern).
  const inFlightRef = React.useRef<readonly [number, number] | null>(null);

  // Bridge `targetCoordinates` → `map.flyTo`. The duration is tuned
  // short (1200ms) for the hero so the user gets immediate feedback
  // when they click an underlined text or a bento card.
  React.useEffect(() => {
    if (!targetCoordinates) return;
    const [lng, lat] = targetCoordinates;
    if (lng === 0 && lat === 0) {
      // Treat as "clear" — same [0,0] sentinel the workspace camera
      // sync rejects, kept here for symmetry.
      setTargetCoordinates(null);
      return;
    }
    const map = mapRef.current;
    if (!map) {
      // Map hasn't mounted yet; the effect will re-fire when
      // `targetCoordinates` updates next. If the user is just
      // setting the same target twice, drop it here to avoid an
      // infinite ping-pong.
      setTargetCoordinates(null);
      return;
    }
    inFlightRef.current = targetCoordinates;
    try {
      map.flyTo({ center: [lng, lat], zoom: 5.6, duration: 1200, essential: true });
    } catch (err) {
      // eslint-disable-next-line no-console -- engine boundary
      console.warn("[hero-map] flyTo failed:", err);
    }
    // Clear the target after the flight so the next click (which
    // sets the same coords again) is observed as a new value.
    window.setTimeout(() => {
      if (inFlightRef.current === targetCoordinates) {
        inFlightRef.current = null;
        setTargetCoordinates(null);
      }
    }, 1300);
  }, [targetCoordinates, setTargetCoordinates]);

  return (
    <GlobeWorkspace
      theme="dark"
      disableIntro
      className="absolute inset-0 h-full w-full"
      testId="hero-globe"
      // The user wants the FULL GLOBE visible and rotating in
      // the hero — not zoomed in to Portugal. We start at
      // EARTH_VIEW (zoom 0.8) so the entire planet fits, and
      // the continuous rotation in GlobeWorkspace makes it
      // spin. When the user clicks "Begin Journey" the camera
      // flies to the home target.
      initialCenter={[10, 25]}
      initialZoom={0.8}
      onStopClick={onStopClick}
      projection={projection}
      onMapReady={(m) => {
        // MapLibre's Map matches the structural type we use.
        mapRef.current = m as unknown as typeof mapRef.current;

        // The base map style ships dark labels (ASIA / EUROPE /
        // AFRICA) that disappear into the dark globe. Override the
        // `text-color` paint property on every symbol layer to the
        // ochre-light accent so the labels read on the hero. This
        // runs on every `style.load` (initial mount + projection
        // switch) so the override survives a 3D ↔ 2D toggle.
        const overrideSymbolLabelColors = (map: HeroMapLibreLike) => {
          const style = map.getStyle?.();
          if (!style?.layers) return;
          for (const layer of style.layers) {
            if (layer.type !== "symbol") continue;
            // text-color is the standard paint property on
            // symbol layers; skip layers that don't have it.
            try {
              map.setPaintProperty(layer.id, "text-color", "#eab875");
            } catch {
              // Some symbol layers (e.g. icons) don't have
              // text-color. Swallow the throw.
            }
          }
        };
        // `onMapReady` fires after the style has loaded once;
        // re-apply on every subsequent style.load so the override
        // survives a projection switch (the 2D ↔ 3D toggle
        // triggers a style reload in some MapLibre versions).
        const map = m as unknown as HeroMapLibreLike;
        overrideSymbolLabelColors(map);
        map.on("style.load", () => overrideSymbolLabelColors(map));

        // If a target arrived before the map mounted, fly to it now.
        const pending = useMapStore.getState().targetCoordinates;
        if (pending && (pending[0] !== 0 || pending[1] !== 0)) {
          m.flyTo({ center: [pending[0], pending[1]], zoom: 5.6, duration: 1200, essential: true });
          window.setTimeout(() => {
            if (useMapStore.getState().targetCoordinates === pending) {
              useMapStore.getState().setTargetCoordinates(null);
            }
          }, 1300);
        }
      }}
    />
  );
}

function ProjectionToggle({
  value,
  onChange
}: {
  value: HeroProjection;
  onChange: (next: HeroProjection) => void;
}) {
  return (
    <div
      role="tablist"
      aria-label="Map projection"
      // On mobile the hero headline ("Discover Intentionally.")
      // sits in the upper third of the map, so a top-right toggle
      // overlaps the heading. Anchor to the bottom-right on mobile
      // and the top-right on desktop where the headline is offset
      // by the larger hero height.
      className="absolute bottom-4 right-4 z-20 inline-flex items-center gap-1 rounded-full border border-white/20 bg-glass-light/85 p-1 shadow-lg backdrop-blur-2xl md:bottom-auto md:right-6 md:top-6"
    >
      <ToggleButton
        label="3D Globe"
        icon="public"
        active={value === "globe"}
        onClick={() => onChange("globe")}
      />
      <ToggleButton
        label="2D Plan"
        icon="map"
        active={value === "mercator"}
        onClick={() => onChange("mercator")}
      />
    </div>
  );
}

function ToggleButton({
  label,
  icon,
  active,
  onClick
}: {
  label: string;
  icon: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      role="tab"
      aria-selected={active}
      aria-label={label}
      onClick={onClick}
      className={
        "inline-flex items-center gap-2 rounded-full px-4 py-2 font-label-ui text-label-ui transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ochre-light " +
        (active
          ? "bg-olive-light text-on-primary shadow-md"
          : "text-linen-dark hover:bg-white/20")
      }
    >
      <span className="material-symbols-outlined text-base" aria-hidden="true">{icon}</span>
      {label}
    </button>
  );
}

function HeroSkeleton({ projection }: { projection: HeroProjection }) {
  const label = projection === "globe" ? "Loading 3D globe" : "Loading 2D workspace";
  return (
    <div
      data-testid="hero-skeleton"
      data-projection={projection}
      className="absolute inset-0 h-full w-full animate-pulse bg-gradient-to-br from-primary via-olive-dark to-primary"
    >
      <span className="sr-only">{label}</span>
    </div>
  );
}
