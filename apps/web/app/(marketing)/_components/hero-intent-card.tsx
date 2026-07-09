"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Button, Card, CardContent, ChoiceCard, ChoiceChipGroup } from "@repo/ui";
import {
  PUBLIC_DESTINATION_CHOICES,
  PUBLIC_DURATION_CHOICES,
  PUBLIC_STYLE_CHOICES,
  publicDraftToPlannerUrl
} from "./public-trip-choices";

export function HeroIntentCard() {
  const router = useRouter();
  const [destination, setDestination] = React.useState("lisbon");
  const [days, setDays] = React.useState("7");
  const [vibe, setVibe] = React.useState("balanced");

  return (
    <Card
      data-testid="hero-intent-card"
      className="on-dark w-full max-w-5xl border-white/20 bg-ink/80 shadow-[0_8px_32px_rgba(24,28,28,0.3)] backdrop-blur-md"
    >
      <CardContent className="grid gap-5 p-5 md:p-6">
        <div className="grid gap-1 text-center">
          <p className="font-mono-micro text-mono-micro uppercase tracking-widest text-ochre-light">
            Start with a route
          </p>
          <h2 className="font-display text-2xl text-linen-dark md:text-3xl">
            Pick a Portugal starting point.
          </h2>
        </div>

        <section aria-label="Destination" className="grid gap-3">
          <p className="text-sm font-medium text-linen-dark">Where would you like to begin?</p>
          <div role="radiogroup" aria-label="Destination" className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {PUBLIC_DESTINATION_CHOICES.map((choice) => (
              <ChoiceCard
                key={choice.value}
                id={`hero-destination-${choice.value}`}
                name="hero-destination"
                value={choice.value}
                label={choice.label}
                description={choice.description}
                consequence={choice.consequence}
                selected={destination === choice.value}
                onSelect={setDestination}
              />
            ))}
          </div>
        </section>

        <div className="grid gap-5 md:grid-cols-2">
          <ChoiceChipGroup
            label="How long do you have?"
            options={[...PUBLIC_DURATION_CHOICES]}
            selected={[days]}
            onChange={([next]) => setDays(next ?? "7")}
            multiple={false}
          />
          <ChoiceChipGroup
            label="What pace suits this trip?"
            options={[...PUBLIC_STYLE_CHOICES]}
            selected={[vibe]}
            onChange={([next]) => setVibe(next ?? "balanced")}
            multiple={false}
          />
        </div>

        <div className="flex justify-center pt-1">
          <Button
            type="button"
            data-testid="hero-intent-submit"
            onClick={() => router.push(publicDraftToPlannerUrl(destination, Number(days), vibe as "restorative" | "balanced" | "high_energy"))}
            className="!px-8 !py-3.5 !text-base focus-visible:ring-2 focus-visible:ring-ochre-light focus-visible:ring-offset-2 focus-visible:ring-offset-paper"
          >
            Build my route
            <span aria-hidden className="ph !text-[20px] ml-1 ph-arrow-right">arrow-right</span>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
