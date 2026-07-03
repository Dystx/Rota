"use client";

import * as React from "react";
import dynamic from "next/dynamic";
import { useSearchParams } from "next/navigation";
import { getDestinationPreset } from "@repo/spatial-engine";
import { useMapStore } from "@/store/useMapStore";

// MapLibre is browser-only — same SSR guard as the GlobeWorkspace.
const WorkspaceCanvas = dynamic(
  () => import("@repo/spatial-engine").then((mod) => mod.WorkspaceCanvas),
  { ssr: false, loading: () => <WorkspaceCanvasSkeleton /> }
);

function WorkspaceCanvasSkeleton() {
  return (
    <div
      data-testid="explore-workspace-canvas-skeleton"
      className="h-[640px] w-full rounded-[32px] border border-olive-dark/10 bg-gradient-to-b from-linen-dark to-sage"
      aria-label="Loading workspace map"
    />
  );
}

/**
 * Inner client component — wrapped in <Suspense> below because
 * useSearchParams() forces the boundary in Next.js 14+.
 */
function WorkspaceCanvasInner() {
  const params = useSearchParams();
  const focusSlug = params.get("focus");
  const preset = getDestinationPreset(focusSlug);

  const setViewport = useMapStore((state) => state.setViewport);
  const selectStop = useMapStore((state) => state.selectStop);

  // If the bento card hydrated the Zustand store before the navigation
  // finished, mirror that selection here so the filmstrip + active
  // stop indicators light up on first paint.
  React.useEffect(() => {
    if (preset && preset.camera.center) {
      selectStop(preset.slug, [preset.camera.center[0], preset.camera.center[1]]);
    }
    // Intentionally only depends on `focusSlug`: the store absorbs the
    // coordinates; subsequent renders should not re-fire.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [focusSlug]);

  return (
    <div
      data-testid="explore-workspace-canvas-frame"
      data-focus={preset?.slug ?? ""}
      className="h-[640px] w-full overflow-hidden rounded-[32px] border border-olive-dark/10 shadow-[0_24px_60px_rgba(7,17,19,0.06)]"
    >
      <WorkspaceCanvas
        className="h-full w-full"
        testId="explore-workspace-canvas"
        initialFocus={preset?.camera}
        onViewportChange={setViewport}
        onStopClick={(id, coords) => selectStop(id, coords)}
      />
    </div>
  );
}

/**
 * Public client component used by /explore/workspace. Wraps the
 * search-params reader in Suspense so static rendering of the
 * workspace page doesn't blow up when no `?focus=` is present.
 */
export function WorkspaceCanvasClient() {
  return (
    <React.Suspense fallback={<WorkspaceCanvasSkeleton />}>
      <WorkspaceCanvasInner />
    </React.Suspense>
  );
}