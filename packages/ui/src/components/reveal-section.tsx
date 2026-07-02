'use client';

import { type ReactNode, type ReactElement } from 'react';

import { m } from 'motion/react';
import { useReducedMotion } from '../hooks/use-reduced-motion';

export interface RevealSectionProps {
  children: ReactNode;
  translateY?: number;
  amount?: number;
  once?: boolean;
  delayMs?: number;
  className?: string;
}

export function RevealSection({
  children,
  translateY = 24,
  amount = 0.3,
  once = true,
  delayMs = 0,
  className,
}: RevealSectionProps): ReactElement {
  const reducedMotion = useReducedMotion();

  if (reducedMotion) {
    return <div className={className}>{children}</div>;
  }

  return (
    <m.div
      initial={{ opacity: 0, y: translateY }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ amount, once }}
      transition={{ 
        duration: 0.8, 
        ease: [0.16, 1, 0.3, 1],
        delay: delayMs / 1000 
      }}
      className={className}
    >
      {children}
    </m.div>
  );
}
