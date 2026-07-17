import * as React from "react";
import { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import {
  Card,
  CardContent,
  SectionHeading
} from "@repo/ui";
import { getTripsForUser, isPersistenceConfigError, isSchemaDriftError } from "@repo/db";
import { getCurrentUser } from "@/lib/auth/current-user";
import { loadCurrentAuthorizedActorOutcome } from "@/lib/auth/authorization";
import { isSessionProviderFailure } from "@/lib/auth/session-outcome";
import { RouteRecovery } from "@/app/_components/route-recovery";
import { AccountTripCard } from "./_components/trip-card";
import { BehaviorConsentToggle } from "./_components/behavior-consent-toggle";
import { SignOutButton } from "./_components/sign-out-button";
import { AccountTripsState } from "./_components/account-trips-state";

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
 * shared TopNav + utility SiteFooter + the same Card /
 * DecisionStatePanel primitives.
 *
 * Post-rewrite: the page uses the shared `TopNav`, the shared
 * SectionHeading + Card + DecisionStatePanel primitives, the shared
 * spacing tokens (`pt-header-height`, `py-section-gap`,
 * `px-container-padding-lg`, `p-card-padding`), and the shared
 * `AccountTripCard` for the trips grid. The preferences section
 * is a peer section with the same `max-w-6xl` width as the trips
 * grid (the previous bespoke right rail is gone).
 */
export default async function AccountPage() {
  const currentUser = await getCurrentUser();

  if (currentUser.outcome === "unavailable") {
    return <RouteRecovery kind="unavailable" />;
  }

  const { user } = currentUser;

  if (!user) {
    redirect("/sign-in?next=%2Faccount");
  }

  let trips: Awaited<ReturnType<typeof getTripsForUser>> = [];
  let infoMessage = "";
  try {
    const actorOutcome = await loadCurrentAuthorizedActorOutcome(currentUser.sessionOutcome);
    if (actorOutcome.kind === "unavailable") {
      return <RouteRecovery kind="unavailable" />;
    }
    const actor = actorOutcome.kind === "ready" ? actorOutcome.actor : null;
    if (!actor) {
      infoMessage = "Your account profile is still being provisioned. Please try again shortly.";
    } else {
      trips = await getTripsForUser(user.id, 24, { actor });
    }
  } catch (error) {
    if (isPersistenceConfigError(error) || isSchemaDriftError(error) || isSessionProviderFailure(error)) {
      return <RouteRecovery kind="unavailable" />;
    }
    throw error;
  }

  return (
    <div className="min-h-screen bg-background" data-testid="account-settings">
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
              </div>
              <SignOutButton
                className="md:self-end"
              />
            </CardContent>
          </Card>
        </section>

        {/* Trips grid — 3-up on desktop, 2-up on tablet, 1-up on
            mobile. The authored account state distinguishes an empty
            shelf from a persistence outage so the next action is truthful. */}
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

          {trips.length > 0 ? (
            <div className="grid gap-section-gap lg:grid-cols-[minmax(0,1.45fr)_minmax(18rem,0.75fr)] lg:items-start">
              <div
                data-testid="trip-list"
                className={[
                  "grid grid-cols-1 gap-section-gap",
                  trips.length > 1 ? "md:grid-cols-2" : ""
                ].filter(Boolean).join(" ")}
              >
                {trips.map((trip) => (
                  <AccountTripCard key={trip.id} trip={trip} />
                ))}
              </div>
              <aside
                data-testid="account-next-action"
                className="flex flex-col gap-5 rounded-[var(--radius-card)] bg-primary p-card-padding text-linen-dark shadow-raised lg:sticky lg:top-28"
              >
                <div className="grid gap-2">
                  <p className="font-mono-micro text-mono-micro uppercase tracking-widest text-ochre-light">
                    One useful next step
                  </p>
                  <h3 className="font-headline-lg text-headline-lg leading-tight">
                    Carry one day forward.
                  </h3>
                  <p className="font-body-md text-body-md leading-relaxed text-linen-dark/75">
                    Open the saved plan when you want to compare its stops,
                    keep its context, or carry it into an export.
                  </p>
                </div>
                <div className="grid gap-2">
                  <Link
                    href={`/trip/${trips[0]?.id ?? ""}`}
                    className="inline-flex min-h-11 items-center justify-center rounded-full bg-ochre-light px-5 py-3 font-label-ui text-label-ui font-semibold text-primary transition-colors hover:bg-ochre-light/85 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ochre-light focus-visible:ring-offset-2 focus-visible:ring-offset-primary"
                  >
                    Open saved plan
                  </Link>
                  <Link
                    href="/explore"
                    className="inline-flex min-h-11 items-center justify-center rounded-full border border-linen-dark/30 px-5 py-3 font-label-ui text-label-ui text-linen-dark transition-colors hover:border-ochre-light hover:text-ochre-light focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ochre-light focus-visible:ring-offset-2 focus-visible:ring-offset-primary"
                  >
                    Shape another day
                  </Link>
                </div>
              </aside>
            </div>
          ) : (
            <AccountTripsState infoMessage={infoMessage || undefined} />
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
