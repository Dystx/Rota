import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, render, screen, waitFor } from '@testing-library/react';
import { type CSSProperties, type ReactNode } from 'react';
import { RevealSection } from './reveal-section';

interface MotionDivProps {
  children?: ReactNode;
  className?: string;
  style?: CSSProperties;
  initial?: { opacity: number; y: number };
  whileInView?: { opacity: number; y: number };
  viewport?: { amount: number; once: boolean };
  transition?: { duration: number; ease: number[]; delay: number };
}

const { motionDivMock } = vi.hoisted(() => ({
  motionDivMock: vi.fn((props: MotionDivProps) => {
    const { children, className, style, transition } = props;

    return (
      <div
        data-motion="true"
        data-testid="motion-div"
        className={className}
        style={{
          ...style,
          transitionDelay: `${transition?.delay ?? 0}s`,
        }}
      >
        {children}
      </div>
    );
  }),
}));

vi.mock('motion/react', () => ({
  m: {
    div: motionDivMock,
  },
}));

function setMatchMedia(matches: boolean): void {
  Object.defineProperty(window, 'matchMedia', {
    configurable: true,
    writable: true,
    value: vi.fn().mockImplementation((query: string) => ({
      matches,
      media: query,
      onchange: null,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  });
}

function clearMatchMedia(): void {
  Object.defineProperty(window, 'matchMedia', {
    configurable: true,
    writable: true,
    value: undefined,
  });
}

describe('RevealSection integration', () => {
  afterEach(() => {
    cleanup();
    motionDivMock.mockClear();
    clearMatchMedia();
  });

  it('forwards motion config to m.div', () => {
    render(
      <RevealSection translateY={32} delayMs={120} amount={0.5}>
        <span>Content</span>
      </RevealSection>
    );

    const [motionProps] = motionDivMock.mock.calls[0] ?? [];

    expect(motionProps).toMatchObject({
      initial: { opacity: 0, y: 32 },
      whileInView: { opacity: 1, y: 0 },
      viewport: { amount: 0.5, once: true },
      transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: 0.12 },
    });
  });

  it('renders statically when reduced motion is enabled', async () => {
    setMatchMedia(true);

    const { container } = render(
      <RevealSection>
        <span>Static content</span>
      </RevealSection>
    );

    await waitFor(() => {
      expect((container.firstChild as HTMLElement).getAttribute('data-motion')).toBeNull();
    });

    expect(screen.getByText('Static content')).toBeDefined();
    expect(motionDivMock).toHaveBeenCalled();
  });

  it('uses the default reveal motion config', () => {
    render(
      <RevealSection>
        <span>Default content</span>
      </RevealSection>
    );

    const [motionProps] = motionDivMock.mock.calls[0] ?? [];

    expect(motionProps).toMatchObject({
      initial: { opacity: 0, y: 24 },
      whileInView: { opacity: 1, y: 0 },
      viewport: { amount: 0.3, once: true },
      transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: 0 },
    });
  });

  it('stagger reveals by delayMs across siblings', () => {
    render(
      <div>
        <RevealSection delayMs={0}>
          <span>First</span>
        </RevealSection>
        <RevealSection delayMs={100}>
          <span>Second</span>
        </RevealSection>
        <RevealSection delayMs={200}>
          <span>Third</span>
        </RevealSection>
      </div>
    );

    expect(screen.getAllByTestId('motion-div').map((element) => (element as HTMLElement).style.transitionDelay)).toEqual([
      '0s',
      '0.1s',
      '0.2s',
    ]);
  });
});
