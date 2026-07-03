"use client";

import dynamic from "next/dynamic";

// MapLibre is browser-only — same SSR guard as the GlobeWorkspace.
const WorkspaceCanvas = dynamic(
  () => import("@repo/spatial-engine").then((mod) => mod.WorkspaceCanvas),
  { ssr: false, loading: () => <WorkspaceCanvasSkeleton /> }
);

export function WorkspaceCanvasClient() {
  return (
    <WorkspaceCanvas
      className="h-[640px] w-full overflow-hidden rounded-[32px] border border-olive-dark/10 shadow-[0_24px_60px_rgba(7,17,19,0.06)]"
      testId="explore-workspace-canvas"
    />
  );
}

function WorkspaceCanvasSkeleton() {
  return (
    <div
      data-testid="explore-workspace-canvas-skeleton"
      className="h-[640px] w-full rounded-[32px] border border-olive-dark/10 bg-gradient-to-b from-linen-dark to-sage"
      aria-label="Loading workspace map"
    />
  );
}