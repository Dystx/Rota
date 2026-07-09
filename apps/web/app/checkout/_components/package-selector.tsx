"use client";

import * as React from "react";

export function PackageSelector({ tripId }: { tripId: string | null }) {
  const [selected, setSelected] = React.useState<"core" | "specialist">("specialist");
  return (
    <div data-testid="checkout-package-selector" className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <button type="button" aria-pressed={selected === "core"} data-testid="checkout-package-core" onClick={() => setSelected("core")} className={`text-left rounded-xl p-6 border transition-shadow ${selected === "core" ? "border-ochre-dark ring-2 ring-ochre-light" : "border-outline/30"}`}>
        <h2 className="font-headline-lg text-headline-lg text-primary mb-2">Core AI</h2>
        <p className="text-on-surface-variant">A complete structured itinerary with maps, pacing, and curated routes.</p>
        <span className="mt-4 inline-block font-label-ui text-label-ui">Included</span>
      </button>
      <button type="button" aria-pressed={selected === "specialist"} data-testid="checkout-package-specialist" onClick={() => setSelected("specialist")} className={`text-left rounded-xl p-6 bg-olive-dark text-linen-dark border transition-shadow ${selected === "specialist" ? "border-ochre-light ring-2 ring-ochre-light" : "border-ochre-light/50"}`}>
        <h2 className="font-headline-lg text-headline-lg mb-2">Hybrid Specialist</h2>
        <p className="text-linen-dark/80">Destination specialists audit, refine, and personalize your itinerary.</p>
        <span className="mt-4 inline-block font-label-ui text-label-ui text-ochre-light">€65 · Recommended</span>
      </button>
      {tripId ? <form action={`/api/trips/${tripId}/unlock`} method="post" className="md:col-span-2"><input type="hidden" name="package" value={selected} /><button type="submit" data-testid="checkout-package-submit" className="w-full rounded-lg bg-ochre-dark px-6 py-3 text-on-primary">{selected === "core" ? "Continue with Core AI" : "Upgrade & Finalize"}</button></form> : null}
    </div>
  );
}
