import Link from "next/link";
import { generateItineraryFromBrief } from "@repo/ai";
import { getTripDraftById, isPersistenceConfigError } from "@repo/db";
import { Badge, Button, Card, CardContent, CardHeader, CardTitle, PageShell, SectionHeading, TripCard } from "@repo/ui";
import { buildEmailPreview } from "@repo/emails";
import { buildTripSharePath, listTripExportOptions } from "@/lib/trip-export";
import { getTripCommerceState } from "@/lib/trip-commerce";

function getFormatFromHref(href: string) {
  if (href.includes("view=print")) return "print";
  const match = href.match(/format=([^&]+)/);
  return match ? match[1] : "unknown";
}

function renderPrintView(title: string, tripId: string, itinerary: Awaited<ReturnType<typeof generateItineraryFromBrief>> | null) {
  return (
    <PageShell variant="app">
      <div data-testid="print-view" className="hidden" />
      <SectionHeading
        eyebrow={`Trip ${tripId}`}
        title={`${title} print view`}
        description="A simplified export layout for browser print and PDF save flows."
      />
      <div className="grid gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Print-friendly itinerary</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4">
            <div className="flex flex-wrap gap-3">
              <Button asChild>
                <Link href={`/trip/${tripId}/export`}>Back to export options</Link>
              </Button>
              <Button asChild variant="ghost">
                <Link href={`/trip/${tripId}`}>Back to trip</Link>
              </Button>
            </div>
            {itinerary ? (
              itinerary.days.map((day) => (
                <div key={day.dayIndex} className="rounded-[20px] border border-[var(--color-border)] bg-white/70 p-4">
                  <p className="rota-kicker">Day {day.dayIndex}</p>
                  <p className="mt-2 text-lg font-semibold text-[var(--color-foreground)]">{day.theme}</p>
                  <p className="rota-muted mt-2 text-sm">{day.summary}</p>
                  <div className="mt-4 grid gap-2">
                    {day.stops.map((stop) => (
                      <div key={`${stop.startTime}-${stop.placeName}`} className="rounded-[16px] border border-[var(--color-border)] bg-white p-3">
                        <p className="text-sm font-semibold text-[var(--color-foreground)]">{stop.startTime} · {stop.placeName}</p>
                        <p className="rota-muted mt-1 text-sm">{stop.reason}</p>
                      </div>
                    ))}
                  </div>
                </div>
              ))
            ) : (
              <p className="rota-muted text-sm">No itinerary is available yet for print export.</p>
            )}
          </CardContent>
        </Card>
      </div>
    </PageShell>
  );
}

export default async function TripExportPage({
  params,
  searchParams
}: {
  params: Promise<{ tripId: string }>;
  searchParams: Promise<{ view?: string }>;
}) {
  const { tripId } = await params;
  const { view } = await searchParams;
  let trip = null;
  let itinerary = null;
  let infoMessage = "";

  try {
    trip = await getTripDraftById(tripId);

    if (trip) {
      itinerary = await generateItineraryFromBrief(trip.brief);
    }
  } catch (error) {
    infoMessage = isPersistenceConfigError(error)
      ? "Supabase environment variables are not configured yet, so export files are unavailable."
      : error instanceof Error
        ? error.message
        : "Could not load trip exports yet.";
  }

  if (view === "print") {
    return renderPrintView(trip?.title ?? "Trip export", tripId, itinerary);
  }

  const tripCommerceState = getTripCommerceState({
    status: trip?.status,
    hasHumanReview: trip?.hasHumanReview,
    isPaid: trip?.isPaid
  });
  const emailPreview = buildEmailPreview(trip?.hasHumanReview ? "review-complete" : "export-ready", trip?.title ?? "Trip export");

  return (
    <PageShell variant="app">
      <SectionHeading
        eyebrow={`Trip ${tripId}`}
        title={trip ? `${trip.title} exports` : "Trip export center"}
        description="The roadmap export layer groups PDF, print, calendar, and share actions in one place after unlock."
      />
      {infoMessage ? (
        <Card data-testid="info-message">
          <CardContent className="pt-6">
            <p className="rota-muted text-sm">{infoMessage}</p>
          </CardContent>
        </Card>
      ) : null}
      <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr] items-start">
        <div className="grid gap-4" data-testid="export-options">
          {listTripExportOptions(tripId).map((option) => (
            <TripCard
              key={option.label}
              title={option.label}
              caption={option.description}
              href={option.href}
              testid={`export-option-${getFormatFromHref(option.href)}`}
            />
          ))}
        </div>
        <div className="grid gap-4">
          <Card data-testid="share-card">
            <CardHeader>
              <CardTitle>Share and delivery</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-3">
              <div className="rounded-[20px] border border-[var(--color-border)] bg-white/70 p-4">
                <p className="rota-kicker">Share path</p>
                <p className="mt-2 text-sm font-semibold text-[var(--color-foreground)]">{buildTripSharePath(tripId)}</p>
                <p className="rota-muted mt-2 text-sm">Share links stay tied to the saved trip route for now.</p>
              </div>
              <div className="rounded-[20px] border border-[var(--color-border)] bg-white/70 p-4">
                <p className="rota-kicker">Delivery email</p>
                <p className="mt-2 text-sm font-semibold text-[var(--color-foreground)]">{emailPreview.subject}</p>
                <p className="rota-muted mt-2 text-sm">{emailPreview.previewText}</p>
              </div>
            </CardContent>
          </Card>
          <Card data-testid="access-card">
            <CardHeader>
              <CardTitle>Export access</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4">
              <div className="flex flex-wrap gap-2">
                <Badge tone="soft">{tripCommerceState.accessLabel}</Badge>
                <Badge tone="soft">{tripCommerceState.exportLabel}</Badge>
                <Badge tone="soft">{tripCommerceState.reviewLabel}</Badge>
              </div>
              <p className="rota-muted text-sm leading-relaxed">
                {tripCommerceState.canExport
                  ? "This trip is unlocked, so PDF, calendar, markdown, and print exports are available."
                  : "Unlock the trip first. Export files remain gated until payment is confirmed."}
              </p>
              <div className="flex flex-wrap gap-3 w-full">
                <Button asChild className="flex-1 min-h-[44px]">
                  <Link href={`/trip/${tripId}`}>Back to trip</Link>
                </Button>
                <Button asChild variant="ghost" className="flex-1 min-h-[44px]">
                  <Link href={`/trip/${tripId}/map`}>Open route map</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
          <Card data-testid="included-list">
            <CardHeader>
              <CardTitle>Included in the PDF itinerary</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-3">
              {[
                "Cover and trip summary",
                "Route overview and validation warnings",
                "Day-by-day itinerary with stop timing",
                "Local tips and reviewer trust markers"
              ].map((item) => (
                <div key={item} className="rounded-[20px] border border-[var(--color-border)] bg-white/70 p-4 text-sm text-[var(--color-foreground)]">
                  {item}
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </PageShell>
  );
}
