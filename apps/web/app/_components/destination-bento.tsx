"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  runViewTransition,
  setTransitionName,
  supportsViewTransitions,
  Icon
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
 *   - `mode="plan"` (legacy planner surface) — each card has one route action
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

// Keep the legacy plan-mode handoff lightweight. Importing the spatial-engine
// barrel here would pull MapLibre into the homepage bundle even though the
// default explore surface is intentionally map-free.
const BENTO_CAMERA_CENTERS: Record<BentoSlug, readonly [number, number]> = {
  lisbon: [-9.1393, 38.7223],
  douro: [-7.5458, 41.1832],
  azores: [-25.7903, 37.8602]
};

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
  activityLabel: string;
  activityCaption: string;
  activityRegion: string;
  backgroundImage: string;
  mediaSrc: string;
  mediaAlt: string;
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
    activityLabel: "A slower Lisbon afternoon",
    activityCaption: "Walking, culture, and a better sense of when to stop.",
    activityRegion: "Lisbon · walking + culture",
    backgroundImage: "url('/trip-covers/lisbon-tagus.svg')",
    mediaSrc: "/trip-covers/lisbon-tagus.svg",
    mediaAlt: "Layered editorial illustration of Lisbon and the Tagus light.",
    gridClass: "md:col-span-8 row-span-2",
    contentClass: "text-on-primary"
  },
  {
    slug: "douro",
    label: "Douro Valley",
    caption: "Terraced vineyards and ancient estates along the golden river.",
    region: "Wine Country",
    activityLabel: "A day shaped around the Douro",
    activityCaption: "Choose the river, the view, and the right amount of time.",
    activityRegion: "Douro · landscape + food",
    backgroundImage: "url('/media/unsplash/douro-terraces-card.webp')",
    mediaSrc: "/media/unsplash/douro-terraces-card.webp",
    mediaAlt: "Terraced vineyards descending toward the Douro River",
    gridClass: "md:col-span-4 row-span-2",
    contentClass: "text-on-primary"
  },
  {
    slug: "azores",
    label: "The Azores",
    caption:
      "Volcanic craters, thermal springs, and untouched Atlantic wilderness.",
    region: "Island Archipelago",
    activityLabel: "When the weather opens a window",
    activityCaption: "Keep the island day generous, not overfilled.",
    activityRegion: "Azores · nature + weather",
    backgroundImage: "url('/media/unsplash/portugal-coast-card.webp')",
    mediaSrc: "/media/unsplash/portugal-coast-card.webp",
    mediaAlt: "Atlantic coast at golden hour in Portugal",
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
    selectStop(slug, BENTO_CAMERA_CENTERS[slug]);
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
      className="rumia-destination-bento w-full max-w-7xl mx-auto px-container-padding-sm md:px-container-padding-lg py-section-gap relative -mt-16 z-20"
      data-testid="destination-bento"
      data-mode={mode}
    >
      <div className="grid grid-cols-1 md:grid-cols-12 gap-gutter auto-rows-[250px]">
        {BENTO_CARDS.map((card) => {
          const planHref = PLANNER_HREF_FOR(card.slug);
          const exploreHref = EXPLORE_HREF_FOR(card.slug);
          const label = mode === "explore" ? card.activityLabel : card.label;
          const caption = mode === "explore" ? card.activityCaption : card.caption;
          const region = mode === "explore" ? card.activityRegion : card.region;

          const cardBody = (
            <>
              <img
                className="rumia-bento-card__media absolute inset-0 h-full w-full object-cover"
                src={card.mediaSrc}
                alt={card.mediaAlt}
                loading="lazy"
                decoding="async"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-olive-dark/80 via-olive-dark/20 to-transparent" />
              <div
                className={`absolute inset-0 p-card-padding flex flex-col justify-end ${card.contentClass} z-20`}
              >
                <span className="font-mono-micro text-mono-micro uppercase tracking-widest text-ochre-light mb-2 bg-olive-dark/50 inline-block w-max px-2 py-1 rounded backdrop-blur-sm">
                  {region}
                </span>
                <h2 className="font-headline-lg text-headline-lg leading-tight mb-2">
                  {label}
                </h2>
                <p className="font-body-md text-body-md max-w-md line-clamp-2 opacity-90">
                  {caption}
                </p>
                {mode === "plan" ? (
                  <span className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-ochre-light px-3 py-1.5 font-label-ui text-label-ui text-primary shadow-sm">
                    {BENTO_CTA_COPY[card.slug]}
                    <Icon name="arrow_forward" className="text-[16px]" />
                  </span>
                ) : (
                  <span className="mt-3 inline-flex min-h-11 w-max items-center gap-2 rounded-full bg-linen-dark/95 px-4 py-2 font-label-ui text-label-ui text-primary shadow-sm motion-safe:transition-colors motion-safe:hover:bg-white">
                    <Icon name="map" className="text-base" />
                    See worthwhile activities
                    <Icon name="arrow_forward" className="text-base" />
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
                style={{
                  backgroundImage: card.backgroundImage,
                  backgroundPosition: "center",
                  backgroundSize: "cover"
                }}
                className={`rumia-bento-card ${card.gridClass} group relative block rounded-xl overflow-hidden border border-white/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ochre-light`}
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
              style={{
                backgroundImage: card.backgroundImage,
                backgroundPosition: "center",
                backgroundSize: "cover"
              }}
              className={`rumia-bento-card ${card.gridClass} group relative rounded-xl overflow-hidden border border-white/40 block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ochre-light group-focus-visible:ring-2 group-focus-visible:ring-ochre-light`}
            >
              {cardBody}
            </Link>
          );
        })}
      </div>
    </section>
  );
}
