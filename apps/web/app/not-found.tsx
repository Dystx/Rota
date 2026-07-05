import Link from "next/link";
import { SiteFooter } from "./_components/site-footer";

/**
 * not-found.tsx — global 404 page.
 *
 * Triggered when `notFound()` is called from a server component or
 * when the user navigates to a route that doesn't exist. Replaces
 * the default Next.js 404 with a Rumia-branded page that offers
 * the two most likely next actions: plan a new trip, or learn how
 * the app works.
 *
 * Auth-gated routes (/admin, /reviewer) redirect to /sign-in from
 * their layouts, so this page only handles genuinely-missing routes
 * — the "lost traveler" framing fits.
 */
export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col bg-paper">
      <main id="main-content" className="flex-1 flex items-center justify-center px-6 py-16">
        <div className="max-w-xl text-center">
          <p className="font-mono-micro text-mono-micro uppercase tracking-widest text-ochre-dark mb-4">
            404 — off the map
          </p>
          <h1 className="font-display text-5xl md:text-6xl text-ink mb-6">
            We haven&apos;t charted this <em className="text-ochre-dark not-italic">route</em> yet.
          </h1>
          <p className="text-ink-soft text-lg mb-10 max-w-md mx-auto">
            The page you&apos;re looking for either moved, expired, or was never part of this itinerary. Let&apos;s get you back on track.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              href="/"
              className="inline-flex items-center justify-center px-6 py-3 rounded-lg bg-ink text-cream font-medium hover:bg-ink-soft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ochre-light focus-visible:ring-offset-2 transition-colors"
            >
              Back to home
            </Link>
            <Link
              href="/trip/new"
              className="inline-flex items-center justify-center px-6 py-3 rounded-lg border border-olive-light/30 text-ink font-medium hover:bg-olive-light/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ochre-light focus-visible:ring-offset-2 transition-colors"
            >
              Plan a new trip
            </Link>
          </div>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
