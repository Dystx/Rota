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
 *   1. Tell us your trip    — the hero card / planner sentence
 *   2. We craft the route   — the AI synthesizes the itinerary
 *   3. Refine with an expert — optional human curator (checkout)
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
    body: "Our spatial engine maps a day-by-day itinerary with curated stops, pacing, and logistics.",
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
      className="max-w-6xl mx-auto px-container-padding-lg py-section-gap"
      data-testid="how-it-works"
    >
      <header className="text-center mb-12">
        <h2
          id="how-it-works-heading"
          className="font-display-mobile md:font-display text-display-mobile md:text-display text-primary mb-3"
        >
          Three steps. One trip.
        </h2>
        <p className="font-body-md md:font-body-lg text-body-md md:text-body-lg text-on-surface-variant max-w-2xl mx-auto">
          From a one-line intent to a fully mapped itinerary with a human curator on call.
        </p>
      </header>
      <ol className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
        {STEPS.map((step, idx) => (
          <li
            key={step.n}
            className={cn(
              "relative bg-white/70 backdrop-blur-md border border-olive-light/15 rounded-2xl p-card-padding shadow-sm hover:shadow-md transition-shadow",
              // Connector arrow on desktop only, pointing to the next step.
              idx < STEPS.length - 1 &&
                "md:after:content-[''] md:after:absolute md:after:top-1/2 md:after:-right-4 md:after:w-4 md:after:h-px md:after:bg-olive-light/30"
            )}
          >
            <div className="flex items-baseline gap-3 mb-3">
              <span className="font-mono-technical text-mono-technical text-ochre-dark tracking-widest">
                {step.n}
              </span>
              <span
                aria-hidden
                className="material-symbols-outlined text-2xl text-olive-dark"
              >
                {step.icon}
              </span>
            </div>
            <h3 className="font-headline-md md:font-headline-lg text-headline-md md:text-headline-lg text-primary mb-2 leading-tight">
              {step.title}
            </h3>
            <p className="font-body-md text-body-md text-on-surface-variant leading-relaxed">
              {step.body}
            </p>
          </li>
        ))}
      </ol>
    </section>
  );
}
