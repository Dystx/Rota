/**
 * Kept as a lightweight companion for routes that previously embedded the
 * free-text quick-start search. The public journey now starts with the
 * explicit choices in HeroIntentCard, so no text entry is offered here.
 */
export function HeroQuickStart() {
  return (
    <section className="bg-background" data-testid="hero-quick-start">
      <div className="mx-auto max-w-3xl px-container-padding-sm py-8 text-center md:px-container-padding-lg">
        <p className="font-mono-micro text-mono-micro uppercase tracking-widest text-on-surface-variant">
          Choose a Portugal starting point above to build a route.
        </p>
      </div>
    </section>
  );
}
