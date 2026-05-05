'use client';

import type { ReactNode } from 'react';
import { LazyMotion, domAnimation } from 'motion/react';

type MotionProviderProps = {
  children: ReactNode;
};

export function MotionProvider({ children }: MotionProviderProps) {
  return (
    <LazyMotion features={domAnimation} strict>
      {children}
    </LazyMotion>
  );
}
