"use client";

function cn(...values: Array<string | false | null | undefined>): string {
  return values.filter(Boolean).join(" ");
}

/**
 * HowItWorks — 3-step visual that explains the flow to a new
 * user. Placed between the hero and the bento grid on the home
 * page so the user understands what happens after they click
 * "Begin Journey" before they commit.
 *
 * The three steps mirror the actual flow:
 *   1. Tell us your trip     — the hero card / planner sentence
 *   2. We craft the route    — the AI synthesizes the itinerary
 *   3. Refine with an expert — optional human curator (checkout)
 *
 * Visual hierarchy (top → bottom inside each card):
 *   1. Big monospace step number (01/02/03) — primary cue
 *   2. Small icon chip
 *   3. Display title (one line, bold)
 *   4. Two-line body description
 *
 * The 3-up grid is connected with subtle dashes on desktop so
 * the eye reads left → right; on mobile the steps stack.
 */
const STEPS = [
  {
    n: "01",
    icon: "edit_note",
    title: "Tell us your trip",
    body: "One sentence — where, when, and how you travel. No forms, no quizzes.",
  },
  {
    n: "02",
    icon: "auto_awesome",
    title: "We craft the route",
    body: "A day-by-day itinerary with curated stops, pacing, and logistics — done in seconds.",
  },
  {
    n: "03",
    icon: "support_agent",
    title: "Refine with an expert",
    body: "Add a destination specialist to audit, refine, and personalize every stop.",
  },
] as const;

export function HowItWorks() {
  return (
    <section
      aria-labelledby="how-it-works-heading"
      // Top padding matches the section-gap token; bottom padding is
      // doubled so the white step cards don't bleed visually into
      // the dark bento photos below.
      className="max-w-6xl mx-auto px-container-padding-lg pt-section-gap pb-[64px] md:pb-[96px]"
      data-testid="how-it-works"
    >
      <header className="text-center mb-12 md:mb-16">
        <h2
          id="how-it-works-heading"
          className="font-display-mobile md:font-display text-display-mobile md:text-display text-primary mb-4"
        >
          Three steps. One trip.
        </h2>
        <p className="font-body-md md:font-body-lg text-body-md md:text-body-lg text-on-surface-variant max-w-2xl mx-auto leading-relaxed">
          From a one-line intent to a fully mapped itinerary with a human curator on call.
        </p>
      </header>
      <ol className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-10">
        {STEPS.map((step, idx) => (
          <li
            key={step.n}
            className={cn(
              // White step cards: same token system as Card primitive
              // but with a slightly larger padding for breathing room.
              "relative bg-white/80 backdrop-blur-md border border-olive-light/20 rounded-2xl p-6 md:p-8 shadow-sm hover:shadow-lg transition-shadow",
              // Connector arrow on desktop only, pointing to the next step.
              idx < STEPS.length - 1 &&
                "md:after:content-[''] md:after:absolute md:after:top-1/2 md:after:-right-6 md:after:w-5 md:after:h-px md:after:bg-olive-light/40"
            )}
          >
            {/* Step number — primary visual cue. Rendered large so it
                reads at a glance instead of being a footnote. */}
            <div className="flex items-center justify-between mb-5 md:mb-6">
              <span className="font-mono-technical text-base md:text-lg text-ochre-dark tracking-widest font-medium">
                {step.n}
              </span>
              <span
                aria-hidden
                className="inline-flex items-center justify-center w-10 h-10 md:w-11 md:h-11 rounded-full bg-ochre-light/15 text-olive-dark"
              >
                <span className="material-symbols-outlined text-[20px] md:text-[22px]">
                  {step.icon}
                </span>
              </span>
            </div>
            <h3 className="font-headline-md md:font-headline-lg text-headline-md md:text-headline-lg text-primary mb-3 leading-tight">
              {step.title}
            </h3>
            {/* `min-h-[3.5rem]` keeps the body block at a fixed
                2-3 line height so step 01 and step 03 don't read
                shorter than step 02 (whose copy is slightly
                longer). The cards stay visually balanced. */}
            <p className="font-body text-body text-on-surface-variant leading-relaxed min-h-[3.5rem] md:min-h-[3.75rem]">
              {step.body}
            </p>
          </li>
        ))}
      </ol>
    </section>
  );
}
