"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { PUBLIC_DESTINATION_ATLAS } from "./_components/public-trip-choices";

/**
 * The homepage context is intentionally static. Rumia's primary job starts
 * with the activity situation, so MapLibre is not loaded until a traveller
 * has selected activities and explicitly opens the map-capable workspace.
 *
 * `HeroProjection` and `initialProjection` remain as a compatibility-shaped
 * API for existing callers, but the homepage no longer pretends that a
 * decorative projection toggle is a product decision.
 */
export type HeroProjection = "globe" | "mercator";

export interface HeroMapProps {
  initialProjection?: HeroProjection;
}

export function HeroMap({ initialProjection = "mercator" }: HeroMapProps) {
  return (
    <div
      data-testid="hero-map"
      data-map-container=""
      data-projection={initialProjection}
      aria-hidden="true"
      className="absolute inset-0 z-0 opacity-25 md:opacity-60"
    >
      <StaticPortugalFallback />
    </div>
  );
}

/**
 * A semantic, no-WebGL context illustration for the hero. It remains
 * available as the stable first paint and keeps destination links out of the
 * primary activity decision; the composer is the only visible task control.
 */
export function StaticPortugalFallback() {
  const router = useRouter();
  const pinLayout: Record<string, { top: string; left: string }> = {
    porto: { top: "20%", left: "53%" },
    lisbon: { top: "50%", left: "42%" },
    douro: { top: "32%", left: "58%" },
    algarve: { top: "76%", left: "52%" },
    azores: { top: "44%", left: "20%" }
  };
  const pins = PUBLIC_DESTINATION_ATLAS.map((destination) => ({
    ...destination,
    ...pinLayout[destination.slug]
  }));

  return (
    <div
      data-testid="hero-map-fallback"
      className="absolute inset-0 z-10 overflow-hidden bg-[radial-gradient(circle_at_50%_38%,rgba(234,184,117,0.2),transparent_30%),linear-gradient(150deg,#17372e,#0c1f16)]"
    >
      <svg
        aria-hidden="true"
        viewBox="0 0 360 540"
        className="absolute left-1/2 top-1/2 h-[125%] w-auto -translate-x-1/2 -translate-y-1/2 opacity-80"
      >
        <path
          d="M188 38 229 56 242 104 224 151 239 196 219 247 235 296 213 349 225 399 205 450 213 500 177 517 150 482 162 432 145 383 161 331 146 284 163 236 148 188 166 140 151 91Z"
          fill="#315445"
          stroke="#eab875"
          strokeWidth="4"
        />
        <path d="M185 65 194 495" stroke="#eab875" strokeWidth="2" strokeDasharray="7 9" opacity=".65" />
      </svg>
      <p className="absolute left-5 top-5 hidden font-mono-micro text-mono-micro uppercase tracking-widest text-linen-dark/80">
        Portugal activity context
      </p>
      {pins.map((pin) => (
        <button
          key={pin.slug}
          type="button"
          aria-label={`Explore what to do in ${pin.label}`}
          onClick={() => router.push(`/explore?region=${pin.slug}`)}
          // The homepage composer is the primary control. Pins remain in the
          // component contract for future map surfaces but stay hidden on this
          // ambient context layer so they cannot compete with the task.
          className="absolute z-20 hidden -translate-x-1/2 -translate-y-1/2 items-center gap-2 rounded-full border border-ochre-light/70 bg-ink/85 px-3 py-2 font-label-ui text-label-ui text-linen-dark shadow-lg backdrop-blur focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ochre-light focus-visible:ring-offset-2 focus-visible:ring-offset-primary"
          style={{ top: pin.top, left: pin.left }}
        >
          <span aria-hidden className="h-2.5 w-2.5 rounded-full bg-ochre-light" />
          {pin.label}
        </button>
      ))}
    </div>
  );
}
