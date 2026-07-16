import * as React from "react";
import Link from "next/link";

import { REVIEWED_ACTIVITY_SEED, type ActivityRegion, type EditorialActivity } from "@/lib/content/activities";

type Collection = {
  region: ActivityRegion;
  title: string;
  description: string;
  judgement: string;
  mood: string;
  imageSrc: string;
  imageAlt: string;
};

const COLLECTIONS: readonly Collection[] = [
  {
    region: "porto",
    title: "Porto beyond the first riverside walk",
    description: "Riverfront atmosphere, one cultural interior, and a better use of the city’s hills.",
    judgement: "Take the river slowly; leave time for one interior.",
    mood: "a walk",
    imageSrc: "/trip-covers/porto-ribeira.svg",
    imageAlt: "Layered editorial illustration of Porto's Ribeira waterfront."
  },
  {
    region: "lisbon",
    title: "Lisbon with room for the climb",
    description: "Historic neighbourhoods, contained culture, and choices that respect the city’s gradients.",
    judgement: "Climb with intention; keep culture contained.",
    mood: "culture",
    imageSrc: "/trip-covers/lisbon-tagus.svg",
    imageAlt: "Layered editorial illustration of Lisbon and the Tagus light."
  },
  {
    region: "douro",
    title: "The Douro without overfilling the valley",
    description: "Train, river, wine, and viewpoint decisions that leave time for the landscape itself.",
    judgement: "Choose the landscape before adding another stop.",
    mood: "good food",
    imageSrc: "/trip-covers/douro-vineyards.svg",
    imageAlt: "Layered editorial illustration of the Douro Valley vineyards."
  },
  {
    region: "algarve",
    title: "The Algarve at a slower coastal scale",
    description: "Cliffs, water, and nature choices that do not ask you to chase a different beach every hour.",
    judgement: "Stay coastal; let one beach hold the day.",
    mood: "a walk",
    imageSrc: "/trip-covers/algarve-coast.svg",
    imageAlt: "Layered editorial illustration of the Algarve coast and cliffs."
  },
  {
    region: "azores",
    title: "São Miguel with weather in the plan",
    description: "Volcanic landscapes, thermal places, and a day flexible enough to work with the island.",
    judgement: "Build around weather, not a rigid sequence.",
    mood: "quiet time",
    imageSrc: "/trip-covers/azores-craters.svg",
    imageAlt: "Layered editorial illustration of the Azores volcanic craters."
  }
];

function regionName(region: ActivityRegion): string {
  return region === "azores" ? "São Miguel" : region[0]!.toUpperCase() + region.slice(1);
}

function collectionHref(collection: Collection): string {
  return `/explore?${new URLSearchParams({ region: collection.region, mood: collection.mood }).toString()}`;
}

function activityCount(collection: Collection, activities: readonly EditorialActivity[]): number {
  return activities.filter((activity) => activity.region === collection.region).length;
}

export function PortugalAtlas({ activities = REVIEWED_ACTIVITY_SEED }: { activities?: readonly EditorialActivity[] } = {}) {
  const featured = COLLECTIONS[0]!;
  const compactCollections = COLLECTIONS.slice(1);

  return (
    <section
      aria-labelledby="portugal-atlas-title"
      className="rumia-portugal-collections relative overflow-visible rounded-[32px] px-0 py-0 text-linen shadow-none md:overflow-hidden md:px-10 md:py-14 md:shadow-overlay"
    >
      <div className="rumia-portugal-collections-intro relative z-10 rounded-[28px] px-5 py-9 md:rounded-none md:px-0 md:py-0">
        <div className="grid gap-10 md:grid-cols-[minmax(0,1fr)_18rem] md:items-end md:gap-16">
          <div className="max-w-3xl">
            <p className="font-mono-micro text-mono-micro uppercase tracking-[0.2em] text-ochre-light">
              Portugal, activity by activity
            </p>
            <h2 id="portugal-atlas-title" className="mt-4 font-display text-4xl leading-[1.02] tracking-[-0.02em] text-linen md:text-6xl">
              Choose a kind of day, not a route shape.
            </h2>
            <p className="mt-5 max-w-2xl text-base leading-7 text-linen/70 md:text-lg">
              Each collection starts from a real trade-off: your time, the weather, the energy of the group, and what is worth leaving out.
            </p>
          </div>
          <div className="border-l border-ochre-light/30 pl-5 text-base leading-7 text-linen/65">
            <p className="font-mono-micro text-mono-micro uppercase tracking-[0.18em] text-ochre-light">The atlas principle</p>
            <p className="mt-3">A good recommendation makes the next choice easier—even when that choice is to skip something popular.</p>
          </div>
        </div>
      </div>

      <article
        data-testid="portugal-featured-region"
        className="rumia-portugal-collection-card rumia-portugal-collection-card--featured group relative z-10 mt-8 overflow-hidden rounded-[24px] border border-linen/15 p-5 md:mt-12 md:p-10"
      >
        <div className="grid gap-8 md:grid-cols-[minmax(0,1fr)_minmax(18rem,0.72fr)] md:items-stretch md:gap-12">
          <div className="relative z-10 flex min-w-0 flex-col">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <span data-testid={`collection-index-${featured.region}`} className="font-mono-technical text-sm tracking-[0.24em] text-ochre-light">01</span>
                <span className="h-px w-10 bg-ochre-light/55" aria-hidden />
                <p className="font-mono-micro text-mono-micro uppercase tracking-[0.18em] text-linen/55">
                  {activityCount(featured, activities)} reviewed activities
                </p>
              </div>
              <span className="rounded-full border border-ochre-light/35 px-3 py-1 font-mono-micro text-mono-micro uppercase tracking-[0.16em] text-ochre-light">{featured.mood}</span>
            </div>
            <h3 className="mt-5 max-w-3xl font-display text-4xl leading-[1.02] tracking-[-0.015em] text-linen md:mt-6 md:text-6xl">{featured.title}</h3>
            <p className="mt-3 max-w-2xl text-base leading-7 text-linen/65 md:mt-4">{featured.description}</p>
            <Link
              className="mt-auto inline-flex min-h-11 w-fit items-center gap-3 border-b border-ochre-light px-1 py-2 pt-7 text-sm font-medium text-ochre-light transition-[color,gap] duration-200 hover:gap-4 hover:text-linen focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ochre-light"
              href={collectionHref(featured)}
            >
              <span>Explore {regionName(featured.region)} activities</span>
              <svg aria-hidden="true" className="h-4 w-4" viewBox="0 0 16 16" fill="none"><path d="M3 8h9m-4-4 4 4-4 4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" /></svg>
            </Link>
          </div>
          <div className="relative min-h-[13rem] overflow-hidden rounded-[20px] border border-linen/15 bg-olive-dark/30 md:min-h-[20rem]">
            <img src={featured.imageSrc} alt={featured.imageAlt} className="absolute inset-0 h-full w-full object-cover" loading="lazy" decoding="async" />
            <div aria-hidden="true" className="absolute inset-0 bg-gradient-to-t from-midnight/55 via-transparent to-transparent" />
            <p className="absolute inset-x-4 bottom-4 font-mono-micro text-mono-micro uppercase tracking-[0.18em] text-linen/75">Featured collection / 01</p>
          </div>
        </div>
      </article>

      <ul data-testid="portugal-compact-region-list" className="relative z-10 mt-3 grid gap-3 md:grid-cols-2 md:gap-4">
        {compactCollections.map((collection, index) => {
          const count = activityCount(collection, activities);
          return (
            <li key={collection.region} className="min-w-0">
              <Link
                className="rumia-portugal-collection-card rumia-portugal-collection-card--compact group relative flex min-h-[10.5rem] h-full flex-col overflow-hidden rounded-[24px] border border-linen/15 p-5 md:min-h-[14rem] md:p-8"
                href={collectionHref(collection)}
                data-region-card="compact"
                data-testid={`portugal-region-link-${collection.region}`}
              >
                <span className="relative z-10 flex items-center gap-4">
                  <span data-testid={`collection-index-${collection.region}`} className="font-mono-technical text-sm tracking-[0.24em] text-ochre-dark md:text-ochre-light">{String(index + 2).padStart(2, "0")}</span>
                  <span className="h-px w-10 bg-ochre-dark/40 md:bg-ochre-light/55" aria-hidden />
                  <span className="font-mono-micro text-mono-micro uppercase tracking-[0.18em] text-on-surface-variant md:text-linen/55">{count} reviewed activities</span>
                </span>
                <span className="relative z-10 mt-5 font-display text-2xl leading-tight tracking-[-0.015em] text-primary md:text-4xl md:text-linen">{collection.title}</span>
                <span data-region-judgement="true" className="relative z-10 mt-3 line-clamp-1 max-w-2xl text-base leading-7 text-on-surface-variant md:text-linen/65">{collection.judgement}</span>
                <span className="relative z-10 mt-auto inline-flex min-h-11 w-fit items-center gap-2 pt-5 text-sm font-medium text-ochre-dark md:text-ochre-light">Explore {regionName(collection.region)} <span aria-hidden>→</span></span>
              </Link>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
