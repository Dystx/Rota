import Link from "next/link";
import { redirect } from "next/navigation";
import { Button, EmptyState } from "@repo/ui";
import { getOwnedTrip } from "@/app/lib/trip-access";
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
          <div
            data-testid="expert-chat-empty"
            className="mx-auto max-w-2xl px-container-padding-sm text-center"
          >
            {/* Sample 2-bubble conversation preview — telegraphs
                "this is a chat" instead of "go back". Muted so
                it reads as a placeholder, not a real thread. */}
            <div
              aria-hidden="true"
              className="mx-auto mb-8 max-w-md rounded-2xl border border-olive-light/15 bg-white/50 p-4 text-left"
            >
              <p className="font-mono-micro text-mono-micro uppercase tracking-widest text-ochre-dark mb-3 text-center">
                Sample thread
              </p>
              <div className="flex flex-col gap-3">
                <div className="self-start max-w-[80%] rounded-2xl rounded-tl-sm bg-white/80 px-3 py-2 text-[13px] text-primary leading-relaxed">
                  Tuesday looks rainy in Sintra. Should we swap the palace day for the Belém loop?
                </div>
                <div className="self-end max-w-[80%] rounded-2xl rounded-tr-sm bg-ochre-light/30 px-3 py-2 text-[13px] text-primary leading-relaxed">
                  Good call — let me move Quinta da Regaleira to Thursday and add the Jerónimos monastery.
                </div>
              </div>
            </div>

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

  return <ExpertChat tripId={tripId} />;
}
