import { cleanup, fireEvent, render } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { ChapterNav } from './chapter-nav';

beforeEach(() => {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: vi.fn().mockImplementation(() => ({
      matches: false,
      media: '',
      onchange: null,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      addListener: vi.fn(),
      removeListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  });
});

const chapters = [
  { id: 'intro', label: 'Introduction' },
  { id: 'context', label: 'Context' },
  { id: 'plan', label: 'Plan' },
  { id: 'review', label: 'Review' },
  { id: 'done', label: 'Done' },
];

describe('ChapterNav', () => {
  afterEach(() => {
    cleanup();
  });

  it('fires click selections with click source', () => {
    const onSelect = vi.fn();

    const { container } = render(<ChapterNav chapters={chapters} activeChapterId="plan" onSelect={onSelect} />);

    fireEvent.click(container.querySelector('[data-chapter-id="context"]')!);

    expect(onSelect).toHaveBeenCalledWith('context', 'click');
  });

  it('ArrowDown from chapter index 2 selects the next chapter', () => {
    const onSelect = vi.fn();

    const { container } = render(<ChapterNav chapters={chapters} activeChapterId="plan" onSelect={onSelect} />);

    fireEvent.keyDown(container.querySelector('[data-chapter-id="plan"]')!, { key: 'ArrowDown' });

    expect(onSelect).toHaveBeenCalledWith('review', 'keyboard');
  });

  it('End selects the last chapter', () => {
    const onSelect = vi.fn();

    const { container } = render(<ChapterNav chapters={chapters} activeChapterId="plan" onSelect={onSelect} />);

    fireEvent.keyDown(container.querySelector('[data-chapter-id="plan"]')!, { key: 'End' });

    expect(onSelect).toHaveBeenCalledWith('done', 'keyboard');
  });

  it('Home selects the first chapter', () => {
    const onSelect = vi.fn();

    const { container } = render(<ChapterNav chapters={chapters} activeChapterId="plan" onSelect={onSelect} />);

    fireEvent.keyDown(container.querySelector('[data-chapter-id="plan"]')!, { key: 'Home' });

    expect(onSelect).toHaveBeenCalledWith('intro', 'keyboard');
  });

  it('falls back to the first chapter when the active id is missing', () => {
    const onSelect = vi.fn();

    const { container } = render(<ChapterNav chapters={chapters} activeChapterId="missing" onSelect={onSelect} />);

    expect(container.querySelector('[data-chapter-id="intro"]')?.getAttribute('aria-current')).toBe('step');
    expect(container.querySelector('[data-chapter-id="context"]')?.getAttribute('aria-current')).toBeNull();
  });

  it('applies aria-current only to the active chapter', () => {
    const onSelect = vi.fn();

    const { container } = render(<ChapterNav chapters={chapters} activeChapterId="review" onSelect={onSelect} />);

    expect(container.querySelector('[data-chapter-id="review"]')?.getAttribute('aria-current')).toBe('step');
    expect(container.querySelector('[data-chapter-id="intro"]')?.getAttribute('aria-current')).toBeNull();
    expect(container.querySelector('[data-chapter-id="context"]')?.getAttribute('aria-current')).toBeNull();
  });
});
