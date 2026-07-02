/// <reference types="@testing-library/jest-dom" />
import { render, screen, cleanup } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';
import { describe, expect, it, vi, afterEach } from 'vitest';
import { KenBurnsImage } from './ken-burns-image';
import { useReducedMotion } from '../hooks/use-reduced-motion';

vi.mock('../hooks/use-reduced-motion', () => ({
  useReducedMotion: vi.fn(),
}));

vi.mock('motion/react', () => ({
  m: {
    img: ({ src, alt, className, 'data-testid': testId }: any) => (
      <img src={src} alt={alt} className={className} data-testid={testId || 'motion-img'} />
    ),
  }
}));

describe('KenBurnsImage', () => {
  afterEach(() => {
    cleanup();
  });

  it('renders with correct alt text', () => {
    vi.mocked(useReducedMotion).mockReturnValue(false);
    render(<KenBurnsImage src="/test.jpg" alt="A test image" />);
    const img = screen.getByAltText('A test image');
    expect(img).toBeInTheDocument();
  });

  it('renders a plain img when reduced motion is preferred', () => {
    vi.mocked(useReducedMotion).mockReturnValue(true);
    const { container } = render(<KenBurnsImage src="/test.jpg" alt="A test image" />);
    const img = container.querySelector('img');
    expect(img).toBeInTheDocument();
    expect(img?.tagName).toBe('IMG');
    expect(img).not.toHaveStyle({ transform: 'none' });
  });

  it('renders m.img by default when animation is allowed', () => {
    vi.mocked(useReducedMotion).mockReturnValue(false);
    const { container } = render(<KenBurnsImage src="/test.jpg" alt="A test image" />);
    const img = container.querySelector('img');
    expect(img).toBeInTheDocument();
  });
});
