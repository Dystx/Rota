/**
 * (marketing) route group loading skeleton — shown during streaming
 * for the marketing pages (/how-it-works, /pricing, /human-review,
 * /portugal, /explore, /). Mirrors the hero + grid layout so the
 * transition is layout-stable.
 */
export default function MarketingLoading() {
  return (
    <div className="min-h-screen" aria-busy="true" aria-live="polite">
      <div
        className="relative h-[420px] md:h-[560px] w-full overflow-hidden bg-gradient-to-b from-sage/40 via-paper to-paper"
        aria-hidden
      >
        <div className="absolute inset-x-6 top-1/2 -translate-y-1/2 max-w-3xl mx-auto">
          <div className="h-3 w-32 rounded-full bg-olive-light/20 animate-pulse mb-6" />
          <div className="h-14 md:h-20 w-3/4 rounded-lg bg-olive-light/25 animate-pulse mb-4" />
          <div className="h-4 w-2/3 rounded bg-olive-light/15 animate-pulse" />
        </div>
      </div>
      <div className="mx-auto max-w-[1200px] px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[0, 1, 2].map((i) => (
            <div key={i} className="rounded-2xl border border-olive-light/15 bg-white/60 h-72 animate-pulse" />
          ))}
        </div>
      </div>
    </div>
  );
}
