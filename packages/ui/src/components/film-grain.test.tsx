/// <reference types="@testing-library/jest-dom" />
import { render, screen, cleanup } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';
import { describe, expect, it, vi, afterEach } from 'vitest';
import { FilmGrain } from './film-grain';
import { useReducedMotion } from '../hooks/use-reduced-motion';

vi.mock('../hooks/use-reduced-motion', () => ({
  useReducedMotion: vi.fn(),
}));

describe('FilmGrain', () => {
  afterEach(() => {
    cleanup();
  });

  it('renders SVG filter when motion is allowed', () => {
    vi.mocked(useReducedMotion).mockReturnValue(false);
    render(<FilmGrain />);
    const svg = screen.getByTestId('film-grain-svg');
    expect(svg).toBeInTheDocument();
    const filter = svg.querySelector('filter feTurbulence');
    expect(filter).toBeInTheDocument();
  });

  it('renders nothing when reduced motion is preferred', () => {
    vi.mocked(useReducedMotion).mockReturnValue(true);
    const { container } = render(<FilmGrain />);
    expect(container).toBeEmptyDOMElement();
  });

  it('maps intensity to opacity correctly', () => {
    vi.mocked(useReducedMotion).mockReturnValue(false);
    const { rerender } = render(<FilmGrain intensity="subtle" />);
    
    let containerElement = screen.getByTestId('film-grain-container');
    expect(containerElement).toHaveStyle({ opacity: '0.04' });
    
    rerender(<FilmGrain intensity="medium" />);
    containerElement = screen.getByTestId('film-grain-container');
    expect(containerElement).toHaveStyle({ opacity: '0.08' });

    rerender(<FilmGrain intensity="strong" />);
    containerElement = screen.getByTestId('film-grain-container');
    expect(containerElement).toHaveStyle({ opacity: '0.14' });
  });
});
