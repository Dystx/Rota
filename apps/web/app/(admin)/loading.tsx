/**
 * (admin) route group loading skeleton — shown during streaming
 * for the admin console (places, regions, quality, etc.). Mirrors
 * the kanban + table layout so the transition is layout-stable.
 */
export default function AdminLoading() {
  return (
    <div
      className="md:ml-64 p-container-padding-lg min-h-screen"
      aria-busy="true"
      aria-live="polite"
    >
      <div className="h-8 w-48 rounded bg-olive-light/25 animate-pulse mb-2" />
      <div className="h-4 w-80 rounded bg-olive-light/15 animate-pulse mb-8" />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className="rounded-2xl border border-olive-light/15 bg-white/60 p-5 h-48 animate-pulse"
          />
        ))}
      </div>
    </div>
  );
}
