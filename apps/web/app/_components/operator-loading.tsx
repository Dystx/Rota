import * as React from "react";
import type { OperatorSection } from "@repo/ui";

interface OperatorLoadingProps {
  section: OperatorSection;
}

const NAV_SKELETON_COUNT = {
  reviewer: 4,
  admin: 8,
  console: 6,
  developer: 1
} as const;

/**
 * Streaming shell for protected reviewer/admin routes.
 *
 * The loading boundary must look like the operator surface it is replacing:
 * a calm sidebar, a compact title/control row, and dense evidence blocks.
 * Keeping the shell stable prevents a flash of the old unstyled skeleton while
 * the authenticated page resolves.
 */
export function OperatorLoading({ section }: OperatorLoadingProps) {
  const navCount = NAV_SKELETON_COUNT[section];
  const contentWidth = section === "console" ? "max-w-[1440px]" : "max-w-6xl";

  return (
    <div
      data-testid="operator-loading"
      data-operator-section={section}
      data-surface="linen"
      data-surface-texture="none"
      className="rumia-operator-shell min-h-screen rumia-surface rumia-surface-linen text-primary"
    >
      <div className="lg:flex lg:min-h-screen">
        <aside
          aria-hidden="true"
          className="rumia-operator-sidebar hidden lg:flex lg:w-64 lg:flex-col lg:border-r lg:border-olive-light/15 lg:bg-white/45"
        >
          <div className="flex flex-1 flex-col gap-8 p-6">
            <div className="h-8 w-28 rounded-md bg-olive-light/15 animate-pulse" />
            <div className="grid gap-3">
              <div className="h-3 w-20 rounded bg-ochre-dark/15 animate-pulse" />
              <div className="grid gap-2">
                {Array.from({ length: navCount }, (_, index) => (
                  <div
                    key={index}
                    className="h-11 rounded-lg border border-olive-light/10 bg-white/45 animate-pulse"
                  />
                ))}
              </div>
            </div>
            <div className="mt-auto h-14 rounded-lg border border-olive-light/10 bg-white/50 animate-pulse" />
          </div>
        </aside>

        <main id="main-content" className="rumia-operator-main min-w-0 flex-1">
          <div className="lg:hidden flex items-center justify-between border-b border-olive-light/15 bg-white/45 p-4">
            <div className="h-7 w-24 rounded-md bg-olive-light/15 animate-pulse" />
            <div className="h-4 w-16 rounded bg-ochre-dark/15 animate-pulse" />
          </div>

          <div className={`rumia-operator-content mx-auto min-w-0 w-full ${contentWidth} overflow-x-hidden px-4 py-8 md:px-8 md:py-12 lg:px-12 lg:py-16`}>
            <div role="status" aria-live="polite" aria-busy="true" aria-label="Loading operator workspace">
              <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
                <div className="grid gap-3">
                  <div className="h-3 w-28 rounded bg-ochre-dark/15 animate-pulse" />
                  <div className="h-12 w-72 max-w-full rounded-lg bg-olive-light/20 animate-pulse" />
                  <div className="h-5 w-[30rem] max-w-full rounded bg-olive-light/15 animate-pulse" />
                </div>
                <div className="flex gap-3">
                  <div className="h-11 w-44 rounded-full bg-white/55 animate-pulse" />
                  <div className="h-11 w-28 rounded-full bg-white/55 animate-pulse" />
                </div>
              </div>

              <div className="mt-8 h-12 rounded-lg border border-ochre-dark/15 bg-ochre-light/10 animate-pulse" />

              <div className="mt-8 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
                {[0, 1, 2, 3, 4, 5].map((index) => (
                  <div
                    key={index}
                    className="min-h-44 rounded-2xl border border-olive-light/15 bg-white/55 p-5 shadow-sm animate-pulse"
                  >
                    <div className="h-3 w-20 rounded bg-ochre-dark/15" />
                    <div className="mt-5 h-7 w-4/5 rounded bg-olive-light/20" />
                    <div className="mt-3 h-4 w-full rounded bg-olive-light/15" />
                    <div className="mt-2 h-4 w-3/5 rounded bg-olive-light/15" />
                    <div className="mt-7 h-8 w-32 rounded-full bg-olive-light/15" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
