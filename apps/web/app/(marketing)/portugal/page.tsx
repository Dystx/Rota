import * as React from "react";
import type { Metadata } from "next";

import { REVIEWED_ACTIVITY_SEED } from "@/lib/content/activities";

import { PortugalAtlas } from "./portugal-atlas";

export const metadata: Metadata = {
  title: "What to do in Portugal | Rumia",
  description:
    "Browse Rumia’s reviewed Portugal activity collections by the kind of day you want to have.",
  alternates: { canonical: "/portugal" }
};

export default function PortugalPage() {
  return (
    <div className="mx-auto max-w-6xl px-6 py-16">
      <h1 className="font-display text-5xl text-primary">What deserves your time in Portugal?</h1>
      <p className="mt-4 max-w-2xl text-lg leading-relaxed text-on-surface-variant">
        Start with a part of the country and the kind of time you have. Rumia will show the activity decisions worth considering, including when to choose something else.
      </p>
      <div className="mt-12">
        <PortugalAtlas activities={REVIEWED_ACTIVITY_SEED} />
      </div>
    </div>
  );
}
