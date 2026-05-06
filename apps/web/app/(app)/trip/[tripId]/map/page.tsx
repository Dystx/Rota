import Link from "next/link";
import { generateItineraryFromBrief } from "@repo/ai";
import { getTripDraftById, isPersistenceConfigError, listPartners } from "@repo/db";
import { buildRouteValidation } from "@repo/routing";
import {
  type MapRouteWarning,
  Badge,
  Button,
  Card,
  CardContent,
  CinematicGuide,
  CTASection,
  GuideChapter,
  GuideProgress,
  MapPanel,
  PageShell,
  RevealSection,
  RouteMap,
  StatPill,
  TravelTimeChip
} from "@repo/ui";
import { buildPartnerClickHref, selectRelevantPartners } from "@/lib/partner-enrichment";
import { PrewarmLink } from "./map-components";

export default async function TripMapPage({
  params,
  searchParams
}: {
  params: Promise<{ tripId: string }>;
  searchParams: Promise<{ day?: string }>;
}) {
  const { tripId } = await params;
  const { day } = await searchParams;
  const requestedDayIndex = Number(day);
  const selectedDayIndex = Number.isInteger(requestedDayIndex) && requestedDayIndex > 0 ? requestedDayIndex : 1;
  let trip = null;
  let itinerary = null;
  let partnerOffers = [] as Awaited<ReturnType<typeof listPartners>>;
  let routeValidation = null;
  let infoMessage = "";

  try {
    trip = await getTripDraftById(tripId);

    if (trip) {
      itinerary = await generateItineraryFromBrief(trip.brief);
      routeValidation = buildRouteValidation(itinerary);
      partnerOffers = selectRelevantPartners(
        await listPartners(),
        [routeValidation.days[0]?.region ?? trip.brief.regions[0] ?? ""],
        trip.brief.destinationCountry
      );
    }
  } catch (error) {
    infoMessage = isPersistenceConfigError(error)
      ? "Saved route data is not available right now. Showing the latest preview."
      : error instanceof Error
        ? "Could not load the saved trip route yet."
        : "Could not load the saved trip route yet.";
  }

  const activeDay = routeValidation?.days.find((routeDay) => routeDay.dayIndex === selectedDayIndex) ?? routeValidation?.days[0];
  const activeItineraryDay = itinerary?.days.find((routeDay) => routeDay.dayIndex === activeDay?.dayIndex) ?? itinerary?.days[0];
  const activeWarnings = routeValidation?.warnings.filter(
    (warning) => warning.dayIndex === activeDay?.dayIndex || warning.dayIndex === undefined
  );
  const mapDays =
    routeValidation?.days.map((routeDay) => ({
      id: String(routeDay.dayIndex),
      stops: routeDay.points.map((point, index) => ({
        id: `${routeDay.dayIndex}-${point.index}`,
        isActive: routeDay.dayIndex === activeDay?.dayIndex ? index === 0 || index === routeDay.points.length - 1 : false,
        label: point.placeName,
        x: point.x,
        y: point.y
      })),
      title: `${routeDay.label} · ${routeDay.region}`
    })) ?? [];
  const mapWarnings: MapRouteWarning[] =
    activeWarnings?.map((warning, index) => ({
      id: `${warning.code}-${warning.dayIndex ?? "all"}-${index}`,
      message: warning.title,
      severity:
        warning.severity === "critical" ? "high" : warning.severity === "warning" ? "medium" : "low"
    })) ?? [];

  const chapters = [
    { id: "overview", label: "Overview" },
    { id: "pacing", label: "Pacing" },
    { id: "route", label: "Route" },
    { id: "warnings", label: "Notes" },
    { id: "next-step", label: "Continue" }
  ];

  const heroTitle = trip ? trip.title : "Route validation & map";
  const heroSummary =
    routeValidation?.summary ??
    "Daily pacing model with stop sequences, travel-time labels, and validation notes.";
  const dayPills = routeValidation?.days ?? Array.from({ length: 3 }, (_, index) => ({ dayIndex: index + 1, label: `Day ${index + 1}`, region: "" }));
  const warningList =
    routeValidation?.warnings ??
    itinerary?.warnings.map((warning, index) => ({ title: warning, code: `itinerary-${index}`, detail: "" })) ??
    [];

  return (
    <PageShell variant="app">
      <CinematicGuide>
        <GuideProgress chapters={chapters} />

        <GuideChapter id="overview" className="py-12 md:py-24">
          <div className="mx-auto max-w-[860px] grid gap-8">
            <RevealSection>
              <p className="rota-kicker text-[var(--color-atlantic)]">Route audit · Trip {tripId}</p>
              <h1 className="mt-4 font-[family-name:var(--font-rota-display)] text-5xl tracking-tight text-[var(--color-foreground)] lg:text-6xl">
                {heroTitle}
              </h1>
              <p className="rota-muted mt-6 max-w-3xl text-xl leading-relaxed">{heroSummary}</p>
            </RevealSection>

            {infoMessage ? (
              <RevealSection delayMs={120}>
                <Card>
                  <CardContent className="pt-6">
                    <p className="rota-muted text-sm">{infoMessage}</p>
                  </CardContent>
                </Card>
              </RevealSection>
            ) : null}

            <RevealSection delayMs={200}>
              <div className="flex flex-wrap gap-3">
                <StatPill label="Days" value={String(routeValidation?.days.length ?? itinerary?.days.length ?? 0)} />
                <StatPill label="Notes" value={String(warningList.length)} />
                <StatPill label={`Stops · day ${activeDay?.dayIndex ?? 1}`} value={String(activeDay?.points.length ?? 0)} />
              </div>
            </RevealSection>
          </div>
        </GuideChapter>

        <GuideChapter id="pacing" className="py-12 md:py-24">
          <div className="mx-auto max-w-[860px] grid gap-12">
            <RevealSection>
              <h2 className="font-[family-name:var(--font-rota-display)] text-4xl text-[var(--color-foreground)]">Why this pace fits you</h2>
            </RevealSection>
            <RevealSection delayMs={120}>
              <div className="grid gap-4 sm:grid-cols-2">
                {(itinerary?.whyThisFitsYou ?? [
                  "Show why this route pace fits the traveler.",
                  "Show where human review or route validation still needs to tighten the plan."
                ]).map((note) => (
                  <div key={note} className="rounded-[24px] border border-[var(--color-border)] bg-[rgba(247,250,249,0.5)] p-6 shadow-sm">
                    <p className="rota-muted leading-relaxed">{note}</p>
                  </div>
                ))}
              </div>
            </RevealSection>
          </div>
        </GuideChapter>

        <GuideChapter id="route" className="py-12 md:py-24">
          <div className="mx-auto max-w-[1200px] grid gap-8">
            <RevealSection>
              <div className="flex flex-wrap items-center gap-3">
                <span className="mr-2 text-xs font-semibold uppercase tracking-widest text-[var(--color-muted-foreground)]">
                  Route layers
                </span>
                {dayPills.map((routeDay) => {
                  const isActive = routeDay.dayIndex === activeDay?.dayIndex || (!activeDay && routeDay.dayIndex === 1);
                  return (
                    <PrewarmLink
                      key={routeDay.dayIndex}
                      href={`/trip/${tripId}/map?day=${routeDay.dayIndex}`}
                      className={[
                        "inline-flex items-center rounded-full border px-5 py-2 text-sm font-medium transition-all min-h-[44px]",
                        isActive
                          ? "border-[var(--color-foreground)] bg-[var(--color-foreground)] text-white shadow-md"
                          : "border-[var(--color-border)] bg-white/80 text-[var(--color-muted-foreground)] hover:bg-white hover:text-[var(--color-foreground)]"
                      ].join(" ")}
                    >
                      {routeDay.label}
                    </PrewarmLink>
                  );
                })}
              </div>
            </RevealSection>

            <RevealSection delayMs={160}>
              <RouteMap selectedDayId={activeDay ? String(activeDay.dayIndex) : undefined} days={mapDays} warnings={mapWarnings}>
                <MapPanel position="right" className="w-[380px] p-6">
                  <div className="flex flex-col gap-6">
                    <div>
                      <p className="rota-kicker mb-2">Day {activeDay?.dayIndex ?? 1} route</p>
                      <h3 className="font-[family-name:var(--font-rota-display)] text-2xl text-[var(--color-foreground)]">
                        {activeDay ? `${activeDay.label} · ${activeDay.region}` : "Saved route preview"}
                      </h3>
                      <p className="rota-muted mt-3 text-sm leading-relaxed">
                        {activeItineraryDay?.summary ??
                          "Route validation appears once a saved trip brief generates itinerary data."}
                      </p>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      <TravelTimeChip time={activeDay ? `${activeDay.estimatedTravelMinutes} min` : "Pending"} distance="Drive time" />
                      <StatPill label="Stops" value={String(activeDay?.points.length ?? 0)} />
                    </div>

                    <div className="relative mt-2 flex flex-col gap-6 before:absolute before:inset-y-4 before:left-[11px] before:w-px before:bg-[var(--color-border)]">
                      {(activeDay?.points ?? []).map((point, index) => {
                        const stop = activeItineraryDay?.stops[index];

                        return (
                          <div key={`${point.dayIndex}-${point.index}`} className="relative pl-10">
                            <div className="absolute left-0 top-0.5 flex h-6 w-6 items-center justify-center rounded-full border-[2px] border-white bg-[var(--color-foreground)] shadow-sm">
                              <span className="text-[9px] font-bold text-white">{point.placeName.charAt(0)}</span>
                            </div>
                            <div className="flex flex-col gap-2">
                              <p className="text-[15px] font-semibold leading-tight text-[var(--color-foreground)]">{point.placeName}</p>
                              <TravelTimeChip className="self-start bg-white/50" time={point.timeLabel} />
                            </div>
                            {stop ? (
                              <div className="mt-4 rounded-xl border border-black/5 bg-white/60 p-4 shadow-sm">
                                <p className="text-sm leading-relaxed text-[var(--color-muted-foreground)]">{stop.reason}</p>
                                {stop.localTip && (
                                  <p className="mt-4 text-[10px] font-bold uppercase tracking-widest text-[var(--color-atlantic)]">
                                    Tip: {stop.localTip}
                                  </p>
                                )}
                              </div>
                            ) : null}
                          </div>
                        );
                      })}
                    </div>

                    {partnerOffers.length ? (
                      <div className="mt-4 flex flex-col gap-5 border-t border-[var(--color-border)] pt-6">
                        <p className="rota-kicker">Booking sources</p>
                        {partnerOffers.map((partner) => (
                          <div key={partner.id} className="rounded-2xl border border-black/5 bg-white p-5 shadow-sm transition-all hover:shadow-md">
                            <div className="flex flex-wrap items-center justify-between gap-3">
                              <div>
                                <p className="text-sm font-semibold text-[var(--color-foreground)]">{partner.name}</p>
                                <p className="rota-muted mt-1 text-[10px] uppercase tracking-wider">{partner.type || "Booking source"}</p>
                              </div>
                              {partner.isAffiliate ? <Badge tone="soft">Affiliate</Badge> : null}
                            </div>
                            <p className="rota-muted mt-3 text-xs leading-relaxed">{partner.notes || "Useful for booking or comparing a stop on this route."}</p>
                            <div className="mt-4">
                              <Button asChild variant="ghost" className="h-8 w-full text-xs">
                                <Link
                                  href={buildPartnerClickHref({
                                    partnerId: partner.id,
                                    source: "trip-map",
                                    target: partner.link,
                                    tripId
                                  })}
                                  rel="noopener noreferrer"
                                  target="_blank"
                                >
                                  Open booking source
                                </Link>
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : null}
                  </div>
                </MapPanel>
              </RouteMap>
            </RevealSection>
          </div>
        </GuideChapter>

        <GuideChapter id="warnings" className="py-12 md:py-24">
          <div className="mx-auto max-w-[860px] grid gap-8">
            <RevealSection>
              <h2 className="font-[family-name:var(--font-rota-display)] text-4xl text-[var(--color-foreground)]">Route notes</h2>
              <p className="rota-muted mt-4 text-lg leading-relaxed">
                Items the route audit flagged for tightening. Reviewer polish addresses these directly.
              </p>
            </RevealSection>
            <RevealSection delayMs={120}>
              <div className="flex flex-col gap-3">
                {warningList.length === 0 ? (
                  <div className="rounded-[24px] border border-[var(--color-border)] bg-white/60 p-6">
                    <p className="rota-muted text-sm">No flagged notes for this route.</p>
                  </div>
                ) : (
                  warningList.map((warning, index) => (
                    <div key={`${warning.code}-${index}`} className="flex items-start gap-3 rounded-2xl border border-[var(--color-border)] bg-white/60 p-4">
                      <div className="mt-1 h-2 w-2 shrink-0 rounded-full bg-[var(--color-atlantic)]" />
                      <p className="text-sm font-medium leading-snug text-[var(--color-foreground)]">{warning.title}</p>
                    </div>
                  ))
                )}
              </div>
            </RevealSection>
          </div>
        </GuideChapter>

        <GuideChapter id="next-step" className="p-0">
          <CTASection>
            <h2 className="font-[family-name:var(--font-rota-display)] text-4xl md:text-5xl">Continue with this route</h2>
            <p className="text-xl text-[var(--color-cream)] max-w-2xl">
              Return to the guided overview or open the export center when you are ready.
            </p>
            <div className="flex flex-wrap justify-center gap-4 mt-4">
              <Button asChild className="bg-[var(--color-paper)] text-[var(--color-ink)] hover:bg-white/90 text-lg px-8 py-3 h-auto min-h-[44px]">
                <Link href={`/trip/${tripId}`}>Back to trip</Link>
              </Button>
              <Button asChild variant="ghost" className="border border-[var(--color-paper)] text-[var(--color-paper)] hover:bg-white/10 text-lg px-8 py-3 h-auto min-h-[44px]">
                <Link href={`/trip/${tripId}/export`}>Open export center</Link>
              </Button>
            </div>
          </CTASection>
        </GuideChapter>
      </CinematicGuide>
    </PageShell>
  );
}
