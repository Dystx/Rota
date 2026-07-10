"use client";
import * as React from "react";
import Link from "next/link";
import type { PortugalRegionContent } from "@/lib/content/portugal-regions";

export function PortugalAtlas({ regions }: { regions: PortugalRegionContent[] }) {
  const [focus, setFocus] = React.useState(regions[0]?.slug ?? "");
  return <section aria-labelledby="portugal-atlas-title" className="grid gap-8"><div className="flex items-end justify-between gap-4"><div><p className="text-sm text-ochre-dark">Portugal, region by region</p><h2 id="portugal-atlas-title" className="font-display text-4xl text-primary">Choose a route shape.</h2></div><p data-testid="atlas-map" data-focus={focus} className="text-sm text-on-surface-variant">Map fallback · {focus}</p></div><div className="grid gap-4 md:grid-cols-2">{regions.map((region) => <article key={region.slug} className="border-t border-[var(--color-border)] py-5"><button type="button" onClick={() => setFocus(region.slug)} className="text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ochre-light"><h3 className="font-display text-2xl text-primary">{region.routeArchetype}</h3><p className="mt-2 text-sm text-on-surface-variant">{region.bestSeason} · {region.idealDuration}</p><p className="mt-3 text-sm text-on-surface-variant">{region.verifiedNote}</p></button><Link className="mt-4 inline-block border-b border-ochre-dark text-sm text-ochre-dark" href={`/planner?region=${region.slug}`}>Plan a {region.slug.replace(/-/g, " ")} route</Link></article>)}</div></section>;
}
