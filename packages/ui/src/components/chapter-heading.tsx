'use client';

import { type ReactElement } from 'react';
import { cn } from '../lib/cn';

export interface ChapterHeadingProps {
  index: number;
  eyebrow?: string;
  title: string;
  subtitle?: string;
  align?: 'left' | 'center';
  className?: string;
}

export function ChapterHeading({
  index,
  eyebrow,
  title,
  subtitle,
  align = 'left',
  className,
}: ChapterHeadingProps): ReactElement {
  const formattedIndex = String(index).padStart(2, '0');

  return (
    <header
      className={cn(
        'flex flex-col gap-2',
        align === 'center' ? 'items-center text-center' : 'items-start text-left',
        className
      )}
    >
      <p className="text-iberian-gold font-medium uppercase tracking-widest text-sm">
        <span className="opacity-70 mr-2">{formattedIndex}</span>
        {eyebrow && <span>{eyebrow}</span>}
      </p>
      
      <h2 className="text-iberian-limestone text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight">
        {title}
      </h2>
      
      {subtitle && (
        <p className="text-iberian-limestone/70 text-lg md:text-xl max-w-2xl mt-2">
          {subtitle}
        </p>
      )}
    </header>
  );
}
