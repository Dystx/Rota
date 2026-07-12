import { SiteFooter } from "../../_components/site-footer";
import { ClientAnchorCard } from "../_components/client-anchor-card";
import { TimelineItem } from "../_components/timeline-item";
import { ValidationBar } from "../_components/validation-bar";

const AMBIENT_PATTERN =
  "url(\"data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCI+PHJlY3Qgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBmaWxsPSJ0cmFuc3BhcmVudCIvPjxjaXJjbGUgY3g9IjIwIiBjeT0iMjAiIHI9IjEiIGZpbGw9InJnYmEoNDMsIDYyLCA1MiwgMC4xKSIvPjwvc3ZnPg==\")";

export default function ConsoleWorkspacePage() {
  return (
    <>
      <div
        className="md:ml-64 min-w-0 min-h-screen flex flex-col bg-background relative overflow-x-hidden"
        style={{ backgroundImage: AMBIENT_PATTERN }}
      >
        <header className="h-header-height px-container-padding-lg flex items-center justify-between border-b border-olive-light/10 bg-surface/50 backdrop-blur-md shrink-0 z-10">
          <div className="flex items-center gap-3 min-w-0">
            <span className="font-mono-technical text-mono-technical bg-surface-container-high text-on-surface-variant px-2 py-1 rounded">
              TRP-PT-2048
            </span>
            <h1 className="font-headline-sm text-headline-sm text-primary truncate">
              Douro & Coast Residency
            </h1>
          </div>
          <div className="flex items-center gap-3">
            <span className="font-label-ui text-label-ui text-on-surface-variant flex items-center gap-2">
              <span
                aria-hidden
                className="w-2 h-2 rounded-full bg-ochre-dark animate-pulse"
              />
              Demo data · 2 pending revisions
            </span>
            <button
              type="button"
              className="font-label-ui text-label-ui bg-primary text-on-primary px-4 py-2 rounded-lg hover:bg-olive-dark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ochre-light focus-visible:ring-offset-2"
            >
              Publish Changes
            </button>
          </div>
        </header>

        <main id="main-content" className="flex-1 flex overflow-hidden">
          <aside className="w-full md:w-1/3 md:min-w-[320px] md:max-w-[400px] border-r border-olive-light/10 bg-glass-light backdrop-blur-md overflow-y-auto p-container-padding-sm flex flex-col gap-section-gap shrink-0">
            <div className="flex items-center justify-between">
              <h3 className="font-headline-sm text-headline-sm text-primary">
                Client Anchors
              </h3>
              <button
                type="button"
                aria-label="Filter anchors"
                className="p-2 rounded-lg text-on-surface-variant hover:bg-surface-container focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ochre-light focus-visible:ring-offset-2"
              >
                <span aria-hidden className="ph ph-funnel">funnel</span>
              </button>
            </div>

            <ClientAnchorCard
              icon="restaurant"
              title="Culinary"
              badge={{ label: "Hard Constraint", tone: "error" }}
              body="Severe shellfish allergy. Requires strict cross-contamination protocols."
              quote="“Please confirm a kitchen can accommodate us before adding any seafood stop.”"
            />
            <ClientAnchorCard
              icon="directions_walk"
              title="Pacing"
              badge={{ label: "Preference", tone: "neutral" }}
              body="Max 2 scheduled activities per day. Requires afternoon downtime."
              tags={["Slow mornings", "Late dinners"]}
            />
            <ClientAnchorCard
              icon="hotel"
              title="Lodging"
              badge={{ label: "Flexible", tone: "olive" }}
              body="Prefers a characterful pousada or small design hotel with quiet rooms and a proper bed."
            />
          </aside>

          <section className="flex-1 bg-surface-container-lowest/50 overflow-y-auto p-container-padding-lg relative">
            <div className="max-w-3xl mx-auto pb-32">
              <h3 className="font-headline-lg text-headline-lg text-primary mb-2">
                Day 3: Douro Valley Focus
              </h3>
              <p className="font-body-md text-body-md text-on-surface-variant mb-8 border-b border-olive-light/10 pb-4">
                Vineyards, a river lunch, and unhurried downtime. One override
                requires your attention.
              </p>

              <div className="flex flex-col gap-section-gap">
                <TimelineItem
                  time="09:00 – 11:30"
                  status={{ label: "Confirmed", tone: "olive" }}
                  title="Quinta Walk & River Lookout"
                  meta={
                    <>
                      <span className="flex items-center gap-1">
                        <span
                          aria-hidden
                          className="ph text-[16px]"
                        >
                          directions_walk
                        </span>
                        Moderate Activity
                      </span>
                      <span className="flex items-center gap-1">
                        <span
                          aria-hidden
                          className="ph text-[16px]"
                        >
                          groups
                        </span>
                        Guide: Inês · local host
                      </span>
                    </>
                  }
                >
                  A private vineyard walk followed by a slow lookout loop and
                  a confirmed lunch venue recon.
                </TimelineItem>

                <TimelineItem
                  variant="ochre"
                  overrideBanner="Logistical Override Required"
                  time="12:30 – 14:00"
                  status={{ label: "In Revision", tone: "ochre" }}
                  title="Lunch: riverside quinta"
                  rightAction={
                    <button
                      type="button"
                      aria-label="Edit lunch entry"
                      className="p-2 rounded-lg text-ochre-dark hover:bg-ochre-light/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ochre-light focus-visible:ring-offset-2"
                    >
                      <span aria-hidden className="ph">
                        edit
                      </span>
                    </button>
                  }
                >
                  <p className="line-through opacity-70 mb-4">
                    Seasonal tasting menu overlooking the Douro.
                  </p>
                  <div className="bg-surface-container-lowest border border-ochre-light/30 rounded-lg p-4 mb-4">
                    <p className="font-label-ui text-label-ui uppercase tracking-wider text-ochre-dark mb-2">
                      Editor Note: Shellfish Conflict
                    </p>
                    <p className="text-on-surface mb-3">
                      The first venue cannot guarantee an allergen-safe kitchen.
                      Choose a substitute with a confirmed cross-contamination
                      protocol before publishing.
                    </p>
                    <p className="font-label-ui text-label-ui text-on-surface-variant">
                      Choose a verified substitute
                    </p>
                    <ul className="mt-3 flex flex-col gap-2" aria-label="Verified substitute restaurants">
                      <li>
                        <button
                          type="button"
                          className="w-full flex items-center justify-between gap-3 px-3 py-2 rounded-lg border border-ochre-light/20 bg-white text-primary hover:border-ochre-light focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ochre-light focus-visible:ring-offset-2"
                        >
                          <span className="font-label-ui text-label-ui">
                            Taberna do Mercado · allergen briefed
                          </span>
                          <span
                            aria-hidden
                            className="ph text-ochre-dark text-[18px] ph-plus"
                          >plus</span>
                        </button>
                      </li>
                      <li>
                        <button
                          type="button"
                          className="w-full flex items-center justify-between gap-3 px-3 py-2 rounded-lg border border-ochre-light/20 bg-white text-primary hover:border-ochre-light focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ochre-light focus-visible:ring-offset-2"
                        >
                          <span className="font-label-ui text-label-ui">
                            Quinta da Foz · kitchen confirmed
                          </span>
                          <span
                            aria-hidden
                            className="ph text-ochre-dark text-[18px] ph-plus"
                          >plus</span>
                        </button>
                      </li>
                    </ul>
                  </div>
                </TimelineItem>

                <TimelineItem
                  variant="muted"
                  time="15:00 – 18:00"
                  status={{ label: "Downtime", tone: "neutral" }}
                  title="Return to Ryokan & Rest"
                >
                  <p className="italic">
                    Aligns with pacing preference: afternoon downtime.
                  </p>
                </TimelineItem>
              </div>
            </div>

            <ValidationBar
              checks={[
                { label: "1 Conflict", tone: "error" },
                { label: "Transit Feasible", tone: "primary" },
                { label: "Pacing Met", tone: "primary" },
              ]}
            />
          </section>
        </main>
        <SiteFooter />
      </div>
      <style>{`
        aside::-webkit-scrollbar, section::-webkit-scrollbar { width: 6px; }
        aside::-webkit-scrollbar-thumb, section::-webkit-scrollbar-thumb {
          background-color: rgba(60, 84, 71, 0.2); border-radius: 9999px;
        }
      `}</style>
    </>
  );
}
