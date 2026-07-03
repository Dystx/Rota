'use client';

import { useRouter } from "next/navigation";
import { useState, useTransition, type ReactNode } from "react";
import Link from "next/link";
import {
  BriefConfirmation,
  BriefField,
  Button,
  PromptComposer,
  type PromptComposerState,
  useReducedMotion
} from "@repo/ui";
import {
  normalizeTripPrompt,
  type PromptFollowUpQuestion
} from "@repo/ai";
import type { TripBrief } from "@repo/types";

type FollowUpState = {
  questions: PromptFollowUpQuestion[];
  prompt: string;
};

type CandidateState = {
  brief: TripBrief;
  prompt: string;
};

type FlowState =
  | { kind: "idle" }
  | { kind: "loading" }
  | { kind: "follow_up"; data: FollowUpState }
  | { kind: "candidate"; data: CandidateState }
  | { kind: "error"; message: string; prompt: string };

const EXAMPLE_PROMPTS = [
  "A 7-day slow food trip through the Douro Valley for two, no rental car, budget-conscious with one special dinner.",
  "10-day family trip from Lisbon to the Algarve, kid-friendly beaches, no long drives, balanced pacing.",
  "5-day romantic getaway in Porto for two, wine-focused, unhurried mornings, mid-range hotels."
];

const FOLLOW_UP_ANSWERS: Record<string, string[]> = {
  duration: ["3 days", "5 days", "7 days", "10 days", "14 days"],
  region: ["Porto + Douro Valley", "Lisbon + Sintra + Cascais", "Alentejo", "Algarve", "Lisbon + Porto"],
  budget: ["budget", "mid-range", "premium"],
  pace: ["calm", "balanced", "full"]
};

export function PlannerClient() {
  const router = useRouter();
  const [flow, setFlow] = useState<FlowState>({ kind: "idle" });
  const [promptValue, setPromptValue] = useState("");
  const [followUpAnswers, setFollowUpAnswers] = useState<Record<string, string>>({});
  const [pending, startTransition] = useTransition();
  const reducedMotion = useReducedMotion();

  const composerState: PromptComposerState =
    flow.kind === "loading"
      ? "loading"
      : flow.kind === "follow_up"
        ? "follow-up"
        : flow.kind === "error"
          ? "error"
          : "idle";

  const errorMessage =
    flow.kind === "error" ? flow.message : "Something went wrong. Please try again.";

  function reset() {
    setFlow({ kind: "idle" });
    setFollowUpAnswers({});
  }

  async function runNormalization(prompt: string) {
    setFlow({ kind: "loading" });
    try {
      const result = await normalizeTripPrompt(prompt);
      if (result.kind === "needs_follow_up") {
        setFlow({ kind: "follow_up", data: { questions: result.questions, prompt } });
        return;
      }
      setFlow({ kind: "candidate", data: { brief: result.candidate, prompt } });
    } catch (err) {
      setFlow({
        kind: "error",
        message: err instanceof Error ? err.message : "Failed to normalize prompt.",
        prompt
      });
    }
  }

  function onSubmit() {
    const text = promptValue.trim();
    if (text.length < 30) {
      setFlow({
        kind: "error",
        message: "Please share a little more — at least 30 characters so we can match regions, pace, and budget.",
        prompt: text
      });
      return;
    }
    void runNormalization(text);
  }

  function formatFollowUpAnswer(field: string, value: string): string | null {
    const trimmed = value.trim();
    if (!trimmed) return null;
    switch (field) {
      case "duration":
        return `${trimmed} long`;
      case "region":
        return `in ${trimmed}`;
      case "budget": {
        const lowered = trimmed.toLocaleLowerCase("en-US");
        if (lowered === "budget") return "at an affordable spending level";
        if (lowered === "mid-range") return "at a moderate spending level";
        if (lowered === "premium") return "at a premium spending level";
        return `at ${trimmed} spending level`;
      }
      case "pace":
        return `with ${trimmed} daily pacing`;
      default:
        return `${field} ${trimmed}`;
    }
  }

  function buildFollowUpAnswer(answers: Record<string, string>): string {
    return Object.entries(answers)
      .map(([field, value]) => formatFollowUpAnswer(field.split(".").pop() ?? field, value))
      .filter((part): part is string => Boolean(part))
      .join(", ");
  }

  function onFollowUpSubmit() {
    if (flow.kind !== "follow_up") return;
    const answered = buildFollowUpAnswer(followUpAnswers);
    const merged = `${flow.data.prompt}\n\nAdditional context: ${answered}`.trim();
    void runNormalization(merged);
  }

  function onConfirmCandidate() {
    if (flow.kind !== "candidate") return;
    const payload = encodeURIComponent(JSON.stringify(flow.data.brief));
    startTransition(() => {
      router.push(`/trip/new?brief=${payload}`);
    });
  }

  return (
    <div className="pt-header-height min-h-screen flex flex-col bg-background text-on-background antialiased relative overflow-x-hidden">
      <div
        className="absolute inset-x-0 top-0 h-[420px] w-full bg-cover bg-center opacity-25 z-[-2]"
        style={{
          backgroundImage:
            "url('https://lh3.googleusercontent.com/aida-public/AB6AXuCzEwXnJYAipE08VL-hr3P3BYwSrlRjIyjL5sfDtwjoYxB-y51wLp6hsVIk22sgoW6QB09oiy8LenVzi9fTviHSQPR1PvB4UJcUD7zLlT2dC84BS2mwp7ZWu9hplWAo6uCdWwgcDmG3b1FKZ75W8jvqk3YzMBi1EbdIcFAWaXa-RzYOroGe3HPMGsu6CenzluL-SW3IKpNrNvPy9Zl_vljATmBkhPcvvMW-EPyyGy4T036LDJBwqzcFio_a0dcyQ8e12fjvVRPBzsyz')"
        }}
      />
      <div className="absolute inset-x-0 top-0 h-[420px] bg-gradient-to-b from-transparent to-background z-[-1]" />
      <main className="flex-1 px-container-padding-sm md:px-[48px] z-10 py-header-height flex items-start md:items-center justify-center">
        <div className="max-w-4xl w-full">
          <div className="bg-linen-dark/80 backdrop-blur-xl border border-white/40 rounded-2xl p-container-padding-lg md:p-[64px] shadow-2xl">
            <p className="font-mono-micro text-mono-micro uppercase tracking-[0.2em] text-ochre-dark mb-4">
              AI Intent Engine
            </p>
            <h1 className="font-headline-lg text-headline-lg md:font-display md:text-display text-primary leading-tight mb-3">
              Tell us about your Portugal trip.
            </h1>
            <p className="font-body-md text-body-md text-olive-light leading-relaxed mb-section-gap max-w-2xl">
              Plain English works — we&apos;ll extract dates, regions, pace, and budget, and confirm before we lock anything in.
            </p>

            <PromptComposer
              state={composerState}
              promptValue={promptValue}
              onPromptChange={setPromptValue}
              onSubmit={onSubmit}
              examplePrompts={EXAMPLE_PROMPTS}
              errorMessage={errorMessage}
              followUpPanel={
                flow.kind === "follow_up" ? (
                  <FollowUpPanel
                    questions={flow.data.questions}
                    answers={followUpAnswers}
                    onChange={setFollowUpAnswers}
                    onSubmit={onFollowUpSubmit}
                    onReset={reset}
                  />
                ) : null
              }
            />

            {flow.kind === "candidate" && (
              <div className="mt-section-gap" role="status" aria-live="polite" aria-atomic="true">
                <BriefConfirmation
                  title="We parsed your brief"
                  description={`Provider: deterministic-fallback · Confirm to lock the structured details, or edit any field to refine.`}
                  actions={
                    <>
                      <Button variant="ghost" onClick={reset}>
                        Start over
                      </Button>
                      <Button
                        variant="primary"
                        onClick={onConfirmCandidate}
                        disabled={pending}
                        aria-label="Continue with this brief"
                      >
                        {pending ? "Preparing…" : "Continue"}
                        <span className="material-symbols-outlined text-base ml-2" aria-hidden="true">arrow_forward</span>
                      </Button>
                    </>
                  }
                  className="bg-white/90 border border-olive-dark/10"
                >
                  <BriefField
                    label="Regions"
                    value={flow.data.brief.regions.join(", ") || "Not specified"}
                  />
                  <BriefField
                    label="Trip length"
                    value={flow.data.brief.tripLengthDays ? `${flow.data.brief.tripLengthDays} days` : "Not specified"}
                  />
                  <BriefField
                    label="Travelers"
                    value={`${flow.data.brief.travelersCount} (${flow.data.brief.travelerType})`}
                  />
                  <BriefField
                    label="Budget"
                    value={flow.data.brief.budgetLevel || "Not specified"}
                  />
                  <BriefField
                    label="Pace"
                    value={flow.data.brief.pace || "Not specified"}
                  />
                  <BriefField
                    label="Transport"
                    value={flow.data.brief.transportMode}
                  />
                  <BriefField
                    label="Interests"
                    value={flow.data.brief.interests.join(", ") || "Not specified"}
                  />
                  <BriefField
                    label="Food preferences"
                    value={flow.data.brief.foodPreferences.join(", ") || "Not specified"}
                  />
                  <BriefField
                    label="Avoid"
                    value={flow.data.brief.avoidances.join(", ") || "Not specified"}
                  />
                </BriefConfirmation>
              </div>
            )}

            <div className="mt-section-gap text-center">
              <Link
                href="/how-it-works"
                className="font-mono-micro text-mono-micro uppercase tracking-[0.2em] text-olive-light hover:text-ochre-dark transition-colors"
              >
                How this works →
              </Link>
            </div>

            {reducedMotion && (
              <span className="sr-only">Reduced motion is enabled.</span>
            )}
          </div>
        </div>
      </main>
      <SiteFooterLite />
    </div>
  );
}

function FollowUpPanel({
  questions,
  answers,
  onChange,
  onSubmit,
  onReset
}: {
  questions: PromptFollowUpQuestion[];
  answers: Record<string, string>;
  onChange: (next: Record<string, string>) => void;
  onSubmit: () => void;
  onReset: () => void;
}): ReactNode {
  return (
    <div className="rounded-2xl border border-primary/30 bg-primary text-on-primary p-card-padding space-y-section-gap shadow-2xl">
      <div>
        <p className="font-mono-micro text-mono-micro uppercase tracking-[0.2em] text-ochre-light mb-2">
          Follow-up
        </p>
        <h2 className="font-headline-sm text-headline-sm md:font-headline-lg md:text-headline-lg text-linen-dark leading-tight">
          We need a few more details before drafting.
        </h2>
        <p className="font-body-md text-body-md text-linen-dark/70 mt-2">
          Tap an option or type your own — we&apos;ll fold it back into your brief.
        </p>
      </div>
      <div className="space-y-5">
        {questions.map((q) => {
          const current = answers[q.id] ?? "";
          const suggestions = FOLLOW_UP_ANSWERS[q.field] ?? q.options;
          const selectedIndex = suggestions.findIndex((s) => s === current);
          const activeIndex = selectedIndex >= 0 ? selectedIndex : 0;
          return (
            <fieldset key={q.id} className="space-y-2">
              <legend className="font-label-ui text-label-ui font-semibold text-linen-dark">
                {q.label}
              </legend>
              <p className="font-body-md text-body-md text-linen-dark/80">{q.question}</p>
              <div
                role="radiogroup"
                aria-label={q.label}
                className="flex flex-wrap gap-2"
              >
                {suggestions.map((opt, index) => {
                  const selected = current === opt;
                  return (
                    <button
                      key={opt}
                      type="button"
                      role="radio"
                      aria-checked={selected}
                      tabIndex={index === activeIndex ? 0 : -1}
                      onClick={() => onChange({ ...answers, [q.id]: opt })}
                      className={
                        "font-label-ui text-label-ui px-4 py-2 rounded-full border transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ochre-light " +
                        (selected
                          ? "bg-ochre-light text-primary border-ochre-light"
                          : "bg-white/10 border-white/25 text-linen-dark hover:bg-white/15")
                      }
                    >
                      {opt}
                    </button>
                  );
                })}
              </div>
              {q.allowsFreeAnswer && (
                <input
                  type="text"
                  value={current}
                  onChange={(e) => onChange({ ...answers, [q.id]: e.target.value })}
                  placeholder="Or type your own…"
                  aria-label="Describe your trip"
                  className="w-full bg-white/10 border border-white/25 rounded-full px-4 py-2 font-body-md text-body-md text-linen-dark placeholder:text-linen-dark/40 focus:outline-none focus:ring-2 focus:ring-ochre-light"
                />
              )}
            </fieldset>
          );
        })}
      </div>
      <div className="flex items-center justify-end gap-3 pt-2 border-t border-white/15">
        <Button variant="ghost" onClick={onReset} className="!text-white !border-white/30 hover:!bg-white/10">
          Start over
        </Button>
        <Button variant="primary" onClick={onSubmit} aria-label="Continue with follow-up answers">
          Continue
          <span className="material-symbols-outlined text-base ml-2" aria-hidden="true">arrow_forward</span>
        </Button>
      </div>
    </div>
  );
}

function SiteFooterLite() {
  return (
    <footer className="bg-linen-dark w-full border-t border-olive-dark/5 py-8 px-container-padding-lg flex flex-col md:flex-row justify-between items-center gap-4 mt-auto z-10">
      <Link href="/" className="font-headline-lg text-headline-lg italic text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ochre-light focus-visible:ring-offset-2">
        Rumia
      </Link>
      <p className="font-label-ui text-label-ui text-olive-light text-center md:text-left">
        © 2024 Rumia. All rights reserved. Intentional Humanism in Travel.
      </p>
      <div className="flex gap-6">
        <Link href="/pricing" className="font-label-ui text-label-ui text-olive-light hover:text-primary transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ochre-light focus-visible:ring-offset-2">
          Pricing
        </Link>
        <Link href="/how-it-works" className="font-label-ui text-label-ui text-olive-light hover:text-primary transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ochre-light focus-visible:ring-offset-2">
          How it works
        </Link>
      </div>
    </footer>
  );
}