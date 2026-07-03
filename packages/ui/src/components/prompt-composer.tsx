'use client';

import { type ReactNode, type HTMLAttributes, useState, useEffect } from 'react';
import { m, AnimatePresence } from 'motion/react';
import { useReducedMotion } from '../hooks/use-reduced-motion';
import { cn } from '../lib/cn';
import { Button } from './button';

export type PromptComposerState = 'idle' | 'loading' | 'follow-up' | 'error';

export interface PromptComposerProps extends Omit<HTMLAttributes<HTMLDivElement>, 'onSubmit'> {
  state?: PromptComposerState;
  promptValue: string;
  onPromptChange: (val: string) => void;
  onSubmit: () => void;
  examplePrompts?: string[];
  errorMessage?: string;
  loadingStages?: string[];
  followUpPanel?: ReactNode;
}

const defaultLoadingStages = [
  "reading your route...",
  "matching regions...",
  "checking pacing...",
  "drafting route..."
];

export function PromptComposer({
  state = 'idle',
  promptValue,
  onPromptChange,
  onSubmit,
  examplePrompts = [],
  errorMessage = "Something went wrong. Please try again.",
  loadingStages = defaultLoadingStages,
  followUpPanel,
  className,
  ...props
}: PromptComposerProps) {
  const reducedMotion = useReducedMotion();
  const [currentStageIndex, setCurrentStageIndex] = useState(0);

  useEffect(() => {
    if (state === 'loading') {
      const interval = setInterval(() => {
        setCurrentStageIndex((prev) => (prev + 1) % loadingStages.length);
      }, 1500);
      return () => clearInterval(interval);
    } else {
      setCurrentStageIndex(0);
    }
  }, [state, loadingStages.length]);

  const isLoading = state === 'loading';
  const isFollowUp = state === 'follow-up';

  return (
    <div className={cn("w-full max-w-4xl mx-auto space-y-6", className)} {...props}>
      <div className="relative rounded-[32px] border border-[var(--color-border)] bg-white/80 p-6 md:p-8 shadow-[0_8px_32px_rgba(24,28,28,0.04)] backdrop-blur-2xl transition-shadow focus-within:shadow-[0_16px_48px_rgba(24,28,28,0.08)]">
        
        {state === 'error' && (
          <div className="mb-6 rounded-xl bg-red-50/50 p-4 text-red-900 border border-red-100/50" role="alert">
            <p className="text-sm font-medium">{errorMessage}</p>
          </div>
        )}

        <textarea
          aria-label="Trip prompt"
          value={promptValue}
          onChange={(e) => onPromptChange(e.target.value)}
          disabled={isLoading || isFollowUp}
          placeholder="Where to? (e.g. A 7-day relaxing food tour in the Douro Valley...)"
          className="w-full resize-none bg-transparent text-xl md:text-2xl leading-relaxed text-[var(--color-ink)] placeholder:text-[var(--color-muted-foreground)] focus:outline-none min-h-[160px] disabled:opacity-50"
        />

        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mt-4">
          <div className="flex flex-wrap gap-2 flex-1" role="group" aria-label="Example prompts">
            {!isLoading && !isFollowUp && examplePrompts.map((ex, i) => (
              <button
                key={i}
                type="button"
                onClick={() => onPromptChange(ex)}
                aria-label={ex}
                title={ex}
                className="text-xs px-4 py-2 min-h-[44px] rounded-full border border-[var(--color-border)] bg-[var(--color-cream)] text-[var(--color-ink)] hover:bg-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)] font-medium"
              >
                <span className="line-clamp-1">{ex.length > 35 ? ex.slice(0, 35) + '...' : ex}</span>
              </button>
            ))}
          </div>

          <div className="shrink-0 flex items-center justify-end">
             {isLoading ? (
                <div className="flex items-center gap-3 text-[var(--color-atlantic)] px-4 py-2" aria-live="polite">
                  <div className="w-5 h-5 border-2 border-current border-r-transparent rounded-full animate-spin" aria-hidden="true" />
                  <span className="text-sm font-medium tracking-wide">
                    {reducedMotion ? "Generating route..." : loadingStages[currentStageIndex]}
                  </span>
                </div>
             ) : (
               <Button
                 onClick={onSubmit}
                 disabled={!promptValue.trim() || isFollowUp || state === 'error'}
                 aria-label="Generate trip route"
               >
                 Generate Route
               </Button>
             )}
          </div>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {isFollowUp && followUpPanel && (
          <m.div
            initial={reducedMotion ? { opacity: 1 } : { opacity: 0, y: 15 }}
            animate={reducedMotion ? { opacity: 1 } : { opacity: 1, y: 0 }}
            exit={reducedMotion ? { opacity: 0 } : { opacity: 0, y: -15 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            className="pt-2"
          >
            {followUpPanel}
          </m.div>
        )}
      </AnimatePresence>
    </div>
  );
}
