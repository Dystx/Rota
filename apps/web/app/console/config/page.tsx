"use client";

import { useState } from "react";
import { Icon } from "@repo/ui";
import { PromptMultiplier } from "../_components/prompt-multiplier";

export default function ConsoleConfigPage() {
  const [strictGeo, setStrictGeo] = useState(true);
  const [verifiedPois, setVerifiedPois] = useState(true);
  const [experimentalNodes, setExperimentalNodes] = useState(false);

  return (
    <>
      <div className="min-h-screen flex flex-col bg-background relative">
        <div className="flex-1 p-container-padding-lg relative z-10">
          <div className="max-w-[1440px] mx-auto min-h-screen relative z-10 flex flex-col">
            <header className="mb-section-gap flex flex-col gap-4 md:flex-row md:items-end md:justify-between border-b border-olive-light/10 pb-6">
              <div>
                <p className="font-mono-micro text-mono-micro uppercase tracking-widest text-ochre-dark mb-2">
                  Environment: Production
                </p>
                <h1 className="font-headline-lg text-headline-lg text-primary">
                  System Variables
                </h1>
                <p className="font-body-md text-body-md text-on-surface-variant mt-2 max-w-2xl">
                  Tune model prompt weights, routing multipliers, and transit
                  safety margins for the global planner engine.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  className="font-label-ui text-label-ui px-4 py-2 rounded-lg border border-outline-variant text-primary hover:bg-surface-container focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ochre-light focus-visible:ring-offset-2"
                >
                  Reset Defaults
                </button>
                <button
                  type="button"
                  className="font-label-ui text-label-ui inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-on-primary hover:bg-olive-dark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ochre-light focus-visible:ring-offset-2"
                >
                  <Icon name="save" className="text-[18px]" />
                  Deploy Config
                </button>
              </div>
            </header>

            <section className="grid grid-cols-1 lg:grid-cols-12 gap-gutter pb-12">
              <div className="lg:col-span-8 flex flex-col gap-gutter">
                <article className="relative overflow-hidden bg-glass-light border border-white/20 backdrop-blur-md p-card-padding rounded-xl shadow-sm">
                  <span
                    aria-hidden
                    className="absolute top-0 left-0 w-1 h-full bg-ochre-dark"
                  />
                  <header className="flex items-center gap-2 mb-6">
                    <Icon name="sliders-horizontal" className="text-ochre-dark" />
                    <h3 className="font-headline-sm text-headline-sm text-primary">
                      LLM Prompt Multipliers
                    </h3>
                  </header>
                  <div className="flex flex-col gap-6">
                    <PromptMultiplier
                      label="Serendipity Bias"
                      slug="prompt.bias.serendipity"
                      initial={1.2}
                    />
                    <PromptMultiplier
                      label="Cultural Density"
                      slug="prompt.bias.culture_density"
                      initial={0.8}
                    />
                  </div>
                </article>

                <article className="bg-glass-light border border-white/20 backdrop-blur-md p-card-padding rounded-xl shadow-sm">
                  <header className="flex items-center gap-2 mb-6">
                    <Icon name="bus" className="text-olive-light" />
                    <h3 className="font-headline-sm text-headline-sm text-primary">
                      Transit &amp; Logistics Engine
                    </h3>
                  </header>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div>
                      <label
                        htmlFor="movement-speed"
                        className="font-label-ui text-label-ui text-primary block mb-1"
                      >
                        Movement Speed Multiplier
                      </label>
                      <p className="font-body-md text-body-md text-on-surface-variant mb-3">
                        Adjusts assumed walking and transit speed globally.
                      </p>
                      <div className="flex items-center gap-2">
                        <input
                          id="movement-speed"
                          type="number"
                          defaultValue={0.95}
                          step={0.05}
                          min={0.5}
                          max={2}
                          className="w-24 font-mono-technical text-mono-technical text-primary bg-white border border-outline-variant rounded-lg px-3 py-2 text-right focus:outline-none focus:ring-2 focus:ring-ochre-light focus:border-ochre-light"
                        />
                        <span className="font-mono-technical text-mono-technical text-on-surface-variant">
                          × BASE_SPEED
                        </span>
                      </div>
                    </div>
                    <div>
                      <label
                        htmlFor="connection-buffer"
                        className="font-label-ui text-label-ui text-primary block mb-1"
                      >
                        Connection Safety Buffer
                      </label>
                      <p className="font-body-md text-body-md text-on-surface-variant mb-3">
                        Minimum padded time between discrete itinerary nodes.
                      </p>
                      <div className="flex items-center gap-2">
                        <input
                          id="connection-buffer"
                          type="number"
                          defaultValue={15}
                          step={5}
                          min={0}
                          max={120}
                          className="w-24 font-mono-technical text-mono-technical text-primary bg-white border border-outline-variant rounded-lg px-3 py-2 text-right focus:outline-none focus:ring-2 focus:ring-ochre-light focus:border-ochre-light"
                        />
                        <span className="font-mono-technical text-mono-technical text-on-surface-variant">
                          MINUTES
                        </span>
                      </div>
                    </div>
                  </div>
                </article>
              </div>

              <aside className="lg:col-span-4 flex flex-col gap-gutter">
                <article className="relative overflow-hidden bg-primary text-on-primary p-card-padding rounded-xl shadow-lg">
                  <span
                    aria-hidden
                    className="absolute inset-0 opacity-10 pointer-events-none"
                    style={{
                      backgroundImage:
                        "repeating-linear-gradient(45deg, transparent, transparent 12px, rgba(255,255,255,0.4) 12px, rgba(255,255,255,0.4) 24px)",
                    }}
                  />
                  <div className="relative z-10">
                    <p className="font-label-ui text-label-ui text-primary-fixed-dim uppercase tracking-widest mb-1">
                      Engine Status
                    </p>
                    <h3 className="font-headline-lg text-headline-lg mb-2">
                      Nominal
                    </h3>
                    <p className="font-mono-technical text-mono-technical text-primary-fixed-dim mb-4">
                      All planner subsystems reporting within tolerance.
                    </p>
                    <ul className="font-mono-technical text-mono-technical space-y-3 text-primary-fixed-dim">
                      <li className="flex items-center justify-between border-b border-primary-fixed-dim/20 pb-1">
                        <span>Active Routes</span>
                        <span className="text-on-primary">1,402</span>
                      </li>
                      <li className="flex items-center justify-between border-b border-primary-fixed-dim/20 pb-1">
                        <span>Cache Hit Rate</span>
                        <span className="text-on-primary">88.4%</span>
                      </li>
                      <li className="flex items-center justify-between">
                        <span>Last Deploy</span>
                        <span className="text-on-primary">42m ago</span>
                      </li>
                    </ul>
                  </div>
                </article>

                <article className="bg-glass-light border border-white/20 backdrop-blur-md p-card-padding rounded-xl shadow-sm">
                  <h4 className="font-headline-sm text-headline-sm text-primary mb-4">
                    Routing Overrides
                  </h4>
                  <ul className="flex flex-col gap-1">
                    <li>
                      <label className="flex items-center justify-between cursor-pointer p-2 rounded hover:bg-surface-variant/50 focus-within:ring-2 focus-within:ring-ochre-light">
                        <span className="font-label-ui text-label-ui text-primary">
                          Strict Geographic Linearization
                        </span>
                        <input
                          type="checkbox"
                          checked={strictGeo}
                          onChange={(event) => setStrictGeo(event.target.checked)}
                          className="h-4 w-4 text-ochre-dark rounded border-outline-variant focus:ring-ochre-light"
                          aria-label="Toggle strict geographic linearization"
                        />
                      </label>
                    </li>
                    <li>
                      <label className="flex items-center justify-between cursor-pointer p-2 rounded hover:bg-surface-variant/50 focus-within:ring-2 focus-within:ring-ochre-light">
                        <span className="font-label-ui text-label-ui text-primary">
                          Prioritize Verified POIs
                        </span>
                        <input
                          type="checkbox"
                          checked={verifiedPois}
                          onChange={(event) =>
                            setVerifiedPois(event.target.checked)
                          }
                          className="h-4 w-4 text-ochre-dark rounded border-outline-variant focus:ring-ochre-light"
                          aria-label="Toggle prioritize verified POIs"
                        />
                      </label>
                    </li>
                    <li>
                      <label className="flex items-center justify-between cursor-pointer p-2 rounded hover:bg-surface-variant/50 focus-within:ring-2 focus-within:ring-ochre-light">
                        <span className="font-label-ui text-label-ui text-primary">
                          Allow Experimental Nodes
                        </span>
                        <input
                          type="checkbox"
                          checked={experimentalNodes}
                          onChange={(event) =>
                            setExperimentalNodes(event.target.checked)
                          }
                          className="h-4 w-4 text-ochre-dark rounded border-outline-variant focus:ring-ochre-light"
                          aria-label="Toggle allow experimental nodes"
                        />
                      </label>
                    </li>
                  </ul>
                </article>
              </aside>
            </section>
          </div>
        </div>
      </div>
    </>
  );
}
