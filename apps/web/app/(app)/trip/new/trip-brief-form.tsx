"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  TripBriefSchema,
  budgetLevels,
  foodPreferenceOptions,
  interestOptions,
  paceOptions,
  portugalRegions,
  transportModes,
  travelerTypes,
  type TripBrief,
  avoidanceOptions
} from "@repo/types";
import { Button, Card, CardContent, CardHeader, CardTitle } from "@repo/ui";

type FormState = {
  destinationCountry: "portugal";
  regions: string[];
  tripLengthDays: string;
  startDate: string;
  endDate: string;
  travelersCount: string;
  travelerType: string;
  budgetLevel: string;
  pace: string;
  interests: string[];
  foodPreferences: string[];
  avoidances: string[];
  transportMode: string;
  accommodationLocation: string;
  rawBrief: string;
};

type FieldErrors = Partial<Record<keyof FormState, string>>;

const initialState: FormState = {
  destinationCountry: "portugal",
  regions: ["porto", "douro-valley"],
  tripLengthDays: "5",
  startDate: "",
  endDate: "",
  travelersCount: "2",
  travelerType: "couple",
  budgetLevel: "mid-range",
  pace: "calm",
  interests: ["local-food", "old-streets", "sea-views"],
  foodPreferences: ["casual-local-meals"],
  avoidances: ["rushed-schedules"],
  transportMode: "train-and-transfers",
  accommodationLocation: "Porto historic center or riverside",
  rawBrief:
    "We want a calm five-day Portugal trip with local food, old streets, sea views, and enough buffer time to avoid feeling rushed."
};

const labels: Record<string, string> = {
  portugal: "Portugal",
  "douro-valley": "Douro Valley",
  "mid-range": "Mid-range",
  "local-food": "Local food",
  "old-streets": "Old streets",
  "sea-views": "Sea views",
  "design-and-architecture": "Design + architecture",
  "family-friendly": "Family-friendly",
  "hidden-gems": "Hidden gems",
  "special-dinner": "One special dinner",
  "casual-local-meals": "Casual local meals",
  "vegetarian-friendly": "Vegetarian-friendly",
  "tourist-heavy-stops": "Tourist-heavy stops",
  "rushed-schedules": "Rushed schedules",
  "long-drives": "Long drives",
  "stairs-and-steep-walks": "Stairs and steep walks",
  "late-nights": "Late nights",
  "no-car": "No car",
  "rental-car": "Rental car",
  "train-and-transfers": "Train + transfers"
};

function prettify(value: string) {
  return labels[value] ?? value.replace(/-/g, " ");
}

function normalizeErrors(issues: FieldErrors) {
  return Object.values(issues).filter(Boolean).length;
}

export function TripBriefForm() {
  const router = useRouter();
  const [form, setForm] = useState<FormState>(initialState);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [validatedBrief, setValidatedBrief] = useState<TripBrief | null>(null);
  const [submitMessage, setSubmitMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  function updateValue<Key extends keyof FormState>(key: Key, value: FormState[Key]) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  function toggleArrayValue(key: "regions" | "interests" | "foodPreferences" | "avoidances", value: string) {
    setForm((current) => {
      const currentValues = current[key];
      const nextValues = currentValues.includes(value)
        ? currentValues.filter((item) => item !== value)
        : [...currentValues, value];

      return { ...current, [key]: nextValues };
    });
  }

  async function handleSubmit(event?: React.FormEvent<HTMLFormElement>) {
    event?.preventDefault();
    setSubmitMessage("");

    const result = TripBriefSchema.safeParse(form);

    if (!result.success) {
      const nextErrors: FieldErrors = {};

      for (const [key, messages] of Object.entries(result.error.flatten().fieldErrors)) {
        const message = messages?.[0];

        if (message) {
          nextErrors[key as keyof FormState] = message;
        }
      }

      setErrors(nextErrors);
      setValidatedBrief(null);
      return;
    }

    setErrors({});
    setValidatedBrief(result.data);

    setIsSubmitting(true);

    try {
      const response = await fetch("/api/trips", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(result.data)
      });

      const payload = (await response.json()) as {
        error?: { message?: string };
        message?: string;
        tripId?: string;
        errors?: Record<string, string[]>;
      };

      if (!response.ok) {
        if (payload.errors) {
          const nextErrors: FieldErrors = {};

          for (const [key, messages] of Object.entries(payload.errors)) {
            const message = messages?.[0];

            if (message) {
              nextErrors[key as keyof FormState] = message;
            }
          }

          setErrors(nextErrors);
        }

        setSubmitMessage(payload.error?.message ?? payload.message ?? "Could not save the trip brief yet.");
        return;
      }

      setSubmitMessage("Trip brief saved. Opening the draft route…");

      if (payload.tripId) {
        router.push(`/trip/${payload.tripId}`);
      }
    } catch {
      setSubmitMessage("The draft trip request failed before the server responded.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="grid gap-10">
      <Card className="rota-glass-panel shadow-sm">
        <CardHeader className="pb-4">
          <CardTitle>Trip requirements</CardTitle>
          <p className="rota-muted text-sm mt-2">
            Let's structure your raw ideas. Be as specific as you can—our engine handles the logistics.
          </p>
        </CardHeader>
        <CardContent>
          <form className="grid gap-8" onSubmit={(event) => void handleSubmit(event)}>
            <section className="grid gap-5 md:grid-cols-2">
              <div className="rota-form-field md:col-span-2">
                <label htmlFor="destinationCountry" className="rota-form-label">
                  Destination country
                </label>
                <select
                  id="destinationCountry"
                  className="rota-form-input"
                  value={form.destinationCountry}
                  onChange={(event) => updateValue("destinationCountry", event.target.value as "portugal")}
                >
                  <option value="portugal">Portugal</option>
                </select>
              </div>

              <div className="rota-form-field">
                <label htmlFor="tripLengthDays" className="rota-form-label">
                  Trip length (days)
                </label>
                <input
                  id="tripLengthDays"
                  type="number"
                  min={2}
                  max={21}
                  className="rota-form-input"
                  value={form.tripLengthDays}
                  onChange={(event) => updateValue("tripLengthDays", event.target.value)}
                />
                <p className="rota-form-hint">Even without exact dates, how long is the trip?</p>
                {errors.tripLengthDays ? <p className="rota-form-error">{errors.tripLengthDays}</p> : null}
              </div>

              <div className="rota-form-field">
                <label htmlFor="travelersCount" className="rota-form-label">
                  Number of travelers
                </label>
                <input
                  id="travelersCount"
                  type="number"
                  min={1}
                  max={12}
                  className="rota-form-input"
                  value={form.travelersCount}
                  onChange={(event) => updateValue("travelersCount", event.target.value)}
                />
                {errors.travelersCount ? <p className="rota-form-error">{errors.travelersCount}</p> : null}
              </div>

              <div className="rota-form-field">
                <label htmlFor="startDate" className="rota-form-label">
                  Start date <span className="opacity-60">(optional)</span>
                </label>
                <input
                  id="startDate"
                  type="date"
                  className="rota-form-input"
                  value={form.startDate}
                  onChange={(event) => updateValue("startDate", event.target.value)}
                />
                {errors.startDate ? <p className="rota-form-error">{errors.startDate}</p> : null}
              </div>

              <div className="rota-form-field">
                <label htmlFor="endDate" className="rota-form-label">
                  End date <span className="opacity-60">(optional)</span>
                </label>
                <input
                  id="endDate"
                  type="date"
                  className="rota-form-input"
                  value={form.endDate}
                  onChange={(event) => updateValue("endDate", event.target.value)}
                />
                {errors.endDate ? <p className="rota-form-error">{errors.endDate}</p> : null}
              </div>
            </section>

            <div className="h-px bg-gradient-to-r from-transparent via-[var(--color-border)] to-transparent opacity-60" />

            <section className="grid gap-5 md:grid-cols-2">
              <SelectField
                label="Traveler type"
                value={form.travelerType}
                options={travelerTypes}
                onChange={(value) => updateValue("travelerType", value)}
              />
              <SelectField
                label="Budget level"
                value={form.budgetLevel}
                options={budgetLevels}
                onChange={(value) => updateValue("budgetLevel", value)}
              />
              <SelectField
                label="Pace"
                value={form.pace}
                options={paceOptions}
                onChange={(value) => updateValue("pace", value)}
              />
              <SelectField
                label="Transport mode"
                value={form.transportMode}
                options={transportModes}
                onChange={(value) => updateValue("transportMode", value)}
              />
            </section>

            <div className="h-px bg-gradient-to-r from-transparent via-[var(--color-border)] to-transparent opacity-60" />

            <CheckboxGroup
              label="Regions & Cities"
              description="Where are you thinking of going? We can refine this later."
              options={portugalRegions}
              selected={form.regions}
              onToggle={(value) => toggleArrayValue("regions", value)}
              error={errors.regions}
            />

            <CheckboxGroup
              label="Interests"
              description="What makes a trip memorable for you?"
              options={interestOptions}
              selected={form.interests}
              onToggle={(value) => toggleArrayValue("interests", value)}
              error={errors.interests}
            />

            <div className="grid gap-8 lg:grid-cols-2">
              <CheckboxGroup
                label="Food preferences"
                options={foodPreferenceOptions}
                selected={form.foodPreferences}
                onToggle={(value) => toggleArrayValue("foodPreferences", value)}
                error={errors.foodPreferences}
              />
              <CheckboxGroup
                label="Avoidances"
                options={avoidanceOptions}
                selected={form.avoidances}
                onToggle={(value) => toggleArrayValue("avoidances", value)}
                error={errors.avoidances}
              />
            </div>

            <div className="h-px bg-gradient-to-r from-transparent via-[var(--color-border)] to-transparent opacity-60" />

            <div className="grid gap-6 md:grid-cols-[1fr_2fr]">
              <div className="rota-form-field">
                <label htmlFor="accommodationLocation" className="rota-form-label">
                  Base location <span className="opacity-60">(optional)</span>
                </label>
                <input
                  id="accommodationLocation"
                  type="text"
                  className="rota-form-input"
                  placeholder="e.g. Near the river in Porto"
                  value={form.accommodationLocation}
                  onChange={(event) => updateValue("accommodationLocation", event.target.value)}
                />
                {errors.accommodationLocation ? (
                  <p className="rota-form-error">{errors.accommodationLocation}</p>
                ) : null}
              </div>
              <div className="rota-form-field">
                <label htmlFor="rawBrief" className="rota-form-label">
                  Additional context
                </label>
                <textarea
                  id="rawBrief"
                  rows={4}
                  className="rota-form-input rota-form-textarea"
                  placeholder="Any other details? E.g., 'We have a morning flight out of Lisbon on the last day.'"
                  value={form.rawBrief}
                  onChange={(event) => updateValue("rawBrief", event.target.value)}
                />
                {errors.rawBrief ? <p className="rota-form-error">{errors.rawBrief}</p> : null}
              </div>
            </div>

            <div className="flex items-center justify-between gap-4 border-t border-[var(--color-border)] pt-8 mt-4">
              <p className="rota-muted text-sm font-medium">
                {normalizeErrors(errors) > 0
                  ? `${normalizeErrors(errors)} field${normalizeErrors(errors) > 1 ? "s" : ""} need attention.`
                  : submitMessage || "Ready for audit."}
              </p>
              <Button type="submit" disabled={isSubmitting} className="min-w-[160px]">
                {isSubmitting ? "Auditing..." : "Audit & Polish Plan"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {validatedBrief && (
        <Card className="bg-[var(--color-ink-soft)] border-none text-[var(--color-surface)] shadow-2xl">
          <CardHeader className="pb-4">
            <CardTitle className="text-white">Payload Ready</CardTitle>
            <p className="text-white/60 text-sm">
              This structured brief has been validated against our plan schema.
            </p>
          </CardHeader>
          <CardContent>
            <pre className="rota-json-preview bg-black/40 border border-white/10 text-emerald-200/90">{JSON.stringify(validatedBrief, null, 2)}</pre>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function SelectField({
  label,
  value,
  options,
  onChange
}: {
  label: string;
  value: string;
  options: readonly string[];
  onChange: (value: string) => void;
}) {
  const id = `select-${label.toLowerCase().replace(/\s+/g, "-")}`;
  return (
    <div className="rota-form-field">
      <label htmlFor={id} className="rota-form-label">{label}</label>
      <select id={id} className="rota-form-input" value={value} onChange={(event) => onChange(event.target.value)}>
        {options.map((option) => (
          <option key={option} value={option}>
            {prettify(option)}
          </option>
        ))}
      </select>
    </div>
  );
}

function CheckboxGroup({
  label,
  description,
  options,
  selected,
  onToggle,
  error
}: {
  label: string;
  description?: string;
  options: readonly string[];
  selected: string[];
  onToggle: (value: string) => void;
  error?: string;
}) {
  return (
    <fieldset className="rota-form-field">
      <legend className="rota-form-label">{label}</legend>
      {description ? <p className="rota-form-hint">{description}</p> : null}
      <div className="grid gap-3 pt-1 sm:grid-cols-2 xl:grid-cols-3">
        {options.map((option) => {
          const isSelected = selected.includes(option);

          return (
            <label key={option} className={`rota-check-card${isSelected ? " rota-check-card--active" : ""}`}>
              <input
                type="checkbox"
                className="sr-only"
                checked={isSelected}
                onChange={() => onToggle(option)}
              />
              <span>{prettify(option)}</span>
            </label>
          );
        })}
      </div>
      {error ? <p className="rota-form-error">{error}</p> : null}
    </fieldset>
  );
}
