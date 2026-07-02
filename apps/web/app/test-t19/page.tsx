"use client";

import { useState, type JSX } from "react";
import {
  ChipGroup,
  Field,
  FieldError,
  Input,
  Select,
  SubmitButton,
  Textarea,
  type ChipOption
} from "@repo/ui";

type Pace = "calm" | "balanced" | "full";
type Budget = "budget" | "mid-range" | "premium";
type Interest = "local-food" | "old-streets" | "sea-views" | "wine";

const paceOptions: ChipOption<Pace>[] = [
  { value: "calm", label: "Calm" },
  { value: "balanced", label: "Balanced" },
  { value: "full", label: "Full" }
];

const interestOptions: ChipOption<Interest>[] = [
  { value: "local-food", label: "Local food" },
  { value: "old-streets", label: "Old streets" },
  { value: "sea-views", label: "Sea views" },
  { value: "wine", label: "Wine" }
];

interface FormState {
  prompt: string;
  email: string;
  region: string;
  pace: Pace | null;
  budget: Budget | "";
  interests: Interest[];
}

interface FormErrors {
  prompt?: string;
  email?: string;
  region?: string;
  pace?: string;
  budget?: string;
}

const initial: FormState = {
  prompt: "",
  email: "",
  region: "",
  pace: null,
  budget: "",
  interests: []
};

export default function TestT19Page() {
  const [state, setState] = useState<FormState>(initial);
  const [errors, setErrors] = useState<FormErrors>({});
  const [submitting, setSubmitting] = useState(false);
  const [submittedSummary, setSubmittedSummary] = useState<string | null>(null);

  function validate(s: FormState): FormErrors {
    const e: FormErrors = {};
    if (!s.prompt.trim()) e.prompt = "Tell us a bit about your trip.";
    if (!s.email.trim()) e.email = "Email is required.";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s.email)) e.email = "Enter a valid email.";
    if (!s.region) e.region = "Pick a region.";
    if (!s.pace) e.pace = "Choose a pace.";
    if (!s.budget) e.budget = "Choose a budget level.";
    return e;
  }

  type SubmitHandler = NonNullable<JSX.IntrinsicElements["form"]["onSubmit"]>;
  const handleSubmit: SubmitHandler = (event) => {
    event.preventDefault();
    const next = validate(state);
    setErrors(next);
    if (Object.keys(next).length > 0) return;
    setSubmitting(true);
    window.setTimeout(() => {
      setSubmitting(false);
      setSubmittedSummary(
        `Brief saved: ${state.region} · ${state.pace} · ${state.budget} · ${state.interests.length} interests`
      );
    }, 600);
  };

  return (
    <main className="mx-auto max-w-2xl px-6 py-12">
      <h1 className="text-2xl font-semibold text-[var(--color-ink)]">T19 form primitives demo</h1>
      <p className="mt-2 text-sm text-[var(--color-muted-foreground)]">
        Exercises Field, Input, Textarea, Select, ChipGroup (single + multi), and SubmitButton with
        accessible inline validation.
      </p>

      <form onSubmit={handleSubmit} className="mt-8 flex flex-col gap-6" noValidate>
        <Field
          label="Trip prompt"
          description="Describe what you imagine."
          required
          error={errors.prompt}
        >
          {({ id, ariaDescribedBy, invalid }) => (
            <Textarea
              id={id}
              aria-describedby={ariaDescribedBy}
              invalid={invalid}
              rows={3}
              value={state.prompt}
              onChange={(e) => setState((p) => ({ ...p, prompt: e.target.value }))}
            />
          )}
        </Field>

        <Field label="Email" required error={errors.email}>
          {({ id, ariaDescribedBy, invalid }) => (
            <Input
              id={id}
              type="email"
              aria-describedby={ariaDescribedBy}
              invalid={invalid}
              value={state.email}
              onChange={(e) => setState((p) => ({ ...p, email: e.target.value }))}
            />
          )}
        </Field>

        <Field label="Region" required error={errors.region}>
          {({ id, ariaDescribedBy, invalid }) => (
            <Select
              id={id}
              aria-describedby={ariaDescribedBy}
              invalid={invalid}
              value={state.region}
              onChange={(e) => setState((p) => ({ ...p, region: e.target.value }))}
            >
              <option value="">Select a region…</option>
              <option value="porto">Porto</option>
              <option value="douro-valley">Douro Valley</option>
              <option value="lisbon">Lisbon</option>
              <option value="sintra">Sintra</option>
              <option value="alentejo">Alentejo</option>
            </Select>
          )}
        </Field>

        <Field label="Pace" required error={errors.pace}>
          {({ ariaDescribedBy, invalid }) => (
            <ChipGroup
              ariaLabel="Pace"
              describedBy={ariaDescribedBy}
              invalid={invalid}
              options={paceOptions}
              value={state.pace}
              onChange={(next) => setState((p) => ({ ...p, pace: next }))}
            />
          )}
        </Field>

        <Field label="Budget" required error={errors.budget}>
          {({ id, ariaDescribedBy, invalid }) => (
            <Select
              id={id}
              aria-describedby={ariaDescribedBy}
              invalid={invalid}
              value={state.budget}
              onChange={(e) =>
                setState((p) => ({ ...p, budget: e.target.value as Budget | "" }))
              }
            >
              <option value="">Select a budget…</option>
              <option value="budget">Budget</option>
              <option value="mid-range">Mid-range</option>
              <option value="premium">Premium</option>
            </Select>
          )}
        </Field>

        <Field label="Interests" description="Pick any that apply.">
          {({ ariaDescribedBy }) => (
            <ChipGroup
              multiple
              ariaLabel="Interests"
              describedBy={ariaDescribedBy}
              options={interestOptions}
              value={state.interests}
              onChange={(next) => setState((p) => ({ ...p, interests: next }))}
            />
          )}
        </Field>

        <div className="flex items-center gap-4">
          <SubmitButton loading={submitting}>Save brief</SubmitButton>
          {submittedSummary ? (
            <span className="text-sm text-[var(--color-muted-foreground)]">{submittedSummary}</span>
          ) : null}
        </div>

        {Object.keys(errors).length > 0 ? (
          <FieldError>Please fix the highlighted fields.</FieldError>
        ) : null}
      </form>
    </main>
  );
}
