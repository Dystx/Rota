import Link from "next/link";
import { isPersistenceConfigError, listTripDrafts } from "@repo/db";
import { buildEmailPreview } from "@repo/emails";
import { getCheckoutPlan } from "@repo/payments";
import { ArchiveLayout, Badge, Button, Card, CardContent, CardHeader, CardTitle } from "@repo/ui";
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
    <ArchiveLayout
      testid="account-header"
      header={{
        eyebrow: "Saved trips",
        title: "Saved draft routes",
        description: "This page now reads persisted trip records and is the first revisit surface after trip creation."
      }}
    >
      {infoMessage ? (
        <Card className="col-span-full bg-white/70">
          <CardContent className="pt-6">
            <p className="rota-muted text-sm">{infoMessage}</p>
          </CardContent>
        </Card>
      ) : null}

      <div data-testid="trip-list" className="contents">
        {trips.length > 0 ? (
          trips.map((trip) => {
            const tripCommerceState = getTripCommerceState({
              hasHumanReview: trip.hasHumanReview,
              isPaid: trip.isPaid
            });

            return (
              <Card key={trip.id} data-testid={`trip-item-${trip.id}`} className="flex flex-col bg-white/70 transition-all hover:bg-white/80">
                <CardHeader className="pb-2">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="rota-kicker">Saved {formatDate(trip.createdAt)}</p>
                      <CardTitle className="mt-1 font-[family-name:var(--font-rota-display)] text-xl text-[var(--color-foreground)]">
                        {trip.title}
                      </CardTitle>
                    </div>
                    <span className="shrink-0 rounded-full border border-[var(--color-border)] px-3 py-1 text-xs uppercase tracking-[0.14em] text-[var(--color-muted-foreground)]">
                      {trip.status}
                    </span>
                  </div>
                </CardHeader>
                <CardContent className="flex flex-1 flex-col gap-4">
                  <div className="flex flex-wrap gap-2">
                    <Badge tone="soft">{tripCommerceState.accessLabel}</Badge>
                    <Badge tone="soft">{tripCommerceState.reviewLabel}</Badge>
                  </div>
                  <p className="rota-muted text-sm leading-relaxed">
                    {trip.brief.regions.map(prettify).join(", ")} · {trip.brief.tripLengthDays} days · {trip.brief.interests.map(prettify).join(", ")}
                  </p>
                  <div className="mt-auto flex flex-wrap gap-3 pt-2">
                    <Button asChild>
                      <Link href={`/trip/${trip.id}`}>Open draft</Link>
                    </Button>
                    {tripCommerceState.canUnlock && (
                      <form action={`/api/trips/${trip.id}/unlock`} method="post" className="inline-flex">
                        <Button type="submit" variant="ghost">
                          Unlock trip
                        </Button>
                      </form>
                    )}
                    {tripCommerceState.canExport && (
                      <Button asChild variant="ghost">
                        <Link href={`/trip/${trip.id}/export`}>Open exports</Link>
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })
        ) : (
          <Card className="bg-white/70">
            <CardContent className="pt-6">
              <p className="rota-muted">Saved and paid itinerary cards will appear here once a real draft trip has been persisted.</p>
            </CardContent>
          </Card>
        )}
      </div>

      <Card data-testid="account-stats" className="flex flex-col bg-white/70">
        <CardHeader>
          <CardTitle>Next account features</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-1 flex-col gap-4">
          <p className="rota-muted text-sm leading-relaxed">Markdown export is live for unlocked trips. PDF, calendar, and share-link history can attach here later.</p>
          <div className="grid gap-3 xl:grid-cols-2">
            <div className="rounded-[20px] border border-[var(--color-border)] bg-white/70 p-4">
              <p className="rota-kicker">Unlock plan</p>
              <p className="mt-2 text-sm font-semibold text-[var(--color-foreground)]">{unlockPlan.priceLabel}</p>
              <p className="rota-muted mt-2 text-xs">{unlockPlan.fulfillment}</p>
            </div>
            <div className="rounded-[20px] border border-[var(--color-border)] bg-white/70 p-4">
              <p className="rota-kicker">Delivery preview</p>
              <p className="mt-2 text-sm font-semibold text-[var(--color-foreground)]">{exportEmailPreview.subject}</p>
              <p className="rota-muted mt-2 text-xs">{reviewPlan.priceLabel} review stays optional after unlock.</p>
            </div>
          </div>
          <ul className="rota-stack-list mt-2 text-sm">
            <li>Unlocked paid itineraries</li>
            <li>Export history</li>
            <li>Human review status</li>
            <li>On-trip access later</li>
          </ul>
        </CardContent>
      </Card>

      <Card data-testid="preferences-section" className="flex flex-col bg-white/70">
        <CardHeader>
          <CardTitle>Preferences</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-1 flex-col">
          <p className="rota-muted text-sm leading-relaxed">
            Account settings and personal travel preferences will appear here. Manage your notification settings and saved defaults.
          </p>
        </CardContent>
      </Card>
    </ArchiveLayout>
  );
}
