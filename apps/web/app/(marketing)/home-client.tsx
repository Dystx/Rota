'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { m, AnimatePresence } from 'motion/react';
import { normalizeTripPrompt, type PromptFollowUpQuestion } from '@repo/ai';
import { type TripBrief } from '@repo/types';
import {
  PromptComposer,
  type PromptComposerState,
  BriefConfirmation,
  BriefField,
  SectionTransition,
  SubmitButton,
  Button,
  Field,
  ChipGroup,
  useReducedMotion
} from '@repo/ui';

const EXAMPLE_PROMPTS = [
  "A 7-day relaxing food tour in the Douro Valley for a couple",
  "5 days in Lisbon and Sintra, premium budget, active pace",
  "10 day family trip to the Algarve, avoiding long drives"
];

export function HomeClient() {
  const router = useRouter();
  const reducedMotion = useReducedMotion();

  const [prompt, setPrompt] = useState("");
  const [state, setState] = useState<PromptComposerState>('idle');
  const [errorMessage, setErrorMessage] = useState("");
  
  const [followUpQuestions, setFollowUpQuestions] = useState<PromptFollowUpQuestion[]>([]);
  const [candidate, setCandidate] = useState<TripBrief | null>(null);

  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState("");

  const handleGenerate = async () => {
    setState('loading');
    setErrorMessage("");
    setSaveError("");
    setCandidate(null);
    setFollowUpQuestions([]);

    try {
      const result = await normalizeTripPrompt(prompt);
      
      if (result.kind === 'needs_follow_up') {
        setFollowUpQuestions(result.questions);
        setState('follow-up');
      } else if (result.kind === 'candidate') {
        setCandidate(result.candidate);
        setState('idle'); // the composer is idle, we show the brief below
      }
    } catch (error) {
      setErrorMessage("Could not process your prompt. Please try again.");
      setState('error');
    }
  };

  const handleFollowUpAnswer = (question: PromptFollowUpQuestion, answer: string) => {
    // Simply append the answer to the prompt and clear this specific question or re-run
    const newPrompt = `${prompt.trim()} with ${answer}`;
    setPrompt(newPrompt);
    
    // We could immediately re-run, but letting the user see the prompt update is nice.
    // If it's the last question, maybe auto-submit.
    if (followUpQuestions.length === 1) {
      // Small timeout to let state update
      setTimeout(() => {
        // Trigger handleGenerate with new prompt by using the updated state
        // To be safe, we'll just update prompt and trigger generate manually here to avoid closure staleness
        handleGenerateWith(newPrompt);
      }, 100);
    } else {
      setFollowUpQuestions(prev => prev.filter(q => q.id !== question.id));
    }
  };

  const handleGenerateWith = async (newPrompt: string) => {
    setState('loading');
    setErrorMessage("");
    try {
      const result = await normalizeTripPrompt(newPrompt);
      if (result.kind === 'needs_follow_up') {
        setFollowUpQuestions(result.questions);
        setState('follow-up');
      } else if (result.kind === 'candidate') {
        setCandidate(result.candidate);
        setState('idle');
      }
    } catch (error) {
      setErrorMessage("Could not process your prompt. Please try again.");
      setState('error');
    }
  };

  const handleSaveTrip = async () => {
    if (!candidate) return;
    setIsSaving(true);
    setSaveError("");

    try {
      const res = await fetch('/api/trips', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(candidate),
      });

      if (!res.ok) {
        if (res.status === 401 || res.status === 403) {
          throw new Error("Please sign in to save your trip.");
        } else if (res.status === 503) {
          throw new Error("Our route saving service is currently offline. Please try again later.");
        } else {
          throw new Error("Failed to save trip draft. Please review your details and try again.");
        }
      }

      const data = await res.json();
      // On success, redirect to the generated trip or success page
      router.push(`/trip/new?saved=true&tripId=${data.tripId}`);
    } catch (error) {
      setSaveError(error instanceof Error ? error.message : "Failed to save trip.");
      setIsSaving(false);
    }
  };

  const followUpPanel = followUpQuestions.length > 0 ? (
    <div className="bg-white/90 rounded-[var(--radius-glass,16px)] p-6 shadow-sm border border-[var(--color-border)] mt-4 space-y-6">
      <h3 className="font-serif text-xl text-[var(--color-ink)] mb-4">We need a few more details</h3>
      <div className="grid gap-6 sm:grid-cols-2">
        {followUpQuestions.map(q => (
          <Field
            key={q.id}
            label={q.label}
            description={q.question}
          >
            {({ id, ariaDescribedBy }) => (
              <ChipGroup
                id={id}
                describedBy={ariaDescribedBy}
                options={q.options.map(opt => ({ value: opt, label: opt }))}
                value={null}
                onChange={(val) => handleFollowUpAnswer(q, val)}
              />
            )}
          </Field>
        ))}
      </div>
      <div className="flex justify-end pt-2">
        <Button type="button" onClick={() => handleGenerate()} disabled={state === 'loading'}>
          Update Route
        </Button>
      </div>
    </div>
  ) : null;

  return (
    <div className="w-full flex flex-col gap-12 lg:gap-24 items-center">
      <div className="w-full max-w-4xl mx-auto space-y-8 text-center pt-12 lg:pt-20">
        <h1 className="rota-display text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-[var(--color-ink)]">
          No AI chat.<br className="hidden md:block" /> Just a calmer, better Portugal route.
        </h1>
        <p className="text-xl md:text-2xl text-[var(--color-muted-foreground)] max-w-2xl mx-auto font-serif">
          Tell us what you want to experience, and our cinematic concierge will structure a premium local itinerary.
        </p>
      </div>

      <div className="w-full relative z-10 px-[var(--spacing-gutter,24px)]">
        <PromptComposer
          state={state}
          promptValue={prompt}
          onPromptChange={setPrompt}
          onSubmit={handleGenerate}
          examplePrompts={EXAMPLE_PROMPTS}
          errorMessage={errorMessage}
          followUpPanel={followUpPanel}
        />
      </div>

      <AnimatePresence mode="wait">
        {candidate && (
          <m.div
            initial={reducedMotion ? { opacity: 1 } : { opacity: 0, y: 30 }}
            animate={reducedMotion ? { opacity: 1 } : { opacity: 1, y: 0 }}
            exit={reducedMotion ? { opacity: 0 } : { opacity: 0, y: -30 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="w-full px-[var(--spacing-gutter,24px)] pb-24"
          >
            <SectionTransition>
              <BriefConfirmation
                title="Your trip blueprint"
                description="We've structured your prompt into a concrete plan. Review the details below."
                actions={
                  <>
                    <button
                      type="button"
                      onClick={() => setCandidate(null)}
                      className="px-4 py-3 min-h-[44px] text-sm font-medium text-[var(--color-muted-foreground)] hover:text-[var(--color-ink)] transition-colors"
                      disabled={isSaving}
                    >
                      Start Over
                    </button>
                    <SubmitButton 
                      onClick={handleSaveTrip} 
                      loading={isSaving}
                      loadingLabel="Saving trip..."
                    >
                      Save Trip Draft
                    </SubmitButton>
                  </>
                }
              >
                {saveError && (
                  <div className="mb-6 rounded-[var(--radius-glass,16px)] bg-[var(--color-status-danger-bg)] p-4 text-[var(--color-status-danger-fg)] border border-[var(--color-status-danger-border)]" role="alert">
                    <p className="text-sm font-medium">{saveError}</p>
                  </div>
                )}
                <div className="grid sm:grid-cols-2 gap-x-12">
                  <div>
                    <BriefField label="Regions" value={candidate.regions.join(", ")} />
                    <BriefField label="Duration" value={`${candidate.tripLengthDays} days`} />
                    <BriefField label="Pace" value={candidate.pace} />
                    <BriefField label="Budget" value={candidate.budgetLevel} />
                  </div>
                  <div>
                    <BriefField label="Travelers" value={`${candidate.travelersCount} (${candidate.travelerType})`} />
                    <BriefField label="Interests" value={candidate.interests.join(", ")} />
                    <BriefField label="Transport" value={candidate.transportMode.replace("-", " ")} />
                  </div>
                </div>
              </BriefConfirmation>
            </SectionTransition>
          </m.div>
        )}
      </AnimatePresence>
    </div>
  );
}
