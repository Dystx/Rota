import Link from "next/link";
import { generateItineraryFromBrief } from "@repo/ai";
import { getTripDraftById, isPersistenceConfigError } from "@repo/db";
import {
  Badge,
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CinematicGuide,
  CTASection,
  GuideChapter,
  GuideProgress,
  PageShell,
  RevealSection,
  SectionHeading,
  TripCard
} from "@repo/ui";
import { buildEmailPreview } from "@repo/emails";
import { buildTripSharePath, listTripExportOptions } from "@/lib/trip-export";
import { getTripCommerceState } from "@/lib/trip-commerce";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/auth/current-user";
import { PrintAutoTrigger } from "./_components/print-auto-trigger";

function getFormatFromHref(href: string) {
  if (href.includes("view=print")) return "print";
  const match = href.match(/format=([^&]+)/);
  return match ? match[1] : "unknown";
}

function renderPrintView(
  title: string,
  tripId: string,
  itinerary: Awaited<ReturnType<typeof generateItineraryFromBrief>> | null,
  autoPrint: boolean
) {
  return (
    <PageShell variant="app">
      <div data-testid="print-view" className="hidden" />
      <PrintAutoTrigger auto={autoPrint} />
      <SectionHeading
        eyebrow={`Trip ${tripId}`}
        title={`${title} print view`}
        description="A simplified export layout for browser print and PDF save flows."
        h1
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
              <PrintAutoTrigger auto={false} />
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
  searchParams: Promise<{ view?: string; print?: string }>;
}) {
  const { tripId } = await params;
  const { view, print: printFlag } = await searchParams;
  // `?print=1` opens the browser print dialog automatically so
  // the 1-click PDF flow from the export drawer fires immediately.
  const autoPrint = printFlag === "1";
  let trip = null;
  let itinerary = null;
  let infoMessage = "";

  const { user } = await getCurrentUser();

  try {
    trip = await getTripDraftById(tripId);

    if (trip) {
      itinerary = await generateItineraryFromBrief(trip.brief);
    }
  } catch (error) {
    infoMessage = isPersistenceConfigError(error)
      ? "Saved trip data is not available right now. Export files will return when the trip reloads."
      : error instanceof Error
        ? "Could not load trip exports yet."
        : "Could not load trip exports yet.";
  }

  if (trip && trip.ownerUserId && (!user || user.id !== trip.ownerUserId)) {
    return (
      <PageShell variant="app">
        <div className="text-center py-16 md:py-32">
          <h1 className="text-5xl">Trip not found</h1>
          <p>This trip does not exist or you do not have permission to view it.</p>
          <Button asChild><Link href="/account">Back to account</Link></Button>
        </div>
      </PageShell>
    );
  }

  if (view === "print") {
    return renderPrintView(trip?.title ?? "Trip export", tripId, itinerary, autoPrint);
  }

  const tripCommerceState = getTripCommerceState({
    status: trip?.status,
    hasHumanReview: trip?.hasHumanReview,
    isPaid: trip?.isPaid
  });
  const emailPreview = buildEmailPreview(trip?.hasHumanReview ? "review-complete" : "export-ready", trip?.title ?? "Trip export");

  const chapters = [
    { id: "overview", label: "Overview" },
    { id: "formats", label: "Formats" },
    { id: "delivery", label: "Delivery" },
    { id: "access", label: "Access" },
    { id: "next-step", label: "Continue" }
  ];

  const heroTitle = trip ? `${trip.title} exports` : "Trip export center";
  const heroDescription = "PDF, print, calendar, and share actions live here, ready when the trip is unlocked.";

  return (
    <PageShell variant="app">
      <CinematicGuide>
        <GuideProgress chapters={chapters} />

        <GuideChapter id="overview" className="py-12 md:py-24">
          <div className="mx-auto max-w-[860px] grid gap-8" data-testid="trip-export-header">
            <RevealSection>
              <p className="rota-kicker text-[var(--color-atlantic)]">Export center · Trip {tripId}</p>
              <h1 className="mt-4 font-[family-name:var(--font-rota-display)] text-5xl tracking-tight text-[var(--color-foreground)] lg:text-6xl">
                {heroTitle}
              </h1>
              <p className="rota-muted mt-6 max-w-3xl text-xl leading-relaxed">{heroDescription}</p>
            </RevealSection>

            {infoMessage ? (
              <RevealSection delayMs={120}>
                <Card data-testid="info-message">
                  <CardContent className="pt-6">
                    <p className="rota-muted text-sm">{infoMessage}</p>
                  </CardContent>
                </Card>
              </RevealSection>
            ) : null}
          </div>
        </GuideChapter>

        <GuideChapter id="formats" className="py-12 md:py-24">
          <div className="mx-auto max-w-[1100px] grid gap-8">
            <RevealSection>
              <h2 className="font-[family-name:var(--font-rota-display)] text-4xl text-[var(--color-foreground)]">Choose a format</h2>
              <p className="rota-muted mt-4 max-w-2xl text-lg leading-relaxed">
                Each format mirrors the same audited route. PDF, calendar, and markdown are gated until unlock; print is always safe to use.
              </p>
            </RevealSection>
            <RevealSection delayMs={120}>
              <div className="grid gap-4 md:grid-cols-2" data-testid="export-options">
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
            </RevealSection>
          </div>
        </GuideChapter>

        <GuideChapter id="delivery" className="py-12 md:py-24">
          <div className="mx-auto max-w-[860px] grid gap-8">
            <RevealSection>
              <h2 className="font-[family-name:var(--font-rota-display)] text-4xl text-[var(--color-foreground)]">Share &amp; delivery</h2>
              <p className="rota-muted mt-4 max-w-2xl text-lg leading-relaxed">
                Where the trip lives once it leaves the planner.
              </p>
            </RevealSection>
            <RevealSection delayMs={120}>
              <Card data-testid="share-card">
                <CardHeader>
                  <CardTitle>Share and delivery</CardTitle>
                </CardHeader>
                <CardContent className="grid gap-3">
                  <div className="rounded-[20px] border border-[var(--color-border)] bg-white/70 p-4">
                    <p className="rota-kicker">Share path</p>
                    <p className="mt-2 text-sm font-semibold text-[var(--color-foreground)]">{buildTripSharePath(tripId)}</p>
                    <p className="rota-muted mt-2 text-sm">Share links stay tied to the saved trip route.</p>
                  </div>
                  <div className="rounded-[20px] border border-[var(--color-border)] bg-white/70 p-4">
                    <p className="rota-kicker">Delivery email</p>
                    <p className="mt-2 text-sm font-semibold text-[var(--color-foreground)]">{emailPreview.subject}</p>
                    <p className="rota-muted mt-2 text-sm">{emailPreview.previewText}</p>
                  </div>
                </CardContent>
              </Card>
            </RevealSection>
            <RevealSection delayMs={200}>
              <Card data-testid="included-list">
                <CardHeader>
                  <CardTitle>Included in the PDF itinerary</CardTitle>
                </CardHeader>
                <CardContent className="grid gap-3">
                  {[
                    "Cover and trip summary",
                    "Route overview and validation notes",
                    "Day-by-day itinerary with stop timing",
                    "Local tips and reviewer trust markers"
                  ].map((item) => (
                    <div key={item} className="rounded-[20px] border border-[var(--color-border)] bg-white/70 p-4 text-sm text-[var(--color-foreground)]">
                      {item}
                    </div>
                  ))}
                </CardContent>
              </Card>
            </RevealSection>
          </div>
        </GuideChapter>

        <GuideChapter id="access" className="py-12 md:py-24 bg-[var(--color-ink)] text-[var(--color-paper)]">
          <div className="mx-auto max-w-[860px] grid gap-8">
            <RevealSection>
              <h2 className="font-[family-name:var(--font-rota-display)] text-4xl">Export access</h2>
              <p className="mt-4 max-w-2xl text-lg leading-relaxed text-[var(--color-cream)]">
                {tripCommerceState.canExport
                  ? "This trip is unlocked. PDF, calendar, markdown, and print exports are ready."
                  : "Unlock the trip to release PDF, calendar, and markdown exports. Print stays available either way."}
              </p>
            </RevealSection>
            <RevealSection delayMs={120}>
              <Card data-testid="access-card" className="bg-white/5 border-white/10 text-white">
                <CardContent className="grid gap-4 pt-6">
                  <div className="flex flex-wrap gap-2">
                    <Badge tone="soft" className="bg-white/15 border-white/10 text-white">{tripCommerceState.accessLabel}</Badge>
                    <Badge tone="soft" className="bg-white/15 border-white/10 text-white">{tripCommerceState.exportLabel}</Badge>
                    <Badge tone="soft" className="bg-white/15 border-white/10 text-white">{tripCommerceState.reviewLabel}</Badge>
                  </div>
                  <div className="flex flex-wrap gap-3 w-full">
                    {tripCommerceState.canUnlock ? (
                      <form action={`/api/trips/${tripId}/unlock`} method="post" className="flex-1">
                        <Button type="submit" className="w-full min-h-[44px] bg-[var(--color-paper)] text-[var(--color-ink)] hover:bg-white/90">
                          Checkout to unlock exports
                        </Button>
                      </form>
                    ) : null}
                    <Button asChild variant="ghost" className="flex-1 min-h-[44px] border border-[var(--color-paper)] text-[var(--color-paper)] hover:bg-white/10">
                      <Link href={`/trip/${tripId}/map`}>Open route map</Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </RevealSection>
          </div>
        </GuideChapter>

        <GuideChapter id="next-step" className="p-0">
          <CTASection>
            <h2 className="font-[family-name:var(--font-rota-display)] text-4xl md:text-5xl">Send the trip onward</h2>
            <p className="text-xl text-[var(--color-cream)] max-w-2xl">
              Print directly, return to the guided trip, or unlock the full export bundle.
            </p>
            <div className="flex flex-wrap justify-center gap-4 mt-4">
              <Button asChild className="bg-[var(--color-paper)] text-[var(--color-ink)] hover:bg-white/90 text-lg px-8 py-3 h-auto min-h-[44px]">
                <Link href={`/trip/${tripId}`}>Back to trip</Link>
              </Button>
              <Button asChild variant="ghost" className="border border-[var(--color-paper)] text-[var(--color-paper)] hover:bg-white/10 text-lg px-8 py-3 h-auto min-h-[44px]">
                <Link href={`/trip/${tripId}/export?view=print`}>Print-friendly view</Link>
              </Button>
            </div>
          </CTASection>
        </GuideChapter>
      </CinematicGuide>
    </PageShell>
  );
}
