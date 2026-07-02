import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, act, cleanup } from '@testing-library/react';
import { PromptComposer } from './prompt-composer';
import { MotionProvider } from './motion-provider';

describe('PromptComposer', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });
  
  afterEach(() => {
    cleanup();
    vi.clearAllTimers();
  });

  it('renders correctly in idle state', () => {
    const handlePromptChange = vi.fn();
    const handleSubmit = vi.fn();

    render(
      <MotionProvider>
        <PromptComposer
          state="idle"
          promptValue="I want to go to Lisbon"
          onPromptChange={handlePromptChange}
          onSubmit={handleSubmit}
          examplePrompts={['A 3-day wine tour']}
        />
      </MotionProvider>
    );

    expect(screen.getByRole('textbox', { name: /Trip prompt/i })).toBeDefined();
    expect(screen.getByRole('button', { name: /Generate trip route/i })).toBeDefined();
    expect(screen.getByText('A 3-day wine tour')).toBeDefined();
  });

  it('calls onPromptChange when example is clicked', () => {
    const handlePromptChange = vi.fn();
    
    render(
      <MotionProvider>
        <PromptComposer
          promptValue=""
          onPromptChange={handlePromptChange}
          onSubmit={vi.fn()}
          examplePrompts={['Example 1']}
        />
      </MotionProvider>
    );

    fireEvent.click(screen.getByText('Example 1'));
    expect(handlePromptChange).toHaveBeenCalledWith('Example 1');
  });

  it('shows error state and disables submit if needed', () => {
    render(
      <MotionProvider>
        <PromptComposer
          state="error"
          errorMessage="Custom error message"
          promptValue="text"
          onPromptChange={vi.fn()}
          onSubmit={vi.fn()}
        />
      </MotionProvider>
    );

    expect(screen.getByText('Custom error message')).toBeDefined();
    expect((screen.getByRole('button', { name: /Generate trip route/i }) as HTMLButtonElement).disabled).toBe(true);
  });

  it('shows loading choreography and disables textarea', () => {
    render(
      <MotionProvider>
        <PromptComposer
          state="loading"
          promptValue="text"
          onPromptChange={vi.fn()}
          onSubmit={vi.fn()}
        />
      </MotionProvider>
    );

    expect((screen.getByRole('textbox', { name: /Trip prompt/i }) as HTMLTextAreaElement).disabled).toBe(true);
    expect(screen.getByText('reading your route...')).toBeDefined();
    expect(screen.queryByRole('button', { name: /Generate trip route/i })).toBeNull();

    act(() => {
      vi.advanceTimersByTime(1500);
    });

    expect(screen.getByText('matching regions...')).toBeDefined();
  });

  it('renders follow up panel', () => {
    render(
      <MotionProvider>
        <PromptComposer
          state="follow-up"
          promptValue="text"
          onPromptChange={vi.fn()}
          onSubmit={vi.fn()}
          followUpPanel={<div data-testid="follow-up">Follow Up Panel Content</div>}
        />
      </MotionProvider>
    );

    expect(screen.getByTestId('follow-up')).toBeDefined();
    expect((screen.getByRole('textbox', { name: /Trip prompt/i }) as HTMLTextAreaElement).disabled).toBe(true);
    expect((screen.getByRole('button', { name: /Generate trip route/i }) as HTMLButtonElement).disabled).toBe(true);
  });
});
