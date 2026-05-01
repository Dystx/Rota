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
  MapPanel,
  PageShell,
  RouteMap,
  StatPill,
  TravelTimeChip
} from "@repo/ui";
import { buildPartnerClickHref, selectRelevantPartners } from "@/lib/partner-enrichment";

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
      ? "Supabase environment variables are not configured yet, so this page cannot load a saved route preview."
      : error instanceof Error
        ? error.message
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
    activeWarnings?.map((warning) => ({
      id: `${warning.code}-${warning.dayIndex ?? "all"}`,
      message: warning.title,
      severity:
        warning.severity === "critical" ? "high" : warning.severity === "warning" ? "medium" : "low"
    })) ?? [];

  return (
    <PageShell variant="app">
      <div className="mb-16 grid gap-6">
        <p className="rota-kicker text-[var(--color-accent)]">Rota — Your Plan Audit</p>
        <h1 className="font-[family-name:var(--font-rota-display)] text-5xl tracking-tight text-[var(--color-foreground)] lg:text-6xl">
          {trip ? trip.title : "Route validation & map"}
        </h1>
        <p className="rota-muted max-w-3xl text-xl leading-relaxed">
          {routeValidation?.summary ??
            "We've analyzed your brief and built a daily pacing model. Review the layers, stop sequences, travel-time labels, and our validation notes."}
        </p>
      </div>

      {infoMessage ? (
        <Card className="mb-12">
          <CardContent className="pt-6">
            <p className="rota-muted text-sm">{infoMessage}</p>
          </CardContent>
        </Card>
      ) : null}

      <div className="mb-16 grid gap-8 lg:grid-cols-3">
        <div className="grid gap-6 lg:col-span-2">
          <div className="flex items-center gap-4 border-b border-[var(--color-border)] pb-4">
            <h2 className="rota-heading text-2xl">Why this pace fits you</h2>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {(itinerary?.whyThisFitsYou ?? [
              "Show why this route pace fits the traveler.",
              "Show where human review or route validation still needs to tighten the plan."
            ]).map((note) => (
              <div key={note} className="rounded-2xl border border-[var(--color-border)] bg-[rgba(247,250,249,0.5)] p-6 shadow-sm">
                <p className="rota-muted leading-relaxed">{note}</p>
              </div>
            ))}
          </div>
        </div>
        <div className="grid gap-6">
          <div className="flex items-center gap-4 border-b border-[var(--color-border)] pb-4">
            <h2 className="rota-heading text-2xl">Route Warnings</h2>
          </div>
          <div className="flex flex-col gap-3">
            {(routeValidation?.warnings ?? itinerary?.warnings.map((warning, index) => ({ title: warning, code: `itinerary-${index}` })) ?? []).map(
              (warning) => (
                <div key={warning.code} className="flex items-start gap-3 rounded-2xl border border-[var(--color-border)] bg-white/50 p-4">
                  <div className="mt-1 h-2 w-2 shrink-0 rounded-full bg-[var(--color-accent)]" />
                  <p className="text-sm font-medium leading-snug text-[var(--color-foreground)]">{warning.title}</p>
                </div>
              )
            )}
          </div>
        </div>
      </div>

      <div className="grid gap-6">
        <div className="flex flex-wrap items-center gap-3">
          <span className="mr-2 text-xs font-semibold uppercase tracking-widest text-[var(--color-muted-foreground)]">
            Route Layers
          </span>
          {(routeValidation?.days ?? Array.from({ length: 3 }, (_, index) => ({ dayIndex: index + 1, label: `Day ${index + 1}` }))).map(
            (routeDay) => {
              const isActive = routeDay.dayIndex === activeDay?.dayIndex || (!activeDay && routeDay.dayIndex === 1);

              return (
                <Link
                  key={routeDay.dayIndex}
                  href={`/trip/${tripId}/map?day=${routeDay.dayIndex}`}
                  className={[
                    "inline-flex items-center rounded-full border px-5 py-2 text-sm font-medium transition-all",
                    isActive
                      ? "border-[var(--color-foreground)] bg-[var(--color-foreground)] text-white shadow-md"
                      : "border-[var(--color-border)] bg-white/80 text-[var(--color-muted-foreground)] hover:bg-white hover:text-[var(--color-foreground)]"
                  ].join(" ")}
                >
                  {routeDay.label}
                </Link>
              );
            }
          )}
        </div>

        <RouteMap selectedDayId={activeDay ? String(activeDay.dayIndex) : undefined} days={mapDays} warnings={mapWarnings}>
          <MapPanel position="right" className="w-[380px] p-6">
            <div className="flex flex-col gap-6">
              <div>
                <p className="rota-kicker mb-2">Day {activeDay?.dayIndex ?? 1} Route</p>
                <h3 className="font-[family-name:var(--font-rota-display)] text-2xl text-[var(--color-foreground)]">
                  {activeDay ? `${activeDay.label} · ${activeDay.region}` : "Route preview shell"}
                </h3>
                <p className="rota-muted mt-3 text-sm leading-relaxed">
                  {activeItineraryDay?.summary ??
                    "The first route validation layer appears here once a saved trip brief can generate itinerary data."}
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
                            <p className="mt-4 text-[10px] font-bold uppercase tracking-widest text-[var(--color-accent)]">
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
      </div>
    </PageShell>
  );
}
