import { SiteFooter } from "./_components/site-footer";

/**
 * Root loading skeleton — shown during Next.js streaming while
 * a server component is resolving (e.g. a Supabase query on
 * /trip/[tripId] or /itineraries). The skeleton mirrors the
 * shape of the loaded page so the layout doesn't shift when
 * the data arrives (no CLS).
 *
 * The hero block is a soft sage gradient with a shimmer line
 * — same palette as the loaded hero so the transition feels
 * like a fade, not a jump.
 */
export default function RootLoading() {
  return (
    <div className="min-h-screen flex flex-col bg-paper" aria-busy="true" aria-live="polite">
      <div className="flex-1">
        <div
          className="relative h-[420px] md:h-[520px] w-full overflow-hidden bg-gradient-to-b from-sage/40 via-paper to-paper"
          aria-hidden
        >
          <div className="absolute inset-x-6 top-1/2 -translate-y-1/2 max-w-2xl mx-auto">
            <div className="h-3 w-32 rounded-full bg-olive-light/20 animate-pulse mb-6" />
            <div className="h-12 md:h-16 w-3/4 rounded-lg bg-olive-light/25 animate-pulse mb-4" />
            <div className="h-4 w-2/3 rounded bg-olive-light/15 animate-pulse" />
          </div>
        </div>
        <div className="mx-auto max-w-[1200px] px-6 py-12">
          <div className="h-6 w-48 rounded bg-olive-light/20 animate-pulse mb-8" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[0, 1, 2].map((i) => (
              <div key={i} className="rounded-2xl border border-olive-light/15 bg-white/60 p-6 h-48 animate-pulse" />
            ))}
          </div>
        </div>
      </div>
      <SiteFooter />
    </div>
  );
}
