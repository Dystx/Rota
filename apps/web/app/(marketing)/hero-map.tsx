"use client";

import dynamic from "next/dynamic";
import * as React from "react";
import { useMapStore } from "@/store/useMapStore";

// MapLibre is browser-only — same SSR guard used on /explore.
const GlobeWorkspace = dynamic(
  () => import("@repo/spatial-engine").then((mod) => mod.GlobeWorkspace),
  { ssr: false, loading: () => <HeroSkeleton projection="globe" /> }
);

const WorkspaceCanvas = dynamic(
  () => import("@repo/spatial-engine").then((mod) => mod.WorkspaceCanvas),
  { ssr: false, loading: () => <HeroSkeleton projection="mercator" /> }
);

export type HeroProjection = "globe" | "mercator";

interface HeroMapProps {
  initialProjection?: HeroProjection;
}

/**
 * The Iberian centroid (just west of Lisbon) used to seed both
 * projections. The 3D globe lands here at zoom 3.4 with a -12°
 * bearing so the Iberian Peninsula reads as Portugal-first on first
 * paint; the 2D workspace lands at zoom 5.6 to match the dedicated
 * /explore/workspace "iberian-context" beat.
 */
const PORTUGAL_CENTER = { lng: -8.165, lat: 39.55 };

/**
 * HeroMap — the interactive canopies that replace the static sunset
 * hero image on /. Defaults to the 3D globe (Discovery) per the
 * executive summary's "The application opens with an immersive
 * interactive globe" directive. A pill toggle in the top-right
 * switches to the 2D workspace view without unmounting the layer
 * registry — the engine survives across projections.
 */
export function HeroMap({ initialProjection = "globe" }: HeroMapProps) {
  const [projection, setProjection] = React.useState<HeroProjection>(initialProjection);

  // Wire the visible map surface back to the cross-page Zustand store.
  // The store is read by the bento grid (selection -> fly-to) and the
  // workspace filmstrip (active stop). Subscribers here stay stable
  // across renders — no need to memoise the handlers.
  const setViewport = useMapStore((state) => state.setViewport);
  const selectStop = useMapStore((state) => state.selectStop);

  // Render a SINGLE GlobeWorkspace for both projection modes and let
  // the engine switch projection in place via `setProjectionType`.
  // The previous design (`key={globe-${tick}}` + `key={workspace-${tick}}`)
  // remounted the whole component on every toggle, which:
  //   1. Re-downloaded the basemap style (network round trip)
  //   2. Re-created every registered SpatialLayer (ambient pulse,
  //      symbol badges, route layer)
  //   3. Re-allocated the WebGL custom layers (radial gradient,
  //      starfield) and their buffers/programs
  //   4. Risked leaking WebGL resources if the teardown race fired
  //      in the wrong order
  // The fix lives in `GlobeWorkspace`'s `projection` prop + the
  // engine's `setProjectionType` method; this component just toggles
  // the prop. WorkspaceCanvas is no longer used here (it owns its own
  // mercator-only mount lifecycle) but is still exported from
  // `@repo/spatial-engine` for the dedicated /explore/workspace page.
  return (
    <div className="absolute inset-0 z-0" data-testid="hero-map" data-projection={projection}>
      <GlobeWorkspace
        theme="dark"
        disableIntro
        className="absolute inset-0 h-full w-full"
        testId="hero-globe"
        initialCenter={[PORTUGAL_CENTER.lng, PORTUGAL_CENTER.lat]}
        initialZoom={3.4}
        onViewportChange={setViewport}
        onStopClick={(id, coords) => selectStop(id, coords)}
        projection={projection}
      />

      <ProjectionToggle value={projection} onChange={setProjection} />
    </div>
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
      className="absolute right-6 top-6 z-20 inline-flex items-center gap-1 rounded-full border border-white/20 bg-glass-light/85 p-1 shadow-lg backdrop-blur-2xl"
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
      <span className="material-symbols-outlined text-base">{icon}</span>
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