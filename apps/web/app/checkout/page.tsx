import Link from "next/link";
import { TopNav } from "../_components/top-nav";
import { SiteFooter } from "../_components/site-footer";
import { isPersistenceConfigError, getTripDraftById } from "@repo/db";
import { resolveCoverImage } from "@/lib/trip-cover";

/**
 * Checkout page — Stitch 1.5 split-screen tier ascension.
 *
 * Left panel: trip summary (cover image, trip name, brief).
 * Right panel: tier comparison (Core AI vs Hybrid Specialist
 * Review) with the premium tier carrying the "Recommended"
 * pill (Stitch 1.5 pattern).
 *
 * Reads `?trip=<id>` from the URL. When present, the left
 * panel pulls the trip data via `getTripDraftById` and shows
 * the cover + brief. When missing (the page is opened from
 * the marketing surface), the left panel falls back to a
 * "no trip yet" card pointing to /planner.
 */
export default async function CheckoutPage({
  searchParams
}: {
  searchParams: Promise<{ trip?: string }>;
}) {
  const { trip: tripParam } = await searchParams;
  const tripId = tripParam?.trim() || null;
  const tripHref = tripId ? `/trip/${tripId}` : "/account";

  let trip = null;
  let tripError = "";
  if (tripId) {
    try {
      trip = await getTripDraftById(tripId);
    } catch (error) {
      tripError = isPersistenceConfigError(error)
        ? "Configure Supabase environment variables to load this trip."
        : error instanceof Error
          ? error.message
          : "Could not load trip details.";
    }
  }

  const coverImage = trip ? resolveCoverImage(trip.brief) : null;
  const tripTitle = trip?.title ?? "Your trip is taking shape";
  const briefSummary = trip
    ? `${trip.brief.regions.join(", ").replace(/-/g, " ")} · ${trip.brief.tripLengthDays} days`
    : "Plan a trip first — the tier comparison below will land on the right.";

  return (
    <>
      <TopNav />
      <div className="pt-header-height min-h-screen flex flex-col font-body-md text-body-md text-on-surface">
        <main
          id="main-content"
          className="flex-grow py-12 md:py-20 px-container-padding-sm md:px-container-padding-lg"
        >
          <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-[1fr_1.1fr] gap-section-gap items-start">
            {/* Left panel: trip summary (Stitch 1.5 left side). */}
            <aside
              data-testid="checkout-trip-summary"
              className="lg:sticky lg:top-28 rounded-xl overflow-hidden border border-olive-light/20 bg-white/80 backdrop-blur-md shadow-md"
            >
              <div className="relative aspect-[16/9] w-full bg-olive-dark/10">
                {coverImage ? (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img
                    src={coverImage}
                    alt=""
                    className="absolute inset-0 h-full w-full object-cover"
                    data-testid="checkout-trip-cover"
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span
                      aria-hidden
                      className="material-symbols-outlined text-5xl text-olive-light/60"
                    >
                      image
                    </span>
                  </div>
                )}
              </div>
              <div className="p-5 flex flex-col gap-2">
                <p className="font-mono-micro text-mono-micro uppercase tracking-widest text-ochre-dark">
                  Your trip
                </p>
                <h2
                  data-testid="checkout-trip-title"
                  className="font-headline-lg text-headline-lg text-primary leading-tight"
                >
                  {tripTitle}
                </h2>
                <p
                  data-testid="checkout-trip-brief"
                  className="font-body-md text-body-md text-on-surface-variant"
                >
                  {briefSummary}
                </p>
                {tripError ? (
                  <p
                    role="alert"
                    data-testid="checkout-trip-error"
                    className="font-mono-technical text-mono-technical text-red-700"
                  >
                    {tripError}
                  </p>
                ) : null}
                {tripId ? (
                  <Link
                    href={`/trip/${tripId}`}
                    data-testid="checkout-trip-link"
                    className="mt-2 inline-flex items-center gap-1 font-mono-technical text-mono-technical text-ochre-dark hover:text-primary"
                  >
                    View trip
                    <span aria-hidden className="material-symbols-outlined text-[16px]">
                      arrow_forward
                    </span>
                  </Link>
                ) : null}
              </div>
            </aside>

            {/* Right panel: tier comparison (Stitch 1.5 right side). */}
            <section
              data-testid="checkout-tiers"
              aria-labelledby="checkout-heading"
              className="flex flex-col gap-6"
            >
              <header>
                <h1
                  id="checkout-heading"
                  className="font-display-mobile md:font-display text-display-mobile md:text-display text-primary mb-3"
                >
                  Elevate Your Itinerary
                </h1>
                <p className="font-headline-sm text-headline-sm text-on-surface-variant">
                  Choose the level of expertise required to finalize your
                  journey. Core AI gives you a complete, structured route;
                  Hybrid Specialist Review adds the irreplaceable touch of
                  human intuition.
                </p>
                {tripId ? (
                  <p className="font-mono-micro text-mono-micro uppercase tracking-widest text-on-surface-variant/70 mt-3">
                    for trip #{tripId}
                  </p>
                ) : null}
              </header>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Tier 1: Core AI (Included) */}
                <div
                  data-testid="checkout-tier-core"
                  className="acrylic-glass rounded-xl p-6 flex flex-col h-full relative group hover:shadow-lg transition-shadow duration-300"
                >
                  <h2 className="font-headline-lg text-headline-lg text-primary mb-2">
                    Core AI
                  </h2>
                  <p className="font-body-md text-body-md text-on-surface-variant mb-4">
                    A complete, structured itinerary generated by our
                    spatial engine. Maps, pacing, curated routes.
                  </p>
                  <ul className="font-body-md text-body-md text-on-surface space-y-2 mb-4">
                    {[
                      "Structured day-by-day route",
                      "Map + filmstrip with opening hours",
                      "Vault + exports (PDF, mobile)"
                    ].map((line) => (
                      <li key={line} className="flex items-start gap-2">
                        <span
                          aria-hidden
                          className="material-symbols-outlined text-olive-light text-[18px] mt-0.5"
                        >
                          check_circle
                        </span>
                        {line}
                      </li>
                    ))}
                  </ul>
                  <div className="pt-4 border-t border-primary/10 mt-auto">
                    <div className="flex justify-between items-center mb-4">
                      <span className="font-label-ui text-label-ui text-on-surface-variant">
                        Total cost
                      </span>
                      <span className="font-headline-sm text-headline-sm text-primary">
                        Included
                      </span>
                    </div>
                    <Link
                      href={tripHref}
                      data-testid="checkout-continue-core"
                      className="block text-center w-full py-3 px-6 rounded-lg border border-outline text-primary font-label-ui text-label-ui hover:bg-surface-variant transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ochre-light focus-visible:ring-offset-2"
                    >
                      Continue with Core AI
                    </Link>
                  </div>
                </div>

                {/* Tier 2: Hybrid Specialist Review */}
                <div
                  data-testid="checkout-tier-specialist"
                  className="rounded-xl p-6 flex flex-col h-full relative group bg-olive-dark text-linen-dark border border-ochre-light/50 shadow-[0_24px_64px_rgba(29,42,35,0.25)] hover:shadow-[0_32px_80px_rgba(206,147,63,0.18)] transition-shadow duration-300"
                >
                  <div className="absolute -top-3 right-6 bg-ochre-light text-olive-dark font-mono-micro text-mono-micro uppercase tracking-widest px-3 py-1 rounded-full shadow-md">
                    Recommended
                  </div>
                  <div
                    aria-hidden
                    className="absolute top-0 right-0 w-48 h-48 bg-ochre-light/10 blur-3xl rounded-full pointer-events-none -z-10"
                  />
                  <h2 className="font-headline-lg text-headline-lg text-linen-dark mb-2">
                    Hybrid Specialist
                  </h2>
                  <p className="font-body-md text-body-md text-linen-dark/80 mb-4">
                    Our destination specialists audit, refine, and
                    personalize your itinerary.
                  </p>
                  <ul className="font-body-md text-body-md text-linen-dark/90 space-y-2 mb-4">
                    {[
                      { icon: "verified_user", label: "Specialist audit of every stop" },
                      { icon: "stars", label: "Personalized recommendations" },
                      { icon: "forum", label: "Async chat with your specialist" },
                      { icon: "schedule", label: "48-hour turnaround" }
                    ].map((item) => (
                      <li key={item.label} className="flex items-start gap-2">
                        <span
                          aria-hidden
                          className="material-symbols-outlined text-ochre-light text-[18px] mt-0.5"
                          style={{ fontVariationSettings: "'FILL' 1" }}
                        >
                          {item.icon}
                        </span>
                        {item.label}
                      </li>
                    ))}
                  </ul>
                  <div className="pt-4 border-t border-white/10 mt-auto">
                    <div className="flex justify-between items-center mb-4">
                      <span className="font-label-ui text-label-ui text-linen-dark/80">
                        One-time ascension fee
                      </span>
                      <span className="font-headline-lg text-headline-lg text-ochre-light">
                        €65
                      </span>
                    </div>
                    {tripId ? (
                      <form
                        action={`/api/trips/${tripId}/unlock`}
                        method="post"
                        className="block"
                      >
                        <button
                          type="submit"
                          data-testid="checkout-upgrade-finalize"
                          className="block text-center w-full py-3 px-6 rounded-lg bg-ochre-dark text-on-primary font-label-ui text-label-ui hover:bg-ochre-light hover:text-on-secondary-container transition-colors duration-200 shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ochre-light focus-visible:ring-offset-2"
                        >
                          Upgrade &amp; Finalize
                        </button>
                      </form>
                    ) : (
                      <Link
                        href="/planner"
                        data-testid="checkout-upgrade-finalize"
                        className="block text-center w-full py-3 px-6 rounded-lg bg-ochre-dark text-on-primary font-label-ui text-label-ui hover:bg-ochre-light hover:text-on-secondary-container transition-colors duration-200 shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ochre-light focus-visible:ring-offset-2"
                      >
                        Start a trip to unlock
                      </Link>
                    )}
                  </div>
                </div>
              </div>

              {!tripId ? (
                <p className="font-body-md text-body-md text-on-surface-variant flex items-center gap-2">
                  <span aria-hidden className="material-symbols-outlined text-[18px]">
                    info
                  </span>
                  These tiers apply to a specific trip. Plan one first and
                  the checkout options will land here automatically.
                </p>
              ) : null}
            </section>
          </div>
        </main>
        <SiteFooter />
      </div>
    </>
  );
}
