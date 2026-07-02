'use client';

import {
  CinematicGuide,
  GuideChapter,
  GuideProgress,
  GuidedNextStep,
  HeroSection,
  CTASection,
} from '@repo/ui';
import { Button } from '@repo/ui';
import { ChapterHeading } from '@repo/ui';

export default function TestT14Page() {
  const chapters = [
    { id: 'ch-1', label: 'Arrival in Lisbon' },
    { id: 'ch-2', label: 'The Douro Valley' },
    { id: 'ch-3', label: 'Algarve Retreat' },
  ];

  return (
    <main className="min-h-screen bg-[var(--color-paper)]">
      <HeroSection 
        title="Cinematic Portugal" 
        subtitle="A Curated Journey Through the Edge of Europe"
        coverImageUrl="https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?q=80&w=2070&auto=format&fit=crop"
      />

      <CinematicGuide>
        <GuideProgress chapters={chapters} />

        <GuideChapter id="ch-1">
          <div className="max-w-3xl mx-auto pt-24">
            <ChapterHeading 
              index={1} 
              eyebrow="Welcome" 
              title="Arrival in Lisbon" 
              subtitle="Step into the city of seven hills and experience the vibrant rhythm of Portugal's capital."
            />
            <div className="mt-12 p-8 rota-glass-panel rounded-2xl">
              <p className="text-lg text-[var(--color-ink-soft)] leading-relaxed">
                Begin your Portuguese adventure in the heart of Lisbon. Experience the vibrant culture, historic architecture, and world-class culinary scenes. Your personal concierge has arranged a sunset sailing experience on the Tagus River to introduce you to the city's unique light.
              </p>
            </div>
          </div>
        </GuideChapter>

        <GuideChapter id="ch-2">
          <div className="max-w-3xl mx-auto pt-24">
            <ChapterHeading 
              index={2} 
              eyebrow="Exploration" 
              title="The Douro Valley" 
              subtitle="Journey north to one of the world's oldest demarcated wine regions."
            />
            <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="aspect-square bg-[var(--color-cream)] rounded-2xl flex items-center justify-center border border-[var(--color-border)]">
                <span className="text-[var(--color-muted-foreground)]">Scenic Vineyards</span>
              </div>
              <div className="flex flex-col justify-center">
                <p className="text-lg text-[var(--color-ink-soft)] leading-relaxed">
                  Travel to the breathtaking Douro Valley, where terraced vineyards meet the winding river. Taste the region's finest vintage ports and enjoy unparalleled hospitality in a boutique quinta, curated exclusively for your private retreat.
                </p>
              </div>
            </div>
          </div>
        </GuideChapter>

        <GuideChapter id="ch-3">
          <div className="max-w-3xl mx-auto pt-24">
            <ChapterHeading 
              index={3} 
              eyebrow="Relaxation" 
              title="Algarve Retreat" 
              subtitle="Conclude your journey on the golden cliffs of the southern coast."
            />
            <div className="mt-12 p-8 bg-[var(--color-ink)] text-[var(--color-paper)] rounded-2xl">
              <p className="text-lg leading-relaxed">
                Conclude your journey in the Algarve, where golden cliffs drop into the azure Atlantic. Rest and rejuvenate in exclusive coastal sanctuaries, reflecting on a truly unforgettable escape away from the crowds.
              </p>
            </div>
            
            <GuidedNextStep>
              <h3 className="rota-heading mb-6">Continue your journey</h3>
              <Button className="bg-[var(--color-atlantic)] text-white hover:bg-[var(--color-aqua)] text-lg px-8 py-4">
                Explore The Itinerary
              </Button>
            </GuidedNextStep>
          </div>
        </GuideChapter>
      </CinematicGuide>

      <CTASection>
        <h2 className="rota-display">Ready for Portugal?</h2>
        <p className="text-xl max-w-xl text-[var(--color-cream)]">
          Join discerning travelers who have experienced the Iberian Peninsula differently.
        </p>
        <Button className="bg-white text-[var(--color-atlantic)] hover:bg-[var(--color-cream)] mt-4 text-lg px-8 py-4">
          Start Planning
        </Button>
      </CTASection>
    </main>
  );
}
