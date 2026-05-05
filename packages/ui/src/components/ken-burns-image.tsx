'use client';

declare module 'motion/react-m' {
  export const m: any;
}

import { m } from 'motion/react-m';
import { useReducedMotion } from '../hooks/use-reduced-motion';

export interface KenBurnsImageProps {
  src: string;
  alt: string;
  durationMs?: number;
  scale?: [number, number];
  pan?: 'tl-br' | 'tr-bl' | 'bl-tr' | 'br-tl';
  className?: string;
}

export function KenBurnsImage({
  src,
  alt,
  durationMs = 12000,
  scale = [1.0, 1.12],
  pan = 'tl-br',
  className = '',
}: KenBurnsImageProps) {
  const reducedMotion = useReducedMotion();

  if (reducedMotion) {
    return <img src={src} alt={alt} className={className} />;
  }

  const getPanValues = () => {
    switch (pan) {
      case 'tl-br':
        return { x: ['0%', '-2%'], y: ['0%', '-2%'] };
      case 'tr-bl':
        return { x: ['0%', '2%'], y: ['0%', '-2%'] };
      case 'bl-tr':
        return { x: ['0%', '-2%'], y: ['0%', '2%'] };
      case 'br-tl':
        return { x: ['0%', '2%'], y: ['0%', '2%'] };
    }
  };

  const { x, y } = getPanValues();

  return (
    <m.img
      src={src}
      alt={alt}
      className={className}
      animate={{
        scale,
        x,
        y,
      }}
      transition={{
        duration: durationMs / 1000,
        ease: 'linear',
        repeat: Infinity,
        repeatType: 'mirror',
      }}
    />
  );
}
