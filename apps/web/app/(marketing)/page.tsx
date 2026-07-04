import { Metadata } from "next";
import { TopNav } from "../_components/top-nav";
import { SiteFooter } from "../_components/site-footer";
import { DestinationBento } from "../_components/destination-bento";
import { HeroMap } from "./hero-map";
import { HeroSearchWizard } from "./_components/hero-search-wizard";

export const metadata: Metadata = {
  title: "Discover Intentionally. | Rumia",
  description:
    "Portugal-first AI travel planning with cinematic itineraries, structured routes, and human-curated quality.",
  alternates: { canonical: "/" },
};

/**
 * Rumia landing page — spatial-engine hero
 *
 * Five sections:
 *  1. TopNav (fixed glass-morphism navigation)
 *  2. Hero (560px mobile / 720px desktop) — 3D globe canopy behind,
 *     a thin gradient scrim that fades to transparent at the bottom
 *     half so the map is fully visible. The headline + interactive
 *     search wizard sit in the upper third; the lower two-thirds is
 *     the map.
 *  3. DestinationBento — 12-column grid with Lisbon, Douro, Azores
 *  4. SiteFooter
 *
 * Layout note (2026-07-04): the hero was h-[819px] with the search
 * bar centered. The map was visually dominated by the overlay.
 * Restructured: hero is shorter (720px desktop), the gradient
 * scrim is now directional (top-only), the search bar is anchored
 * in the upper third, and the lower two-thirds is unobstructed map.
 */
export default function HomePage() {
  return (
    <div className="min-h-screen pt-header-height flex flex-col">
      <TopNav />

      <main className="flex-1" id="main-content">
        {/* Hero Section (Cinematic Gate with Spatial Engine canopy) */}
        <section className="relative h-[560px] min-h-[480px] md:h-[720px] md:min-h-[560px] w-full flex flex-col justify-start items-center overflow-hidden">
          {/* Interactive 3D/2D map canopy — fills the entire hero. */}
          <HeroMap initialProjection="globe" />

          {/* Top-only directional scrim: keeps the headline + wizard
              readable without darkening the lower 2/3 of the map.
              Bottom fades to fully transparent so the Iberian
              peninsula reads through. */}
          <div
            className="absolute inset-x-0 top-0 h-3/4 bg-gradient-to-b from-primary/65 via-primary/35 to-transparent z-[1] pointer-events-none"
            aria-hidden="true"
          />

          {/* Hero Content — anchored in the upper third. The map is
              visible in the lower 2/3 with no overlay. */}
          <div className="relative z-10 w-full max-w-4xl mx-auto px-container-padding-sm md:px-container-padding-lg pt-8 md:pt-12 flex flex-col items-center text-center">
            <h1 className="font-display-mobile text-display-mobile md:font-display md:text-display text-linen-dark mb-4 md:mb-6 tracking-tight drop-shadow-2xl">
              Discover <span className="italic text-ochre-light">Intentionally.</span>
            </h1>

            {/* Central Search Bar (interactive wizard) */}
            <HeroSearchWizard />

            {/* Subtle hint that the underlined spans are clickable.
                Keeps the hero quiet while still telling the user the
                map will react. */}
            <p className="mt-3 font-mono-micro text-mono-micro uppercase tracking-widest text-linen-dark/60 drop-shadow-md">
              <span className="inline-flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[14px]" aria-hidden="true">
                  touch_app
                </span>
                Tap a place or the wizard to focus the map
              </span>
            </p>
          </div>
        </section>

        {/* Discovery Bento Grid */}
        <DestinationBento />
      </main>

      <SiteFooter />
    </div>
  );
}
