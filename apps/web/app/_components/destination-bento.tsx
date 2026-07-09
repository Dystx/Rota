"use client";

import Link from "next/link";
import { getDestinationPreset } from "@repo/spatial-engine";
import { useMapStore } from "@/store/useMapStore";

/**
 * DestinationBento — editorial bento grid (Stitch 1.1 home layout).
 *
 * 12-column grid, 3 cards:
 *   - Lisbon & Surrounds (8-col, 2-row) — Capital Region
 *   - Douro Valley (4-col, 2-row) — Wine Country
 *   - The Azores (12-col, 1-row) — Island Archipelago
 *
 * Per-card CTAs (Stitch 1.3 "1 click to begin" pattern):
 *   - `mode="plan"` (the home) — each card has two CTAs:
 *       primary: "Plan this trip" → /planner?destination=<slug>&days=7
 *       secondary: "Map" → /explore/workspace?focus=<slug>
 *   - `mode="explore"` (the default, used by /explore and
 *     /portugal) — each card has a single link that covers the
 *     full card area: "View on the map" → /explore/workspace?focus=<slug>
 *
 * The `mode` prop is a string literal so the home (a server
 * component) can pass it across the server/client boundary
 * without a function. The bento owns the URL templates because
 * the slug set is fixed (lisbon / douro / azores).
 */
const BENTO_SLUGS = ["lisbon", "douro", "azores"] as const;
type BentoSlug = (typeof BENTO_SLUGS)[number];

export type DestinationBentoMode = "explore" | "plan";

export interface DestinationBentoProps {
  /**
   * `plan` = home-page treatment (dual CTA: plan + map).
   * `explore` = default (single full-card link to /explore/workspace).
   */
  mode?: DestinationBentoMode;
}

interface BentoCardData {
  slug: BentoSlug;
  label: string;
  caption: string;
  region: string;
  backgroundImage: string;
  gridClass: string;
  contentClass: string;
}

const BENTO_CARDS: BentoCardData[] = [
  {
    slug: "lisbon",
    label: "Lisbon & Surrounds",
    caption:
      "Explore the steep, historic streets, vibrant culinary scene, and nearby coastal retreats of Sintra and Cascais.",
    region: "Capital Region",
    backgroundImage:
      "url('https://lh3.googleusercontent.com/aida-public/AB6AXuBvuwR3iBxSI7Dc_xUue9PlZOCxIkQdO1BKnkgj-Vq6a6JbMPr5O97KI6d0ZWxwqjhuR1vs8JPyayESizGC4kuFSrWW58tlR9jga482rLrmo0T-b4VypQQsJAaei9FZ1yDMY7XIWocnoL1SV_GZQdCU56_yCUHMLkWvsUCY0wotaS3KlSHTP951qa-BSLMipuZqD84KyB7aj3cjePoP6zdoo9Mwo3l7tSNZjLrmkXopRfAh8ZnUeya-lMseIAzgR9e4PQ6wJjrQCdf7')",
    gridClass: "md:col-span-8 row-span-2",
    contentClass: "text-on-primary"
  },
  {
    slug: "douro",
    label: "Douro Valley",
    caption: "Terraced vineyards and ancient estates along the golden river.",
    region: "Wine Country",
    backgroundImage:
      "url('https://lh3.googleusercontent.com/aida-public/AB6AXuDYu4Fau7io9fH__yOAmh3NS8NfSMdk4ppABEZGMyiJwdW_dhtVGIV0Dw8kZR5lK8lak_dEo3IYDDkcBiyUHxBrqgD1OY6SCaop5fhBOUIuWLkFjpQEap2YW6UIWgEQub-GOXL6J16-h9-xPjE5k4xodT3fM956CvzZtrcH2SVBxRa4jyXhODGOllDkrFhiRZSkk1SHeyc6sg3eg112VXti1LIJwp3gJBIAT5_yX8TXauvdhmEtLcwsd8bMv72CDVKpvSHVhqM1u1-q')",
    gridClass: "md:col-span-4 row-span-2",
    contentClass: "text-on-primary"
  },
  {
    slug: "azores",
    label: "The Azores",
    caption:
      "Volcanic craters, thermal springs, and untouched Atlantic wilderness.",
    region: "Island Archipelago",
    backgroundImage:
      "url('https://lh3.googleusercontent.com/aida-public/AB6AXuBVKywJbZwS5PUrrA6MTfs8d39w7yOtkJJUlakoA3aqZmMo4bLGdOn82FnKAJpUqR3Jx9CEwQqheDNpgz4SQ1c8xNuXlkUbJ6P6GIQxYDjHrjZbZrUSTiAh_dzx28ytJ4YG1qFhpPhIPg1LQ5sLWV8Qn6xUwtNOvQhOiFiGt4K6t3ek8exOSJc94DpCxSm2ZZaOX7x8CWip_O1xDmTILAQdtSnFICxCjx6GZQrksj92zpEnN4klxv2zWuS-S2otMfgk_4y9xhmDvjv0')",
    gridClass: "md:col-span-12 row-span-1",
    contentClass: "text-on-primary w-full md:w-1/2"
  }
];

const PLANNER_HREF_FOR = (slug: BentoSlug) =>
  `/planner?destination=${slug}&days=7`;
const MAP_HREF_FOR = (slug: BentoSlug) => `/explore/workspace?focus=${slug}`;

/**
 * Destination-specific bento CTA copy. The previous "Plan this
 * trip" label was generic and competed with the TopNav and
 * hero CTAs. Per-destination copy reads as intentional and
 * matches the bento card's editorial tone.
 */
const BENTO_CTA_COPY: Record<BentoSlug, string> = {
  lisbon: "Plan a Lisbon trip",
  douro: "Plan a Douro trip",
  azores: "Plan an Azores trip"
};

export function DestinationBento({ mode = "explore" }: DestinationBentoProps = {}) {
  const selectStop = useMapStore((state) => state.selectStop);

  const handleBentoClick = (slug: BentoSlug) => {
    const preset = getDestinationPreset(slug);
    if (preset && preset.camera.center) {
      selectStop(slug, [preset.camera.center[0], preset.camera.center[1]]);
    }
  };

  return (
    <section
      className="max-w-7xl mx-auto px-container-padding-lg py-section-gap relative -mt-16 z-20"
      data-testid="destination-bento"
      data-mode={mode}
    >
      <div className="grid grid-cols-1 md:grid-cols-12 gap-gutter auto-rows-[250px]">
        {BENTO_CARDS.map((card) => {
          const planHref = PLANNER_HREF_FOR(card.slug);
          const mapHref = MAP_HREF_FOR(card.slug);

          const cardBody = (
            <>
              <div
                className="absolute inset-0 bg-cover bg-center motion-safe:transition-transform motion-safe:duration-700 motion-safe:group-hover:scale-105"
                style={{ backgroundImage: card.backgroundImage }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-olive-dark/80 via-olive-dark/20 to-transparent" />
              <div
                className={`absolute inset-0 p-card-padding flex flex-col justify-end ${card.contentClass} z-20`}
              >
                <span className="font-mono-micro text-mono-micro uppercase tracking-widest text-ochre-light mb-2 bg-olive-dark/50 inline-block w-max px-2 py-1 rounded backdrop-blur-sm">
                  {card.region}
                </span>
                <h2 className="font-headline-lg text-headline-lg leading-tight mb-2">
                  {card.label}
                </h2>
                <p className="font-body-md text-body-md opacity-90 max-w-md hidden md:block">
                  {card.caption}
                </p>
                {mode === "plan" ? (
                  <div className="mt-3 flex flex-wrap items-center gap-2 relative z-30">
                    <Link
                      href={planHref}
                      aria-label={`Plan this trip to ${card.label}`}
                      onClick={(event) => event.stopPropagation()}
                      data-testid={`bento-cta-plan-${card.slug}`}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-ochre-light text-ochre-dark font-label-ui text-label-ui shadow-sm hover:brightness-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ochre-light"
                    >
                      {BENTO_CTA_COPY[card.slug]}
                      <span aria-hidden className="ph text-[16px] ph-arrow-right">arrow-right</span>
                    </Link>
                    <Link
                      href={mapHref}
                      aria-label={`View ${card.label} on the map`}
                      onClick={(event) => event.stopPropagation()}
                      data-testid={`bento-cta-map-${card.slug}`}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/10 border border-white/30 text-ochre-light font-label-ui text-label-ui backdrop-blur-sm hover:bg-white/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ochre-light"
                    >
                      View on map
                      <span aria-hidden className="ph text-[16px]">
                        map
                      </span>
                    </Link>
                  </div>
                ) : (
                  <span className="mt-3 inline-flex items-center gap-1 font-label-ui text-label-ui text-ochre-light opacity-0 motion-safe:group-hover:opacity-100 transition-opacity">
                    <span
                      aria-hidden
                      className="ph text-base"
                    >
                      map
                    </span>
                    View on the map →
                  </span>
                )}
              </div>
            </>
          );

          if (mode === "plan") {
            return (
              <div
                key={card.slug}
                data-testid={`bento-card-${card.slug}`}
                data-slug={card.slug}
                onClick={() => handleBentoClick(card.slug)}
                className={`${card.gridClass} group relative rounded-xl overflow-hidden shadow-lg border border-white/40`}
              >
                <Link
                  href={planHref}
                  aria-label={`Plan this trip to ${card.label}`}
                  className="absolute inset-0 z-10 rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ochre-light"
                />
                {cardBody}
              </div>
            );
          }

          return (
            <Link
              key={card.slug}
              href={mapHref}
              onClick={() => handleBentoClick(card.slug)}
              data-testid={`bento-card-${card.slug}`}
              data-slug={card.slug}
              className={`${card.gridClass} group relative rounded-xl overflow-hidden shadow-lg border border-white/40 block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ochre-light group-focus-visible:ring-2 group-focus-visible:ring-ochre-light`}
            >
              {cardBody}
            </Link>
          );
        })}
      </div>
    </section>
  );
}
