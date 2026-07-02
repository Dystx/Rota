'use client';

import { useState, useEffect } from 'react';
import { 
  PageIntro, 
  SectionTransition, 
  GuidedLoading,
  CinematicGuide,
  GuideChapter,
  ChapterHeading
} from '@repo/ui';

export default function TestT20Page() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 2500);
    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[var(--color-paper)]">
        <GuidedLoading message="Curating your coastal journey through the Rota Vicentina..." />
      </div>
    );
  }

  return (
    <PageIntro className="min-h-screen bg-[var(--color-paper)] text-[var(--color-ink)] pb-32">
      <CinematicGuide>
        <header className="px-8 pt-24 pb-16 md:px-12 md:pt-32">
          <h1 className="font-serif text-4xl md:text-6xl text-[var(--color-ink)] tracking-tight">
            The Rota Vicentina
          </h1>
          <p className="mt-6 max-w-2xl font-sans text-lg text-[var(--color-ink)]/70">
            A journey along the unspoiled southwestern coast of Portugal. Where the Atlantic meets towering cliffs and ancient trails guide your way.
          </p>
        </header>

        <main className="flex flex-col gap-32 px-8 md:px-12">
          <GuideChapter id="chapter-1-alentejo">
            <SectionTransition delayMs={200}>
              <ChapterHeading
                title="The Alentejo Coast"
                subtitle="Wild, Untamed, and Timeless"
                index={1}
                className="mb-12"
              />
              <div className="max-w-3xl prose font-sans text-[var(--color-ink)]/80 text-lg leading-relaxed">
                <p>
                  Begin your journey in the Alentejo region, where the land meets the ocean in a dramatic display of nature's power. Here, the Fisherman's Trail winds precariously along the cliff edges, offering sweeping views of the Atlantic.
                </p>
                <p className="mt-4">
                  The scent of salt and wild herbs fills the air. Every step reveals a new cove, a hidden beach, or a nesting site for white storks perched impossibly on jagged sea stacks.
                </p>
              </div>
            </SectionTransition>
          </GuideChapter>

          <GuideChapter id="chapter-2-algarve">
            <SectionTransition delayMs={200}>
              <ChapterHeading
                title="Entering the Algarve"
                subtitle="Sun-drenched Cliffs and Golden Sands"
                index={2}
                className="mb-12"
              />
              <div className="max-w-3xl prose font-sans text-[var(--color-ink)]/80 text-lg leading-relaxed">
                <p>
                  As the trail shifts south into the Vicentine Coast Natural Park, the landscape transforms. The dramatic dark schist of the Alentejo gives way to the golden, sun-baked limestone of the Algarve.
                </p>
                <p className="mt-4">
                  Descend into pristine valleys where small fishing villages cling to the terrain, offering fresh sea bream and the unparalleled warmth of Portuguese hospitality.
                </p>
              </div>
            </SectionTransition>
          </GuideChapter>

          <GuideChapter id="chapter-3-sagres">
            <SectionTransition delayMs={200}>
              <ChapterHeading
                title="Arrival at Sagres"
                subtitle="The End of the World"
                index={3}
                className="mb-12"
              />
              <div className="max-w-3xl prose font-sans text-[var(--color-ink)]/80 text-lg leading-relaxed">
                <p>
                  The journey culminates at Cabo de São Vicente, the southwesternmost point of mainland Europe. For centuries, this rugged promontory was believed to be the end of the known world.
                </p>
                <p className="mt-4">
                  Watch the sun dip below the horizon, painting the sky in vibrant hues of crimson and gold, bringing your coastal expedition to a cinematic close.
                </p>
              </div>
            </SectionTransition>
          </GuideChapter>
        </main>
      </CinematicGuide>
    </PageIntro>
  );
}
