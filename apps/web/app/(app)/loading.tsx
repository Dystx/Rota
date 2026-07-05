import { SiteFooter } from "../_components/site-footer";

/**
 * (app) route group loading skeleton — shown during streaming for
 * the authenticated app shell (trip pages, account, itineraries,
 * logistics, planner). Mirrors the trip hero + timeline layout so
 * the transition is layout-stable.
 */
export default function AppLoading() {
  return (
    <div className="min-h-screen flex flex-col bg-paper" aria-busy="true" aria-live="polite">
      <div className="flex-1">
        <div
          className="relative h-[280px] md:h-[360px] w-full overflow-hidden bg-gradient-to-b from-sage/40 to-paper"
          aria-hidden
        >
          <div className="absolute inset-x-6 top-1/2 -translate-y-1/2 max-w-2xl mx-auto">
            <div className="h-2.5 w-24 rounded-full bg-olive-light/25 animate-pulse mb-4" />
            <div className="h-8 w-2/3 rounded-lg bg-olive-light/30 animate-pulse" />
          </div>
        </div>
        <div className="mx-auto max-w-[860px] px-6 py-12 space-y-4">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="h-20 rounded-2xl bg-white/40 border border-olive-light/10 animate-pulse" />
          ))}
        </div>
      </div>
      <SiteFooter />
    </div>
  );
}
