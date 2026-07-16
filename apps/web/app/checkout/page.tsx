import * as React from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { DecisionStatePanel, Icon } from "@repo/ui";
import { PublicRouteLayout } from "../_components/public-route-layout";
import { resolveCoverImage } from "@/lib/trip-cover";
import { getOwnedTrip } from "@/app/lib/trip-access";
import { PackageSelector } from "./_components/package-selector";

/**
 * Checkout page — Stitch 1.5 split-screen tier ascension.
 *
 * Left panel: trip summary (cover image, trip name, brief).
 * Right panel: optional chosen-day support. The page preserves the existing
 * commerce contract while using activity-first language rather than the
 * retired AI/concierge tier framing.
 *
 * Reads `?trip=<id>` from the URL. When present, the left panel pulls
 * owner-scoped trip data and shows the cover + brief. When missing (the page
 * is opened from a marketing surface), checkout stops at one saved-day
 * handoff instead of presenting package controls without trip context.
 */
export default async function CheckoutPage({
  searchParams
}: {
  searchParams: Promise<{ trip?: string }>;
}) {
  const { trip: tripParam } = await searchParams;
  const tripId = tripParam?.trim() || null;

  if (!tripId) {
    return (
      <PublicRouteLayout scene="utility" footerMode="utility" surfaceTone="linen" surfaceTexture="none">
        <div className="min-h-[calc(100vh-5rem)] px-container-padding-sm py-16 md:px-container-padding-lg md:py-24">
          <div className="mx-auto grid max-w-4xl gap-8">
            <header className="max-w-2xl">
              <p className="rumia-type-label text-ochre-on-light">Saved day first</p>
              <h1 className="mt-3 rumia-type-display text-4xl text-primary md:text-6xl">
                Checkout follows a considered day.
              </h1>
              <p className="mt-5 max-w-xl text-base leading-relaxed text-on-surface-variant md:text-lg">
                Choose the activities that earn their place, save the day, then
                decide whether an optional refinement is worth adding.
              </p>
            </header>

            <DecisionStatePanel
              data-testid="checkout-no-trip"
              kind="empty"
              tone="inverse"
              className="min-h-[20rem] md:min-h-[24rem]"
              title="Start with one good choice."
              description="There are no checkout options to compare until a saved day exists. Shape the brief first, and the right next step will appear here without booking or accommodation search."
              illustration={<Icon name="bookmark-simple" aria-hidden />}
              primaryAction={(
                <Link
                  href="/planner"
                  className="inline-flex items-center justify-center rounded-full bg-ochre-light px-5 py-3 text-sm font-medium text-primary shadow-sm transition-transform hover:-translate-y-0.5 hover:bg-ochre-dark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ochre-light focus-visible:ring-offset-2"
                >
                  Shape a day
                </Link>
              )}
              secondaryAction={(
                <Link
                  href="/explore"
                  className="inline-flex items-center justify-center rounded-full border border-white/30 px-5 py-3 text-sm font-medium text-linen-dark transition-colors hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ochre-light focus-visible:ring-offset-2"
                >
                  Explore activities
                </Link>
              )}
            />
          </div>
        </div>
      </PublicRouteLayout>
    );
  }

  const tripAccess = await getOwnedTrip(tripId);

  if (tripAccess.kind === "anonymous") {
    redirect(`/sign-in?next=${encodeURIComponent(`/checkout?trip=${tripId}`)}`);
  }

  if (tripAccess.kind !== "ok") {
    redirect("/itineraries?notice=unavailable");
  }

  const trip = tripAccess.trip;
  const tripHref = `/trip/${tripId}`;

  const coverImage = trip ? resolveCoverImage(trip.brief) : null;
  const tripTitle = trip?.title ?? "Your trip is taking shape";
  const briefSummary = trip
    ? `${trip.brief.regions.join(", ").replace(/-/g, " ")} · ${trip.brief.tripLengthDays} days`
    : "Plan a trip first — the tier comparison below will land on the right.";

  return (
    <PublicRouteLayout scene="utility" footerMode="utility" surfaceTone="linen" surfaceTexture="none">
      <div className="min-h-screen flex flex-col font-body-md text-body-md text-on-surface">
        <div className="flex-grow py-12 md:py-20 px-container-padding-sm md:px-container-padding-lg">
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
                  /* No-trip state: a compact illustration + CTA
                     instead of a large gray box with a single
                     icon. The illustration sits centered with a
                     "Plan a trip" button below it so the user has
                     a clear next step from the checkout surface. */
                  <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 px-6 text-center">
                    <div className="w-14 h-14 rounded-full bg-olive-light/15 flex items-center justify-center">
                      <Icon name="travel_explore" className="text-3xl text-olive-dark" />
                    </div>
                    <p className="font-mono-micro text-mono-micro uppercase tracking-widest text-olive-dark/80">
                      No trip linked
                    </p>
                    <p className="font-body-sm text-body-sm text-on-surface-variant max-w-xs">
                      Plan a trip first and the cover + brief will appear here.
                    </p>
                    <Link
                      href="/planner"
                      data-testid="checkout-empty-cta"
                      className="mt-1 inline-flex items-center gap-2 bg-olive-light text-on-primary font-label-ui text-label-ui px-4 py-2 rounded-full hover:bg-olive-dark transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ochre-light focus-visible:ring-offset-2"
                    >
                      <Icon name="add_location_alt" className="text-[18px]" />
                      Plan a trip
                    </Link>
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
                {tripId ? (
                  <Link
                    href={`/trip/${tripId}`}
                    data-testid="checkout-trip-link"
                    className="mt-2 inline-flex items-center gap-1 font-mono-technical text-mono-technical text-ochre-dark hover:text-primary"
                  >
                    View trip
                    <Icon name="arrow-right" className="text-[16px]" />
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
                  Keep shaping this day
                </h1>
                <p className="font-headline-sm text-headline-sm text-on-surface-variant">
                  Start with the clear activity brief, then add an optional
                  editorial refinement when the day needs a closer read. Rumia
                  never books, chooses accommodation, or takes over the plan.
                </p>
                <p className="font-mono-micro text-mono-micro uppercase tracking-widest text-on-surface-variant/70 mt-3">
                  for your saved day
                </p>
              </header>

              <PackageSelector tripId={tripId} />
              <div className="hidden grid grid-cols-1 md:grid-cols-2 gap-4" aria-hidden="true">
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
                        <Icon name="check_circle" className="text-olive-light text-[18px] mt-0.5" />
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
                        <Icon name={item.icon} className="text-ochre-light text-[18px] mt-0.5" />
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
                  <Icon name="info" className="text-[18px]" />
                  These tiers apply to a specific trip. Plan one first and
                  the checkout options will land here automatically.
                </p>
              ) : null}
            </section>
          </div>
        </div>
      </div>
    </PublicRouteLayout>
  );
}
