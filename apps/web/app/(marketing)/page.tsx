import { Metadata } from "next";
import Link from "next/link";
import { TopNav } from "../_components/top-nav";
import { SiteFooter } from "../_components/site-footer";
import { DestinationBento } from "../_components/destination-bento";
import { HeroMap } from "./hero-map";

export const metadata: Metadata = {
  title: "Discover Intentionally. | Rumia",
  description:
    "Portugal-first AI travel planning with cinematic itineraries, structured routes, and human-curated quality.",
  alternates: { canonical: "/" },
};

/**
 * Rumia landing page — spatial-engine hero
 *
 * Four sections:
 *  1. TopNav (fixed glass-morphism navigation)
 *  2. Hero — 819px cinematic gate with an interactive Spatial Engine
 *     canopy (3D globe by default; toggle to 2D planning map). Glass card
 *     overlay containing the editable "We are visiting Portugal for 7
 *     days..." text + "Begin Journey" CTA.
 *  3. DestinationBento — 12-column grid with Lisbon (8-col), Douro (4-col),
 *     Azores (12-col) cards
 *  4. SiteFooter
 */
export default function HomePage() {
  return (
    <div className="min-h-screen pt-header-height flex flex-col">
      <TopNav />

      <main className="flex-1" id="main-content">
        {/* Hero Section (Cinematic Gate with Spatial Engine canopy) */}
        <section className="relative h-[819px] min-h-[600px] w-full flex flex-col justify-center items-center overflow-hidden">
          {/* Interactive 3D/2D map canopy — replaces the static sunset
              image so the executive summary's "Discovery Experience"
              directive (immersive interactive globe at app launch) is
              the actual default landing surface, not a placeholder. */}
          <HeroMap initialProjection="globe" />

          {/* Gradient Overlay for headline readability above any map */}
          <div className="absolute inset-0 bg-gradient-to-b from-primary/55 via-primary/15 to-background/95 z-[1] pointer-events-none" />

          {/* Hero Content */}
          <div className="relative z-10 w-full max-w-4xl mx-auto px-container-padding-lg text-center flex flex-col items-center">
            <h1 className="font-display text-display text-linen-dark mb-section-gap tracking-tight drop-shadow-2xl">
              Discover <span className="italic text-ochre-light">Intentionally.</span>
            </h1>

            {/* Central Search Bar (The Wizard) */}
            <div className="w-full max-w-3xl bg-glass-light backdrop-blur-[24px] border border-white/40 rounded-xl p-card-padding shadow-2xl flex flex-col items-center">
              <div className="w-full flex items-center justify-between border-b border-olive-light/20 pb-4 mb-4">
                <span className="font-headline-lg text-headline-lg text-primary text-center w-full">
                  We are visiting{" "}
                  <span className="text-ochre-dark border-b-2 border-ochre-dark/30 cursor-text">
                    Portugal
                  </span>{" "}
                  for{" "}
                  <span className="text-ochre-dark border-b-2 border-ochre-dark/30 cursor-text">
                    7 days
                  </span>
                  ...
                </span>
              </div>
              <Link
                href="/planner"
                className="bg-olive-light text-on-primary font-label-ui text-label-ui px-8 py-3 rounded-full hover:bg-olive-dark transition-all duration-200 shadow-md flex items-center gap-2 group"
              >
                Begin Journey{" "}
                <span className="material-symbols-outlined text-[16px] group-hover:translate-x-1 transition-transform">
                  arrow_forward
                </span>
              </Link>
            </div>
          </div>
        </section>

        {/* Discovery Bento Grid */}
        <DestinationBento />
      </main>

      <SiteFooter />
    </div>
  );
}