"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { getDestinationPreset } from "@repo/spatial-engine";
import {
  runViewTransition,
  setTransitionName,
  supportsViewTransitions
} from "@repo/ui";
import { useMapStore } from "@/store/useMapStore";
import { publicDraftToPlannerUrl } from "../(marketing)/_components/public-trip-choices";

/**
 * DestinationBento — editorial bento grid (Stitch 1.1 home layout).
 *
 * 12-column grid, 3 cards:
 *   - Lisbon & Surrounds (8-col, 2-row) — Capital Region
 *   - Douro Valley (4-col, 2-row) — Wine Country
 *   - The Azores (12-col, 1-row) — Island Archipelago
 *
 * Per-card CTAs (Stitch 1.3 "1 click to begin" pattern):
 *   - `mode="plan"` (the home) — each card has one route action
 *       backed by the same choice-draft URL adapter as the hero.
 *   - `mode="explore"` — each card has a single link that covers the
 *     full card area: "See what is worth doing" → /explore?region=<slug>
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
  /** `plan` = home route action; `explore` = map workspace link. */
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
    backgroundImage: "url('/trip-covers/lisbon-tagus.svg')",
    gridClass: "md:col-span-8 row-span-2",
    contentClass: "text-on-primary"
  },
  {
    slug: "douro",
    label: "Douro Valley",
    caption: "Terraced vineyards and ancient estates along the golden river.",
    region: "Wine Country",
    backgroundImage: "url('/trip-covers/douro-vineyards.svg')",
    gridClass: "md:col-span-4 row-span-2",
    contentClass: "text-on-primary"
  },
  {
    slug: "azores",
    label: "The Azores",
    caption:
      "Volcanic craters, thermal springs, and untouched Atlantic wilderness.",
    region: "Island Archipelago",
    backgroundImage: "url('/trip-covers/azores-craters.svg')",
    gridClass: "md:col-span-12 row-span-1",
    contentClass: "text-on-primary w-full md:w-1/2"
  }
];

const PLANNER_HREF_FOR = (slug: BentoSlug) => publicDraftToPlannerUrl(slug);
const EXPLORE_HREF_FOR = (slug: BentoSlug) => `/explore?region=${slug}`;

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
  const router = useRouter();
  const selectStop = useMapStore((state) => state.selectStop);

  const handleBentoClick = (slug: BentoSlug) => {
    const preset = getDestinationPreset(slug);
    if (preset && preset.camera.center) {
      selectStop(slug, [preset.camera.center[0], preset.camera.center[1]]);
    }
  };

  const handlePlanNavigation = (
    event: React.MouseEvent<HTMLAnchorElement>,
    slug: BentoSlug,
    href: string
  ) => {
    handleBentoClick(slug);

    // Preserve native new-tab and modified-click behavior. The standard
    // link semantics also ensure Enter activation dispatches the same click
    // path as a pointer interaction.
    if (
      event.defaultPrevented ||
      event.button !== 0 ||
      event.metaKey ||
      event.ctrlKey ||
      event.shiftKey ||
      event.altKey
    ) {
      return;
    }

    event.preventDefault();

    const navigate = () => router.push(href);
    if (!supportsViewTransitions()) {
      navigate();
      return;
    }

    setTransitionName(event.currentTarget, `destination-card-${slug}`);
    runViewTransition(navigate);
  };

  return (
    <section
      className="w-full max-w-7xl mx-auto px-container-padding-sm md:px-container-padding-lg py-section-gap relative -mt-16 z-20"
      data-testid="destination-bento"
      data-mode={mode}
    >
      <div className="grid grid-cols-1 md:grid-cols-12 gap-gutter auto-rows-[250px]">
        {BENTO_CARDS.map((card) => {
          const planHref = PLANNER_HREF_FOR(card.slug);
          const exploreHref = EXPLORE_HREF_FOR(card.slug);

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
                  <span className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-ochre-light px-3 py-1.5 font-label-ui text-label-ui text-primary shadow-sm">
                    {BENTO_CTA_COPY[card.slug]}
                    <span aria-hidden className="ph text-[16px] ph-arrow-right">arrow-right</span>
                  </span>
                ) : (
                  <span className="mt-3 inline-flex items-center gap-1 font-label-ui text-label-ui text-ochre-light opacity-0 motion-safe:group-hover:opacity-100 transition-opacity">
                    <span
                      aria-hidden
                      className="ph text-base"
                    >
                      map
                    </span>
                    See what is worth doing →
                  </span>
                )}
              </div>
            </>
          );

          if (mode === "plan") {
            return (
              <Link
                key={card.slug}
                href={planHref}
                data-testid={`bento-card-${card.slug}`}
                data-slug={card.slug}
                aria-label={`Plan this trip to ${card.label}`}
                onClick={(event) => handlePlanNavigation(event, card.slug, planHref)}
                className={`${card.gridClass} group relative block rounded-xl overflow-hidden border border-white/40 shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ochre-light`}
              >
                {cardBody}
              </Link>
            );
          }

          return (
            <Link
              key={card.slug}
              href={exploreHref}
              data-testid={`bento-card-${card.slug}`}
              data-slug={card.slug}
              aria-label={`Explore judged activities in ${card.label}`}
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
