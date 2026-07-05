import Link from "next/link";
import { Button, EmptyState } from "@repo/ui";
import { getTripDraftById } from "@repo/db";
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
 * `ExpertChat` component mounts and renders the chat timeline
 * + composer (currently still seeded with the Kyoto timeline
 * as a placeholder until the timeline is wired to `trip.days`).
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

  if (!tripId) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <TopNav />
        <main
          id="main-content"
          className="flex-1 pt-header-height flex items-center justify-center"
        >
          <EmptyState
            icon="forum"
            title="Open this chat from a trip"
            description="The expert chat is scoped to a specific trip. Open a trip and use the 'Open expert chat' action to start a conversation with the destination specialist."
            variant="default"
            action={
              <Button asChild>
                <Link href="/account">Browse my trips</Link>
              </Button>
            }
            secondaryAction={
              <Button asChild variant="ghost">
                <Link href="/">Back to home</Link>
              </Button>
            }
          />
        </main>
        <SiteFooter />
      </div>
    );
  }

  // Best-effort: try to load the trip to confirm it exists and
  // surface a friendly empty state when the id is bogus. The
  // chat component itself doesn't need the trip row to mount
  // (the timeline is still hardcoded) but we want the page to
  // 404 gracefully when the user mistypes the id.
  let tripExists = true;
  try {
    const trip = await getTripDraftById(tripId);
    if (!trip) tripExists = false;
  } catch {
    tripExists = false;
  }

  if (!tripExists) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <TopNav />
        <main
          id="main-content"
          className="flex-1 pt-header-height flex items-center justify-center"
        >
          <EmptyState
            icon="error"
            title="We couldn't find that trip"
            description={`Trip ${tripId} is not in your account, or the link is no longer valid. Pick a trip from your list to open its expert chat.`}
            variant="default"
            action={
              <Button asChild>
                <Link href="/account">Browse my trips</Link>
              </Button>
            }
          />
        </main>
        <SiteFooter />
      </div>
    );
  }

  return <ExpertChat tripId={tripId} />;
}
