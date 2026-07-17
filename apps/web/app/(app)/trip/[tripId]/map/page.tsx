import Link from "next/link";
import { redirect } from "next/navigation";
import { generateItineraryFromBrief } from "@repo/ai";
import { isFeatureEnabled } from "@repo/config";
import { buildRouteValidation } from "@repo/routing";
import { buildCameraPresets } from "@repo/spatial-engine";
import {
  type MapRouteWarning,
  Button,
  Card,
  CardContent,
  CinematicGuide,
  CTASection,
  GuideChapter,
  GuideProgress,
  MapPanel,
  RevealSection,
  StatPill,
  TravelTimeChip
} from "@repo/ui";
import { getOwnedTrip } from "@/app/lib/trip-access";
import { PrewarmLink, RouteMap, RouteMapStatus } from "./map-components";

function editorialTitle(value: string) {
  return value.replace(/\broute\b/gi, "plan").replace(/\bitinerary\b/gi, "plan");
}

function editorialCopy(value: string) {
  return value.replace(/\broute\b/gi, "plan").replace(/\bitinerary\b/gi, "agenda");
}

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
  const tripAccess = await getOwnedTrip(tripId);

  if (tripAccess.kind === "anonymous") {
    redirect(`/sign-in?next=${encodeURIComponent(`/trip/${tripId}/map`)}`);
  }

  if (tripAccess.kind !== "ok") {
    redirect("/itineraries?notice=unavailable");
  }

  const trip = tripAccess.trip;
  let itinerary = null;
  let routeValidation = null;
  let infoMessage = "";

  try {
    itinerary = await generateItineraryFromBrief(trip.brief);
    routeValidation = buildRouteValidation(itinerary);
  } catch (error) {
    infoMessage = error instanceof Error
      ? "Could not load the saved plan view yet."
      : "Could not load the saved plan view yet.";
  }

  const activeDay = routeValidation?.days.find((routeDay) => routeDay.dayIndex === selectedDayIndex) ?? routeValidation?.days[0];
  const activeItineraryDay = itinerary?.days.find((routeDay) => routeDay.dayIndex === activeDay?.dayIndex) ?? itinerary?.days[0];
  const activityMapEnabled = isFeatureEnabled("activityMap");
  const storyPresets = buildCameraPresets(
    (activeItineraryDay?.stops ?? []).map((stop, index) => {
      if (typeof stop === "string") {
        return { id: `stop-${index + 1}`, label: stop, center: null };
      }
      return {
        id: `stop-${index + 1}`,
        label: stop.placeName,
        center: stop.lng !== undefined && stop.lat !== undefined ? [stop.lng, stop.lat] as const : null,
        startTime: stop.startTime
      };
    })
  );
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
    { id: "pacing", label: "Pace" },
    { id: "route", label: "Spatial view" },
    { id: "warnings", label: "Notes" },
    { id: "next-step", label: "Continue" }
  ];

  const heroTitle = trip ? editorialTitle(trip.title) : "Spatial view";
  const heroSummary =
    (routeValidation?.summary ? editorialCopy(routeValidation.summary) : null) ??
    "A practical spatial view for comparing the activities you kept, their order, and the time between them.";
  const dayPills = routeValidation?.days ?? Array.from({ length: 3 }, (_, index) => ({ dayIndex: index + 1, label: `Day ${index + 1}`, region: "" }));
  const warningList =
    routeValidation?.warnings ??
    itinerary?.warnings.map((warning, index) => ({ title: warning, code: `itinerary-${index}`, detail: "" })) ??
    [];

  return (
    <div className="min-h-screen bg-background" data-scene="atlas">
      <CinematicGuide>
        <GuideProgress chapters={chapters} />

        <GuideChapter id="overview" fullHeight={false} className="py-12 md:py-24">
          <div className="mx-auto max-w-[860px] grid gap-8" data-testid="trip-map-header">
            <RevealSection>
              <p className="text-xs uppercase tracking-widest text-ochre-dark font-medium text-[var(--color-atlantic)]">Spatial view · Saved plan</p>
              <h1 className="mt-4 font-display text-5xl tracking-tight text-[var(--color-foreground)] lg:text-6xl">
                {heroTitle}
              </h1>
              <p className="text-on-surface-variant leading-loose mt-6 max-w-3xl text-xl leading-relaxed">{heroSummary}</p>
            </RevealSection>

            {infoMessage ? (
              <RevealSection delayMs={120}>
                <Card>
                  <CardContent className="pt-6 space-y-4">
                    <div>
                      <p className="font-medium text-foreground">Spatial view unavailable</p>
                      <p className="text-on-surface-variant leading-loose text-base mt-1">
                        {infoMessage} Return to the saved plan and try the spatial view again when the route data is ready.
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-3">
                      <a
                        href={`/trip/${tripId}`}
                        className="inline-flex items-center justify-center px-4 py-2 rounded-lg bg-ink text-cream text-sm font-medium hover:bg-ink-soft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ochre-light focus-visible:ring-offset-2 transition-colors"
                      >
                        Back to saved plan
                      </a>
                      <a
                        href={`/trip/${tripId}/map?retry=1`}
                        className="inline-flex items-center justify-center px-4 py-2 rounded-lg border border-olive-light/30 text-ink text-sm font-medium hover:bg-olive-light/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ochre-light focus-visible:ring-offset-2 transition-colors"
                      >
                        Try again
                      </a>
                    </div>
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

        <GuideChapter id="pacing" fullHeight={false} className="py-12 md:py-24">
          <div className="mx-auto max-w-[860px] grid gap-12">
            <RevealSection>
              <h2 className="font-display text-4xl text-[var(--color-foreground)]">Why this pace fits you</h2>
            </RevealSection>
            <RevealSection delayMs={120}>
              <div className="grid gap-4 sm:grid-cols-2">
                {(itinerary?.whyThisFitsYou ?? [
                  "Show why this pace fits the activities and time you chose.",
                  "Use the list as the source of truth; this view adds spatial context without taking control away."
                ]).map((note) => (
                  <div key={note} className="rounded-[24px] border border-[var(--color-border)] bg-[rgba(247,250,249,0.5)] p-6 shadow-sm">
                    <p className="text-on-surface-variant leading-loose leading-relaxed">{note}</p>
                  </div>
                ))}
              </div>
            </RevealSection>
          </div>
        </GuideChapter>

        <GuideChapter id="route" fullHeight={false} className="py-12 md:py-24">
          <div className="mx-auto max-w-[1200px] grid gap-8">
            <RevealSection>
              <div className="flex flex-wrap items-center gap-3" data-testid="trip-map-day-tabs" aria-label="Plan day and spatial filters">
                <span className="mr-2 text-xs font-semibold uppercase tracking-widest text-[var(--color-muted-foreground)]">
                  Plan days
                </span>
                {dayPills.map((routeDay) => {
                  const isActive = routeDay.dayIndex === activeDay?.dayIndex || (!activeDay && routeDay.dayIndex === 1);
                  return (
                    <PrewarmLink
                      key={routeDay.dayIndex}
                      href={`/trip/${tripId}/map?day=${routeDay.dayIndex}`}
                      className={[
                        "inline-flex items-center rounded-full border px-5 py-2 text-sm font-medium transition-all min-h-[44px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-foreground)] focus-visible:ring-offset-2",
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
              <RouteMap
                tripId={tripId}
                selectedDayId={activeDay ? String(activeDay.dayIndex) : undefined}
                days={mapDays}
                warnings={mapWarnings}
                storyEnabled={activityMapEnabled && isFeatureEnabled("activityMapStorytelling")}
                storyPresets={storyPresets}
                showBuildingExtrusions={activityMapEnabled && isFeatureEnabled("activityMap3d")}
              >
                <MapPanel
                  position="right"
                  className="right-3 top-3 bottom-3 w-[calc(100%-1.5rem)] p-5 sm:right-6 sm:top-6 sm:bottom-6 sm:w-[380px] sm:p-6"
                >
                  <div className="flex flex-col gap-6">
                    <div>
                      <p className="text-xs uppercase tracking-widest text-ochre-dark font-medium mb-2">Day {activeDay?.dayIndex ?? 1} · Selected activities</p>
                      <h3 className="font-display text-2xl text-[var(--color-foreground)]">
                        {activeDay ? `${activeDay.label} · ${activeDay.region}` : "Saved plan preview"}
                      </h3>
                      <p className="text-on-surface-variant leading-loose mt-3 text-base leading-7">
                        {(activeItineraryDay?.summary ? editorialCopy(activeItineraryDay.summary) : null) ??
                          "Spatial context appears once the saved plan has activity data."}
                      </p>
                    </div>

                    <RouteMapStatus />

                    <div className="flex flex-wrap gap-2">
                      <TravelTimeChip time={activeDay ? `${activeDay.estimatedTravelMinutes} min` : "Pending"} distance="Drive time" />
                      <StatPill label="Stops" value={String(activeDay?.points.length ?? 0)} />
                      <span data-testid="route-stop-count" className="sr-only" aria-hidden="true">{String(activeDay?.points.length ?? 0)}</span>
                    </div>

                    <div
                      className="relative mt-2 flex flex-col gap-6 before:absolute before:inset-y-4 before:left-[11px] before:w-px before:bg-[var(--color-border)]"
                      data-testid="route-list-fallback"
                      role="list"
                      aria-label="Saved route stops"
                    >
                      {(activeDay?.points ?? []).map((point, index) => {
                        const stop = activeItineraryDay?.stops[index];

                        return (
                          <div key={`${point.dayIndex}-${point.index}`} className="relative pl-10" role="listitem" data-testid={`route-stop-${point.dayIndex}-${point.index}`}>
                            <div className="absolute left-0 top-0.5 flex h-6 w-6 items-center justify-center rounded-full border-[2px] border-white bg-[var(--color-foreground)] shadow-sm">
                              <span className="text-[9px] font-bold text-white">{point.placeName.charAt(0)}</span>
                            </div>
                            <div className="flex flex-col gap-2">
                              <p className="text-[15px] font-semibold leading-tight text-[var(--color-foreground)]">{point.placeName}</p>
                              <TravelTimeChip className="self-start bg-white/50" time={point.timeLabel} />
                            </div>
                            {stop ? (
                              <div className="mt-4 rounded-xl border border-black/5 bg-white/60 p-4 shadow-sm">
                                <p className="text-base leading-7 text-[var(--color-muted-foreground)]">{stop.reason}</p>
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

                  </div>
                </MapPanel>
              </RouteMap>
            </RevealSection>
          </div>
        </GuideChapter>

        <GuideChapter id="warnings" fullHeight={false} className="py-12 md:py-24">
          <div className="mx-auto max-w-[860px] grid gap-8">
            <RevealSection>
              <h2 className="font-display text-4xl text-[var(--color-foreground)]">Planning notes</h2>
              <p className="text-on-surface-variant leading-loose mt-4 text-lg leading-relaxed">
                Practical trade-offs to keep visible while you shape the day. They are prompts for judgement, not hidden failures.
              </p>
            </RevealSection>
            <RevealSection delayMs={120}>
              <div className="flex flex-col gap-3">
                {warningList.length === 0 ? (
                  <div className="rounded-[24px] border border-[var(--color-border)] bg-white/60 p-6">
                    <p className="text-on-surface-variant leading-loose text-base">No planning notes for this saved plan.</p>
                  </div>
                ) : (
                  warningList.map((warning, index) => (
                    <div key={`${warning.code}-${index}`} className="flex items-start gap-3 rounded-2xl border border-[var(--color-border)] bg-white/60 p-4">
                      <div className="mt-1 h-2 w-2 shrink-0 rounded-full bg-[var(--color-atlantic)]" />
                      <p className="text-base font-medium leading-7 text-[var(--color-foreground)]">{warning.title}</p>
                    </div>
                  ))
                )}
              </div>
            </RevealSection>
          </div>
        </GuideChapter>

        <GuideChapter id="next-step" fullHeight={false} className="p-0">
          <CTASection>
            <h2 className="font-display text-4xl md:text-5xl">Continue shaping the day</h2>
              <p className="text-xl text-[var(--color-cream)] max-w-2xl">
              Return to the saved plan or carry it into the export surface when you are ready.
            </p>
            <div className="flex flex-wrap justify-center gap-4 mt-4">
              <Button asChild className="bg-[var(--color-paper)] text-[var(--color-ink)] hover:bg-white/90 text-lg px-8 py-3 h-auto min-h-[44px]">
                <Link href={`/trip/${tripId}`}>Back to saved plan</Link>
              </Button>
              <Button asChild variant="ghost" className="border border-[var(--color-paper)] text-[var(--color-paper)] hover:bg-white/10 text-lg px-8 py-3 h-auto min-h-[44px]">
                <Link href={`/trip/${tripId}/export`}>Carry it with you</Link>
              </Button>
            </div>
          </CTASection>
        </GuideChapter>
      </CinematicGuide>
    </div>
  );
}
