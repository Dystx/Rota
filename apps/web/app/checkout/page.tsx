import Link from "next/link";
import { TopNav } from "../_components/top-nav";
import { SiteFooter } from "../_components/site-footer";

/**
 * Checkout page — Mock 1.5 (Tier Ascension Checkout).
 *
 * Source: docs/prototype.html (CheckoutPage component).
 * Centered two-column tier comparison: Core AI Synthesis (acrylic glass)
 * vs Hybrid Specialist Review (premium dark card with ochre accent).
 */
export default function CheckoutPage() {
  return (
    <>
      <TopNav />
      <div className="pt-header-height min-h-screen flex flex-col font-body-md text-body-md text-on-surface">
        <main
          id="main-content"
          className="flex-grow pt-32 pb-24 px-container-padding-sm md:px-container-padding-lg max-w-7xl mx-auto w-full flex flex-col justify-center items-center"
          style={{
            backgroundImage:
              "radial-gradient(var(--color-grid-pattern) 1px, transparent 1px)",
            backgroundSize: "24px 24px",
          }}
        >
          <div className="text-center mb-16 max-w-2xl mx-auto">
            <h1 className="font-display-mobile md:font-display text-display-mobile md:text-display text-primary mb-6">
              Elevate Your Itinerary
            </h1>
            <p className="font-headline-sm text-headline-sm text-on-surface-variant">
              Choose the level of expertise required to finalize your journey.
              Our Core AI provides exceptional foundational planning, while our
              Hybrid Specialist Review adds the irreplaceable touch of human
              intuition.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-section-gap w-full max-w-5xl mx-auto relative z-10">
            {/* Tier 1: Core AI (Included) */}
            <div className="acrylic-glass rounded-xl p-8 flex flex-col h-full relative group hover:shadow-lg transition-shadow duration-300">
              <div className="mb-6 flex justify-between items-start">
                <div>
                  <span className="font-mono-micro text-mono-micro text-primary-fixed-dim uppercase tracking-wider mb-2 block">
                    Current Selection
                  </span>
                  <h2 className="font-headline-lg text-headline-lg text-primary">
                    Core AI Synthesis
                  </h2>
                </div>
                <span className="material-symbols-outlined text-4xl text-olive-light opacity-50">
                  memory
                </span>
              </div>
              <p className="text-on-surface-variant mb-8 flex-grow">
                Our proprietary generative models have processed your
                preferences to construct a highly optimized, logical travel
                structure.
              </p>
              <ul className="space-y-4 mb-8">
                <li className="flex items-start gap-3">
                  <span className="material-symbols-outlined text-olive-light text-xl mt-0.5">
                    check_circle
                  </span>
                  <span className="text-on-surface-variant">
                    Algorithmic route optimization
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="material-symbols-outlined text-olive-light text-xl mt-0.5">
                    check_circle
                  </span>
                  <span className="text-on-surface-variant">
                    Standard predictive pacing
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="material-symbols-outlined text-olive-light text-xl mt-0.5">
                    check_circle
                  </span>
                  <span className="text-on-surface-variant">
                    Automated logistical mapping
                  </span>
                </li>
              </ul>
              <div className="pt-6 border-t border-primary/10 mt-auto">
                <div className="flex justify-between items-center mb-6">
                  <span className="font-label-ui text-label-ui text-on-surface-variant">
                    Total Cost
                  </span>
                  <span className="font-headline-sm text-headline-sm text-primary">
                    Included
                  </span>
                </div>
                <Link
                  href="/itineraries"
                  className="block text-center w-full py-4 px-6 rounded-lg border border-outline text-primary font-label-ui text-label-ui hover:bg-surface-variant transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ochre-light focus-visible:ring-offset-2"
                >
                  Continue with Core AI
                </Link>
              </div>
            </div>

            {/* Tier 2: Hybrid Specialist Review */}
            <div className="bg-olive-dark text-linen-dark rounded-xl p-8 flex flex-col h-full relative group premium-shadow border border-ochre-light overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-ochre-light/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />
              <div className="mb-6 flex justify-between items-start relative z-10">
                <div>
                  <span className="font-mono-micro text-mono-micro text-ochre-light uppercase tracking-wider mb-2 block">
                    Premium Ascension
                  </span>
                  <h2 className="font-headline-lg text-headline-lg text-linen-dark">
                    Hybrid Specialist Review
                  </h2>
                </div>
                <span
                  className="material-symbols-outlined text-4xl text-ochre-light"
                  style={{ fontVariationSettings: "'FILL' 1" }}
                >
                  verified_user
                </span>
              </div>
              <p className="text-primary-fixed-dim mb-8 flex-grow relative z-10">
                A dedicated human travel curator reviews, refines, and elevates
                the AI&apos;s foundation, ensuring cultural nuance and
                serendipitous discovery.
              </p>
              <ul className="space-y-4 mb-8 relative z-10">
                <li className="flex items-start gap-3">
                  <span
                    className="material-symbols-outlined text-ochre-light text-xl mt-0.5"
                    style={{ fontVariationSettings: "'FILL' 1" }}
                  >
                    stars
                  </span>
                  <span className="text-linen-dark">
                    Human verification of pacing and logic
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <span
                    className="material-symbols-outlined text-ochre-light text-xl mt-0.5"
                    style={{ fontVariationSettings: "'FILL' 1" }}
                  >
                    stars
                  </span>
                  <span className="text-linen-dark">
                    Injection of exclusive, unlisted local experiences
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <span
                    className="material-symbols-outlined text-ochre-light text-xl mt-0.5"
                    style={{ fontVariationSettings: "'FILL' 1" }}
                  >
                    stars
                  </span>
                  <span className="text-linen-dark">
                    Direct chat access to your assigned Specialist
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <span
                    className="material-symbols-outlined text-ochre-light text-xl mt-0.5"
                    style={{ fontVariationSettings: "'FILL' 1" }}
                  >
                    stars
                  </span>
                  <span className="text-linen-dark">
                    Priority booking assistance
                  </span>
                </li>
              </ul>
              <div className="pt-6 border-t border-white/10 mt-auto relative z-10">
                <div className="flex justify-between items-center mb-6">
                  <span className="font-label-ui text-label-ui text-primary-fixed-dim">
                    One-time Ascension Fee
                  </span>
                  <span className="font-headline-lg text-headline-lg text-ochre-light">
                    €65
                  </span>
                </div>
                <Link
                  href="/expert-chat"
                  className="block text-center w-full py-4 px-6 rounded-lg bg-ochre-dark text-on-primary font-label-ui text-label-ui hover:bg-ochre-light hover:text-on-secondary-container transition-colors duration-200 shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ochre-light focus-visible:ring-offset-2"
                >
                  Upgrade &amp; Finalize
                </Link>
              </div>
            </div>
          </div>

          <div className="mt-16 text-center max-w-lg mx-auto">
            <div className="flex items-center justify-center gap-2 text-on-surface-variant font-mono-micro text-mono-micro uppercase tracking-widest mb-4">
              <span className="material-symbols-outlined text-sm">lock</span>
              Secure Transaction
            </div>
            <p className="text-xs text-on-surface-variant/70">
              By proceeding, you agree to Rumia&apos;s Terms of Service. The
              Ascension Fee is non-refundable once human curation begins.
            </p>
          </div>
        </main>

        <SiteFooter />
      </div>
    </>
  );
}
