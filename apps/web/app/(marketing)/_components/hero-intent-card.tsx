"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { AcceptedPhrase } from "@repo/ui";
import { publicDraftToPlannerUrl } from "./public-trip-choices";

const destinations = ["Lisbon & surrounds", "Porto & the North", "Douro Valley", "The Algarve", "The Azores"] as const;
const durationOptions = ["three days", "five days", "one week", "ten days"] as const;
const paceOptions = ["slow and spacious", "balanced", "full and lively"] as const;

const destinationValues: Record<(typeof destinations)[number], string> = { "Lisbon & surrounds": "lisbon", "Porto & the North": "porto", "Douro Valley": "douro", "The Algarve": "algarve", "The Azores": "azores" };
const durationValues: Record<(typeof durationOptions)[number], number> = { "three days": 3, "five days": 5, "one week": 7, "ten days": 10 };
const paceValues: Record<(typeof paceOptions)[number], "restorative" | "balanced" | "high_energy"> = { "slow and spacious": "restorative", balanced: "balanced", "full and lively": "high_energy" };

export function HeroIntentCard() {
  const router = useRouter();
  const [destination, setDestination] = React.useState<(typeof destinations)[number]>("Lisbon & surrounds");
  const [duration, setDuration] = React.useState<(typeof durationOptions)[number]>("one week");
  const [pace, setPace] = React.useState<(typeof paceOptions)[number]>("balanced");
  return <div data-testid="hero-intent-card" className="max-w-3xl text-center text-xl leading-relaxed text-linen-dark md:text-2xl"><div>Show me <AcceptedPhrase label="Destination" value={destination} options={destinations} onAccept={(value) => setDestination(value as typeof destination)} onClear={() => setDestination("Lisbon & surrounds")} /> for <AcceptedPhrase label="Duration" value={duration} options={durationOptions} onAccept={(value) => setDuration(value as typeof duration)} onClear={() => setDuration("one week")} />, at a <AcceptedPhrase label="Pace" value={pace} options={paceOptions} onAccept={(value) => setPace(value as typeof pace)} onClear={() => setPace("balanced")} /> pace.</div><button type="button" onClick={() => router.push(publicDraftToPlannerUrl(destinationValues[destination], durationValues[duration], paceValues[pace]))} className="mt-6 border-b border-ochre-light px-1 py-2 font-medium text-ochre-light hover:text-linen-dark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ochre-light">Plan Portugal →</button></div>;
}
