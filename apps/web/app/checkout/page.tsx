import Link from "next/link";

/**
 * Checkout page — "Elevate Your Itinerary"
 *
 * Source: docs/prototype.html (CheckoutPage component, lines 252-274).
 * Tier 1 -> Tier 2 upsell moment. Two-column glass card layout.
 */
export default function CheckoutPage() {
  return (
    <div className="min-h-screen flex flex-col font-body-md text-body-md text-on-surface">
      <header className="fixed top-0 w-full bg-glass-light/65 backdrop-blur-md border-b border-white/20 shadow-sm z-50 flex justify-between items-center h-header-height px-container-padding-lg transition-all">
        <Link href="/" className="font-headline-lg text-headline-lg italic text-primary">
          Rumia
        </Link>
        <Link href="/itineraries" className="text-on-surface-variant hover:text-ochre-light">
          <span className="material-symbols-outlined">close</span>
        </Link>
      </header>
      <main className="flex-grow pt-32 pb-24 px-container-padding-sm max-w-7xl mx-auto w-full flex flex-col justify-center items-center">
        <div className="text-center mb-16 max-w-2xl mx-auto">
          <h1 className="font-display-mobile md:font-display text-display-mobile md:text-display text-primary mb-6">
            Elevate Your Itinerary
          </h1>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-section-gap w-full max-w-5xl">
          <div className="bg-glass-light rounded-xl p-8 border border-white/40 shadow-sm">
            <h2 className="font-headline-lg text-headline-lg text-primary mb-4">
              Core AI Synthesis
            </h2>
            <Link
              href="/itineraries"
              className="block text-center w-full py-4 px-6 rounded-lg border border-outline text-primary font-label-ui hover:bg-surface-variant"
            >
              Continue with Core AI
            </Link>
          </div>
          <div className="bg-olive-dark text-linen-dark rounded-xl p-8 shadow-lg border border-ochre-light">
            <h2 className="font-headline-lg text-headline-lg text-linen-dark mb-4">
              Hybrid Specialist Review
            </h2>
            <Link
              href="/expert-chat"
              className="block text-center w-full py-4 px-6 rounded-lg bg-ochre-dark text-on-primary font-label-ui hover:bg-ochre-light"
            >
              Upgrade & Finalize
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}