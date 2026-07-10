import Link from "next/link";
import { Metadata } from "next";
import { redirect } from "next/navigation";
import { generateItineraryFromBrief } from "@repo/ai";
import { getCheckoutPlan } from "@repo/payments";
import { 
  Badge, Breadcrumb, Button, EmptyState, RevealSection, StatPill,
  CinematicGuide, GuideProgress, GuideChapter, CTASection,
  ItineraryTimeline, TimelineDay
} from "@repo/ui";
import { getTripCommerceState } from "@/lib/trip-commerce";
import { resolveCoverImage } from "@/lib/trip-cover";
import { getOwnedTrip } from "@/app/lib/trip-access";
import { CinematicHero } from "./_components/cinematic-hero";
import CinematicMapSection from "./_components/cinematic-map-section";
import { PaceToneControl } from "./_components/pace-tone-control";
import { StopFilmstrip, type FilmstripStop } from "./_components/stop-filmstrip";
import { TripContextBarClient } from "./_components/trip-context-bar-client";

export const metadata: Metadata = {
  robots: { index: false, follow: false }
};

function prettify(value: string) { return value.replace(/-/g, " "); }

/**
 * Resolve a hero cover image for a given trip. The current seeded
 * trip (3 — "5-day porto route") gets a curated Porto illustration
 * so the CinematicHero has visual identity on first paint. When
 * the destination preset has a cover of its own (real seed data
 * or a future curator upload), that wins. Falls back to a generic
 * Iberia illustration for trips outside the 9 known regions.
 *
 * The cover images live in `apps/web/public/trip-covers/` as
 * inline SVG so they ship in the bundle with zero network
 * dependency. The CinematicHero's Ken Burns effect applies to
 * whatever's passed in (image src or inline SVG).
 */

/**
 * Synthesize a 1-2 sentence summary of a TripBrief. The brief is
 * already structured (destination, regions, days, transport, etc.)
 * — the missing piece is a human-readable one-liner the user
 * reads at a glance. Pulls from the fields most users care about
 * and falls back gracefully when any are missing.
 */
function summarizeBrief(brief: import("@repo/types").TripBrief | undefined): string {
  if (!brief) {
    return "Your itinerary is being drafted. Once the brief is confirmed, the AI will produce day-by-day stops and a route.";
  }
  const days = brief.tripLengthDays;
  const country = brief.destinationCountry || "Portugal";
  const region = brief.regions?.[0] ? prettify(brief.regions[0]) : null;
  const transport = brief.transportMode ? prettify(brief.transportMode) : null;
  const interests = brief.interests?.length
    ? brief.interests.map(prettify).join(", ")
    : null;

  const place = [region, country].filter(Boolean).join(", ");
  const moves = transport ? `${days}-day ${transport} itinerary through ${place}` : `${days}-day itinerary through ${place}`;
  const flavor = interests ? ` — focusing on ${interests}.` : ".";
  return `A ${moves}${flavor}`;
}

type GeneratedItinerary = Awaited<ReturnType<typeof generateItineraryFromBrief>>;
type ItineraryDay = GeneratedItinerary["days"][number];
type ItineraryStop = ItineraryDay["stops"][number];
type PreviewStop = Pick<
  ItineraryStop,
  "startTime" | "placeName" | "lng" | "lat"
>;
type DisplayStop = ItineraryStop | PreviewStop | string;
type DisplayDay = Pick<ItineraryDay, "dayIndex" | "theme" | "summary" | "warnings"> & {
  stops: DisplayStop[];
};

export default async function TripDetailPage({
  params,
  searchParams
}: {
  params: Promise<{ tripId: string }>;
  searchParams: Promise<{ review?: string; unlock?: string; day?: string }>;
}) {
  const { tripId } = await params;
  const query = await searchParams;
  const tripAccess = await getOwnedTrip(tripId);

  if (tripAccess.kind === "anonymous") {
    redirect(`/sign-in?next=${encodeURIComponent(`/trip/${tripId}`)}`);
  }

  if (tripAccess.kind !== "ok") {
    redirect("/itineraries?notice=unavailable");
  }

  const trip = tripAccess.trip;
  let itinerary: GeneratedItinerary | null = null;
  let itineraryError = false;

  try {
    itinerary = await generateItineraryFromBrief(trip.brief);
  } catch {
    itinerary = null;
    itineraryError = true;
  }

  const title = trip ? trip.title : "Generated route overview preview";
  const tripCommerceState = getTripCommerceState({ status: trip?.status, hasHumanReview: trip?.hasHumanReview, isPaid: trip?.isPaid });
  const checkoutPlan = getCheckoutPlan(tripCommerceState.canUnlock ? "paid-trip" : tripCommerceState.canRequestReview ? "human-polish" : "free-preview");
  // Do not synthesize preview days when generation failed or returned
  // an empty payload: that would present guessed stops as ready data.
  const timelineDaysRaw: DisplayDay[] = itinerary?.days ?? [];
  const itineraryEmpty = Boolean(itinerary && itinerary.days.length === 0);

  const timelineDays: TimelineDay[] = timelineDaysRaw.map((day) => ({
    id: `day-${day.dayIndex}`,
    dateLabel: `Day ${day.dayIndex} · ${day.theme}`,
    activities: day.stops.map((stop, idx) => {
      const time = typeof stop === 'string' ? stop.split(' ')[0] : stop.startTime;
      const place = typeof stop === 'string' ? stop.split(' ').slice(1).join(' ') : stop.placeName;
      return {
        id: `day-${day.dayIndex}-stop-${idx}`,
        timeLabel: time,
        title: place,
        description: idx === 0 ? day.summary : undefined,
        locked: tripCommerceState.canUnlock && day.dayIndex > 1
      };
    })
  }));

  const chapters = [
    { id: "overview", label: "Overview" },
    { id: "pacing", label: "Pacing" },
    { id: "route", label: "Route" },
    { id: "itinerary", label: "Itinerary" },
    { id: "unlock", label: "Unlock" },
    { id: "next-step", label: "Next Step" }
  ];

  // Flatten the day/stop tree into the filmstrip's stop list.
  // The filmstrip shows the first day's stops under "Today's Stops";
  // the vertical ItineraryTimeline below still shows the full week.
  const requestedDay = Number(query.day);
  const hasExplicitDay = Number.isInteger(requestedDay) && requestedDay > 0;
  // A default visit should land on the first day that has map data. Keep an
  // explicit query day distinct so an unresolved day can remain selected.
  const selectedDayIndex = hasExplicitDay ? requestedDay : undefined;
  const defaultDay = timelineDaysRaw.find((day) =>
    day.stops.some((stop) => typeof stop !== "string" && stop.lng !== undefined && stop.lat !== undefined)
  ) ?? timelineDaysRaw[0];
  const filmstripDayIndex = selectedDayIndex ?? defaultDay?.dayIndex;
  const firstDay = timelineDaysRaw.find((day) => day.dayIndex === filmstripDayIndex) ?? defaultDay;
  const filmstripStops: FilmstripStop[] = firstDay
    ? firstDay.stops.map((stop, idx) => {
        const time = (
          typeof stop === "string" ? stop.split(" ")[0] : stop.startTime
        ) ?? "00:00";
        const place =
          typeof stop === "string"
            ? stop.split(" ").slice(1).join(" ")
            : stop.placeName;
        // The deterministic itinerary provider now emits
        // `lng`/`lat` on every stop (see `REGION_CENTROIDS` in
        // `packages/ai/src/index.ts`). When the stop has both
        // fields, project them into the `[lng, lat]` tuple the
        // filmstrip's `FilmstripStopForMap.coordinates` expects.
        // The filmstrip's onClick guard treats missing
        // coordinates as a no-op, so legacy stops without
        // coords render correctly.
        const coordinates =
          typeof stop === "string" || stop.lng === undefined || stop.lat === undefined
            ? undefined
            : ([stop.lng, stop.lat] as const);
        return {
          id: `day-${firstDay.dayIndex}-stop-${idx}`,
          dayIndex: firstDay.dayIndex,
          startTime: time,
          placeName: place,
          description: firstDay.summary,
          imageSeed: `trip-${tripId}-stop-${idx}`,
          coordinates
        };
      })
    : [];

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-[1100px] px-6 pt-6">
        <Breadcrumb
          items={[
            { label: "Itineraries", href: "/itineraries" },
            { label: title }
          ]}
        />
        {trip ? (
          <div className="flex justify-end pt-4">
            <a
              href={`/trip/${tripId}/map`}
              data-testid="trip-brief-open-map"
              className="inline-flex items-center gap-2 rounded-full border border-olive-light/40 bg-white/70 px-5 py-2 font-label-ui text-label-ui text-primary transition-colors hover:bg-olive-light/15 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ochre-light focus-visible:ring-offset-2"
            >
              Open route map
            </a>
          </div>
        ) : null}
      </div>
      <CinematicGuide>
        <GuideProgress chapters={chapters} />

        <GuideChapter id="overview" className="p-0">
          <div data-testid="trip-overview-header">
          <CinematicHero
            title={title}
            region={trip ? trip.brief.regions.map(prettify).join(", ") : undefined}
            durationDays={trip?.brief.tripLengthDays}
            coverImageUrl={resolveCoverImage(trip?.brief)}
          />
          {trip ? (
            <div className="mx-auto max-w-[1100px] px-6 pt-6" data-testid="trip-context-bar">
              <TripContextBarClient draft={{
                destination: trip.brief.regions.map(prettify).join(", ") || prettify(trip.brief.destinationCountry),
                days: trip.brief.tripLengthDays,
                travelWindow: null,
                transport: prettify(trip.brief.transportMode),
                vibe: trip.brief.pace ? prettify(trip.brief.pace) : "Balanced"
              }} tripState={tripCommerceState.canExport ? "unlocked" : "preview"} />
            </div>
          ) : null}
          <div className="mx-auto max-w-[800px] px-6 py-16 grid gap-6">
            <RevealSection delayMs={0}>
              <div
                data-testid="trip-brief-card"
                className="grid gap-6 rounded-[24px] border border-[var(--color-border)] bg-white/60 p-8 shadow-sm backdrop-blur-xl"
              >
                <div className="flex items-start justify-between gap-4 flex-wrap">
                  <div>
                    <p className="font-mono-micro text-mono-micro text-olive-light uppercase tracking-widest mb-1">
                      Overview
                    </p>
                    <h3 className="font-display text-2xl text-[var(--color-foreground)]">
                      {trip?.title ?? title}
                    </h3>
                  </div>
                  {trip ? (
                    <div className="flex flex-wrap gap-2">
                      <Link
                        href="#route"
                        data-testid="trip-brief-view-route"
                        className="inline-flex items-center gap-2 bg-olive-light text-on-primary font-label-ui text-label-ui px-5 py-2 rounded-full hover:bg-olive-dark transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ochre-light focus-visible:ring-offset-2"
                      >
                        View Route
                        <span className="ph text-[16px] ph-arrow-right">arrow-right</span>
                      </Link>
                    </div>
                  ) : null}
                </div>

                {/* 1-2 sentence synthesized summary. Falls back to a
                    generic "coming soon" line if the brief is missing
                    the fields the synthesizer reads. The synthesizer
                    is intentionally lightweight — it doesn't reach
                    for the AI provider; the brief is already
                    structured and the only thing missing is a
                    human-readable summary. */}
                <p className="font-body-md text-body-md text-on-surface-variant">
                  {summarizeBrief(trip?.brief)}
                </p>

                {/* Stitch 1.4 — pace & tone segmented control. Lives
                    in the workspace store (not local state) so the
                    map camera can react without prop-drilling. The
                    screen-reader announcement below keeps pace/tone
                    changes verbalized for keyboard users. */}
                <div className="pt-2 border-t border-[var(--color-border)]">
                  <PaceToneControl />
                </div>

                <div className="grid gap-4 text-sm">
                  <SummaryRow label="Country" value={trip?.brief.destinationCountry ?? "Portugal"} />
                  <SummaryRow label="Regions" value={trip ? trip.brief.regions.map(prettify).join(", ") : "—"} />
                  <SummaryRow label="Interests" value={trip ? trip.brief.interests.map(prettify).join(", ") : "—"} />
                  <SummaryRow label="Transport" value={trip ? prettify(trip.brief.transportMode) : "—"} />
                  <SummaryRow label="Status" value={trip?.status ?? "Draft"} />
                  <SummaryRow label="Access" value={tripCommerceState.accessLabel} />
                </div>

                {/* Stitch 1.4 — floating action buttons in the
                    brief card header. The real implementation is
                    inline here (not a separate component) because
                    the URLs are page-scoped and the buttons reuse
                    the existing /trip/[id]/export route. */}
                <div
                  data-testid="trip-brief-actions"
                  className="flex flex-wrap gap-2 pt-4 border-t border-[var(--color-border)]"
                >
                  <Link
                    href={`/trip/${tripId}/export`}
                    data-testid="trip-brief-share"
                    aria-label="Open export and share panel"
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/70 text-primary border border-olive-light/40 font-label-ui text-label-ui hover:bg-olive-light/15 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ochre-light focus-visible:ring-offset-2"
                  >
                    <span aria-hidden="true" className="ph text-[16px] ph-share-network">share-network</span>
                    Share
                  </Link>
                  <Link
                    href={`/trip/${tripId}/export`}
                    data-testid="trip-brief-download"
                    aria-label="Download this trip"
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-olive-light text-on-primary font-label-ui text-label-ui hover:bg-olive-dark transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ochre-light focus-visible:ring-offset-2"
                  >
                    <span aria-hidden="true" className="ph text-[16px] ph-download-simple">download-simple</span>
                    Download
                  </Link>
                </div>

                {tripCommerceState.canRequestReview ? (
                  <form
                    action={`/api/trips/${tripId}/review`}
                    method="post"
                    className="pt-4 border-t border-[var(--color-border)]"
                  >
                    <input type="hidden" name="intent" value="request" />
                    <input type="hidden" name="target" value="trip" />
                    <Button
                      type="submit"
                      data-testid="trip-brief-request-polish"
                      variant="ghost"
                      className="border border-olive-light text-olive-dark hover:bg-olive-light/10"
                    >
                      <span className="ph text-[16px] mr-1 ph-headset">headset</span>
                      Request Polish — async chat with a specialist
                    </Button>
                  </form>
                ) : null}
              </div>
            </RevealSection>
          </div>
          </div>
        </GuideChapter>

        <GuideChapter id="pacing" className="py-12 md:py-24">
          <div className="mx-auto max-w-[800px] grid gap-12">
            {itinerary ? (
              <RevealSection>
                <div className="grid gap-6 text-center">
                  <h2 className="font-display text-4xl text-[var(--color-foreground)]">Route & Pacing</h2>
                  <p className="text-lg leading-[1.6] text-[var(--color-muted-foreground)] font-[family-name:var(--font-inter)] mx-auto max-w-2xl">
                    {itinerary.routeOverview}
                  </p>
                  <div className="flex flex-wrap justify-center gap-3 mt-4">
                    <StatPill label="Confidence" value={`${Math.round(itinerary.confidenceScore * 100)}%`} />
                    <StatPill label="Missing Info" value={String(itinerary.missingInfo.length)} />
                  </div>
                </div>
              </RevealSection>
            ) : (
              <EmptyState
                icon="route"
                title="Route & pacing will appear here"
                description="Once the brief is confirmed, the AI drafts a day-by-day route with confidence scores and a list of missing inputs. Until then, this section stays empty so we don't show guesswork."
                variant="default"
              />
            )}
          </div>
        </GuideChapter>

        <GuideChapter id="route" className="p-0 relative min-h-[60vh]">
          {itinerary?.days && itinerary.days.length > 0 ? (
            <CinematicMapSection
              days={itinerary.days}
              tripId={tripId}
              reducedMotion={false}
              selectedDayIndex={selectedDayIndex}
              selectedDayIsExplicit={hasExplicitDay}
              filmstripStops={filmstripStops}
            />
          ) : (
            // No itinerary yet — show a friendly map-shaped empty
            // state instead of a min-h-[60vh] gray void. Uses the
            // `map` variant so the icon + copy fill the whole
            // section evenly.
            <EmptyState
              icon="map"
              title={itineraryError ? "Itinerary unavailable" : itineraryEmpty ? "No itinerary days yet" : "Itinerary is generating"}
              description={itineraryError ? "We couldn’t load the saved route. Your last saved trip details are unchanged; try again shortly." : itineraryEmpty ? "The saved itinerary has no day data yet. Try again after generation finishes." : "Your saved brief is ready; day-by-day stops will appear when generation finishes."}
              variant="map"
              action={itineraryError ? <Link href={`/trip/${tripId}?retry=1#route`} className="mt-4 inline-flex min-h-11 items-center rounded-full bg-olive-light px-5 text-white">Retry generation</Link> : undefined}
            />
          )}
        </GuideChapter>

        {filmstripStops.length > 0 && (
          <section className="py-12 md:py-16 bg-surface-container-low/40 border-t border-olive-light/10">
            <div className="mx-auto max-w-[1400px]">
              <nav aria-label="Trip days" className="mb-6 flex gap-2 overflow-x-auto px-container-padding-lg">
                {timelineDaysRaw.map((day) => <Link key={day.dayIndex} href={`?day=${day.dayIndex}#route`} aria-current={day.dayIndex === filmstripDayIndex ? "page" : undefined} className={`min-h-11 rounded-full border px-4 py-2 text-sm ${day.dayIndex === filmstripDayIndex ? "bg-olive-light text-white" : "bg-white/70"}`}>Day {day.dayIndex}</Link>)}
              </nav>
              <StopFilmstrip stops={filmstripStops} />
              <Link href="#itinerary" className="mt-2 inline-flex px-container-padding-lg text-sm font-medium underline">View day agenda</Link>
            </div>
          </section>
        )}

        <GuideChapter id="itinerary" className="py-12 md:py-24">
          <div className="mx-auto max-w-[800px]">
            <h2 className="font-display text-4xl text-[var(--color-foreground)] mb-12">Detailed Itinerary</h2>
            <ItineraryTimeline days={timelineDays} readOnly={false} />
          </div>
        </GuideChapter>

        <GuideChapter id="unlock" className="py-12 md:py-24 bg-[var(--color-ink)] text-[var(--color-paper)]">
          <div className="mx-auto max-w-[800px] grid gap-12">
            <div className="text-center">
              <h2 className="font-display text-4xl">Unlock & Delivery</h2>
              <p className="mt-4 text-lg text-[var(--color-cream)]">Get full access to this curated route.</p>
            </div>
            
            <div className="grid gap-6 rounded-[24px] border border-white/10 bg-white/5 p-8 shadow-sm backdrop-blur-xl text-white">
              <div className="flex flex-wrap gap-2 mb-4">
                {tripCommerceState.markers.map((marker) => (
                  <Badge key={marker} tone="glass">{marker}</Badge>
                ))}
              </div>
              <div className="grid gap-4 text-sm opacity-90">
                <SummaryRow label="Exports" value={tripCommerceState.exportLabel} />
                <SummaryRow label="Review" value={tripCommerceState.reviewLabel} />
                <SummaryRow label="Plan" value={checkoutPlan.priceLabel} />
              </div>
            </div>
          </div>
        </GuideChapter>

        <GuideChapter id="next-step" className="p-0">
          <CTASection>
             <h2 className="font-display text-4xl md:text-5xl">Ready to proceed?</h2>
             <p className="text-xl md:text-2xl text-[var(--color-cream)] max-w-2xl">Confirm your unlocking plan, chat with the destination specialist, or request an expert human review to perfect these details.</p>
             <div className="flex flex-wrap justify-center gap-4 mt-4">
               {tripCommerceState.canUnlock ? (
                 // The "Unlock Trip" CTA used to POST directly to the
                 // unlock API, which skipped the checkout surface
                 // and bypassed the tier comparison. Now we route
                 // through `/checkout?trip=<id>` so the user sees
                 // the Core AI vs Hybrid Specialist Review split
                 // and picks a tier explicitly. The checkout page
                 // posts the chosen tier back to the unlock API.
                 <Button asChild className="bg-[var(--color-paper)] text-[var(--color-ink)] hover:bg-white/90 text-lg px-8 py-3 h-auto">
                   <Link href={`/checkout?trip=${tripId}`}>Unlock Trip</Link>
                 </Button>
               ) : tripCommerceState.canExport ? (
                 <Button asChild className="bg-[var(--color-paper)] text-[var(--color-ink)] hover:bg-white/90 text-lg px-8 py-3 h-auto">
                   <Link href={`/trip/${tripId}/export`}>Export Options</Link>
                 </Button>
               ) : null}

               {/* Expert chat is per-trip — the per-trip "Open
                   expert chat" action lives here so the chat
                   surface is reachable without a public nav
                   link. The destination is the auth-gated
                   /expert-chat?trip=<id> page. */}
               <Button asChild variant="ghost" className="border border-[var(--color-paper)] text-[var(--color-paper)] hover:bg-white/10 text-lg px-8 py-3 h-auto">
                 <Link href={`/expert-chat?trip=${tripId}`}>
                   <span
                     aria-hidden
                     className="ph text-[20px] mr-1 ph-chat-circle-dots"
                     style={{ fontVariationSettings: "'FILL' 1" }}
                   >chat-circle-dots</span>
                   Open expert chat
                 </Link>
               </Button>

               {tripCommerceState.canRequestReview ? (
                 <form action={`/api/trips/${tripId}/review`} method="post">
                   <input type="hidden" name="intent" value="request" />
                   <input type="hidden" name="target" value="trip" />
                   <Button type="submit" variant="ghost" className="border border-[var(--color-paper)] text-[var(--color-paper)] hover:bg-white/10 text-lg px-8 py-3 h-auto">Request Polish</Button>
                 </form>
               ) : null}
             </div>
          </CTASection>
        </GuideChapter>
      </CinematicGuide>
    </div>
  );
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between items-center border-b border-current/20 pb-3 last:border-b-0 last:pb-0 gap-4">
      {/*
        SummaryRow is used in two contexts that need contrast in
        opposite directions:
          1. The Brief card (light surface, dark text inherited)
          2. The Unlock & Delivery card (dark ink surface, light
             paper text inherited)
        `opacity-60` originally read as #707e76 on the Brief card
        (4.17:1, just under WCAG AA) but passed on the Unlock card
        (paper at 60% on dark ink). Bumping to `opacity-75` keeps
        the inherited text color so the design adapts to whichever
        card it's in, while pushing the Brief side to ~6.5:1
        (WCAG AAA). The Unlock side lands at ~7:1 — still well
        above 4.5:1.
      */}
      <span className="text-[12px] font-semibold uppercase tracking-[0.1em] opacity-75">{label}</span>
      <span className="text-sm font-medium text-right">{value}</span>
    </div>
  );
}
