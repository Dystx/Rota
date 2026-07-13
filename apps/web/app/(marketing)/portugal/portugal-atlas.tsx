import * as React from "react";
import Link from "next/link";

import type { ActivityRegion, EditorialActivity } from "@/lib/content/activities";

const COLLECTIONS: readonly {
  region: ActivityRegion;
  title: string;
  description: string;
  mood: string;
}[] = [
  {
    region: "porto",
    title: "Porto beyond the first riverside walk",
    description: "Riverfront atmosphere, one cultural interior, and a better use of the city’s hills.",
    mood: "a walk"
  },
  {
    region: "lisbon",
    title: "Lisbon with room for the climb",
    description: "Historic neighbourhoods, contained culture, and choices that respect the city’s gradients.",
    mood: "culture"
  },
  {
    region: "douro",
    title: "The Douro without overfilling the valley",
    description: "Train, river, wine, and viewpoint decisions that leave time for the landscape itself.",
    mood: "good food"
  },
  {
    region: "algarve",
    title: "The Algarve at a slower coastal scale",
    description: "Cliffs, water, and nature choices that do not ask you to chase a different beach every hour.",
    mood: "a walk"
  },
  {
    region: "azores",
    title: "São Miguel with weather in the plan",
    description: "Volcanic landscapes, thermal places, and a day flexible enough to work with the island.",
    mood: "quiet time"
  }
];

export function PortugalAtlas({ activities }: { activities: readonly EditorialActivity[] }) {
  return (
    <section aria-labelledby="portugal-atlas-title">
      <div className="max-w-2xl">
        <p className="text-sm text-ochre-dark">Portugal, activity by activity</p>
        <h2 id="portugal-atlas-title" className="mt-3 font-display text-4xl text-primary">Choose a kind of day, not a route shape.</h2>
        <p className="mt-4 text-on-surface-variant">Each collection starts from a real trade-off: your time, the weather, the energy of the group, and what is worth leaving out.</p>
      </div>
      <div className="mt-10 grid gap-x-10 md:grid-cols-2">
        {COLLECTIONS.map((collection, index) => {
          const count = activities.filter((activity) => activity.region === collection.region).length;
          const href = `/explore?${new URLSearchParams({ region: collection.region, mood: collection.mood }).toString()}`;

          return (
            <article key={collection.region} className="group relative border-t border-[var(--color-border)] py-8 md:py-9">
              <div className="flex items-center gap-4">
                <span data-testid={`collection-index-${collection.region}`} className="font-mono-technical text-sm tracking-[0.24em] text-ochre-dark">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <span className="h-px w-10 bg-ochre-dark/50" aria-hidden />
                <p className="font-mono-micro text-mono-micro uppercase tracking-[0.18em] text-ochre-dark">
                  {count} reviewed activities
                </p>
              </div>
              <h3 className="mt-4 max-w-xl font-display text-3xl leading-tight text-primary md:text-4xl">{collection.title}</h3>
              <p className="mt-4 max-w-xl leading-relaxed text-on-surface-variant">{collection.description}</p>
              <Link className="mt-6 inline-flex min-h-11 items-center border-b border-ochre-dark px-1 py-2 text-sm font-medium text-ochre-dark transition-colors hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ochre-light" href={href}>
                Explore {collection.region === "azores" ? "São Miguel" : collection.region[0]!.toUpperCase() + collection.region.slice(1)} activities
              </Link>
            </article>
          );
        })}
      </div>
    </section>
  );
}
