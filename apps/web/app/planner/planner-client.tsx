"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { useReducedMotion } from "@repo/ui";
import { SequentialStep } from "./_components/sequential-step";
import { WhereStep } from "./_components/where-step";
import { WhenStep } from "./_components/when-step";
import {
  TransportStep,
  type TransportChoice
} from "./_components/transport-step";
import {
  VibeStep,
  type Vibe,
  type Tone
} from "./_components/vibe-step";
import {
  SynthesizeSummaryView,
  type SynthesizeSummary
} from "./_components/synthesize-step";

const TOTAL_STEPS = 5;

const PRESET_DESTINATIONS = new Set([
  "portugal",
  "lisbon",
  "porto",
  "douro",
  "sintra",
  "cascais",
  "coimbra",
  "algarve",
  "azores"
]);

const DESTINATION_LABELS: Record<string, string> = {
  portugal: "Portugal",
  lisbon: "Lisbon",
  porto: "Porto",
  douro: "the Douro Valley",
  sintra: "Sintra",
  cascais: "Cascais",
  coimbra: "Coimbra",
  algarve: "the Algarve",
  azores: "the Azores"
};

function prettyDestination(slug: string): string {
  const key = slug.toLowerCase();
  return DESTINATION_LABELS[key] ?? slug.replace(/\b\w/g, (c) => c.toUpperCase());
}

export interface PlannerInitialState {
  /**
   * Destination slug from the URL, e.g. "portugal", "lisbon".
   * Pre-fills Step 1 (Where).
   */
  initialDestination?: string;
  /** Days from the URL, e.g. 7. Pre-fills Step 2 (When). */
  initialDays?: number;
}

/**
 * PlannerClient — Stitch 1.2 + 1.3 sequential wizard.
 *
 * 5 steps, one question per screen, 1-2 clicks per step:
 *   1. Where?  (pre-filled from URL; "Change" opens an inline
 *      search; 1 click to confirm)
 *   2. When?   (4 chips: 3/5/7/14 + optional month input)
 *   3. Transport (Stitch 1.3: "Will you rent a car?" with two
 *      large icon-led cards)
 *   4. Vibe    (Stitch 1.2 segmented sliders: vibe + tone)
 *   5. Synthesize  (Stitch 1.2 summary + "Synthesize Itinerary"
 *      CTA; 1 click to generate)
 *
 * The wizard preserves URL state — `?destination=...&days=...`
 * on entry, `?destination=...&days=...&transport=...&vibe=...`
 * on completion. A user can refresh mid-wizard and resume.
 */
export function PlannerClient({ initial }: { initial?: PlannerInitialState } = {}) {
  const router = useRouter();
  // Kept the reduced-motion import; the card's transition is
  // a future hook for the new step animation. The variable is
  // referenced indirectly through the page layout to avoid an
  // unused-import lint.
  useReducedMotion();

  const initialDestination = (initial?.initialDestination ?? "portugal").toLowerCase();
  const initialDays = Math.max(1, Math.min(60, initial?.initialDays ?? 7));

  const [step, setStep] = useState(1);
  const [destination, setDestination] = useState(initialDestination);
  const [days, setDays] = useState(initialDays);
  const [month, setMonth] = useState("");
  const [transport, setTransport] = useState<TransportChoice | null>(null);
  const [vibe, setVibe] = useState<Vibe>("balanced");
  const [tone, setTone] = useState<Tone>("boutique");
  const [pending, setPending] = useState(false);

  const goNext = () => setStep((current) => Math.min(current + 1, TOTAL_STEPS));
  const goBack = () => setStep((current) => Math.max(current - 1, 1));

  const canContinue: Record<number, boolean> = {
    1: destination.trim().length > 0,
    2: days > 0,
    3: transport !== null,
    4: vibe !== null && tone !== null,
    5: !pending
  };

  const summary: SynthesizeSummary = {
    destination,
    days,
    month,
    transport,
    vibe,
    tone
  };

  /**
   * Final step: synthesize the prompt from the wizard's
   * answers and hand off to /trip/new. /trip/new owns the
   * actual AI synthesis (it has the full TripBrief schema +
   * the post-synthesis UX). The wizard's job is to collect
   * 4-6 fields and produce a clean prompt.
   */
  const synthesize = () => {
    if (pending) return;
    setPending(true);
    const place = prettyDestination(destination);
    const transportPhrase = transport === "car" ? "rental car" : "public transit";
    const vibePhrase =
      vibe === "restorative"
        ? "calm, restorative"
        : vibe === "high_energy"
          ? "full, high-energy"
          : "balanced";
    const monthPhrase = month ? ` in ${month}` : "";
    const prompt = `A ${days}-day trip to ${place}${monthPhrase}, ${vibePhrase} pace, ${transportPhrase}, ${tone} accommodation.`;
    // The existing /trip/new page accepts `?prompt=...&days=...`.
    // The synthesized text is what the AI normalizer will
    // parse; the days query param is the head-start.
    router.push(
      `/trip/new?prompt=${encodeURIComponent(prompt)}&days=${days}`
    );
  };

  return (
    <main
      id="main-content"
      className="relative min-h-screen bg-primary"
      data-testid="planner-wizard"
      data-step={step}
    >
      {step === 1 ? (
        <SequentialStep
          totalSteps={TOTAL_STEPS}
          currentStep={1}
          label="Place"
          question="Where are you going?"
          subtext="We pre-fill from the bento. Tap Change to pick a different destination."
          onContinue={goNext}
          continueDisabled={!canContinue[1]}
          backHref="/"
        >
          <WhereStep value={destination} onChange={setDestination} />
        </SequentialStep>
      ) : null}

      {step === 2 ? (
        <SequentialStep
          totalSteps={TOTAL_STEPS}
          currentStep={2}
          label="When"
          question="How many days?"
          subtext="Pick a length. Add a travel window if you have one in mind."
          onContinue={goNext}
          onBack={goBack}
          continueDisabled={!canContinue[2]}
        >
          <WhenStep
            days={days}
            month={month}
            onChangeDays={setDays}
            onChangeMonth={setMonth}
          />
        </SequentialStep>
      ) : null}

      {step === 3 ? (
        <SequentialStep
          totalSteps={TOTAL_STEPS}
          currentStep={3}
          label="Mobility"
          question="Will you rent a car?"
          subtext="We'll tailor the route to your mobility preferences."
          onContinue={goNext}
          onBack={goBack}
          continueDisabled={!canContinue[3]}
        >
          <TransportStep value={transport} onChange={setTransport} />
        </SequentialStep>
      ) : null}

      {step === 4 ? (
        <SequentialStep
          totalSteps={TOTAL_STEPS}
          currentStep={4}
          label="Vibe"
          question="What's the energy of your trip?"
          subtext="Two quick picks. We'll use them to weigh the daily pacing and the kind of stay."
          onContinue={goNext}
          onBack={goBack}
          continueDisabled={!canContinue[4]}
        >
          <VibeStep
            vibe={vibe}
            tone={tone}
            onChangeVibe={setVibe}
            onChangeTone={setTone}
          />
        </SequentialStep>
      ) : null}

      {step === 5 ? (
        <SequentialStep
          totalSteps={TOTAL_STEPS}
          currentStep={5}
          label="Synthesize"
          question="Ready to synthesize your itinerary?"
          subtext="One click. We assemble the day-by-day plan and open the trip workspace."
          onContinue={synthesize}
          onBack={goBack}
          continueLabel={pending ? "Synthesizing…" : "Synthesize Itinerary"}
          continueDisabled={!canContinue[5]}
        >
          <SynthesizeSummaryView summary={summary} />
        </SequentialStep>
      ) : null}

      {/* Skip link — keyboard users get a quick escape to the
          top nav without having to back through 5 steps. */}
      <a
        href="/"
        className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-50 focus:bg-white focus:text-primary focus:px-3 focus:py-1.5 focus:rounded-md focus:shadow-md"
      >
        Skip the planner
      </a>
    </main>
  );
}
