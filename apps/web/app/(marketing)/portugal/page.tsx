import * as React from "react";
import type { Metadata } from "next";

import { REVIEWED_ACTIVITY_SEED } from "@/lib/content/activities";

import { PortugalAtlas } from "./portugal-atlas";

export const metadata: Metadata = {
  title: "What to do in Portugal",
  description:
    "Browse Rumia’s reviewed Portugal activity collections by the kind of day you want to have.",
  alternates: { canonical: "/portugal" }
};

export default function PortugalPage() {
  return (
    <div className="mx-auto max-w-6xl px-6 py-16">
      <header
        data-testid="portugal-atlas-intro"
        className="grid gap-10 md:grid-cols-[minmax(0,1fr)_18rem] md:gap-16"
      >
        <div>
          <p className="font-mono-micro text-mono-micro uppercase tracking-[0.22em] text-ochre-dark">
            Portugal / reviewed activity atlas
          </p>
          <h1 className="mt-4 max-w-4xl font-display text-5xl leading-[1.02] text-primary md:text-7xl">
            What deserves your time in Portugal?
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-relaxed text-on-surface-variant">
            Start with a part of the country and the kind of time you have.
            Rumia will show the activity decisions worth considering,
            including when to choose something else.
          </p>
        </div>
        <aside className="border-t border-[var(--color-border)] pt-5 md:mt-2">
          <p className="font-mono-micro text-mono-micro uppercase tracking-[0.2em] text-ochre-dark">
            5 regions, one activity-first lens
          </p>
          <p className="mt-3 text-sm leading-6 text-on-surface-variant">
            Browse by the time, weather, and energy a day can hold—not by a
            generic route template.
          </p>
        </aside>
      </header>

      <div className="mt-12 grid gap-6 border-y border-[var(--color-border)] py-5 text-sm text-on-surface-variant sm:grid-cols-3">
        <p><span className="font-mono-micro text-mono-micro uppercase tracking-[0.16em] text-primary">Coverage</span><span className="mt-2 block">Portugal-wide collections</span></p>
        <p><span className="font-mono-micro text-mono-micro uppercase tracking-[0.16em] text-primary">Standard</span><span className="mt-2 block">Judgement before inventory</span></p>
        <p><span className="font-mono-micro text-mono-micro uppercase tracking-[0.16em] text-primary">Promise</span><span className="mt-2 block">A better use of the time you have</span></p>
      </div>
      <div className="mt-12">
        <PortugalAtlas activities={REVIEWED_ACTIVITY_SEED} />
      </div>
    </div>
  );
}
