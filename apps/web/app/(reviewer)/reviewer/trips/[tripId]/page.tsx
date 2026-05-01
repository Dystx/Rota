import Link from "next/link";
import { generateItineraryFromBrief } from "@repo/ai";
import { getTripDraftById, isPersistenceConfigError } from "@repo/db";
import { buildRouteValidation } from "@repo/routing";
import {
  type MapRouteWarning,
  Badge,
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  MapPanel,
  PageShell,
  RouteMap,
  SectionHeading,
  StatPill,
  TravelTimeChip
} from "@repo/ui";
import { getTripCommerceState } from "@/lib/trip-commerce";

export default async function ReviewerTripPage({
  params,
  searchParams
}: {
  params: Promise<{ tripId: string }>;
  searchParams: Promise<{ day?: string; review?: string }>;
}) {
  const { tripId } = await params;
  const { day, review } = await searchParams;
  const requestedDayIndex = Number(day);
  const selectedDayIndex = Number.isInteger(requestedDayIndex) && requestedDayIndex > 0 ? requestedDayIndex : 1;
  let trip = null;
  let itinerary = null;
  let routeValidation = null;
  let infoMessage = "";

  try {
    trip = await getTripDraftById(tripId);

    if (trip) {
      itinerary = await generateItineraryFromBrief(trip.brief);
      routeValidation = buildRouteValidation(itinerary);
    }
  } catch (error) {
    infoMessage = isPersistenceConfigError(error)
      ? "Supabase environment variables are not configured yet, so this workspace cannot load the saved route draft."
      : error instanceof Error
        ? error.message
        : "Could not load the reviewer trip yet.";
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
        isActive: routeDay.dayIndex === activeDay?.dayIndex ? index === 1 || index === routeDay.points.length - 1 : false,
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
  const tripCommerceState = getTripCommerceState({
    status: trip?.status,
    hasHumanReview: trip?.hasHumanReview,
    isPaid: trip?.isPaid
  });

  return (
    <PageShell variant="reviewer">
      <SectionHeading
        eyebrow={`Review trip ${tripId}`}
        title={trip ? `${trip.title} reviewer route` : "Expert reviewer workspace"}
        description="Built around route edits, local notes, substitutions, pacing alerts, and reviewer change summaries." 
      />
      {review === "queued" ? (
        <Card>
          <CardContent className="pt-6">
            <p className="rota-muted text-sm">This trip is now marked as in review.</p>
          </CardContent>
        </Card>
      ) : null}
      {review === "completed" ? (
        <Card>
          <CardContent className="pt-6">
            <p className="rota-muted text-sm">Reviewer completion saved. The trip now carries reviewed trust markers.</p>
          </CardContent>
        </Card>
      ) : null}
      {review === "locked" ? (
        <Card>
          <CardContent className="pt-6">
            <p className="rota-muted text-sm">This trip must be unlocked before it can move through human review.</p>
          </CardContent>
        </Card>
      ) : null}
      {infoMessage ? (
        <Card>
          <CardContent className="pt-6">
            <p className="rota-muted text-sm">{infoMessage}</p>
          </CardContent>
        </Card>
      ) : null}
      <div className="grid gap-8 xl:grid-cols-[0.9fr_1.1fr]">
        <div className="grid gap-6">
          <Card className="overflow-hidden border-black/5 bg-white/60 shadow-sm">
            <CardHeader className="px-8 pt-8">
              <CardTitle className="font-[family-name:var(--font-rota-display)] text-2xl">Client brief context</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-6 px-8 pb-8">
              <div className="flex flex-wrap gap-3">
                <StatPill label="Status" value={trip?.status ?? "Draft"} />
                <StatPill label="Travelers" value={String(trip?.brief.travelersCount ?? 0)} />
                <StatPill label="Transport" value={trip?.brief.transportMode ?? "Pending"} />
                <StatPill label="Unlock" value={tripCommerceState.accessLabel} />
                <StatPill label="Export" value={tripCommerceState.exportLabel} />
                <StatPill label="Review" value={tripCommerceState.reviewLabel} />
              </div>
              <div className="grid gap-4 text-sm">
                <SummaryRow label="Travel style tags" value={trip?.brief.interests.join(", ") ?? "Awaiting saved brief"} />
                <SummaryRow label="Budget and pace" value={trip ? `${trip.brief.budgetLevel} · ${trip.brief.pace}` : "Pending"} />
                <SummaryRow
                  label="Reviewer-only context"
                  value={trip?.brief.avoidances.length ? trip.brief.avoidances.join(", ") : "No avoidances recorded yet"}
                />
              </div>
            </CardContent>
          </Card>
          <Card className="overflow-hidden border-black/5 bg-white/60 shadow-sm">
            <CardHeader className="px-8 pt-8">
              <CardTitle className="font-[family-name:var(--font-rota-display)] text-2xl">Reviewer actions</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 px-8 pb-8">
              {trip && tripCommerceState.canCompleteReview ? (
                <form action={`/api/trips/${trip.id}/review`} method="post" className="rounded-2xl border border-black/5 bg-white/80 p-6 shadow-sm">
                  <input type="hidden" name="intent" value="complete" />
                  <input type="hidden" name="target" value="reviewer" />
                  <div className="grid gap-5">
                    <div>
                      <p className="text-base font-medium text-[var(--color-foreground)]">Complete human review</p>
                      <p className="rota-muted mt-2 text-sm leading-relaxed">Apply the reviewer trust marker to this unlocked trip.</p>
                    </div>
                    <label className="grid gap-3 text-sm text-[var(--color-foreground)]">
                      <span className="rota-kicker">Reviewer summary</span>
                      <textarea
                        name="notes"
                        rows={4}
                        className="rota-form-input min-h-[112px] resize-y rounded-xl border border-black/10 p-3 shadow-sm focus:border-[var(--color-accent)] focus:ring-1 focus:ring-[var(--color-accent)]"
                        placeholder="Summarize the edits, substitutions, or local guidance added during review."
                      />
                    </label>
                    <div>
                      <Button type="submit">Mark as reviewed</Button>
                    </div>
                  </div>
                </form>
              ) : null}
              {[
                "Replace place",
                "Add local note",
                "Flag tourist trap",
                "Add rain fallback"
              ].map((action) => (
                <div key={action} className="rounded-2xl border border-black/5 bg-white/80 p-6 shadow-sm">
                  <p className="text-base font-medium text-[var(--color-foreground)]">{action}</p>
                  <p className="rota-muted mt-3 text-sm leading-relaxed">
                    {action === "Add rain fallback"
                      ? "Attach a backup stop to any day that still lacks a weather-safe option."
                      : action === "Flag tourist trap"
                        ? "Mark any stop that needs a local substitute before client delivery."
                        : "Keep the client-facing route calm while preserving the itinerary logic."}
                  </p>
                </div>
              ))}
              <div className="mt-4 flex flex-wrap gap-4">
                <Button asChild variant="ghost" className="font-medium">
                  <Link href="/reviewer/history">Open review history</Link>
                </Button>
                <Button asChild variant="ghost" className="font-medium">
                  <Link href="/reviewer/profile">Open reviewer profile</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
          <Card className="overflow-hidden border-black/5 bg-white/60 shadow-sm">
            <CardHeader className="px-8 pt-8">
              <CardTitle className="font-[family-name:var(--font-rota-display)] text-2xl">Trust markers</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-3 px-8 pb-8">
              {tripCommerceState.markers.map((marker) => (
                <Badge key={marker} tone="soft">
                  {marker}
                </Badge>
              ))}
            </CardContent>
          </Card>
        </div>
        <div className="grid gap-6">
          <div className="flex flex-wrap gap-3">
            {(routeValidation?.days ?? Array.from({ length: 3 }, (_, index) => ({ dayIndex: index + 1, label: `Day ${index + 1}` }))).map(
              (routeDay) => {
                const isActive = routeDay.dayIndex === activeDay?.dayIndex || (!activeDay && routeDay.dayIndex === 1);

                return (
                  <Link
                    key={routeDay.dayIndex}
                    href={`/reviewer/trips/${tripId}?day=${routeDay.dayIndex}`}
                    className={[
                      "inline-flex items-center rounded-full border px-5 py-2.5 text-sm font-medium transition-colors shadow-sm",
                      isActive
                        ? "border-[var(--color-foreground)] bg-[var(--color-foreground)] text-white"
                        : "border-black/5 bg-white/80 text-[var(--color-muted-foreground)] hover:bg-white"
                    ].join(" ")}
                  >
                    {routeDay.label}
                  </Link>
                );
              }
            )}
          </div>
          <RouteMap selectedDayId={activeDay ? String(activeDay.dayIndex) : undefined} days={mapDays} warnings={mapWarnings}>
            <MapPanel position="left">
              <div className="grid gap-4">
                <p className="rota-kicker">Reviewer focus</p>
                <h3 className="font-[family-name:var(--font-rota-display)] text-3xl text-[var(--color-foreground)]">
                  {activeDay ? `${activeDay.label} edit layer` : "Map editor shell"}
                </h3>
                <p className="rota-muted leading-relaxed">
                  {activeItineraryDay?.transportAssumption ??
                    "Travel assumptions and reviewer adjustments will appear here once a route draft is loaded."}
                </p>
              </div>
              <div className="mt-6 flex flex-wrap gap-3">
                <TravelTimeChip time={activeDay ? `${activeDay.estimatedTravelMinutes} min estimated` : "Travel timing pending"} />
                <StatPill label="Warnings" value={String(activeWarnings?.length ?? 0)} />
              </div>
              <div className="mt-6 grid gap-4">
                {(activeItineraryDay?.stops ?? []).map((stop) => (
                  <div key={`${stop.startTime}-${stop.placeName}`} className="rounded-2xl border border-black/5 bg-white/80 p-6 shadow-sm">
                    <div className="flex items-center justify-between gap-3">
                      <p className="text-base font-medium text-[var(--color-foreground)]">{stop.placeName}</p>
                      <TravelTimeChip className="shrink-0" time={`${stop.startTime}–${stop.endTime}`} />
                    </div>
                    <p className="rota-muted mt-3 leading-relaxed">{stop.reason}</p>
                    {stop.warning ? (
                      <Badge className="mt-4" tone="soft">
                        {stop.warning}
                      </Badge>
                    ) : null}
                  </div>
                ))}
              </div>
            </MapPanel>
          </RouteMap>
          <Card className="overflow-hidden border-black/5 bg-white/60 shadow-sm">
            <CardHeader className="px-8 pt-8">
              <CardTitle className="font-[family-name:var(--font-rota-display)] text-2xl">Validation findings</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 px-8 pb-8 md:grid-cols-2">
              {(activeWarnings ?? routeValidation?.warnings ?? []).map((warning) => (
                <div key={`${warning.code}-${warning.dayIndex ?? "all"}`} className="rounded-2xl border border-black/5 bg-white/80 p-6 shadow-sm">
                  <p className="text-base font-medium text-[var(--color-foreground)]">{warning.title}</p>
                  <p className="rota-muted mt-3 text-sm leading-relaxed">{warning.detail}</p>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </PageShell>
  );
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="grid gap-1 border-b border-[var(--color-border)] pb-3 last:border-b-0 last:pb-0">
      <p className="rota-kicker">{label}</p>
      <p className="text-sm text-[var(--color-foreground)]">{value}</p>
    </div>
  );
}
