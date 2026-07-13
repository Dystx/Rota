"use client";

import { useRef, useState } from "react";

import { PhraseChoiceRail } from "./phrase-choice-rail";

export type AcceptedPhraseProps = {
  label: string;
  value: string;
  options: readonly string[];
  onAccept: (value: string) => void;
  onClear: () => void;
  tone?: "default" | "inverse";
};

export function AcceptedPhrase({ label, value, options, onAccept, onClear, tone = "default" }: AcceptedPhraseProps) {
  const [isChoosing, setIsChoosing] = useState(false);
  const phraseButton = useRef<HTMLButtonElement>(null);
  const isInverse = tone === "inverse";

  function close() {
    phraseButton.current?.focus();
    setIsChoosing(false);
  }

  return (
    <span className="inline-flex flex-wrap items-center gap-2">
      <button
        ref={phraseButton}
        aria-expanded={isChoosing}
        aria-label={`${label}, ${value}`}
        className={`rounded-none border-b border-[var(--color-ochre-on-light)] bg-transparent px-0 py-1 font-medium decoration-1 underline-offset-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-ochre-light)] ${isInverse ? "text-[var(--color-paper)] hover:text-[var(--color-ochre-light)]" : "text-[var(--color-foreground)] hover:text-[var(--color-ochre-on-light)]"}`}
        onClick={() => setIsChoosing((open) => !open)}
        type="button"
      >
        {value}
      </button>
      <button aria-label={`Clear ${label}`} className={`min-h-11 min-w-11 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-ochre-light)] ${isInverse ? "text-[var(--color-paper)] hover:text-[var(--color-ochre-light)]" : "text-[var(--color-muted-foreground)] hover:text-[var(--color-foreground)]"}`} onClick={onClear} type="button">×</button>
      {isChoosing ? (
        <PhraseChoiceRail
          options={options}
          selected={value}
          onEscape={close}
          onSelect={(nextValue) => {
            onAccept(nextValue);
            close();
          }}
        />
      ) : null}
    </span>
  );
}
