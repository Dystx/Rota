import * as React from "react";

/**
 * A quiet image anchor for the cover. It gives the activity question a sense
 * of place without turning the homepage into a map or a destination browser.
 * The asset is an owned Rumia illustration and carries its own caption so the
 * image remains contextual rather than decorative chrome.
 */
export function HeroEditorialFigure() {
  return (
    <figure
      data-testid="hero-editorial-figure"
      className="pointer-events-none absolute bottom-8 right-[3vw] z-[2] hidden w-[min(22vw,18rem)] md:block"
    >
      <div className="relative aspect-[4/5] overflow-hidden rounded-[2rem] border border-linen-dark/25 bg-olive-dark/80 shadow-2xl shadow-black/20">
        <img
          src="/hero/portugal-coast-golden-hour.svg"
          alt="Portugal coast at golden hour"
          className="h-full w-full object-cover opacity-90 mix-blend-screen"
          loading="lazy"
        />
        <div
          aria-hidden
          className="absolute inset-0 bg-[linear-gradient(145deg,rgba(12,31,22,0.08),rgba(12,31,22,0.76))]"
        />
        <div className="absolute inset-x-5 bottom-5 border-t border-linen-dark/35 pt-3 text-left text-linen-dark">
          <p className="font-mono-micro text-mono-micro uppercase tracking-[0.2em] text-ochre-light">
            Field note / 01
          </p>
          <p className="mt-2 max-w-[14rem] font-display text-xl leading-tight">
            Leave room for the light to change.
          </p>
        </div>
      </div>
      <figcaption className="mt-3 flex items-center justify-between gap-4 font-mono-micro text-mono-micro uppercase tracking-[0.16em] text-linen-dark/65">
        <span>Atlantic edge</span>
        <span>Portugal / 2026</span>
      </figcaption>
    </figure>
  );
}
