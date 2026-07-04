import Link from "next/link";
import { Metadata } from "next";
import { generateItineraryFromBrief } from "@repo/ai";
import { getTripDraftById } from "@repo/db";
import { getCheckoutPlan } from "@repo/payments";
import { 
  Badge, Button, PageShell, RevealSection, StatPill, 
  CinematicGuide, GuideProgress, GuideChapter, CTASection,
  ItineraryTimeline, TimelineDay
} from "@repo/ui";
import { getTripCommerceState } from "@/lib/trip-commerce";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { CinematicHero } from "./_components/cinematic-hero";
import CinematicMapSection from "./_components/cinematic-map-section";
import { StopFilmstrip, type FilmstripStop } from "./_components/stop-filmstrip";

export const metadata: Metadata = {
  robots: { index: false, follow: false }
};

function prettify(value: string) { return value.replace(/-/g, " "); }

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

const FALLBACK_PREVIEW_DAYS: DisplayDay[] = [
  {
    dayIndex: 1, theme: "Arrival & Orientation", summary: "Get settled and explore the immediate surroundings.",
    stops: [{ startTime: "14:00", placeName: "Hotel check-in" }, { startTime: "16:00", placeName: "Orientation walk" }],
    warnings: [],
  },
  {
    dayIndex: 2, theme: "Guided Exploration", summary: "A full day discovering key highlights.",
    stops: [{ startTime: "09:00", placeName: "Morning activity" }, { startTime: "14:00", placeName: "Afternoon activity" }],
    warnings: [],
  }
];

export default async function TripDetailPage({
  params
}: {
  params: Promise<{ tripId: string }>;
  searchParams: Promise<{ review?: string; unlock?: string }>;
}) {
  const { tripId } = await params;
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  let trip = null;
  let itinerary: GeneratedItinerary | null = null;

  try {
    trip = await getTripDraftById(tripId);
    if (trip && trip.ownerUserId && (!user || user.id !== trip.ownerUserId)) {
      return (
        <PageShell variant="app">
          <div className="relative mb-12 lg:mb-24 overflow-hidden rounded-[24px] lg:rounded-[32px] px-6 py-16 text-center lg:px-12 lg:py-32">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(182,235,254,0.15),transparent_40%),radial-gradient(circle_at_bottom_left,rgba(48,101,118,0.05),transparent_50%),linear-gradient(to_bottom,rgba(247,250,249,0),rgba(247,250,249,1))]"></div>
            <div className="relative mx-auto grid max-w-3xl gap-6">
              <h1 className="font-[family-name:var(--font-rota-display)] text-5xl text-[var(--color-foreground)]">Trip not found</h1>
              <p className="mx-auto max-w-2xl font-[family-name:var(--font-inter)] text-lg text-[var(--color-muted-foreground)]">
                This trip does not exist or you do not have permission to view it.
              </p>
              <div><Button asChild className="bg-foreground text-white hover:bg-ink-soft"><Link href="/account">Back to account</Link></Button></div>
            </div>
          </div>
        </PageShell>
      );
    }
    if (trip) {
      itinerary = await generateItineraryFromBrief(trip.brief);
    }
  } catch {
    trip = null;
    itinerary = null;
  }

  const title = trip ? trip.title : "Generated route overview preview";
  const tripCommerceState = getTripCommerceState({ status: trip?.status, hasHumanReview: trip?.hasHumanReview, isPaid: trip?.isPaid });
  const checkoutPlan = getCheckoutPlan(tripCommerceState.canUnlock ? "paid-trip" : tripCommerceState.canRequestReview ? "human-polish" : "free-preview");
  const timelineDaysRaw: DisplayDay[] = itinerary?.days ?? FALLBACK_PREVIEW_DAYS;

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
  const firstDay = timelineDaysRaw[0];
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
    <PageShell variant="app">
      <CinematicGuide>
        <GuideProgress chapters={chapters} />

        <GuideChapter id="overview" className="p-0">
          <div data-testid="trip-overview-header">
          <CinematicHero
            title={title}
            region={trip ? trip.brief.regions.map(prettify).join(", ") : undefined}
            durationDays={trip?.brief.tripLengthDays}
          />
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
                    <h3 className="font-[family-name:var(--font-rota-display)] text-2xl text-[var(--color-foreground)]">
                      {trip?.title ?? title}
                    </h3>
                  </div>
                  {trip ? (
                    <Link
                      href="#route"
                      data-testid="trip-brief-view-route"
                      className="inline-flex items-center gap-2 bg-olive-light text-on-primary font-label-ui text-label-ui px-5 py-2 rounded-full hover:bg-olive-dark transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ochre-light focus-visible:ring-offset-2"
                    >
                      View Route
                      <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                    </Link>
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

                <div className="grid gap-4 text-sm">
                  <SummaryRow label="Country" value={trip?.brief.destinationCountry ?? "Portugal"} />
                  <SummaryRow label="Regions" value={trip ? trip.brief.regions.map(prettify).join(", ") : "—"} />
                  <SummaryRow label="Interests" value={trip ? trip.brief.interests.map(prettify).join(", ") : "—"} />
                  <SummaryRow label="Transport" value={trip ? prettify(trip.brief.transportMode) : "—"} />
                  <SummaryRow label="Status" value={trip?.status ?? "Draft"} />
                  <SummaryRow label="Access" value={tripCommerceState.accessLabel} />
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
                      <span className="material-symbols-outlined text-[16px] mr-1">support_agent</span>
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
                  <h2 className="font-[family-name:var(--font-rota-display)] text-4xl text-[var(--color-foreground)]">Route & Pacing</h2>
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
               <div className="text-center"><p className="text-lg text-[var(--color-muted-foreground)]">No pacing info available.</p></div>
            )}
          </div>
        </GuideChapter>

        <GuideChapter id="route" className="p-0 relative min-h-[60vh]">
          {itinerary?.days && (
            <CinematicMapSection
              days={itinerary.days}
              tripId={tripId}
              reducedMotion={false}
              filmstripStops={filmstripStops}
            />
          )}
        </GuideChapter>

        {filmstripStops.length > 0 && (
          <section className="py-12 md:py-16 bg-surface-container-low/40 border-t border-olive-light/10">
            <div className="mx-auto max-w-[1400px]">
              <StopFilmstrip stops={filmstripStops} />
            </div>
          </section>
        )}

        <GuideChapter id="itinerary" className="py-12 md:py-24">
          <div className="mx-auto max-w-[800px]">
            <h2 className="font-[family-name:var(--font-rota-display)] text-4xl text-[var(--color-foreground)] mb-12">Detailed Itinerary</h2>
            <ItineraryTimeline days={timelineDays} readOnly={false} />
          </div>
        </GuideChapter>

        <GuideChapter id="unlock" className="py-12 md:py-24 bg-[var(--color-ink)] text-[var(--color-paper)]">
          <div className="mx-auto max-w-[800px] grid gap-12">
            <div className="text-center">
              <h2 className="font-[family-name:var(--font-rota-display)] text-4xl">Unlock & Delivery</h2>
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
             <h2 className="font-[family-name:var(--font-rota-display)] text-4xl md:text-5xl">Ready to proceed?</h2>
             <p className="text-xl md:text-2xl text-[var(--color-cream)] max-w-2xl">Confirm your unlocking plan or request an expert human review to perfect these details.</p>
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
    </PageShell>
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
