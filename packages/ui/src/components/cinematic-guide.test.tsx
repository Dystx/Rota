import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeAll, afterAll } from 'vitest';
import {
  CinematicGuide,
  GuideChapter,
  GuideProgress,
  GuidedNextStep,
  HeroSection,
  CTASection,
} from './cinematic-guide';

describe('CinematicGuide System', () => {
  beforeAll(() => {
    const IntersectionObserverMock = vi.fn(() => ({
      disconnect: vi.fn(),
      observe: vi.fn(),
      takeRecords: vi.fn(),
      unobserve: vi.fn(),
    }));
    vi.stubGlobal('IntersectionObserver', IntersectionObserverMock);
  });

  afterAll(() => {
    vi.unstubAllGlobals();
  });

  it('renders CinematicGuide and registers chapters', () => {
    const chapters = [
      { id: 'ch1', label: 'Chapter 1' },
      { id: 'ch2', label: 'Chapter 2' },
    ];

    render(
      <CinematicGuide>
        <GuideProgress chapters={chapters} />
        <GuideChapter id="ch1">Content 1</GuideChapter>
        <GuideChapter id="ch2">Content 2</GuideChapter>
      </CinematicGuide>
    );

    expect(screen.getByText('Chapter 1')).toBeTruthy();
    expect(screen.getByText('Content 1')).toBeTruthy();
    expect(screen.getByText('Content 2')).toBeTruthy();
  });

  it('renders HeroSection with title and subtitle', () => {
    render(
      <HeroSection title="Hero Title" subtitle="Hero Subtitle" />
    );

    expect(screen.getByText('Hero Title')).toBeTruthy();
    expect(screen.getByText('Hero Subtitle')).toBeTruthy();
  });

  it('renders CTASection', () => {
    render(
      <CTASection>
        <h2>Ready to go?</h2>
      </CTASection>
    );

    expect(screen.getByText('Ready to go?')).toBeTruthy();
  });

  it('renders GuidedNextStep', () => {
    render(
      <GuidedNextStep>
        <button>Next</button>
      </GuidedNextStep>
    );

    expect(screen.getByRole('button', { name: 'Next' })).toBeTruthy();
  });
});
