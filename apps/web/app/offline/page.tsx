import { PublicRouteLayout } from "../_components/public-route-layout";
import { OfflineStatus } from "./offline-status";

/**
 * Offline fallback. Served by the PWA service worker when the
 * network is unreachable and the requested page is not in the
 * SW cache. Keeps the brand surface consistent (nav, footer)
 * so the experience doesn't feel broken.
 */
export default function OfflinePage() {
  return (
    <PublicRouteLayout>
      <div className="min-h-[60vh] flex items-center justify-center px-container-padding-lg py-section-gap bg-background">
        <div className="max-w-xl text-center flex flex-col items-center gap-gutter">
          <h1 className="font-display text-display text-foreground">
            You&apos;re offline
          </h1>
          <OfflineStatus online={false} cachedPacks={[]} safeHref="/offline" />
        </div>
      </div>
    </PublicRouteLayout>
  );
}
