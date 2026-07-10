"use client";

import { useRef } from "react";

export type PhraseChoiceRailProps = {
  options: readonly string[];
  selected?: string;
  onSelect: (value: string) => void;
  onEscape?: () => void;
};

export function PhraseChoiceRail({ options, selected, onSelect, onEscape }: PhraseChoiceRailProps) {
  const buttons = useRef<Array<HTMLButtonElement | null>>([]);

  function moveFocus(index: number, delta: number) {
    const nextIndex = (index + delta + options.length) % options.length;
    buttons.current[nextIndex]?.focus();
  }

  return (
    <div aria-label="Choose a phrase" className="flex flex-wrap gap-2" role="group">
      {options.map((option, index) => (
        <button
          key={option}
          ref={(element) => { buttons.current[index] = element; }}
          aria-pressed={option === selected}
          className="min-h-11 rounded-full border border-[var(--color-border)] bg-[var(--color-surface)] px-4 text-sm text-[var(--color-foreground)] transition-colors hover:border-[var(--color-ochre-on-light)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-ochre-light)]"
          onClick={() => onSelect(option)}
          onKeyDown={(event) => {
            if (event.key === "ArrowRight" || event.key === "ArrowDown") {
              event.preventDefault();
              moveFocus(index, 1);
            }
            if (event.key === "ArrowLeft" || event.key === "ArrowUp") {
              event.preventDefault();
              moveFocus(index, -1);
            }
            if (event.key === "Escape") {
              event.preventDefault();
              onEscape?.();
            }
            if (event.key === "Enter" || event.key === " ") {
              event.preventDefault();
              onSelect(option);
            }
          }}
          tabIndex={option === selected || (!selected && index === 0) ? 0 : -1}
          type="button"
        >
          {option}
        </button>
      ))}
    </div>
  );
}
