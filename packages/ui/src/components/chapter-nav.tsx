'use client';

import {
  type KeyboardEvent,
  type ForwardedRef,
  type HTMLAttributes,
  type ReactElement,
  forwardRef,
} from 'react';
import { cn } from '../lib/cn';
import { useReducedMotion } from '../hooks/use-reduced-motion';

export type ChapterNavProps = Omit<HTMLAttributes<HTMLDivElement>, 'onSelect'> & {
  chapters: { id: string; label: string }[];
  activeChapterId: string;
  onSelect: (chapterId: string, source: 'click' | 'keyboard') => void;
};

function ChapterNavComponent(
  { chapters, activeChapterId, onSelect, className, ...props }: ChapterNavProps,
  ref: ForwardedRef<HTMLDivElement>
): ReactElement {
  const reducedMotion = useReducedMotion();
  const activeIndex = Math.max(chapters.findIndex((chapter) => chapter.id === activeChapterId), 0);

  const selectChapter = (chapterId: string, source: 'click' | 'keyboard'): void => {
    onSelect(chapterId, source);
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLButtonElement>): void => {
    if (chapters.length === 0) {
      return;
    }

    if (event.key === 'ArrowUp') {
      event.preventDefault();
      selectChapter(chapters[Math.max(activeIndex - 1, 0)]!.id, 'keyboard');
    }

    if (event.key === 'ArrowDown') {
      event.preventDefault();
      selectChapter(chapters[Math.min(activeIndex + 1, chapters.length - 1)]!.id, 'keyboard');
    }

    if (event.key === 'Home') {
      event.preventDefault();
      selectChapter(chapters[0]!.id, 'keyboard');
    }

    if (event.key === 'End') {
      event.preventDefault();
      selectChapter(chapters[chapters.length - 1]!.id, 'keyboard');
    }
  };

  return (
    <div
      ref={ref}
      className={cn('hidden md:flex flex-col gap-2 items-end', className)}
      {...props}
    >
      {chapters.map((chapter) => {
        const isActive = chapter.id === chapters[activeIndex]?.id;

        return (
          <button
            key={chapter.id}
            type="button"
            aria-label={chapter.label}
            aria-current={isActive ? 'step' : undefined}
            data-chapter-id={chapter.id}
            onClick={() => selectChapter(chapter.id, 'click')}
            onKeyDown={handleKeyDown}
            className={cn(
              'h-3.5 w-3.5 rounded-full border border-[var(--color-iberian-shadow)]/20 bg-[var(--color-iberian-limestone)]/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--color-background)]',
              reducedMotion ? 'transition-none' : 'transition-transform duration-200 ease-out',
              isActive && 'scale-[1.3] bg-[var(--color-iberian-terracotta)]'
            )}
          />
        );
      })}
    </div>
  );
}

export const ChapterNav = forwardRef<HTMLDivElement, ChapterNavProps>(ChapterNavComponent);

ChapterNav.displayName = 'ChapterNav';
