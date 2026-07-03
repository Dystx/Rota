"use client";

import dynamic from "next/dynamic";
import * as React from "react";

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
  const [tick, setTick] = React.useState(0);

  // Bumping `tick` forces the dynamic child to remount on projection
  // switch so the GlobeWorkspace / WorkspaceCanvas lifecycle runs
  // cleanly. This is the simplest pattern that keeps both canvases
  // out of each other's residual state.
  React.useEffect(() => {
    setTick((current) => current + 1);
  }, [projection]);

  return (
    <div className="absolute inset-0 z-0" data-testid="hero-map" data-projection={projection}>
      {projection === "globe" ? (
        <GlobeWorkspace
          key={`globe-${tick}`}
          theme="dark"
          disableIntro
          className="absolute inset-0 h-full w-full"
          testId="hero-globe"
          initialCenter={[PORTUGAL_CENTER.lng, PORTUGAL_CENTER.lat]}
          initialZoom={3.4}
        />
      ) : (
        <WorkspaceCanvas
          key={`workspace-${tick}`}
          disableIntro
          className="absolute inset-0 h-full w-full"
          testId="hero-workspace"
          initialCenter={[PORTUGAL_CENTER.lng, PORTUGAL_CENTER.lat]}
          initialZoom={5.6}
        />
      )}

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
  return (
    <div
      data-testid="hero-skeleton"
      data-projection={projection}
      className="absolute inset-0 h-full w-full animate-pulse bg-gradient-to-br from-primary via-olive-dark to-primary"
      aria-label={projection === "globe" ? "Loading 3D globe" : "Loading 2D workspace"}
    />
  );
}