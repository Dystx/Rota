import { TopNav } from "../_components/top-nav";
import { SiteFooter } from "../_components/site-footer";

/**
 * Loading UI for the (app) route group — shown by Next.js
 * while a server component in /account, /trip/[id], or
 * /trip/new is being prepared. Renders the fixed TopNav +
 * a placeholder shell that matches the max-w-6xl + section
 * rhythm of the account page so the layout doesn't shift
 * when the real page mounts.
 *
 * The trip detail page has its own CinematicHero + dark
 * GuideChapter rhythm, so this skeleton picks the
 * cream-on-mint account page rhythm as the more general
 * fallback. Trip pages still benefit from the TopNav +
 * site footer continuity; the content area is a single
 * generic skeleton block.
 */
export default function AppLoading() {
  return (
    <div
      className="min-h-screen flex flex-col rumia-surface rumia-surface-linen"
      data-surface="linen"
      data-surface-texture="editorial"
    >
      <TopNav />
      <div
        role="status"
        aria-live="polite"
        className="flex-1 pt-header-height"
        aria-busy="true"
        aria-label="Loading"
      >
        {/* Profile strip skeleton — matches the /account
            SectionHeading + Card rhythm. */}
        <section className="max-w-6xl mx-auto px-container-padding-lg py-section-gap">
          <div
            className="h-10 w-2/3 max-w-md rounded-md bg-olive-light/20 animate-pulse mb-4"
            aria-hidden
          />
          <div
            className="h-5 w-3/4 max-w-2xl rounded-md bg-olive-light/15 animate-pulse mb-section-gap"
            aria-hidden
          />
          <div
            className="h-20 rounded-2xl bg-white/60 border border-olive-light/20 animate-pulse"
            aria-hidden
          />
        </section>

        {/* Trips grid skeleton — matches the 3-up grid on
            /account. */}
        <section className="max-w-6xl mx-auto px-container-padding-lg pb-section-gap">
          <div
            className="h-6 w-40 rounded-md bg-olive-light/20 animate-pulse mb-4"
            aria-hidden
          />
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-section-gap">
            {[0, 1, 2, 3, 4, 5].map((i) => (
              <div
                key={i}
                className="rounded-2xl bg-white/60 border border-olive-light/20 overflow-hidden animate-pulse"
                aria-hidden
              >
                <div className="aspect-[16/9] bg-olive-light/15" />
                <div className="p-card-padding space-y-3">
                  <div className="h-4 w-1/3 rounded-md bg-olive-light/20" />
                  <div className="h-6 w-3/4 rounded-md bg-olive-light/20" />
                  <div className="h-4 w-full rounded-md bg-olive-light/15" />
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
      <SiteFooter />
    </div>
  );
}
