"use client";

import Link from "next/link";
import { ChoiceCard, RouteConsequence } from "@repo/ui";
import React from "react";
import { useState } from "react";

export type TransportChoice = "car" | "transit";
export type MobilityUpdate = (choice: TransportChoice) => void | Promise<void>;

type MobilityTilesProps = {
  initialChoice?: TransportChoice;
  onChoiceChange?: MobilityUpdate;
  tripId?: string;
};

const OPTIONS: Record<TransportChoice, {
  label: string;
  description: string;
  consequence: string;
  travelMinutes: number;
  stops: number;
  warnings: string[];
}> = {
  car: {
    label: "Drive between regions",
    description: "A rental car gives you the most flexibility for viewpoints and quieter stops.",
    consequence: "42 min typical drive · 2 base transfers",
    travelMinutes: 42,
    stops: 2,
    warnings: ["Parking and winding roads add a little friction on scenic days."]
  },
  transit: {
    label: "Train, transit & walking",
    description: "Keep the route relaxed with trains, local transit, and walks between close-by stops.",
    consequence: "68 min typical travel · 4 base transfers",
    travelMinutes: 68,
    stops: 4,
    warnings: ["Some viewpoints need an extra transfer or a short taxi connection."]
  }
};

/** Trip-scoped mobility choices and their immediate route consequences. */
export function MobilityTiles({ initialChoice = "transit", onChoiceChange, tripId }: MobilityTilesProps) {
  const [selected, setSelected] = useState<TransportChoice>(initialChoice);
  const [status, setStatus] = useState<"idle" | "updating" | "ready" | "error">("ready");
  const [pending, setPending] = useState<TransportChoice | null>(null);
  const requestRef = React.useRef(0);

  async function choose(choice: TransportChoice) {
    const requestId = ++requestRef.current;
    setSelected(choice);
    setPending(choice);
    setStatus(onChoiceChange ? "updating" : "ready");
    if (!onChoiceChange) return;
    try {
      await onChoiceChange(choice);
      if (requestId !== requestRef.current) return;
      setPending(null);
      setStatus("ready");
    } catch {
      if (requestId !== requestRef.current) return;
      // Keep the optimistic choice visible so a retry does not discard the
      // traveler's last valid selection.
      setStatus("error");
    }
  }

  function retry() {
    if (pending) void choose(pending);
  }

  const option = OPTIONS[selected];

  return (
    <>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2" role="radiogroup" aria-label="Choose transport">
        {(Object.keys(OPTIONS) as TransportChoice[]).map((choice) => {
          const item = OPTIONS[choice];
          return (
            <ChoiceCard
              key={choice}
              id={`logistics-${choice}`}
              name="transport"
              value={choice}
              label={item.label}
              description={item.description}
              consequence={item.consequence}
              selected={selected === choice}
              onSelect={(value) => void choose(value as TransportChoice)}
            />
          );
        })}
      </div>

      <RouteConsequence
        status={status}
        stopCount={option.stops}
        travelMinutes={option.travelMinutes}
        transportLabel={selected === "car" ? "Rental car" : "Transit + walking"}
        warnings={option.warnings}
        onRetry={retry}
      />

      <div className="flex items-center justify-between border-t border-olive-dark/10 pt-6">
        <Link href={tripId ? `/planner?trip=${encodeURIComponent(tripId)}` : "/planner"} className="font-label-ui text-label-ui text-on-surface-variant">Back</Link>
        <Link href={tripId ? `/checkout?trip=${encodeURIComponent(tripId)}` : "/checkout"} aria-disabled={status === "updating"} className="rounded-lg bg-olive-dark px-6 py-3 font-label-ui text-label-ui text-on-primary">Continue</Link>
      </div>
      <div className="sr-only" aria-live="polite">
        {status === "updating" ? "Updating route" : status === "error" ? "Route update failed; retry available" : `Selected: ${selected === "car" ? "rental car" : "transit and walking"}`}
      </div>
    </>
  );
}
