import { Metadata } from "next";
import Link from "next/link";
import { TopNav } from "../_components/top-nav";
import { SiteFooter } from "../_components/site-footer";
import { DestinationBento } from "../_components/destination-bento";

export const metadata: Metadata = {
  title: "Discover Intentionally. | Rumia",
  description:
    "Portugal-first AI travel planning with cinematic itineraries, structured routes, and human-curated quality.",
  alternates: { canonical: "/" },
};

/**
 * Rumia landing page — 100% parity with docs/prototype.html
 *
 * Three sections:
 *  1. TopNav (fixed glass-morphism navigation)
 *  2. Hero — 819px cinematic gate with Portugal bg image, glass card
 *     containing the editable "We are visiting Portugal for 7 days..."
 *     text + "Begin Journey" CTA
 *  3. DestinationBento — 12-column grid with Lisbon (8-col), Douro (4-col),
 *     Azores (12-col) cards
 *  4. SiteFooter
 */
export default function HomePage() {
  return (
    <div className="min-h-screen pt-header-height flex flex-col">
      <TopNav />

      <main className="flex-1" id="main-content">
        {/* Hero Section (Cinematic Gate) */}
        <section className="relative h-[819px] min-h-[600px] w-full flex flex-col justify-center items-center overflow-hidden">
          {/* Background "Video Loop" (mocked with image) */}
          <div className="absolute inset-0 w-full h-full">
            <div
              className="w-full h-full bg-cover bg-center filter brightness-[0.85] contrast-125 saturate-110"
              style={{
                backgroundImage:
                  "url('https://lh3.googleusercontent.com/aida-public/AB6AXuCX3bKR-Xr7E_XjZsIHsO8GXIycFbn1UViEGxIXcvq3q5URIvlKF1tHXI8Q6I2K_aOmqDtA0I9xgu3nukH3AKzEV0E_ZVN-jTVndO-ZmUgFTgQ6Qja0ApRYSCmHU7_rtk4zuAXTpszEFhJntzw9Hc1PU-yQqKvq_VB1tCp5kV0RyNrRw34OBeBnei4hZhWWHXgKziQfaoH-stdy5vUUyvroiRc1Xl46gkiOU5z3CByCu7z7MeZue5KAtydhEggtzf5NL-NDqysiKt-S')",
              }}
            />
            {/* Gradient Overlay for readability */}
            <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent opacity-90" />
            <div className="absolute inset-0 bg-primary/20 mix-blend-multiply" />
          </div>

          {/* Hero Content */}
          <div className="relative z-10 w-full max-w-4xl mx-auto px-container-padding-lg text-center flex flex-col items-center">
            <h1 className="font-display text-display text-on-secondary mb-section-gap tracking-tight drop-shadow-2xl">
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