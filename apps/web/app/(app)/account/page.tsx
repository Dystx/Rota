import Link from "next/link";
import { Metadata } from "next";
import { redirect } from "next/navigation";
import {
  Button,
  Card,
  CardContent,
  EmptyState,
  SectionHeading
} from "@repo/ui";
import { getTripsForUser, isPersistenceConfigError, loadPostgresAuthorizationContext } from "@repo/db";
import { getCurrentUser } from "@/lib/auth/current-user";
import { AccountTripCard } from "./_components/trip-card";
import { BehaviorConsentToggle } from "./_components/behavior-consent-toggle";
import { signOutAction } from "./_actions/sign-out";
import { SignOutButton } from "./_components/sign-out-button";

export const metadata: Metadata = {
  title: "Saved plans | Rumia",
  robots: { index: false, follow: false }
};

/**
 * `/account` — the traveler's saved drafts and unlocked itineraries.
 *
 * Pre-rewrite: this page used `ArchiveLayout` → `PageShell` which
 * renders a "Rumia | PORTUGAL TRAVEL CONCIERGE" sub-brand header
 * with its own uppercase nav (HOME | TRIP BRIEF | REVIEWER | ADMIN).
 * It felt like a separate app from the public surface (`/`,
 * `/itineraries`, `/vault`, `/checkout`) which all use the
 * shared `TopNav` + `SiteFooter` + the same `Card` / `Badge` /
 * `Button` primitives.
 *
 * Post-rewrite: the page uses the shared `TopNav`, the shared
 * `SectionHeading` + `Card` + `EmptyState` primitives, the shared
 * spacing tokens (`pt-header-height`, `py-section-gap`,
 * `px-container-padding-lg`, `p-card-padding`), and the shared
 * `AccountTripCard` for the trips grid. The preferences section
 * is a peer section with the same `max-w-6xl` width as the trips
 * grid (the previous bespoke right rail is gone).
 */
export default async function AccountPage() {
  const { user } = await getCurrentUser();

  if (!user) {
    redirect("/sign-in?next=%2Faccount");
  }

  let trips: Awaited<ReturnType<typeof getTripsForUser>> = [];
  let infoMessage = "";
  try {
    const actor = await loadPostgresAuthorizationContext(user.id);
    if (!actor) {
      infoMessage = "Your account profile is still being provisioned. Please try again shortly.";
    } else {
      trips = await getTripsForUser(user.id, 24, { actor });
    }
  } catch (error) {
    infoMessage = isPersistenceConfigError(error)
      ? "Configure PostgreSQL and Better Auth environment variables to load saved draft trips here."
      : error instanceof Error
        ? error.message
        : "Could not load saved trips.";
  }

  return (
    <div className="min-h-screen bg-background" data-testid="account-header">
        {/* Profile strip — one Card at the top of the page so the
            traveler sees their session + a sign-out control as
            soon as the page renders. `max-w-6xl` + shared padding
            tokens keep the rhythm with the rest of the public
            surface. */}
        <section className="max-w-6xl mx-auto px-container-padding-lg py-section-gap">
          <SectionHeading
            eyebrow="Your Rumia shelf"
            title="Saved plans"
            description="The activities you chose, the days you shaped, and the exports you can revisit when the time is right."
            h1
          />
          <Card
            data-testid="account-profile"
            className="mt-section-gap flex flex-col bg-white/80"
          >
            <CardContent className="flex flex-1 flex-col gap-3 p-card-padding md:flex-row md:items-center md:justify-between">
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
                className="md:self-end"
              />
            </CardContent>
          </Card>
        </section>

        {/* Trips grid — 3-up on desktop, 2-up on tablet, 1-up on
            mobile. EmptyState replaces the previous bespoke "no
            trips" paragraph so the IA, the icon, and the action
            follow the same vocabulary as the rest of the app. */}
        <section
          className="max-w-6xl mx-auto px-container-padding-lg pb-section-gap"
          aria-labelledby="trips-heading"
        >
          <h2
            id="trips-heading"
            className="font-mono-micro text-mono-micro uppercase tracking-widest text-ochre-dark mb-4"
          >
            Your saved work
          </h2>

          {infoMessage ? (
            <Card className="mb-section-gap bg-white/70">
              <CardContent className="p-card-padding">
                <p className="font-body-md text-body-md text-on-surface-variant">
                  {infoMessage}
                </p>
              </CardContent>
            </Card>
          ) : null}

          {trips.length > 0 ? (
            <div
              data-testid="trip-list"
              className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-section-gap"
            >
              {trips.map((trip) => (
                <AccountTripCard key={trip.id} trip={trip} />
              ))}
            </div>
          ) : (
            <EmptyState
              icon="luggage"
              title="No saved plans yet"
              description="Start by exploring worthwhile activities. When you save a few, this becomes the quiet place to shape, revisit, and carry them with you."
              variant="default"
              action={
                <Button asChild>
                  <Link href="/explore">Explore activities</Link>
                </Button>
              }
            />
          )}
        </section>

        {/* Preferences — a peer section, not a side rail. Same
            max-w-6xl so the rhythm matches the trips grid above. */}
        <section
          className="max-w-6xl mx-auto px-container-padding-lg pb-section-gap"
          aria-labelledby="preferences-heading"
        >
          <h2
            id="preferences-heading"
            className="font-mono-micro text-mono-micro uppercase tracking-widest text-ochre-dark mb-4"
          >
            Preferences
          </h2>
          <Card
            data-testid="preferences-section"
            className="flex flex-col bg-white/80"
          >
            <CardContent className="flex flex-1 flex-col gap-4 p-card-padding">
              <p className="font-body-md text-body-md text-on-surface-variant leading-relaxed">
                Control what your activity suggestions remember about you. Off
                by default — nothing is recorded until you opt in.
              </p>
              <BehaviorConsentToggle />
            </CardContent>
          </Card>
        </section>
    </div>
  );
}
