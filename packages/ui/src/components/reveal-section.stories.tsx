import { type ReactElement } from 'react';
import { RevealSection } from './reveal-section';

const delays = [0, 100, 200, 300, 400, 500] as const;

export default {
  title: 'reveal-section',
};

export const AdoptionGrid = {
  render: (): ReactElement => (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {delays.map((delayMs, index) => (
        <RevealSection key={delayMs} delayMs={delayMs} className="rounded-2xl border border-white/10 bg-black/20 p-5">
          <article className="space-y-2">
            <p className="text-xs uppercase tracking-[0.3em] text-white/50">Card {index + 1}</p>
            <h3 className="text-lg font-semibold text-white">RevealSection stagger demo</h3>
            <p className="text-sm text-white/70">delayMs {delayMs}ms</p>
          </article>
        </RevealSection>
      ))}
    </div>
  ),
};
