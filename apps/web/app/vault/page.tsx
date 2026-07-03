import { TopNav } from "../_components/top-nav";
import { SiteFooter } from "../_components/site-footer";

/**
 * Vault page — Mock 1.7 (Saved Vault & Export).
 *
 * Source: docs/prototype.html (VaultPage component).
 * Two-pane layout: gallery of saved trips on the left, sticky export
 * drawer on the right. The drawer is statically rendered for now —
 * interactive selection is wired by a future Tier 3 task.
 */
export default function VaultPage() {
  return (
    <>
      <TopNav />
      <div className="pt-header-height min-h-screen flex flex-col font-body-md text-body-md">
        <main id="main-content" className="flex-grow pt-[88px] pb-section-gap px-container-padding-sm md:px-container-padding-lg max-w-[1440px] mx-auto w-full flex flex-col md:flex-row gap-section-gap relative">
          {/* Left: Vault Grid (Gallery) */}
          <section className="flex-grow flex flex-col gap-section-gap">
            <header className="flex justify-between items-end pb-4 border-b border-outline-variant/30">
              <div>
                <h1 className="font-display-mobile text-display-mobile md:font-display md:text-display text-primary">
                  Saved Vault
                </h1>
                <p className="font-body-md text-body-md text-on-surface-variant mt-2">
                  Your personalized archive of curated itineraries and
                  inspirations.
                </p>
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  aria-label="Grid view"
                  className="p-2 rounded-full hover:bg-surface-variant text-primary transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ochre-light focus-visible:ring-offset-2"
                >
                  <span className="material-symbols-outlined">grid_view</span>
                </button>
                <button
                  type="button"
                  aria-label="List view"
                  className="p-2 rounded-full hover:bg-surface-variant text-on-surface-variant transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ochre-light focus-visible:ring-offset-2"
                >
                  <span className="material-symbols-outlined">view_list</span>
                </button>
              </div>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-gutter">
              {/* Card 1: Portugal Escape */}
              <article className="bg-glass-light/65 backdrop-blur-md rounded-xl border border-white/20 shadow-sm overflow-hidden group hover:shadow-lg transition-all duration-300 relative cursor-pointer">
                <div className="h-48 w-full bg-surface-variant overflow-hidden relative">
                  <div
                    className="bg-cover bg-center w-full h-full group-hover:scale-105 transition-transform duration-500"
                    style={{
                      backgroundImage:
                        "url('https://picsum.photos/seed/douro-valley-vault/800/400')",
                    }}
                  />
                  <div className="absolute top-3 right-3 bg-white/80 backdrop-blur-sm px-2 py-1 rounded text-primary font-mono-micro text-mono-micro uppercase tracking-wider">
                    Itinerary
                  </div>
                </div>
                <div className="p-card-padding">
                  <h2 className="font-headline-sm text-headline-sm text-primary mb-1">
                    Portugal Escape
                  </h2>
                  <p className="font-body-md text-body-md text-on-surface-variant text-sm mb-3">
                    Douro Terroir &amp; Lisbon Nights
                  </p>
                  <div className="flex justify-between items-center mt-4 pt-4 border-t border-outline-variant/20">
                    <span className="font-mono-micro text-mono-micro text-on-surface-variant">
                      7 DAYS • 2 GUESTS
                    </span>
                    <span className="material-symbols-outlined text-on-surface-variant group-hover:text-ochre-dark transition-colors" aria-hidden="true">
                      arrow_forward
                    </span>
                  </div>
                </div>
              </article>

              {/* Card 2: Kyoto Minimalism */}
              <article className="bg-glass-light/65 backdrop-blur-md rounded-xl border border-white/20 shadow-sm overflow-hidden group hover:shadow-lg transition-all duration-300 relative cursor-pointer">
                <div className="h-48 w-full bg-surface-variant overflow-hidden relative">
                  <div
                    className="bg-cover bg-center w-full h-full group-hover:scale-105 transition-transform duration-500"
                    style={{
                      backgroundImage:
                        "url('https://picsum.photos/seed/kyoto-minimalism-vault/800/400')",
                    }}
                  />
                  <div className="absolute top-3 right-3 bg-white/80 backdrop-blur-sm px-2 py-1 rounded text-primary font-mono-micro text-mono-micro uppercase tracking-wider">
                    Draft
                  </div>
                </div>
                <div className="p-card-padding">
                  <h2 className="font-headline-sm text-headline-sm text-primary mb-1">
                    Kyoto Minimalism
                  </h2>
                  <p className="font-body-md text-body-md text-on-surface-variant text-sm mb-3">
                    Temples &amp; Modernity
                  </p>
                  <div className="flex justify-between items-center mt-4 pt-4 border-t border-outline-variant/20">
                    <span className="font-mono-micro text-mono-micro text-on-surface-variant">
                      10 DAYS • SOLO
                    </span>
                    <span className="material-symbols-outlined text-on-surface-variant group-hover:text-ochre-dark transition-colors" aria-hidden="true">
                      arrow_forward
                    </span>
                  </div>
                </div>
              </article>

              {/* Card 3: Iceland Ring Road */}
              <article className="bg-glass-light/65 backdrop-blur-md rounded-xl border border-white/20 shadow-sm overflow-hidden group hover:shadow-lg transition-all duration-300 relative cursor-pointer">
                <div className="h-48 w-full bg-surface-variant overflow-hidden relative">
                  <div
                    className="bg-cover bg-center w-full h-full group-hover:scale-105 transition-transform duration-500"
                    style={{
                      backgroundImage:
                        "url('https://picsum.photos/seed/iceland-ring-vault/800/400')",
                    }}
                  />
                  <div className="absolute top-3 right-3 bg-white/80 backdrop-blur-sm px-2 py-1 rounded text-primary font-mono-micro text-mono-micro uppercase tracking-wider">
                    Inspiration
                  </div>
                </div>
                <div className="p-card-padding">
                  <h2 className="font-headline-sm text-headline-sm text-primary mb-1">
                    Iceland Ring Road
                  </h2>
                  <p className="font-body-md text-body-md text-on-surface-variant text-sm mb-3">
                    Volcanic Landscapes &amp; Hot Springs
                  </p>
                  <div className="flex justify-between items-center mt-4 pt-4 border-t border-outline-variant/20">
                    <span className="font-mono-micro text-mono-micro text-on-surface-variant">
                      8 DAYS • COUPLE
                    </span>
                    <span className="material-symbols-outlined text-on-surface-variant group-hover:text-ochre-dark transition-colors" aria-hidden="true">
                      arrow_forward
                    </span>
                  </div>
                </div>
              </article>
            </div>
          </section>

          {/* Right: Sliding Export Panel (Drawer) */}
          <aside
            className="hidden md:block w-full md:w-80 lg:w-96 bg-glass-light/65 backdrop-blur-md rounded-xl border border-white/20 shadow-md p-card-padding flex-shrink-0 sticky top-[88px] h-[calc(100vh-120px)] overflow-y-auto transition-transform duration-300 transform translate-x-0"
            id="export-panel"
          >
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-headline-sm text-headline-sm text-primary">
                Export Options
              </h3>
              <button
                type="button"
                aria-label="Close export panel"
                className="text-on-surface-variant hover:text-primary transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ochre-light focus-visible:ring-offset-2 rounded"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <div className="mb-6 p-4 bg-surface-container-low rounded-lg border border-outline-variant/30">
              <h4 className="font-headline-sm text-headline-sm text-primary text-sm mb-1">
                Portugal Escape
              </h4>
              <p className="font-mono-micro text-mono-micro text-on-surface-variant uppercase tracking-wide">
                Selected Itinerary
              </p>
            </div>
            <div className="flex flex-col gap-4">
              <button
                type="button"
                className="w-full text-left group bg-surface hover:bg-surface-container-high border border-outline-variant/30 rounded-lg p-4 transition-all duration-200 flex items-start gap-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ochre-light focus-visible:ring-offset-2"
              >
                <div className="p-2 bg-olive-light/10 text-olive-light rounded-md group-hover:bg-ochre-light/20 group-hover:text-ochre-dark transition-colors">
                  <span className="material-symbols-outlined" aria-hidden="true">
                    picture_as_pdf
                  </span>
                </div>
                <div>
                  <div className="font-label-ui text-label-ui text-primary mb-1 group-hover:text-ochre-dark transition-colors">
                    Download PDF
                  </div>
                  <div className="font-body-md text-body-md text-sm text-on-surface-variant">
                    Premium editorial layout for printing or offline viewing.
                  </div>
                </div>
              </button>
              <button
                type="button"
                className="w-full text-left group bg-surface hover:bg-surface-container-high border border-outline-variant/30 rounded-lg p-4 transition-all duration-200 flex items-start gap-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ochre-light focus-visible:ring-offset-2"
              >
                <div className="p-2 bg-olive-light/10 text-olive-light rounded-md group-hover:bg-ochre-light/20 group-hover:text-ochre-dark transition-colors">
                  <span className="material-symbols-outlined" aria-hidden="true">
                    sync_saved_locally
                  </span>
                </div>
                <div>
                  <div className="font-label-ui text-label-ui text-primary mb-1 group-hover:text-ochre-dark transition-colors">
                    Sync to Mobile App
                  </div>
                  <div className="font-body-md text-body-md text-sm text-on-surface-variant">
                    Send directly to the Rumia companion app for on-the-go
                    access.
                  </div>
                </div>
              </button>
              <button
                type="button"
                className="w-full text-left group bg-surface hover:bg-surface-container-high border border-outline-variant/30 rounded-lg p-4 transition-all duration-200 flex items-start gap-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ochre-light focus-visible:ring-offset-2"
              >
                <div className="p-2 bg-olive-light/10 text-olive-light rounded-md group-hover:bg-ochre-light/20 group-hover:text-ochre-dark transition-colors">
                  <span className="material-symbols-outlined" aria-hidden="true">share</span>
                </div>
                <div>
                  <div className="font-label-ui text-label-ui text-primary mb-1 group-hover:text-ochre-dark transition-colors">
                    Share Link
                  </div>
                  <div className="font-body-md text-body-md text-sm text-on-surface-variant">
                    Generate a secure web link to share with co-travelers.
                  </div>
                </div>
              </button>
            </div>
            <div className="mt-8 pt-6 border-t border-outline-variant/30">
              <button
                type="button"
                className="w-full bg-primary text-on-primary py-3 rounded-lg font-label-ui text-label-ui shadow-sm hover:bg-olive-light hover:shadow-md transition-all duration-200 flex justify-center items-center gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ochre-light focus-visible:ring-offset-2"
              >
                <span className="material-symbols-outlined text-sm" aria-hidden="true">
                  file_download
                </span>
                Execute Export
              </button>
            </div>
          </aside>
        </main>

        <SiteFooter />
      </div>
    </>
  );
}
