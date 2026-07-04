"use client";

/**
 * Skills chip input for the specialist onboarding form.
 *
 * The DB stores skills as `specialist_capabilities` rows
 * with `type='skill'` and a free-text `value` (1-80 chars,
 * enforced by the migration CHECK). The form presents the
 * values as chips: a text input + "Add" button appends a
 * new chip, the X on each chip removes it.
 *
 * Validation lives at the input boundary (trim, dedupe,
 * length cap) so the form never sends a value that would
 * fail at the DB layer. The server action's zod schema is
 * a backstop but this catches it before the round-trip.
 *
 * No async, no network — the value is plain local state
 * that the parent form passes to the server action on
 * submit.
 */

import * as React from "react";

const MAX_SKILL_LENGTH = 80;
const MAX_SKILLS = 20;

type Props = {
  value: readonly string[];
  onChange: (next: string[]) => void;
  disabled?: boolean;
};

export function SkillsInput({ value, onChange, disabled = false }: Props) {
  const [draft, setDraft] = React.useState("");
  const [error, setError] = React.useState<string | null>(null);
  const groupId = React.useId();

  function commitDraft() {
    const trimmed = draft.trim();
    if (trimmed.length === 0) {
      setDraft("");
      setError(null);
      return;
    }
    if (trimmed.length > MAX_SKILL_LENGTH) {
      setError(`Skills must be ${MAX_SKILL_LENGTH} characters or fewer`);
      return;
    }
    if (value.length >= MAX_SKILLS) {
      setError(`Pick at most ${MAX_SKILLS} skills`);
      return;
    }
    if (value.some((s) => s.toLowerCase() === trimmed.toLowerCase())) {
      setError("You already have that skill");
      return;
    }
    onChange([...value, trimmed]);
    setDraft("");
    setError(null);
  }

  function remove(skill: string) {
    onChange(value.filter((s) => s !== skill));
  }

  function onKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Enter" || event.key === ",") {
      event.preventDefault();
      commitDraft();
    }
  }

  return (
    <div className="grid gap-2" data-testid="skills-input">
      <label
        htmlFor={`${groupId}-draft`}
        className="text-sm font-medium text-foreground"
      >
        Skills (specialties)
      </label>
      <p
        id={`${groupId}-help`}
        className="text-xs text-[var(--color-muted-foreground)]"
      >
        Add up to {MAX_SKILLS} skills. Press Enter or comma to add a chip.
        Examples: "Sintra Expert", "Wine Tours", "Family-friendly pacing".
      </p>
      <div className="flex gap-2">
        <input
          id={`${groupId}-draft`}
          type="text"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={onKeyDown}
          disabled={disabled}
          maxLength={MAX_SKILL_LENGTH}
          placeholder="Type a skill and press Enter"
          aria-describedby={`${groupId}-help`}
          className="flex-1 rounded-lg border border-[var(--color-border)] bg-white/80 px-3 py-2 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ochre-light"
          data-testid="skills-input-draft"
        />
        <button
          type="button"
          onClick={commitDraft}
          disabled={disabled || draft.trim().length === 0}
          className="rounded-lg border border-[var(--color-border)] bg-white/80 px-3 py-2 text-sm font-medium text-foreground hover:bg-white disabled:opacity-50"
          data-testid="skills-input-add"
        >
          Add
        </button>
      </div>
      {error ? (
        <p
          className="text-xs text-error"
          role="alert"
          data-testid="skills-input-error"
        >
          {error}
        </p>
      ) : null}
      {value.length > 0 ? (
        <ul
          className="flex flex-wrap gap-2"
          data-testid="skills-input-chips"
          aria-label="Selected skills"
        >
          {value.map((skill) => (
            <li
              key={skill}
              className="inline-flex items-center gap-1.5 rounded-full border border-[var(--color-border)] bg-white/80 px-3 py-1.5 text-xs text-foreground"
            >
              <span>{skill}</span>
              <button
                type="button"
                onClick={() => remove(skill)}
                disabled={disabled}
                aria-label={`Remove skill ${skill}`}
                className="rounded-full p-0.5 text-[var(--color-muted-foreground)] hover:bg-[var(--color-surface-muted)] disabled:opacity-50"
                data-testid={`skills-input-remove-${slugify(skill)}`}
              >
                ×
              </button>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}

function slugify(s: string): string {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}
