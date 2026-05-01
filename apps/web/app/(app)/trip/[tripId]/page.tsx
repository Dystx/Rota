import Link from "next/link";
import { generateItineraryFromBrief } from "@repo/ai";
import { getTripDraftById, isPersistenceConfigError, listPartners } from "@repo/db";
import { buildEmailPreview } from "@repo/emails";
import { getCheckoutPlan } from "@repo/payments";
import { Badge, Button, Card, CardContent, CardHeader, CardTitle, PageShell, StatPill } from "@repo/ui";
import { buildPartnerClickHref, selectRelevantPartners } from "@/lib/partner-enrichment";
import { getTripCommerceState } from "@/lib/trip-commerce";

function prettify(value: string) {
  return value.replace(/-/g, " ");
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium"
  }).format(new Date(value));
}

export default async function TripDetailPage({
  params,
  searchParams
}: {
  params: Promise<{ tripId: string }>;
  searchParams: Promise<{ review?: string; unlock?: string }>;
}) {
  const { tripId } = await params;
  const { review, unlock } = await searchParams;
  let trip = null;
  let itinerary = null;
  let partnerOffers = [] as Awaited<ReturnType<typeof listPartners>>;
  let infoMessage = "";

  try {
    trip = await getTripDraftById(tripId);

    if (trip) {
      itinerary = await generateItineraryFromBrief(trip.brief);
      partnerOffers = selectRelevantPartners(listPartners ? await listPartners() : [], trip.brief.regions.map(prettify), prettify(trip.brief.destinationCountry));
    }
  } catch (error) {
    infoMessage = isPersistenceConfigError(error)
      ? "Supabase environment variables are not configured yet, so this page cannot load saved trip data."
      : error instanceof Error
        ? error.message
        : "Could not load the saved trip yet.";
  }

  const title = trip ? trip.title : "Generated route overview shell";
  const description = trip
    ? "This saved draft now includes a schema-validated itinerary preview generated from the persisted brief."
    : "Built for day-by-day itinerary, why-this-fits-you, warnings, local tips, and route adjustments.";
  const tripCommerceState = getTripCommerceState({
    status: trip?.status,
    hasHumanReview: trip?.hasHumanReview,
    isPaid: trip?.isPaid
  });
  const checkoutPlan = getCheckoutPlan(tripCommerceState.canUnlock ? "paid-trip" : tripCommerceState.canRequestReview ? "human-polish" : "free-preview");
  const emailPreview = buildEmailPreview(
    tripCommerceState.canRequestReview ? "payment-receipt" : trip?.hasHumanReview ? "review-complete" : "export-ready",
    title
  );

  return (
    <PageShell variant="app">
      <div className="relative mb-24 overflow-hidden rounded-[32px] px-6 py-32 text-center lg:px-12 lg:py-48">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(182,235,254,0.15),transparent_40%),radial-gradient(circle_at_bottom_left,rgba(48,101,118,0.05),transparent_50%),linear-gradient(to_bottom,rgba(247,250,249,0),rgba(247,250,249,1))]"></div>
        <div className="relative mx-auto grid max-w-3xl gap-6">
          <Badge tone="soft" className="mx-auto mb-4 bg-white/60 px-4 py-2 text-[12px] font-semibold tracking-[0.1em] text-[var(--color-foreground)] backdrop-blur-md">Trip {tripId}</Badge>
          <h1 className="font-[family-name:var(--font-rota-display)] text-5xl font-normal leading-[1.1] tracking-tight text-[var(--color-foreground)] md:text-6xl lg:text-[64px]">
            {title}
          </h1>
          <p className="mx-auto max-w-2xl font-[family-name:var(--font-inter)] text-lg leading-[1.6] text-[var(--color-muted-foreground)]">
            {description}
          </p>
        </div>
      </div>

      <div className="mx-auto mb-16 max-w-[1400px] grid gap-4">
        {unlock === "success" ? (
          <div className="rounded-2xl border border-[var(--color-border)] bg-white/60 px-6 py-4 text-sm text-[var(--color-muted-foreground)] shadow-sm backdrop-blur-md">Trip unlocked. Markdown export is now available for this route.</div>
        ) : null}
        {unlock === "unavailable" ? (
          <div className="rounded-2xl border border-[var(--color-border)] bg-white/60 px-6 py-4 text-sm text-[var(--color-muted-foreground)] shadow-sm backdrop-blur-md">Unlock is unavailable until Supabase environment variables are configured.</div>
        ) : null}
        {review === "queued" ? (
          <div className="rounded-2xl border border-[var(--color-border)] bg-white/60 px-6 py-4 text-sm text-[var(--color-muted-foreground)] shadow-sm backdrop-blur-md">Human review requested. This trip is now waiting in the reviewer queue.</div>
        ) : null}
        {review === "completed" ? (
          <div className="rounded-2xl border border-[var(--color-border)] bg-white/60 px-6 py-4 text-sm text-[var(--color-muted-foreground)] shadow-sm backdrop-blur-md">Human review completed. Trust markers and reviewer status are now updated.</div>
        ) : null}
        {review === "locked" ? (
          <div className="rounded-2xl border border-[var(--color-border)] bg-white/60 px-6 py-4 text-sm text-[var(--color-muted-foreground)] shadow-sm backdrop-blur-md">Unlock the trip before requesting human review.</div>
        ) : null}
        {review === "unavailable" ? (
          <div className="rounded-2xl border border-[var(--color-border)] bg-white/60 px-6 py-4 text-sm text-[var(--color-muted-foreground)] shadow-sm backdrop-blur-md">Human review is unavailable until Supabase environment variables are configured.</div>
        ) : null}
        {infoMessage ? (
          <div className="rounded-2xl border border-red-900/10 bg-red-50/50 px-6 py-4 text-sm text-red-900 shadow-sm backdrop-blur-md">{infoMessage}</div>
        ) : null}
      </div>

      <div className="mx-auto max-w-[1400px] grid gap-16 lg:grid-cols-[380px_1fr] lg:gap-24">
        <div className="grid gap-8 self-start">
          <div className="grid gap-6 rounded-[24px] border border-[var(--color-border)] bg-white/60 p-8 shadow-sm backdrop-blur-xl">
            <h3 className="font-[family-name:var(--font-rota-display)] text-2xl text-[var(--color-foreground)]">The Brief</h3>
            
            <div className="grid gap-4 text-sm">
              <SummaryRow label="Country" value={trip?.brief.destinationCountry ?? "Portugal"} />
              <SummaryRow label="Regions" value={trip ? trip.brief.regions.map(prettify).join(", ") : "—"} />
              <SummaryRow label="Interests" value={trip ? trip.brief.interests.map(prettify).join(", ") : "—"} />
              <SummaryRow label="Transport" value={trip ? prettify(trip.brief.transportMode) : "—"} />
              <SummaryRow label="Status" value={trip?.status ?? "Draft"} />
              <SummaryRow label="Access" value={tripCommerceState.accessLabel} />
              {trip ? <SummaryRow label="Saved" value={formatDate(trip.createdAt)} /> : null}
            </div>

            {trip && (
              <div className="mt-4 rounded-xl bg-[var(--color-background)] p-4 text-[13px] leading-relaxed text-[var(--color-muted-foreground)] border border-[var(--color-border)]">
                <span className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.1em] text-[var(--color-foreground)]">Raw Request</span>
                "{trip.brief.rawBrief}"
              </div>
            )}
            
            {trip ? (
              <div className="mt-2 flex flex-wrap gap-2">
                {["Make it calmer", "More coastal", "Lower budget", "Ask for human review"].map((label) => (
                  <Badge key={label} tone="soft">{label}</Badge>
                ))}
              </div>
            ) : null}
          </div>

          {trip && (
            <div className="grid gap-6 rounded-[24px] border border-[var(--color-border)] bg-white/60 p-8 shadow-sm backdrop-blur-xl">
              <h3 className="font-[family-name:var(--font-rota-display)] text-2xl text-[var(--color-foreground)]">Unlock & Delivery</h3>
              
              <div className="flex flex-wrap gap-2">
                {tripCommerceState.markers.map((marker) => (
                  <Badge key={marker} tone="soft">{marker}</Badge>
                ))}
              </div>
              
              <div className="grid gap-4 text-sm">
                <SummaryRow label="Exports" value={tripCommerceState.exportLabel} />
                <SummaryRow label="Review" value={tripCommerceState.reviewLabel} />
              </div>
              
              <div className="grid gap-3 pt-2">
                {tripCommerceState.canUnlock ? (
                  <form action={`/api/trips/${trip.id}/unlock`} method="post">
                    <Button type="submit" className="w-full bg-[#181c1c] text-white hover:bg-[#2d3131]">Unlock full trip</Button>
                  </form>
                ) : tripCommerceState.canExport ? (
                  <Button asChild className="w-full bg-[#181c1c] text-white hover:bg-[#2d3131]">
                    <Link href={`/trip/${trip.id}/export`}>Open export options</Link>
                  </Button>
                ) : null}
                
                {tripCommerceState.canRequestReview ? (
                  <form action={`/api/trips/${trip.id}/review`} method="post">
                    <input type="hidden" name="intent" value="request" />
                    <input type="hidden" name="target" value="trip" />
                    <Button type="submit" variant="ghost" className="w-full border border-[var(--color-border)]">Request human review</Button>
                  </form>
                ) : null}
                
                <Button asChild variant="ghost" className="w-full border border-[var(--color-border)]">
                  <Link href="/human-review">See human review</Link>
                </Button>
              </div>
            </div>
          )}

          {trip && (
             <div className="grid gap-6 rounded-[24px] border border-[var(--color-border)] bg-white/60 p-8 shadow-sm backdrop-blur-xl">
               <h3 className="font-[family-name:var(--font-rota-display)] text-2xl text-[var(--color-foreground)]">Preview Setup</h3>
               <div className="grid gap-4 text-sm">
                  <SummaryRow label="Plan" value={checkoutPlan.priceLabel} />
                  <SummaryRow label="Fulfillment" value={checkoutPlan.fulfillment} />
                  <SummaryRow label="Email Subject" value={emailPreview.subject} />
               </div>
             </div>
          )}
        </div>

        <div className="grid gap-20">
          {!trip ? (
             <div className="grid gap-5">
               <p className="rota-muted text-lg leading-relaxed">
                 This route ID does not have a persisted draft yet. Save a new brief first or configure Supabase and rerun the flow.
               </p>
               <div>
                 <Button asChild className="bg-[#181c1c] text-white hover:bg-[#2d3131]">
                   <Link href="/trip/new">Back to trip brief</Link>
                 </Button>
               </div>
             </div>
          ) : (
            <>
              {itinerary ? (
                <div className="mb-8 grid gap-6">
                   <h2 className="font-[family-name:var(--font-rota-display)] text-4xl text-[var(--color-foreground)]">Route Overview</h2>
                   <p className="text-lg leading-[1.6] text-[var(--color-muted-foreground)] font-[family-name:var(--font-inter)]">
                     {itinerary.routeOverview}
                   </p>
                   <div className="flex flex-wrap gap-3 mt-2">
                     <StatPill label="Confidence" value={`${Math.round(itinerary.confidenceScore * 100)}%`} />
                     <StatPill label="Questions" value={String(itinerary.missingInfo.length)} />
                   </div>
                </div>
              ) : null}

              <div className="relative">
                <div className="absolute bottom-0 left-[11px] top-6 w-[1.5px] bg-[#b6ebfe]/40 md:left-[23px]"></div>
                
                <div className="grid gap-24">
                  {(itinerary?.days || [
                    {
                      dayIndex: 1,
                      theme: "Placeholder Day",
                      summary: "Placeholder day summary, timing notes, local tip, and warning areas for a structured itinerary object.",
                      stops: [{ startTime: "09:00", placeName: "Morning stop" }, { startTime: "14:00", placeName: "Afternoon stop" }],
                      warnings: []
                    },
                    {
                      dayIndex: 2,
                      theme: "Placeholder Day",
                      summary: "Placeholder day summary, timing notes, local tip, and warning areas for a structured itinerary object.",
                      stops: [{ startTime: "10:00", placeName: "Morning stop" }, { startTime: "15:00", placeName: "Afternoon stop" }],
                      warnings: []
                    },
                    {
                      dayIndex: 3,
                      theme: "Placeholder Day",
                      summary: "Placeholder day summary, timing notes, local tip, and warning areas for a structured itinerary object.",
                      stops: [{ startTime: "09:30", placeName: "Morning stop" }, { startTime: "16:00", placeName: "Afternoon stop" }],
                      warnings: []
                    }
                  ]).map((day: any) => (
                    <div key={`day-${day.dayIndex}`} className="relative pl-10 md:pl-16">
                      <div className="absolute left-[-2px] top-3 h-3 w-3 rounded-full border-2 border-[#306576] bg-[#f7faf9] ring-8 ring-[#f7faf9] md:left-[18px] md:top-4"></div>
                      
                      <div className="grid gap-8">
                        <div>
                          <h3 className="font-[family-name:var(--font-rota-display)] text-3xl md:text-4xl text-[var(--color-foreground)] leading-[1.2]">
                            Day {day.dayIndex} <span className="text-[var(--color-muted-foreground)]">· {day.theme}</span>
                          </h3>
                          <p className="mt-4 max-w-3xl text-lg text-[var(--color-muted-foreground)] leading-[1.6] font-[family-name:var(--font-inter)]">
                            {day.summary}
                          </p>
                        </div>
                        
                        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-1">
                          {day.stops.map((stop: any, idx: number) => {
                            const time = typeof stop === 'string' ? stop.split(' ')[0] : stop.startTime;
                            const place = typeof stop === 'string' ? stop.split(' ').slice(1).join(' ') : stop.placeName;
                            
                            return (
                              <div key={idx} className="group flex items-start gap-4 rounded-2xl border border-[var(--color-border)] bg-white/60 p-5 shadow-sm backdrop-blur-sm transition-all hover:-translate-y-0.5 hover:shadow-md hover:bg-white/80">
                                <span className="font-[family-name:var(--font-rota-display)] text-lg text-[var(--color-foreground)] whitespace-nowrap pt-0.5 min-w-[70px]">
                                  {time}
                                </span>
                                <span className="font-[family-name:var(--font-inter)] text-base text-[var(--color-muted-foreground)] leading-relaxed">
                                  {place}
                                </span>
                              </div>
                            );
                          })}
                        </div>

                        {day.warnings && day.warnings.length > 0 && (
                          <div className="flex flex-wrap gap-2 pt-2">
                            {day.warnings.map((warning: string) => (
                              <Badge key={warning} tone="soft" className="bg-[#ba1a1a]/5 text-[#ba1a1a] border-[#ba1a1a]/20">
                                {warning}
                              </Badge>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {itinerary?.missingInfo && itinerary.missingInfo.length > 0 && (
                <div className="mt-16 grid gap-6 border-t border-[var(--color-border)] pt-16">
                  <h2 className="font-[family-name:var(--font-rota-display)] text-4xl text-[var(--color-foreground)]">Missing Information</h2>
                  <div className="grid gap-6 md:grid-cols-2">
                    {itinerary.missingInfo.map((question: any) => (
                      <div key={question.question} className="rounded-[24px] border border-[var(--color-border)] bg-white/60 p-8 shadow-sm backdrop-blur-xl transition-shadow hover:shadow-md">
                        <p className="text-[12px] font-semibold uppercase tracking-[0.1em] text-[var(--color-secondary)] mb-3">{question.title}</p>
                        <p className="mb-6 text-base leading-[1.6] text-[var(--color-foreground)] font-[family-name:var(--font-inter)]">{question.question}</p>
                        <div className="flex flex-wrap gap-2">
                          {question.options.map((option: string) => (
                            <Badge key={option} tone="soft">{option}</Badge>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {partnerOffers.length > 0 && (
                <div className="mt-16 grid gap-6 border-t border-[var(--color-border)] pt-16">
                  <div>
                    <h2 className="font-[family-name:var(--font-rota-display)] text-4xl text-[var(--color-foreground)]">Curated Spaces</h2>
                    <p className="mt-3 text-lg text-[var(--color-muted-foreground)] font-[family-name:var(--font-inter)]">Locations vetted for atmosphere, design, and light.</p>
                  </div>
                  
                  <div className="grid gap-6 md:grid-cols-2">
                    {partnerOffers.map((partner) => (
                      <div key={partner.id} className="group relative overflow-hidden rounded-[24px] border border-[var(--color-border)] bg-white/60 p-8 shadow-sm backdrop-blur-xl transition-all hover:shadow-md hover:bg-white/80">
                        <div className="mb-6 flex flex-wrap items-start justify-between gap-3">
                          <div>
                            <p className="text-[11px] font-semibold uppercase tracking-[0.15em] text-[var(--color-secondary)] mb-2">
                              {partner.type || "Booking source"} · {partner.coverageRegions.join(", ") || "Portugal"}
                            </p>
                            <p className="font-[family-name:var(--font-rota-display)] text-2xl text-[var(--color-foreground)]">{partner.name}</p>
                          </div>
                          {partner.isAffiliate ? <Badge tone="soft" className="bg-[#306576]/10 text-[#306576]">Affiliate</Badge> : null}
                        </div>
                        
                        <p className="mb-8 text-base text-[var(--color-muted-foreground)] leading-[1.6] font-[family-name:var(--font-inter)]">
                          {partner.notes || "Use this link when the stop fits the final route and quality bar."}
                        </p>
                        
                        <Button asChild variant="ghost" className="w-full border border-[var(--color-border)] group-hover:border-[#181c1c] group-hover:text-[#181c1c] transition-colors">
                          <Link
                            href={buildPartnerClickHref({
                              partnerId: partner.id,
                              source: "trip-detail",
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
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </PageShell>
  );
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between items-center border-b border-[var(--color-border)]/50 pb-3 last:border-b-0 last:pb-0 gap-4">
      <span className="text-[12px] font-semibold uppercase tracking-[0.1em] text-[var(--color-muted-foreground)]">{label}</span>
      <span className="text-sm font-medium text-[var(--color-foreground)] text-right">{value}</span>
    </div>
  );
}
