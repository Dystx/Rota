/**
 * (reviewer) route group loading skeleton — shown during streaming
 * for the reviewer workspace (queue, history, profile, operations).
 * Mirrors the reviewer table + filter row layout so the
 * transition is layout-stable.
 */
export default function ReviewerLoading() {
  return (
    <div className="md:ml-64 p-container-padding-lg min-h-screen" aria-busy="true" aria-live="polite">
      <div className="h-8 w-56 rounded bg-olive-light/25 animate-pulse mb-2" />
      <div className="h-4 w-96 rounded bg-olive-light/15 animate-pulse mb-8" />
      <div className="flex gap-3 mb-6">
        {[0, 1, 2].map((i) => (
          <div key={i} className="h-10 w-28 rounded-full bg-olive-light/15 animate-pulse" />
        ))}
      </div>
      <div className="space-y-3">
        {[0, 1, 2, 3, 4].map((i) => (
          <div key={i} className="h-16 rounded-2xl border border-olive-light/15 bg-white/60 animate-pulse" />
        ))}
      </div>
    </div>
  );
}
