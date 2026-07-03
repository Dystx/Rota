"use client";

import dynamic from "next/dynamic";
import { useMapStore } from "@/store/useMapStore";

// MapLibre touches `window` at import time; load the workspace on the
// client only so the server render of /explore stays HTML-only.
const GlobeWorkspace = dynamic(
  () => import("@repo/spatial-engine").then((mod) => mod.GlobeWorkspace),
  { ssr: false, loading: () => <DiscoveryGlobeSkeleton /> }
);

export function DiscoveryGlobe() {
  const setViewport = useMapStore((state) => state.setViewport);
  const selectStop = useMapStore((state) => state.selectStop);
  return (
    <GlobeWorkspace
      theme="dark"
      className="h-[640px] w-full overflow-hidden rounded-[32px] border border-olive-dark/10 shadow-[0_24px_60px_rgba(7,17,19,0.06)]"
      testId="explore-globe"
      onViewportChange={setViewport}
      onStopClick={(id, coords) => selectStop(id, coords)}
    />
  );
}

function DiscoveryGlobeSkeleton() {
  return (
    <div
      data-testid="explore-globe-skeleton"
      className="h-[640px] w-full rounded-[32px] border border-olive-dark/10 bg-gradient-to-b from-sage via-linen-dark to-sage"
      aria-label="Loading 3D globe"
    />
  );
}