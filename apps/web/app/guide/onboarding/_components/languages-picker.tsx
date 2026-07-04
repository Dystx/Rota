"use client";

/**
 * Languages picker for the specialist onboarding form.
 *
 * The DB stores languages as `specialist_capabilities`
 * rows with `type='language'` and a closed-enum `value`
 * (pt, en, es, fr, it, de — enforced by the migration
 * CHECK). The picker is a checkbox grid of the six
 * allowed values; the friendly labels come from
 * `specialistLanguageLabels` so a non-engineer sees
 * "Portuguese" instead of "pt".
 *
 * Single source of truth for the allowed set:
 * `specialistLanguages` from `@repo/types`. A future
 * expansion (e.g. add "ja") is one line in
 * `packages/types/src/trip-brief.ts` and the CHECK
 * constraint in the migration; this picker picks up
 * the new option automatically.
 */

import * as React from "react";
import {
  specialistLanguages,
  specialistLanguageLabels,
  type SpecialistLanguage
} from "@repo/types";

type Props = {
  value: readonly string[];
  onChange: (next: string[]) => void;
  disabled?: boolean;
};

export function LanguagesPicker({ value, onChange, disabled = false }: Props) {
  const groupId = React.useId();
  const helpId = `${groupId}-help`;
  const selected = new Set<SpecialistLanguage>(
    value.filter((v): v is SpecialistLanguage =>
      (specialistLanguages as readonly string[]).includes(v)
    )
  );

  function toggle(lang: SpecialistLanguage) {
    const next = new Set(selected);
    if (next.has(lang)) {
      next.delete(lang);
    } else {
      next.add(lang);
    }
    onChange([...next]);
  }

  return (
    <fieldset
      className="grid gap-2"
      data-testid="languages-picker"
      disabled={disabled}
    >
      <legend className="text-sm font-medium text-foreground">
        Languages you consult or guide in
      </legend>
      <p id={helpId} className="text-xs text-[var(--color-muted-foreground)]">
        Pick all that apply. Tier 3 dispatch routes on language match.
      </p>
      <div
        role="group"
        aria-describedby={helpId}
        className="grid grid-cols-2 gap-2 sm:grid-cols-3"
        data-testid="languages-picker-grid"
      >
        {specialistLanguages.map((lang) => {
          const inputId = `${groupId}-${lang}`;
          const checked = selected.has(lang);
          return (
            <label
              key={lang}
              htmlFor={inputId}
              className="flex cursor-pointer items-center gap-2 rounded-lg border border-[var(--color-border)] bg-white/80 px-3 py-2 text-sm text-foreground hover:bg-white has-[:focus-visible]:outline-none has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-ochre-light"
            >
              <input
                id={inputId}
                type="checkbox"
                checked={checked}
                disabled={disabled}
                onChange={() => toggle(lang)}
                className="h-4 w-4 rounded border-[var(--color-border)] accent-[var(--color-accent)]"
                data-testid={`languages-picker-${lang}`}
              />
              <span>{specialistLanguageLabels[lang]}</span>
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}
