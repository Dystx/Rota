import * as React from "react";
import Link from "next/link";
import { Icon } from "@repo/ui";

/**
 * SequentialStep — the shared shell for each question in the
 * Stitch 1.2 / 1.3 sequential wizard. One question per screen;
 * a single blurred cinematic background; a centered glass-
 * morphism card with: pill label, question, subtext, the
 * step's specific content, and Back / Continue navigation.
 *
 * The user said: "i dont want any forms everything should be
 * 1 or 2 clicks or write 1 or 2 words. sequencial." This
 * component is the contract: every step renders inside it
 * and the navigation is the only chrome.
 */
export interface SequentialStepProps {
  /** Total number of steps in the wizard (e.g. 5). */
  totalSteps: number;
  /** 1-based index of this step. */
  currentStep: number;
  /** Uppercase mono pill at the top of the card. */
  label: string;
  /** Playfair Display serif question. */
  question: string;
  /** Inter body subtext. */
  subtext?: string;
  /** Called when the user clicks Continue (or presses Enter). */
  onContinue: () => void;
  /** Called when the user clicks Back (or presses Escape). */
  onBack?: () => void;
  /** Label for the primary button. Defaults to "Continue". */
  continueLabel?: string;
  /** When true, the Continue button is disabled. */
  continueDisabled?: boolean;
  /** Optional URL for the Back link (when onBack is not provided). */
  backHref?: string;
  /** The step's specific content (chips, cards, etc.). */
  children: React.ReactNode;
}

export function SequentialStep({
  totalSteps,
  currentStep,
  label,
  question,
  subtext,
  onContinue,
  onBack,
  continueLabel = "Continue",
  continueDisabled = false,
  backHref,
  children
}: SequentialStepProps) {
  const containerRef = React.useRef<HTMLDivElement>(null);

  // Auto-focus the first interactive element (button or input) in
  // the card on mount so the keyboard user lands on the right place
  // without tabbing. Skip on initial mount for the first step —
  // the page is already in focus.
  React.useEffect(() => {
    if (currentStep === 1) return;
    const firstInteractive = containerRef.current?.querySelector<HTMLElement>(
      'button:not([disabled]), [href], input:not([disabled]), [tabindex]:not([tabindex="-1"])'
    );
    firstInteractive?.focus();
  }, [currentStep]);

  // Keyboard: Enter advances, Escape goes back.
  React.useEffect(() => {
    const handler = (event: KeyboardEvent) => {
      if (event.key === "Enter" && !continueDisabled) {
        const target = event.target as HTMLElement;
        // Don't intercept Enter from the textarea (it should
        // insert a newline).
        if (target.tagName === "TEXTAREA") return;
        event.preventDefault();
        onContinue();
      } else if (event.key === "Escape" && (onBack || backHref)) {
        event.preventDefault();
        if (onBack) onBack();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onContinue, onBack, backHref, continueDisabled]);

  return (
    <section
      ref={containerRef}
      data-testid="sequential-step"
      data-step={currentStep}
      data-total-steps={totalSteps}
      className="relative min-h-[calc(100vh-var(--header-height))] w-full flex flex-col items-center justify-center overflow-hidden"
    >
      {/* Blurred cinematic background. The page itself doesn't have
          a background image (the planner is a focused surface), so
          we render one as an absolute layer behind the card. */}
      <div
        aria-hidden
        className="absolute inset-0 bg-cover bg-center scale-110 blur-md"
        style={{
          backgroundImage:
            "url('/hero/portugal-coast-golden-hour.svg')"
        }}
      />
      {/* Dark scrim for legibility — the card is white on a blurred
          photo, so a heavy scrim is needed to keep the contrast
          ratio above 4.5:1. */}
      <div
        aria-hidden
        className="absolute inset-0 bg-olive-dark/55 backdrop-brightness-90"
      />

      {/* Top-right: step indicator (Stitch 1.3 pattern). */}
      <div
        data-testid="sequential-step-indicator"
        className="absolute top-6 right-6 z-10 font-mono-micro text-mono-micro uppercase tracking-widest text-ochre-light/80"
      >
        {currentStep} / {totalSteps}
      </div>

      {/* Top-left: brand mark so the user can leave via the
          wordmark if they decide this isn't for them. */}
      <div className="absolute top-6 left-6 z-10">
        <Link
          href="/"
          className="font-display text-display-mobile italic text-linen-dark hover:text-ochre-light transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ochre-light focus-visible:ring-offset-2 rounded-sm"
        >
          Rumia
        </Link>
      </div>

      {/* Centered glass-morphism card. */}
      <div className="relative z-10 w-full max-w-2xl mx-auto px-container-padding-sm md:px-container-padding-lg py-12">
        <div
          data-testid="sequential-step-card"
          className="bg-glass-light backdrop-blur-md border border-white/40 rounded-2xl shadow-2xl p-card-padding md:p-8 flex flex-col gap-4"
        >
          <div className="flex flex-col items-center text-center gap-2">
            <span
              data-testid="sequential-step-label"
              className="font-mono-micro text-mono-micro uppercase tracking-widest text-ochre-dark bg-ochre-light/30 border border-ochre-light/40 px-2.5 py-0.5 rounded-full"
            >
              {label}
            </span>
            <h1
              data-testid="sequential-step-question"
              className="font-display text-display-mobile md:text-headline-lg text-primary leading-tight"
            >
              {question}
            </h1>
            {subtext ? (
              <p
                data-testid="sequential-step-subtext"
                className="font-body-md text-body-md text-on-surface-variant max-w-prose"
              >
                {subtext}
              </p>
            ) : null}
          </div>

          <div className="w-full">{children}</div>

          <div className="flex items-center justify-between gap-3 pt-2 border-t border-olive-light/15">
            {onBack || backHref ? (
              onBack ? (
                <button
                  type="button"
                  onClick={onBack}
                  data-testid="sequential-step-back"
                  className="inline-flex items-center gap-1.5 font-label-ui text-label-ui text-on-surface-variant hover:text-primary transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ochre-light focus-visible:ring-offset-2 rounded-md px-2 py-1"
                >
                  <Icon name="arrow_back" className="text-[16px]" />
                  Back
                </button>
              ) : (
                <Link
                  href={backHref!}
                  data-testid="sequential-step-back"
                  className="inline-flex items-center gap-1.5 font-label-ui text-label-ui text-on-surface-variant hover:text-primary transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ochre-light focus-visible:ring-offset-2 rounded-md px-2 py-1"
                >
                  <Icon name="arrow_back" className="text-[16px]" />
                  Back
                </Link>
              )
            ) : (
              <span aria-hidden className="w-1" />
            )}

            <button
              type="button"
              onClick={onContinue}
              disabled={continueDisabled}
              data-testid="sequential-step-continue"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-olive-light text-on-primary font-label-ui text-label-ui hover:bg-olive-dark transition-colors shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ochre-light focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {continueLabel}
              <Icon name="arrow_forward" className="text-[16px]" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
