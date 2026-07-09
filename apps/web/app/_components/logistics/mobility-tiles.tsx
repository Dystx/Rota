"use client";

import Link from "next/link";
import { useState } from "react";

type MobilityOption = "yes" | "no";

interface TileConfig {
  id: MobilityOption;
  title: string;
  caption: string;
  icon: string;
}

const TILES: TileConfig[] = [
  {
    id: "yes",
    title: "Yes, airport pickup",
    caption: "Flexible exploration",
    icon: "car_rental",
  },
  {
    id: "no",
    title: "No, transit & walking",
    caption: "City immersion",
    icon: "directions_transit",
  },
];

/**
 * MobilityTiles — body content for the Logistics screen (Mock 1.3).
 *
 * Source: docs/prototype.html (LogisticsPage inner card).
 *
 * Two selectable tiles plus the back/continue footer. The Continue Link is
 * disabled until a selection is made; selecting a tile adds a `.selected`
 * marker so the inline `group-[:has(.selected)]:opacity-100` Tailwind v4
 * utility shows the corner check_circle.
 */
export function MobilityTiles() {
  const [selected, setSelected] = useState<MobilityOption | null>(null);

  return (
    <>
      <header className="text-center">
        <div className="inline-block px-3 py-1 bg-olive-light/10 rounded-full mb-4">
          <span className="font-mono-micro text-mono-micro text-olive-dark uppercase tracking-widest">
            Logistics
          </span>
        </div>
        <h1 className="font-headline-lg text-headline-lg text-primary mb-2">
          Will you rent a car?
        </h1>
        <p className="font-body-md text-body-md text-on-surface-variant">
          We&apos;ll tailor your itinerary based on your mobility preferences.
        </p>
      </header>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {TILES.map((tile) => {
          const isSelected = selected === tile.id;
          return (
            <button
              key={tile.id}
              type="button"
              onClick={() => setSelected(tile.id)}
              aria-pressed={isSelected}
              aria-label={`${tile.title} — ${tile.caption}`}
              className={[
                "group relative flex flex-col items-center justify-center p-6 bg-surface-container-lowest/80 border rounded-lg transition-all duration-300 hover-pull overflow-hidden focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ochre-light focus-visible:ring-offset-2",
                isSelected
                  ? "border-ochre-light bg-surface-container-lowest selected"
                  : "border-olive-light/10 hover:border-ochre-light hover:bg-surface-container-lowest",
              ].join(" ")}
            >
              <div className="absolute inset-0 bg-ochre-light/5 opacity-0 group-hover:opacity-100 transition-opacity" />
              <span className="ph text-4xl text-olive-dark mb-4 group-hover:text-ochre-dark transition-colors">
                {tile.icon}
              </span>
              <span className="font-label-ui text-label-ui text-primary mb-1">
                {tile.title}
              </span>
              <span className="font-body-md text-body-md text-on-surface-variant text-center text-sm">
                {tile.caption}
              </span>
              <div className="absolute top-4 right-4 opacity-0 group-[:has(.selected)]:opacity-100 transition-opacity">
                <span className="ph text-ochre-dark">
                  check_circle
                </span>
              </div>
            </button>
          );
        })}
      </div>

      <div className="flex justify-between items-center mt-4 pt-6 border-t border-olive-dark/10">
        <Link
          href="/planner"
          className="font-label-ui text-label-ui text-on-surface-variant hover:text-primary transition-colors flex items-center gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ochre-light focus-visible:ring-offset-2 rounded"
        >
          <span className="ph text-sm ph-arrow-left">arrow-left</span>
          Back
        </Link>
        <Link
          href="/checkout"
          aria-disabled={!selected}
          tabIndex={selected ? undefined : -1}
          className={[
            "font-label-ui text-label-ui px-6 py-3 rounded-lg transition-colors duration-200 hover-pull shadow-sm flex items-center gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ochre-light focus-visible:ring-offset-2",
            selected
              ? "bg-olive-dark text-on-primary hover:bg-primary"
              : "bg-olive-dark text-on-primary hover:bg-primary pointer-events-none opacity-50",
          ].join(" ")}
        >
          Continue
          <span className="ph text-sm ph-arrow-right">arrow-right</span>
        </Link>
      </div>

      <div className="sr-only" aria-live="polite">
        {selected
          ? `Selected: ${selected === "yes" ? "rental car" : "transit & walking"}`
          : "No mobility preference selected"}
      </div>
    </>
  );
}
