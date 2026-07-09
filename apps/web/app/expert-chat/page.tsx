import Link from "next/link";
import { redirect } from "next/navigation";
import { Button } from "@repo/ui";
import { isFeatureEnabled } from "@repo/config";
import { getOwnedTrip } from "@/app/lib/trip-access";
import { BetaUnavailable } from "../_components/beta-unavailable";
import { TopNav } from "../_components/top-nav";
import { SiteFooter } from "../_components/site-footer";
import { ExpertChat } from "./_components/expert-chat";

/**
 * `/expert-chat` — per-trip specialist chat.
 *
 * Auth-gated behind `?trip=<id>`. When the trip param is
 * missing or the trip can't be loaded, the page renders an
 * `EmptyState` with a "Browse my trips" CTA back to `/account`
 * instead of dropping the user into a hardcoded Kyoto
 * conversation. When the trip is present, the client
 * `ExpertChat` component loads only authenticated, trip-scoped messages.
 *
 * The user lands here from the "Open expert chat →" action on
 * `/trip/[id]`; the per-trip `?trip=` is what scopes the
 * conversation. Without it the chat has no context.
 */
export default async function ExpertChatPage({
  searchParams
}: {
  searchParams: Promise<{ trip?: string }>;
}) {
  const { trip: tripParam } = await searchParams;
  const tripId = tripParam?.trim() || null;

  if (!isFeatureEnabled("tripMessaging")) {
    return (
      <BetaUnavailable
        title="Expert messaging is not available yet"
        description="Messaging will become available here when trip messaging is enabled. Your itinerary and review status remain available from the trip itself."
        returnHref={tripId ? `/trip/${encodeURIComponent(tripId)}` : "/itineraries"}
      />
    );
  }

  if (!tripId) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <TopNav />
        <main
          id="main-content"
          className="flex-1 pt-header-height flex items-center justify-center"
        >
          <div
            data-testid="expert-chat-empty"
            className="mx-auto max-w-2xl px-container-padding-sm text-center"
          >
            <span className="ph text-[48px] text-olive-light mb-3 block ph-chat-circle-dots">chat-circle-dots</span>
            <h1 className="font-headline-lg text-headline-lg text-primary mb-2">
              Open this chat from a trip
            </h1>
            <p className="font-body-md text-body-md text-on-surface-variant mb-6 max-w-prose mx-auto">
              The expert chat is scoped to a specific trip. Open a trip
              and use the &ldquo;Open expert chat&rdquo; action to start
              a conversation with the destination specialist.
            </p>
            <div className="flex flex-wrap gap-3 justify-center">
              <Button asChild>
                <Link href="/account">Browse my trips</Link>
              </Button>
              <Button asChild variant="ghost">
                <Link href="/">Back to home</Link>
              </Button>
            </div>
          </div>
        </main>
        <SiteFooter />
      </div>
    );
  }

  const tripAccess = await getOwnedTrip(tripId);

  if (tripAccess.kind === "anonymous") {
    redirect(`/sign-in?next=${encodeURIComponent(`/expert-chat?trip=${tripId}`)}`);
  }

  if (tripAccess.kind !== "ok") {
    redirect("/itineraries?notice=unavailable");
  }

  const reviewed = tripAccess.trip.hasHumanReview || tripAccess.trip.status === "reviewed";
  if (!tripAccess.trip.isPaid || !reviewed) {
    return (
      <BetaUnavailable
        title="Expert messaging is reserved for reviewed trips"
        description="Unlock your trip and complete the local specialist review before messaging becomes available."
        returnHref={`/trip/${encodeURIComponent(tripId)}`}
      />
    );
  }

  return <ExpertChat tripId={tripId} />;
}
