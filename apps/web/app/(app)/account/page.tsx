import Link from "next/link";
import { Metadata } from "next";
import { isPersistenceConfigError, listTripDrafts } from "@repo/db";
import { buildEmailPreview } from "@repo/emails";
import { getCheckoutPlan } from "@repo/payments";
import { ArchiveLayout, Badge, Button, Card, CardContent, CardHeader, CardTitle } from "@repo/ui";
import { getTripCommerceState } from "@/lib/trip-commerce";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/auth/current-user";
import { BehaviorConsentToggle } from "./_components/behavior-consent-toggle";
import { signOutAction } from "./_actions/sign-out";
import { SignOutButton } from "./_components/sign-out-button";

export const metadata: Metadata = {
  title: "My Account",
  robots: {
    index: false,
    follow: false
  }
};

function prettify(value: string) {
  return value.replace(/-/g, " ");
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium"
  }).format(new Date(value));
}

export default async function AccountPage() {
  const { user } = await getCurrentUser();

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
        eyebrow: "Client Portal",
        title: "Your Itineraries",
        description: "Access your drafted routes, unlock final itineraries, and request human review."
      }}
    >
      {/* Phase C.5: profile section. Shows the signed-in user's
          email + a sign-out form. The placeholder "Preferences"
          paragraph is gone; this section is the real content. */}
      <Card data-testid="account-profile" className="col-span-full flex flex-col bg-white/70">
        <CardHeader className="pb-2">
          <CardTitle>Profile</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-1 flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="grid gap-1">
            <p className="font-mono-micro text-mono-micro uppercase tracking-widest text-ochre-dark">
              Signed in as
            </p>
            <p
              data-testid="account-profile-email"
              className="font-body-md text-body-md text-primary break-all"
            >
              {user?.email ?? "Anonymous session"}
            </p>
            {user?.id ? (
              <p className="font-mono-micro text-mono-micro text-on-surface-variant break-all">
                ID · {user.id}
              </p>
            ) : null}
          </div>
          <SignOutButton
            signOutAction={signOutAction}
            className="md:self-end text-on-surface-variant hover:text-primary"
          />
        </CardContent>
      </Card>

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
                          Checkout to unlock
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
              <p className="rota-muted">Your saved drafts and unlocked itineraries will appear here once you create your first trip.</p>
            </CardContent>
          </Card>
        )}
      </div>

      <Card data-testid="account-stats" className="flex flex-col bg-white/70">
        <CardHeader>
          <CardTitle>Deliverables & Upgrades</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-1 flex-col gap-4">
          <p className="rota-muted text-sm leading-relaxed">Upgrade your drafts to unlock full daily routing, export features, and optional human concierge review.</p>
          <div className="grid gap-3 xl:grid-cols-2">
            <div className="rounded-[20px] border border-[var(--color-border)] bg-white/70 p-4">
              <p className="rota-kicker">Unlock plan</p>
              <p className="mt-2 text-sm font-semibold text-[var(--color-foreground)]">{unlockPlan.priceLabel}</p>
              <p className="rota-muted mt-2 text-xs">{unlockPlan.fulfillment}</p>
            </div>
            <div className="rounded-[20px] border border-[var(--color-border)] bg-white/70 p-4">
              <p className="rota-kicker">Concierge review</p>
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
        <CardContent className="flex flex-1 flex-col gap-4">
          <p className="rota-muted text-sm leading-relaxed">
            Personalization preferences for your itineraries.
          </p>
          <div className="rounded-[20px] border border-[var(--color-border)] bg-white/70 p-4">
            <BehaviorConsentToggle />
          </div>
        </CardContent>
      </Card>
    </ArchiveLayout>
  );
}
