'use client';

import { Children, type ReactNode, type ReactElement, isValidElement } from 'react';
import { m } from 'motion/react';
import { useReducedMotion } from '../hooks/use-reduced-motion';
import { cn } from '../lib/cn';

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

/**
 * RevealStagger — animate children in sequence when the parent
 * enters the viewport. Drop children inside; each direct child is
 * treated as a stagger item.
 *
 * PR-6: standardizes the staggered-reveal pattern used by the
 * bento, how-it-works, and pricing cards.
 */
export interface RevealStaggerProps {
  children: ReactNode;
  /** Delay between successive children in ms. Default 80. */
  staggerMs?: number;
  /** Initial translateY in px. Default 16. */
  translateY?: number;
  amount?: number;
  once?: boolean;
  className?: string;
  itemClassName?: string;
}

export function RevealStagger({
  children,
  staggerMs = 80,
  translateY = 16,
  amount = 0.3,
  once = true,
  className,
  itemClassName
}: RevealStaggerProps): ReactElement {
  const reducedMotion = useReducedMotion();
  const items = Children.toArray(children).filter(isValidElement);

  if (reducedMotion) {
    return (
      <div className={cn(className, itemClassName)}>
        {items}
      </div>
    );
  }

  return (
    <m.div
      initial="hidden"
      whileInView="visible"
      viewport={{ amount, once }}
      variants={{
        hidden: {},
        visible: {
          transition: {
            staggerChildren: staggerMs / 1000
          }
        }
      }}
      className={className}
    >
      {items.map((child, i) => (
        <m.div
          key={isValidElement(child) && child.key ? child.key : i}
          variants={{
            hidden: { opacity: 0, y: translateY },
            visible: {
              opacity: 1,
              y: 0,
              transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] }
            }
          }}
          className={itemClassName}
        >
          {child}
        </m.div>
      ))}
    </m.div>
  );
}
