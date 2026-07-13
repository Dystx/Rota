"use client";

import * as React from "react";
import { Icon } from "@repo/ui";
function cn(...values: Array<string | false | null | undefined>): string { return values.filter(Boolean).join(" "); }

/**
 * TransportStep — Stitch 1.3 dual-tile transport question.
 *
 * "Will you rent a car?" with two large icon-led choice cards.
 * 1 click to select; the choice is recorded in the parent
 * stepper. The full Stitch 1.3 text:
 *
 *   Yes, airport pickup
 *   Flexible exploration
 *
 *   No, transit & walking
 *   City immersion
 *
 * The user's "1 or 2 clicks" rule means we render a single
 * radio group of two big buttons, not a chip set or a
 * follow-up text input.
 */
export type TransportChoice = "car" | "transit";

const TRANSPORT_OPTIONS: Array<{
  value: TransportChoice;
  title: string;
  description: string;
  icon: string;
}> = [
  {
    value: "car",
    title: "Yes, airport pickup",
    description: "Flexible exploration",
    icon: "car_rental"
  },
  {
    value: "transit",
    title: "No, transit & walking",
    description: "City immersion",
    icon: "directions_transit"
  }
];

export function TransportStep({
  value,
  onChange
}: {
  value: TransportChoice | null;
  onChange: (next: TransportChoice) => void;
}) {
  return (
    <div
      role="radiogroup"
      aria-label="Will you rent a car?"
      data-testid="transport-step"
      className="grid grid-cols-1 md:grid-cols-2 gap-3"
    >
      {TRANSPORT_OPTIONS.map((option) => {
        const isSelected = value === option.value;
        return (
          <button
            key={option.value}
            type="button"
            role="radio"
            aria-checked={isSelected}
            data-testid={`transport-option-${option.value}`}
            onClick={() => onChange(option.value)}
            className={cn(
              "group flex flex-col items-center gap-2 p-5 rounded-xl border-2 text-center transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ochre-light focus-visible:ring-offset-2",
              isSelected
                ? "bg-ochre-light/15 border-ochre-light shadow-md"
                : "bg-white border-outline-variant/30 hover:border-ochre-light/60 hover:bg-ochre-light/5"
            )}
          >
            <Icon
              name={option.icon}
              className={cn(
                "text-4xl",
                isSelected ? "text-ochre-dark" : "text-on-surface-variant"
              )}
            />
            <span
              className={cn(
                "font-headline-sm text-headline-sm",
                isSelected ? "text-ochre-dark" : "text-primary"
              )}
            >
              {option.title}
            </span>
            <span className="font-body-md text-body-md text-on-surface-variant">
              {option.description}
            </span>
          </button>
        );
      })}
    </div>
  );
}
