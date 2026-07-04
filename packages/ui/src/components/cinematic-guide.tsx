'use client';

import { type ReactNode, createContext, useContext, useState, useRef, useEffect, forwardRef } from 'react';
import { m } from 'motion/react';
import { useReducedMotion } from '../hooks/use-reduced-motion';
import { cn } from '../lib/cn';

interface CinematicGuideContextType {
  activeChapter: string | null;
  setActiveChapter: (id: string) => void;
  registerChapter: (id: string) => void;
  unregisterChapter: (id: string) => void;
}

const CinematicGuideContext = createContext<CinematicGuideContextType>({
  activeChapter: null,
  setActiveChapter: () => {},
  registerChapter: () => {},
  unregisterChapter: () => {},
});

export function useCinematicGuide() {
  return useContext(CinematicGuideContext);
}

export interface CinematicGuideProps {
  children: ReactNode;
  className?: string;
}

export function CinematicGuide({ children, className }: CinematicGuideProps) {
  const [activeChapter, setActiveChapter] = useState<string | null>(null);
  const chaptersRef = useRef<Set<string>>(new Set());

  const registerChapter = (id: string) => {
    chaptersRef.current.add(id);
  };

  const unregisterChapter = (id: string) => {
    chaptersRef.current.delete(id);
  };

  return (
    <CinematicGuideContext.Provider value={{ activeChapter, setActiveChapter, registerChapter, unregisterChapter }}>
      <div className={cn("relative w-full text-[var(--color-ink)] bg-[var(--color-paper)]", className)}>
        {children}
      </div>
    </CinematicGuideContext.Provider>
  );
}

export interface GuideChapterProps {
  id: string;
  children: ReactNode;
  className?: string;
}

export const GuideChapter = forwardRef<HTMLDivElement, GuideChapterProps>(
  ({ id, children, className }, ref) => {
    const { setActiveChapter, registerChapter, unregisterChapter } = useCinematicGuide();
    const internalRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
      registerChapter(id);
      return () => unregisterChapter(id);
    }, [id, registerChapter, unregisterChapter]);

    useEffect(() => {
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting && entry.intersectionRatio >= 0.3) {
              setActiveChapter(id);
            }
          });
        },
        { threshold: 0.3 }
      );

      const el = internalRef.current;
      if (el) observer.observe(el);
      return () => {
        if (el) observer.unobserve(el);
      };
    }, [id, setActiveChapter]);

    return (
      <div
        id={id}
        ref={(node) => {
          internalRef.current = node;
          if (typeof ref === 'function') ref(node);
          else if (ref) ref.current = node;
        }}
        className={cn("min-h-[100svh] py-[var(--spacing-section)] px-[var(--spacing-gutter)]", className)}
      >
        {children}
      </div>
    );
  }
);
GuideChapter.displayName = 'GuideChapter';

export interface GuideProgressProps {
  chapters: { id: string; label: string }[];
  sticky?: boolean;
  className?: string;
}

export function GuideProgress({ chapters, sticky = true, className }: GuideProgressProps) {
  const { activeChapter } = useCinematicGuide();
  const reducedMotion = useReducedMotion();

  return (
    <div
      className={cn(
        "z-50 pointer-events-none p-4",
        // `fixed` (not `float-right` + `sticky`) so the chapter
        // nav anchors to the viewport's right edge regardless
        // of how short the surrounding content is. The previous
        // `float-right` made the nav drift into the middle of
        // the viewport on chapters with little content (the
        // trip page's CinematicHero + brief card), because
        // float positions relative to the content flow.
        sticky
          ? "fixed top-1/2 right-3 md:right-6 -translate-y-1/2"
          : "",
        className
      )}
    >
      <nav className="hidden md:flex flex-col gap-3 pointer-events-auto rota-glass-panel rounded-[var(--radius-glass)] p-4">
        {chapters.map((chapter) => {
          const isActive = activeChapter === chapter.id;
          return (
            <a
              key={chapter.id}
              href={`#${chapter.id}`}
              className="flex items-center gap-3 group focus-visible:outline-none"
              aria-current={isActive ? 'step' : undefined}
            >
              <span className={cn(
                "text-xs font-medium uppercase tracking-widest text-[var(--color-muted-foreground)] group-hover:text-[var(--color-ink)] transition-colors",
                isActive && "text-[var(--color-ink)] font-bold"
              )}>
                {chapter.label}
              </span>
              <div 
                className={cn(
                  "w-2 h-2 rounded-full border border-[var(--color-border)] bg-[var(--color-cream)]",
                  reducedMotion ? "transition-none" : "transition-all duration-300",
                  isActive && "bg-[var(--color-atlantic)] scale-150 border-transparent"
                )}
              />
            </a>
          );
        })}
      </nav>
    </div>
  );
}

export interface GuidedNextStepProps {
  children: ReactNode;
  className?: string;
}

export function GuidedNextStep({ children, className }: GuidedNextStepProps) {
  const reducedMotion = useReducedMotion();

  if (reducedMotion) {
    return (
      <div className={cn("py-16 md:py-24 px-[var(--spacing-gutter)] text-center", className)}>
        {children}
      </div>
    );
  }

  return (
    <m.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.8 }}
      transition={{ duration: 0.8, ease: "easeOut" }}
      className={cn("py-16 md:py-24 px-[var(--spacing-gutter)] text-center", className)}
    >
      {children}
    </m.div>
  );
}

export interface HeroSectionProps {
  title: ReactNode;
  subtitle?: ReactNode;
  coverImageUrl?: string;
  className?: string;
}

export function HeroSection({ title, subtitle, coverImageUrl, className }: HeroSectionProps) {
  const reducedMotion = useReducedMotion();

  return (
    <section
      className={cn(
        "relative w-full h-[100svh] min-h-[500px] overflow-hidden bg-[var(--color-ink)] text-[var(--color-paper)] flex flex-col justify-end pb-32 px-[var(--spacing-gutter)]",
        className
      )}
    >
      {coverImageUrl && (
        <div className="absolute inset-0 z-0">
          <img
            src={coverImageUrl}
            alt=""
            className="w-full h-full object-cover object-center opacity-70"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[var(--color-ink)] via-transparent to-transparent opacity-90" />
        </div>
      )}
      
      <div className="relative z-10 w-full max-w-5xl mx-auto">
        {reducedMotion ? (
          <div className="flex flex-col gap-6">
            <h1 className="rota-display font-bold text-[var(--color-paper)] drop-shadow-md">
              {title}
            </h1>
            {subtitle && (
              <p className="text-xl md:text-2xl text-[var(--color-cream)] max-w-2xl">
                {subtitle}
              </p>
            )}
          </div>
        ) : (
          <div className="flex flex-col gap-6">
            <m.h1 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, ease: "easeOut" }}
              className="rota-display font-bold text-[var(--color-paper)] drop-shadow-md"
            >
              {title}
            </m.h1>
            {subtitle && (
              <m.p 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1, delay: 0.2, ease: "easeOut" }}
                className="text-xl md:text-2xl text-[var(--color-cream)] max-w-2xl"
              >
                {subtitle}
              </m.p>
            )}
          </div>
        )}
      </div>
    </section>
  );
}

export interface CTASectionProps {
  children: ReactNode;
  className?: string;
}

export function CTASection({ children, className }: CTASectionProps) {
  return (
    <section
      className={cn(
        "py-[calc(var(--spacing-section)*1.5)] px-[var(--spacing-gutter)]",
        // Dark mode CTASection matches the Cinematic Concierge design
        // language. The previous bg-atlantic (ochre) + text-paper
        // combination was only 2.59:1 — failed WCAG AA. ink (#16281f)
        // on cream (#efece6) is ~13.5:1.
        "bg-[var(--color-ink)] text-[var(--color-cream)] text-center",
        className
      )}
    >
      <div className="max-w-4xl mx-auto flex flex-col items-center gap-8">
        {children}
      </div>
    </section>
  );
}
