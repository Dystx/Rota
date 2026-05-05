'use client';

import { useReducedMotion } from '../hooks/use-reduced-motion';

export interface FilmGrainProps {
  intensity?: 'subtle' | 'medium' | 'strong';
  className?: string;
}

export function FilmGrain({ intensity = 'subtle', className = '' }: FilmGrainProps) {
  const reducedMotion = useReducedMotion();

  if (reducedMotion) {
    return null;
  }

  const opacityMap = {
    subtle: 0.04,
    medium: 0.08,
    strong: 0.14,
  };

  const opacity = opacityMap[intensity];

  return (
    <div
      className={`absolute inset-0 pointer-events-none mix-blend-overlay ${className}`}
      style={{ opacity }}
      aria-hidden="true"
      data-testid="film-grain-container"
    >
      <svg
        className="absolute inset-0 w-full h-full"
        xmlns="http://www.w3.org/2000/svg"
        data-testid="film-grain-svg"
      >
        <filter id="film-grain-filter">
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.75"
            numOctaves="3"
            stitchTiles="stitch"
          />
        </filter>
        <rect width="100%" height="100%" filter="url(#film-grain-filter)" />
      </svg>
    </div>
  );
}
