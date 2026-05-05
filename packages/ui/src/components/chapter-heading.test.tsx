import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ChapterHeading } from './chapter-heading';

describe('ChapterHeading', () => {
  it('renders index and title', () => {
    render(<ChapterHeading index={1} title="The Beginning" />);
    
    expect(screen.getByRole('banner')).toBeDefined();
    expect(screen.getByRole('heading', { level: 2, name: 'The Beginning' })).toBeDefined();
    expect(screen.getByText('01')).toBeDefined();
  });

  it('renders eyebrow and subtitle when provided', () => {
    render(
      <ChapterHeading 
        index={2} 
        title="Middle" 
        eyebrow="Part Two" 
        subtitle="This is the middle part" 
      />
    );
    
    expect(screen.getByText('Part Two')).toBeDefined();
    expect(screen.getByText('This is the middle part')).toBeDefined();
  });

  it('applies semantic classes', () => {
    render(<ChapterHeading index={1} title="Classes Test" subtitle="Subtitle" eyebrow="Eyebrow" />);
    
    const eyebrowP = screen.getByText('Eyebrow').parentElement;
    const titleH2 = screen.getByRole('heading', { level: 2, name: 'Classes Test' });
    const subtitleP = screen.getByText('Subtitle');

    expect(eyebrowP?.className).toContain('text-iberian-gold');
    expect(titleH2.className).toContain('text-iberian-limestone');
    expect(subtitleP.className).toContain('text-iberian-limestone/70');
  });

  it('applies alignment classes', () => {
    const { container } = render(<ChapterHeading index={1} title="Center" align="center" />);
    expect(container.firstChild).toHaveProperty('className');
    expect((container.firstChild as HTMLElement).className).toContain('items-center text-center');
  });
});
