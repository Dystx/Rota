import { TopNav } from "../_components/top-nav";
import { SiteFooter } from "../_components/site-footer";

/**
 * Loading UI for the marketing route group — shown by Next.js
 * while a server component in `/`, `/itineraries`, `/vault`,
 * `/pricing`, `/human-review`, `/how-it-works`, or `/portugal`
 * is being prepared. Renders the fixed TopNav + a cinematic
 * shell so the page transition doesn't flash from a blank
 * white screen to the full hero.
 *
 * The skeleton uses the same vertical rhythm as the home page
 * (60vh mobile / 80vh desktop) so when the real page mounts
 * the layout doesn't shift.
 */
export default function MarketingLoading() {
  return (
    <div className="min-h-screen pt-header-height flex flex-col bg-background">
      <TopNav />
      <div
        role="status"
        aria-live="polite"
        className="flex-1"
        aria-busy="true"
        aria-label="Loading"
      >
        {/* Hero skeleton — same 60vh/80vh rhythm as the home
            hero, with a pulse animation on the headline + card
            placeholders so the page reads as "in progress"
            rather than "broken". */}
        <section className="relative h-[60vh] min-h-[560px] md:h-[80vh] md:min-h-[720px] w-full flex flex-col items-center justify-center px-container-padding-sm md:px-container-padding-lg bg-gradient-to-b from-primary/30 via-primary/5 to-transparent">
          <div className="w-full max-w-4xl mx-auto flex flex-col items-center text-center gap-4">
            <div
              className="h-12 md:h-16 w-3/4 max-w-2xl rounded-md bg-olive-light/20 animate-pulse"
              aria-hidden
            />
            <div
              className="h-6 w-2/3 max-w-xl rounded-md bg-olive-light/15 animate-pulse"
              aria-hidden
            />
            <div
              className="mt-8 w-full max-w-3xl h-24 md:h-32 rounded-2xl bg-white/40 backdrop-blur-sm border border-olive-light/20 animate-pulse"
              aria-hidden
            />
          </div>
        </section>

        {/* Section skeleton — same width + spacing as the
            HowItWorks grid so the layout doesn't shift when the
            real section mounts. */}
        <section className="max-w-6xl mx-auto px-container-padding-lg py-section-gap">
          <div
            className="h-8 w-1/3 mx-auto rounded-md bg-olive-light/20 animate-pulse mb-12"
            aria-hidden
          />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-10">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="h-48 rounded-2xl bg-white/60 border border-olive-light/20 animate-pulse"
                aria-hidden
              />
            ))}
          </div>
        </section>
      </div>
      <SiteFooter />
    </div>
  );
}
