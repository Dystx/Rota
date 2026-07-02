import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen, within } from '@testing-library/react';
import {
  ChipGroup,
  Field,
  FieldError,
  Input,
  Select,
  SubmitButton,
  Textarea,
  type ChipOption
} from './form-primitives';

afterEach(() => cleanup());

describe('Field', () => {
  it('wires label, description, and input via id and aria-describedby', () => {
    render(
      <Field
        label="Trip prompt"
        description="Tell us what kind of trip you imagine."
      >
        {({ id, ariaDescribedBy, invalid }) => (
          <Input id={id} aria-describedby={ariaDescribedBy} invalid={invalid} />
        )}
      </Field>
    );

    const input = screen.getByLabelText(/trip prompt/i);
    expect(input).toBeTruthy();
    const describedBy = input.getAttribute('aria-describedby');
    expect(describedBy).toBeTruthy();
    const desc = document.getElementById(describedBy as string);
    expect(desc?.textContent).toContain('Tell us what kind of trip you imagine.');
    expect(input.getAttribute('aria-invalid')).toBeNull();
  });

  it('marks invalid and announces inline error via role=alert', () => {
    render(
      <Field label="Email" error="Email is required.">
        {({ id, ariaDescribedBy, invalid }) => (
          <Input id={id} aria-describedby={ariaDescribedBy} invalid={invalid} />
        )}
      </Field>
    );

    const input = screen.getByLabelText(/email/i);
    expect(input.getAttribute('aria-invalid')).toBe('true');
    const alert = screen.getByRole('alert');
    expect(alert.textContent).toBe('Email is required.');
    expect(input.getAttribute('aria-describedby')).toContain(alert.id);
  });

  it('renders required indicator with sr-only text', () => {
    render(
      <Field label="Region" required>
        {({ id }) => <Input id={id} />}
      </Field>
    );
    expect(screen.getByText(/\(required\)/i)).toBeTruthy();
  });
});

describe('FieldError', () => {
  it('renders nothing when no children', () => {
    const { container } = render(<FieldError>{null}</FieldError>);
    expect(container.firstChild).toBeNull();
  });

  it('renders alert role when children provided', () => {
    render(<FieldError>Required</FieldError>);
    expect(screen.getByRole('alert').textContent).toBe('Required');
  });
});

describe('Input / Textarea / Select', () => {
  it('Input applies aria-invalid only when invalid=true', () => {
    const { rerender } = render(<Input aria-label="x" />);
    expect(screen.getByLabelText('x').getAttribute('aria-invalid')).toBeNull();
    rerender(<Input aria-label="x" invalid />);
    expect(screen.getByLabelText('x').getAttribute('aria-invalid')).toBe('true');
  });

  it('Textarea is disabled when disabled prop set', () => {
    render(<Textarea aria-label="brief" disabled />);
    const ta = screen.getByLabelText('brief') as HTMLTextAreaElement;
    expect(ta.disabled).toBe(true);
  });

  it('Select renders options and reports invalid', () => {
    render(
      <Select aria-label="pace" invalid defaultValue="calm">
        <option value="calm">Calm</option>
        <option value="full">Full</option>
      </Select>
    );
    const sel = screen.getByLabelText('pace');
    expect(sel.getAttribute('aria-invalid')).toBe('true');
    expect(within(sel as HTMLSelectElement).getByText('Calm')).toBeTruthy();
  });
});

describe('ChipGroup (single)', () => {
  const paceOptions: ChipOption<'calm' | 'balanced' | 'full'>[] = [
    { value: 'calm', label: 'Calm' },
    { value: 'balanced', label: 'Balanced' },
    { value: 'full', label: 'Full' }
  ];

  it('exposes radiogroup and aria-checked on selected chip', () => {
    const onChange = vi.fn();
    render(
      <ChipGroup
        ariaLabel="Pace"
        options={paceOptions}
        value="balanced"
        onChange={onChange}
      />
    );
    const group = screen.getByRole('radiogroup', { name: 'Pace' });
    expect(group).toBeTruthy();
    const radios = within(group).getAllByRole('radio');
    expect(radios).toHaveLength(3);
    expect(radios[1]?.getAttribute('aria-checked')).toBe('true');
    expect(radios[0]?.getAttribute('aria-checked')).toBe('false');
  });

  it('selects via click and arrow keys', () => {
    const onChange = vi.fn();
    render(
      <ChipGroup
        ariaLabel="Pace"
        options={paceOptions}
        value="calm"
        onChange={onChange}
      />
    );
    const group = screen.getByRole('radiogroup', { name: 'Pace' });
    const radios = within(group).getAllByRole('radio');
    fireEvent.click(radios[2]!);
    expect(onChange).toHaveBeenLastCalledWith('full');

    fireEvent.keyDown(radios[0]!, { key: 'ArrowRight' });
    expect(onChange).toHaveBeenLastCalledWith('balanced');

    fireEvent.keyDown(radios[0]!, { key: 'End' });
    expect(onChange).toHaveBeenLastCalledWith('full');
  });

  it('respects disabled flag and skips disabled options on keyboard', () => {
    const onChange = vi.fn();
    render(
      <ChipGroup
        ariaLabel="Pace"
        options={[
          { value: 'calm', label: 'Calm' },
          { value: 'balanced', label: 'Balanced', disabled: true },
          { value: 'full', label: 'Full' }
        ]}
        value="calm"
        onChange={onChange}
      />
    );
    const group = screen.getByRole('radiogroup');
    const radios = within(group).getAllByRole('radio');
    fireEvent.keyDown(radios[0]!, { key: 'ArrowRight' });
    expect(onChange).toHaveBeenLastCalledWith('full');
  });
});

describe('ChipGroup (multiple)', () => {
  const interestOptions: ChipOption<'food' | 'wine' | 'sea'>[] = [
    { value: 'food', label: 'Food' },
    { value: 'wine', label: 'Wine' },
    { value: 'sea', label: 'Sea views' }
  ];

  it('toggles selection and exposes aria-pressed', () => {
    const onChange = vi.fn();
    render(
      <ChipGroup
        multiple
        ariaLabel="Interests"
        options={interestOptions}
        value={['wine']}
        onChange={onChange}
      />
    );
    const group = screen.getByRole('group', { name: 'Interests' });
    const buttons = within(group).getAllByRole('button');
    expect(buttons[1]?.getAttribute('aria-pressed')).toBe('true');
    expect(buttons[0]?.getAttribute('aria-pressed')).toBe('false');

    fireEvent.click(buttons[0]!);
    expect(onChange).toHaveBeenLastCalledWith(['wine', 'food']);

    fireEvent.click(buttons[1]!);
    expect(onChange).toHaveBeenLastCalledWith([]);
  });

  it('Space key toggles selection', () => {
    const onChange = vi.fn();
    render(
      <ChipGroup
        multiple
        ariaLabel="Interests"
        options={interestOptions}
        value={[]}
        onChange={onChange}
      />
    );
    const buttons = screen.getAllByRole('button');
    fireEvent.keyDown(buttons[0]!, { key: ' ' });
    expect(onChange).toHaveBeenLastCalledWith(['food']);
  });
});

describe('SubmitButton', () => {
  it('shows loading label and aria-busy when loading', () => {
    render(<SubmitButton loading>Save</SubmitButton>);
    const btn = screen.getByRole('button');
    expect(btn.getAttribute('aria-busy')).toBe('true');
    expect(btn.textContent).toContain('Saving');
    expect((btn as HTMLButtonElement).disabled).toBe(true);
  });

  it('is disabled when disabled prop is set', () => {
    render(<SubmitButton disabled>Save</SubmitButton>);
    expect((screen.getByRole('button') as HTMLButtonElement).disabled).toBe(true);
  });

  it('renders children and submit type when idle', () => {
    render(<SubmitButton>Save brief</SubmitButton>);
    const btn = screen.getByRole('button') as HTMLButtonElement;
    expect(btn.textContent).toBe('Save brief');
    expect(btn.type).toBe('submit');
    expect(btn.disabled).toBe(false);
  });
});
