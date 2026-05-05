'use client';

import { useRef } from 'react';
// @ts-ignore - handled by motion/react-m alias
import { m, useScroll, useTransform } from 'motion/react-m';
import { KenBurnsImage } from '@repo/ui/components/ken-burns-image';
import { FilmGrain } from '@repo/ui/components/film-grain';
import { useReducedMotion } from '@repo/ui/hooks/use-reduced-motion';
import { cn } from '@repo/ui/lib/cn';

export interface CinematicHeroProps {
  title: string;
  region?: string;
  durationDays?: number;
  coverImageUrl?: string;
  className?: string;
}

export function CinematicHero({
  title,
  region,
  durationDays,
  coverImageUrl,
  className,
}: CinematicHeroProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const reducedMotion = useReducedMotion();

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end start'],
  });

  const y = useTransform(scrollYProgress, [0, 0.6], ['0%', '-50%']);
  const opacity = useTransform(scrollYProgress, [0, 0.6], [1, 0]);

  const bgImage = coverImageUrl || '/placeholder-trip.jpg';

  const metaText = [
    region,
    durationDays ? `${durationDays} days` : undefined,
  ]
    .filter(Boolean)
    .join(' • ');

  return (
    <section
      ref={containerRef}
      data-section="hero"
      className={cn(
        'relative w-full h-[100svh] min-h-[400px] overflow-hidden bg-iberian-shadow flex flex-col justify-end pb-24 md:pb-32',
        className
      )}
    >
      <div className="absolute inset-0 z-0">
        <div className="hidden md:block w-full h-full">
          <KenBurnsImage
            src={bgImage}
            alt={title}
            className="w-full h-full object-cover object-center"
            durationMs={20000}
            pan="bl-tr"
          />
        </div>
        <img
          src={bgImage}
          alt={title}
          className="block md:hidden w-full h-full object-cover object-center"
        />
        
        <div 
          className="absolute inset-0"
          style={{ background: 'var(--cinematic-overlay-hero)' }} 
        />
        <div 
          className="absolute inset-0"
          style={{ background: 'var(--cinematic-overlay-vignette)' }} 
        />
        <FilmGrain intensity="subtle" />
      </div>

      <div className="relative z-10 w-full max-w-7xl mx-auto px-6 md:px-12">
        {reducedMotion ? (
          <div className="flex flex-col gap-4">
            {metaText && (
              <p className="text-iberian-gold font-medium uppercase tracking-widest text-sm md:text-base">
                {metaText}
              </p>
            )}
            <h1 
              className="text-iberian-limestone font-bold tracking-tight"
              style={{ fontSize: 'clamp(2rem, 5vw, 3.5rem)', lineHeight: 1.1 }}
            >
              {title}
            </h1>
          </div>
        ) : (
          <m.div
            style={{ y, opacity }}
            className="flex flex-col gap-4"
          >
            {metaText && (
              <m.p className="text-iberian-gold font-medium uppercase tracking-widest text-sm md:text-base">
                {metaText}
              </m.p>
            )}
            <m.h1 
              className="text-iberian-limestone font-bold tracking-tight"
              style={{ fontSize: 'clamp(2rem, 5vw, 3.5rem)', lineHeight: 1.1 }}
            >
              {title}
            </m.h1>
          </m.div>
        )}
      </div>
    </section>
  );
}
