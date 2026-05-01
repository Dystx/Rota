import Link from "next/link";
import { isPersistenceConfigError, listTripDrafts } from "@repo/db";
import { buildEmailPreview } from "@repo/emails";
import { getCheckoutPlan } from "@repo/payments";
import { Badge, Button, Card, CardContent, CardHeader, CardTitle, PageShell, SectionHeading } from "@repo/ui";
import { getTripCommerceState } from "@/lib/trip-commerce";

function prettify(value: string) {
  return value.replace(/-/g, " ");
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium"
  }).format(new Date(value));
}

export default async function AccountPage() {
  let trips = [] as Awaited<ReturnType<typeof listTripDrafts>>;
  let infoMessage = "";
  const unlockPlan = getCheckoutPlan("paid-trip");
  const reviewPlan = getCheckoutPlan("human-polish");
  const exportEmailPreview = buildEmailPreview("export-ready", "Saved trip");

  try {
    trips = await listTripDrafts();
  } catch (error) {
    infoMessage = isPersistenceConfigError(error)
      ? "Configure Supabase environment variables to load saved draft trips here."
      : error instanceof Error
        ? error.message
        : "Could not load saved trips.";
  }

  return (
    <PageShell variant="app">
      <SectionHeading
        eyebrow="Saved trips"
        title="Saved draft routes"
        description="This page now reads persisted trip records and is the first revisit surface after trip creation."
      />
      {infoMessage ? (
        <Card>
          <CardContent className="pt-6">
            <p className="rota-muted text-sm">{infoMessage}</p>
          </CardContent>
        </Card>
      ) : null}
      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Saved drafts</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4">
            {trips.length > 0 ? (
              trips.map((trip) => (
                <div key={trip.id} className="grid gap-3 rounded-[20px] border border-[var(--color-border)] bg-white/70 p-4">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="rota-kicker">Saved {formatDate(trip.createdAt)}</p>
                      <h3 className="font-[family-name:var(--font-rota-display)] text-xl text-[var(--color-foreground)]">
                        {trip.title}
                      </h3>
                    </div>
                    <span className="rounded-full border border-[var(--color-border)] px-3 py-1 text-xs uppercase tracking-[0.14em] text-[var(--color-muted-foreground)]">
                      {trip.status}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {(() => {
                      const tripCommerceState = getTripCommerceState({
                        hasHumanReview: trip.hasHumanReview,
                        isPaid: trip.isPaid
                      });

                      return (
                        <>
                          <Badge tone="soft">{tripCommerceState.accessLabel}</Badge>
                          <Badge tone="soft">{tripCommerceState.reviewLabel}</Badge>
                        </>
                      );
                    })()}
                  </div>
                  <p className="rota-muted text-sm">
                    {trip.brief.regions.map(prettify).join(", ")} · {trip.brief.tripLengthDays} days · {trip.brief.interests
                      .map(prettify)
                      .join(", ")}
                  </p>
                  <div className="flex flex-wrap gap-3">
                    <Button asChild>
                      <Link href={`/trip/${trip.id}`}>Open draft</Link>
                    </Button>
                    {(() => {
                      const tripCommerceState = getTripCommerceState({
                        hasHumanReview: trip.hasHumanReview,
                        isPaid: trip.isPaid
                      });

                      if (tripCommerceState.canUnlock) {
                        return (
                          <form action={`/api/trips/${trip.id}/unlock`} method="post">
                            <Button type="submit" variant="ghost">
                              Unlock trip
                            </Button>
                          </form>
                        );
                      }

                      if (tripCommerceState.canExport) {
                        return (
                          <Button asChild variant="ghost">
                            <Link href={`/trip/${trip.id}/export`}>Open exports</Link>
                          </Button>
                        );
                      }

                      return null;
                    })()}
                  </div>
                </div>
              ))
            ) : (
              <p className="rota-muted">Saved and paid itinerary cards will appear here once a real draft trip has been persisted.</p>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Next account features</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-3">
            <p className="rota-muted">Markdown export is live for unlocked trips. PDF, calendar, and share-link history can attach here later.</p>
            <div className="grid gap-3 md:grid-cols-2">
              <div className="rounded-[20px] border border-[var(--color-border)] bg-white/70 p-4">
                <p className="rota-kicker">Unlock plan</p>
                <p className="mt-2 text-sm font-semibold text-[var(--color-foreground)]">{unlockPlan.priceLabel}</p>
                <p className="rota-muted mt-2 text-sm">{unlockPlan.fulfillment}</p>
              </div>
              <div className="rounded-[20px] border border-[var(--color-border)] bg-white/70 p-4">
                <p className="rota-kicker">Delivery preview</p>
                <p className="mt-2 text-sm font-semibold text-[var(--color-foreground)]">{exportEmailPreview.subject}</p>
                <p className="rota-muted mt-2 text-sm">{reviewPlan.priceLabel} review stays optional after unlock.</p>
              </div>
            </div>
            <ul className="rota-stack-list">
              <li>Unlocked paid itineraries</li>
              <li>Export history</li>
              <li>Human review status</li>
              <li>On-trip access later</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </PageShell>
  );
}
