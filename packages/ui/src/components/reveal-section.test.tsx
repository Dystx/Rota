import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';
import { RevealSection } from './reveal-section';
import { useReducedMotion } from '../hooks/use-reduced-motion';

vi.mock('../hooks/use-reduced-motion', () => ({
  useReducedMotion: vi.fn(),
}));

vi.mock('motion/react-m', () => ({
  m: {
    div: ({ children, className, 'data-testid': testId }: any) => (
      <div className={className} data-testid={testId || 'motion-div'}>
        {children}
      </div>
    ),
  }
}));

describe('RevealSection', () => {
  afterEach(() => {
    cleanup();
  });

  it('renders children correctly', () => {
    vi.mocked(useReducedMotion).mockReturnValue(false);
    render(
      <RevealSection>
        <span>Content</span>
      </RevealSection>
    );
    expect(screen.getByText('Content')).toBeDefined();
    expect(screen.getByTestId('motion-div')).toBeDefined();
  });

  it('renders plain div when reduced motion is true', () => {
    vi.mocked(useReducedMotion).mockReturnValue(true);
    const { container } = render(
      <RevealSection className="test-class">
        <span>Content</span>
      </RevealSection>
    );
    
    expect(screen.getByText('Content')).toBeDefined();
    expect(screen.queryByTestId('motion-div')).toBeNull();
    expect((container.firstChild as HTMLElement).tagName).toBe('DIV');
    expect((container.firstChild as HTMLElement).className).toContain('test-class');
  });

  it('applies custom className', () => {
    vi.mocked(useReducedMotion).mockReturnValue(false);
    render(
      <RevealSection className="custom-class">
        <span>Content</span>
      </RevealSection>
    );
    
    expect(screen.getByTestId('motion-div').className).toContain('custom-class');
  });
});

