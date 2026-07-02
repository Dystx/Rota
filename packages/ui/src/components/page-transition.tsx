'use client';

import { type ReactNode, type ReactElement, useEffect, useState } from 'react';
import { m } from 'motion/react';
import { useReducedMotion } from '../hooks/use-reduced-motion';
import { cn } from '../lib/cn';

export interface PageIntroProps {
  children: ReactNode;
  className?: string;
}

/**
 * PageIntro
 * Route-safe wrapper that animates the entire page view on mount.
 * Uses a gentle fade and slight upward motion suitable for the Cinematic Concierge tone.
 */
export function PageIntro({ children, className }: PageIntroProps): ReactElement {
  const reducedMotion = useReducedMotion();

  // Print-safe: force opacity to 100% and remove transforms during printing.
  const baseClasses = cn("print:opacity-100 print:transform-none", className);

  if (reducedMotion) {
    return <div className={baseClasses}>{children}</div>;
  }

  return (
    <m.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      transition={{
        duration: 0.8,
        ease: [0.16, 1, 0.3, 1], // cinematic curve
      }}
      className={baseClasses}
    >
      {children}
    </m.div>
  );
}

export interface SectionTransitionProps {
  children: ReactNode;
  className?: string;
  delayMs?: number;
}

/**
 * SectionTransition
 * Reveals sections sequentially or as they scroll into view.
 * Ideal for chapter transitions in a guided tour.
 */
export function SectionTransition({ children, className, delayMs = 0 }: SectionTransitionProps): ReactElement {
  const reducedMotion = useReducedMotion();

  const baseClasses = cn("print:opacity-100 print:transform-none", className);

  if (reducedMotion) {
    return <section className={baseClasses}>{children}</section>;
  }

  return (
    <m.section
      initial={{ opacity: 0, filter: 'blur(4px)', y: 24 }}
      whileInView={{ opacity: 1, filter: 'blur(0px)', y: 0 }}
      viewport={{ once: true, margin: "-10%" }}
      transition={{
        duration: 1.0,
        ease: [0.16, 1, 0.3, 1],
        delay: delayMs / 1000,
      }}
      className={baseClasses}
    >
      {children}
    </m.section>
  );
}

export interface GuidedLoadingProps {
  message?: string;
  className?: string;
}

/**
 * GuidedLoading
 * Accessible cinematic loading state.
 * Announces changes to screen readers and gracefully pulses visual state.
 */
export function GuidedLoading({ message = "Preparing your itinerary...", className }: GuidedLoadingProps): ReactElement {
  const reducedMotion = useReducedMotion();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const baseClasses = cn(
    "flex flex-col items-center justify-center p-8 text-center text-[var(--color-ink)]",
    "print:opacity-100 print:hidden", // Usually hide loaders when printing
    className
  );

  if (!mounted) {
    // Avoid hydration mismatch by rendering static fallback initially
    return (
      <div className={baseClasses} role="status" aria-live="polite">
        <span className="font-serif text-lg tracking-wide">{message}</span>
      </div>
    );
  }

  if (reducedMotion) {
    return (
      <div className={baseClasses} role="status" aria-live="polite">
        <span className="font-serif text-lg tracking-wide">{message}</span>
      </div>
    );
  }

  return (
    <m.div
      role="status"
      aria-live="polite"
      className={baseClasses}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.6 }}
    >
      <m.span
        className="font-serif text-lg tracking-wide"
        animate={{ opacity: [0.5, 1, 0.5] }}
        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
      >
        {message}
      </m.span>
    </m.div>
  );
}
