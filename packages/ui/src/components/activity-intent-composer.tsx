"use client";

import { useState } from "react";

import { AcceptedPhrase } from "./accepted-phrase";

export type ActivityIntentDraft = {
  timeWindow: string;
  region: string;
  moods: readonly string[];
  group: string;
  constraints: readonly string[];
  customContext: string;
};

export type ActivityIntentComposerProps = {
  initial?: Partial<ActivityIntentDraft>;
  onSubmit: (draft: ActivityIntentDraft) => void;
};

const TIME_OPTIONS = ["three hours", "an afternoon", "a full day", "a rainy afternoon"] as const;
const REGION_OPTIONS = ["Porto", "Lisbon", "Douro", "The Algarve", "The Azores"] as const;
const MOOD_OPTIONS = ["good food", "a walk", "culture", "quiet time", "something with children"] as const;
const GROUP_OPTIONS = ["two adults", "my family", "just me", "friends"] as const;

const DEFAULT_DRAFT: ActivityIntentDraft = {
  timeWindow: "an afternoon",
  region: "Porto",
  moods: ["good food"],
  group: "two adults",
  constraints: [],
  customContext: ""
};

function display(value: string, fallback: string): string {
  return value || fallback;
}

export function ActivityIntentComposer({ initial, onSubmit }: ActivityIntentComposerProps) {
  const [draft, setDraft] = useState<ActivityIntentDraft>({ ...DEFAULT_DRAFT, ...initial });
  const [isDetailOpen, setIsDetailOpen] = useState(Boolean(initial?.customContext));
  const mood = draft.moods[0] ?? "";

  function patch(next: Partial<ActivityIntentDraft>) {
    setDraft((current) => ({ ...current, ...next }));
  }

  return (
    <div className="max-w-3xl text-center text-xl leading-relaxed text-linen-dark md:text-2xl">
      <div aria-label="Describe your activity situation" role="group">
        I have{" "}
        <AcceptedPhrase
          label="Time available"
          value={display(draft.timeWindow, "choose a time")}
          options={TIME_OPTIONS}
          onAccept={(timeWindow) => patch({ timeWindow })}
          onClear={() => patch({ timeWindow: "" })}
        />{" "}
        in{" "}
        <AcceptedPhrase
          label="Region"
          value={display(draft.region, "choose a region")}
          options={REGION_OPTIONS}
          onAccept={(region) => patch({ region })}
          onClear={() => patch({ region: "" })}
        />{" "}
        and want{" "}
        <AcceptedPhrase
          label="Mood"
          value={display(mood, "choose a feeling")}
          options={MOOD_OPTIONS}
          onAccept={(nextMood) => patch({ moods: [nextMood] })}
          onClear={() => patch({ moods: [] })}
        />{" "}
        with{" "}
        <AcceptedPhrase
          label="Who is going"
          value={display(draft.group, "choose who")}
          options={GROUP_OPTIONS}
          onAccept={(group) => patch({ group })}
          onClear={() => patch({ group: "" })}
        />.
      </div>

      {isDetailOpen ? (
        <div className="mx-auto mt-5 max-w-xl text-left">
          <label className="sr-only" htmlFor="activity-intent-detail">A detail about this day</label>
          <input
            id="activity-intent-detail"
            className="w-full border-b border-ochre-light bg-transparent px-1 py-3 text-base text-linen-dark placeholder:text-linen-dark/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ochre-light"
            value={draft.customContext}
            onChange={(event) => patch({ customContext: event.target.value })}
            placeholder="Add a detail, if it changes the decision"
          />
          <button
            className="mt-2 min-h-11 px-2 text-sm text-ochre-light focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ochre-light"
            type="button"
            onClick={() => {
              patch({ customContext: "" });
              setIsDetailOpen(false);
            }}
          >
            Remove detail
          </button>
        </div>
      ) : (
        <button
          className="mt-4 min-h-11 px-2 text-sm text-linen-dark/85 underline decoration-ochre-light underline-offset-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ochre-light"
          type="button"
          onClick={() => setIsDetailOpen(true)}
        >
          Add a detail
        </button>
      )}

      <button
        className="mt-6 border-b border-ochre-light px-1 py-3 font-medium text-ochre-light hover:text-linen-dark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ochre-light"
        type="button"
        onClick={() => onSubmit(draft)}
      >
        Show me what is worth doing
      </button>
    </div>
  );
}
