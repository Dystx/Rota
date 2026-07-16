import Link from "next/link";
import { PublicRouteLayout } from "../_components/public-route-layout";
import { OfflineStatus } from "./offline-status";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Offline help",
  description: "Keep the next useful Rumia step visible when your connection drops.",
  alternates: { canonical: "/offline" }
};

/**
 * Offline fallback. Served by the PWA service worker when the
 * network is unreachable and the requested page is not in the
 * SW cache. Keeps the brand surface consistent (nav, footer)
 * so the experience doesn't feel broken.
 */
export default function OfflinePage() {
  return (
    <PublicRouteLayout scene="utility" footerMode="compact" surfaceTone="linen" surfaceTexture="none">
      <div
        className="rumia-surface rumia-surface-linen px-container-padding-lg py-section-gap"
        data-surface="linen"
        data-surface-texture="editorial"
      >
        <div className="mx-auto grid max-w-5xl gap-10 lg:grid-cols-[minmax(0,1.1fr)_minmax(260px,0.7fr)] lg:items-center">
          <section className="grid gap-6" aria-labelledby="offline-heading">
            <div className="grid gap-3">
              <p className="font-metadata text-metadata uppercase tracking-[0.16em] text-ochre-dark">
                Connection state
              </p>
              <h1 id="offline-heading" className="max-w-xl font-display text-display leading-[0.94] text-foreground">
                You&apos;re offline
              </h1>
              <p className="max-w-xl text-lg leading-relaxed text-on-surface-variant">
                Rumia keeps this recovery page available so a lost connection does not become a dead end.
              </p>
            </div>
            <OfflineStatus online={false} cachedPacks={[]} safeHref="/offline" />
          </section>

          <aside className="grid gap-5 rounded-[28px] border border-olive-light/15 bg-white/45 p-6 shadow-sm backdrop-blur-sm md:p-7" aria-labelledby="offline-next-heading">
            <div className="grid gap-2">
              <p className="font-metadata text-metadata uppercase tracking-[0.16em] text-ochre-dark">
                When you&apos;re back
              </p>
              <h2 id="offline-next-heading" className="font-display text-2xl leading-tight text-primary">
                Return to the choices that matter.
              </h2>
            </div>
            <ul className="grid gap-3 text-base leading-relaxed text-on-surface-variant">
              <li className="flex gap-3"><span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-ochre-dark" aria-hidden="true" />Retry this page to check the connection.</li>
              <li className="flex gap-3"><span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-ochre-dark" aria-hidden="true" />Open a saved activity day if this device has one cached.</li>
              <li className="flex gap-3"><span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-ochre-dark" aria-hidden="true" />Keep Rumia&apos;s activity list as the source of truth when you continue.</li>
            </ul>
            <Link
              href="/support"
              className="inline-flex min-h-11 items-center justify-center rounded-full border border-olive-light/35 px-5 text-sm font-medium text-primary transition-colors hover:border-olive-light hover:bg-white/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ochre-light focus-visible:ring-offset-2"
            >
              Open support when connected
            </Link>
          </aside>
        </div>
      </div>
    </PublicRouteLayout>
  );
}
