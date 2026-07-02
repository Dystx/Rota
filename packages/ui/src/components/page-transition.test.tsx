import { ReactNode } from 'react';
import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';
import { PageIntro, SectionTransition, GuidedLoading } from './page-transition';
import { useReducedMotion } from '../hooks/use-reduced-motion';

vi.mock('../hooks/use-reduced-motion', () => ({
  useReducedMotion: vi.fn(),
}));

interface MockProps {
  children?: ReactNode;
  className?: string;
  role?: string;
  'aria-live'?: "polite" | "assertive" | "off";
  'data-testid'?: string;
}

vi.mock('motion/react', () => ({
  m: {
    div: ({ children, className, role, 'aria-live': ariaLive, 'data-testid': testId }: MockProps) => (
      <div className={className} role={role} aria-live={ariaLive} data-testid={testId || 'motion-div'}>
        {children}
      </div>
    ),
    section: ({ children, className, 'data-testid': testId }: MockProps) => (
      <section className={className} data-testid={testId || 'motion-section'}>
        {children}
      </section>
    ),
    span: ({ children, className, 'data-testid': testId }: MockProps) => (
      <span className={className} data-testid={testId || 'motion-span'}>
        {children}
      </span>
    ),
  }
}));

describe('PageTransition Primitives', () => {
  afterEach(() => {
    cleanup();
    vi.clearAllMocks();
  });

  describe('PageIntro', () => {
    it('renders animated motion div by default', () => {
      vi.mocked(useReducedMotion).mockReturnValue(false);
      render(<PageIntro><span>Content</span></PageIntro>);
      expect(screen.getByText('Content')).toBeDefined();
      expect(screen.getByTestId('motion-div')).toBeDefined();
    });

    it('renders plain div when reduced motion is true', () => {
      vi.mocked(useReducedMotion).mockReturnValue(true);
      const { container } = render(<PageIntro className="test-class"><span>Content</span></PageIntro>);
      expect(screen.queryByTestId('motion-div')).toBeNull();
      const element = container.firstChild as HTMLElement;
      expect(element.tagName).toBe('DIV');
      expect(element.className).toContain('test-class');
    });

    it('applies print-safe fallback classes', () => {
      vi.mocked(useReducedMotion).mockReturnValue(false);
      render(<PageIntro><span>Content</span></PageIntro>);
      const motionDiv = screen.getByTestId('motion-div');
      expect(motionDiv.className).toContain('print:opacity-100');
      expect(motionDiv.className).toContain('print:transform-none');
    });
  });

  describe('SectionTransition', () => {
    it('renders animated motion section by default', () => {
      vi.mocked(useReducedMotion).mockReturnValue(false);
      render(<SectionTransition><span>Content</span></SectionTransition>);
      expect(screen.getByText('Content')).toBeDefined();
      expect(screen.getByTestId('motion-section')).toBeDefined();
    });

    it('renders plain section when reduced motion is true', () => {
      vi.mocked(useReducedMotion).mockReturnValue(true);
      const { container } = render(<SectionTransition className="test-class"><span>Content</span></SectionTransition>);
      expect(screen.queryByTestId('motion-section')).toBeNull();
      const element = container.firstChild as HTMLElement;
      expect(element.tagName).toBe('SECTION');
      expect(element.className).toContain('test-class');
    });

    it('applies print-safe fallback classes', () => {
      vi.mocked(useReducedMotion).mockReturnValue(false);
      render(<SectionTransition><span>Content</span></SectionTransition>);
      const motionSection = screen.getByTestId('motion-section');
      expect(motionSection.className).toContain('print:opacity-100');
      expect(motionSection.className).toContain('print:transform-none');
    });
  });

  describe('GuidedLoading', () => {
    it('renders accessible loading state', () => {
      vi.mocked(useReducedMotion).mockReturnValue(false);
      render(<GuidedLoading message="Loading itinerary..." />);
      const container = screen.getByRole('status');
      expect(container.getAttribute('aria-live')).toBe('polite');
      expect(screen.getByText('Loading itinerary...')).toBeDefined();
    });

    it('renders plain div when reduced motion is true', () => {
      vi.mocked(useReducedMotion).mockReturnValue(true);
      const { container } = render(<GuidedLoading className="test-class" />);
      expect(screen.queryByTestId('motion-div')).toBeNull();
      const element = container.firstChild as HTMLElement;
      expect(element.tagName).toBe('DIV');
      expect(element.className).toContain('test-class');
    });

    it('applies print fallback classes', () => {
      vi.mocked(useReducedMotion).mockReturnValue(false);
      render(<GuidedLoading />);
      const container = screen.getByRole('status');
      expect(container.className).toContain('print:hidden');
      expect(container.className).toContain('print:opacity-100');
    });
  });
});
