import { PageShell } from "@repo/ui";
import Link from "next/link";

/**
 * Offline fallback. Served by the PWA service worker when the
 * network is unreachable and the requested page is not in the
 * SW cache. Keeps the brand surface consistent (nav, footer)
 * so the experience doesn't feel broken.
 */
export default function OfflinePage() {
  return (
    <PageShell variant="marketing">
      <main
        id="main-content"
        className="min-h-[60vh] flex items-center justify-center px-container-padding-lg py-section-gap"
      >
        <div className="max-w-xl text-center flex flex-col items-center gap-gutter">
          <span
            aria-hidden
            className="ph text-[64px] text-on-surface-variant"
          >
            cloud_off
          </span>
          <h1 className="font-display text-display text-foreground">
            You&apos;re offline
          </h1>
          <p className="font-body-lg text-body-lg text-on-surface-variant">
            Rumia can&apos;t reach the network right now. Cached trip previews remain available on this device; reconnect to refresh your route.
          </p>
          <p className="font-mono-micro text-mono-micro uppercase tracking-widest text-on-surface-variant">
            Reconnect automatically when you&apos;re back online
          </p>
          <Link href="/explore" className="rounded-full bg-olive-light px-5 py-3 text-sm font-semibold text-on-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ochre-light">Return to Discover</Link>
        </div>
      </main>
    </PageShell>
  );
}
