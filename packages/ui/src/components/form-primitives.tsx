'use client';

import {
  type ButtonHTMLAttributes,
  type ChangeEvent,
  type HTMLAttributes,
  type InputHTMLAttributes,
  type KeyboardEvent,
  type LabelHTMLAttributes,
  type ReactNode,
  type SelectHTMLAttributes,
  type TextareaHTMLAttributes,
  forwardRef,
  useId,
  useMemo
} from 'react';
import { cn } from '../lib/cn';

/**
 * Shared form primitives consumed by traveler and admin surfaces.
 * Field threads label/description/error via aria-describedby + aria-invalid.
 * ChipGroup follows WAI-ARIA radiogroup (single) and group (multi) keyboard semantics.
 * Errors render synchronously and are not gated by motion.
 */

export interface FieldRenderProps {
  id: string;
  descriptionId?: string;
  errorId?: string;
  invalid: boolean;
  ariaDescribedBy?: string;
}

export interface FieldProps extends Omit<HTMLAttributes<HTMLDivElement>, 'children'> {
  label: ReactNode;
  description?: ReactNode;
  error?: ReactNode;
  required?: boolean;
  htmlFor?: string;
  children: (props: FieldRenderProps) => ReactNode;
}

export function Field({
  label,
  description,
  error,
  required,
  htmlFor,
  className,
  children,
  ...rest
}: FieldProps) {
  const generatedId = useId();
  const id = htmlFor ?? `field-${generatedId}`;
  const descriptionId = description ? `${id}-description` : undefined;
  const errorId = error ? `${id}-error` : undefined;
  const invalid = Boolean(error);

  const ariaDescribedBy = useMemo(() => {
    return [descriptionId, errorId].filter(Boolean).join(' ') || undefined;
  }, [descriptionId, errorId]);

  return (
    <div className={cn('flex flex-col gap-1.5', className)} {...rest}>
      <Label htmlFor={id} required={required}>
        {label}
      </Label>
      {description ? (
        <p
          id={descriptionId}
          className="text-[13px] leading-relaxed text-[var(--color-muted-foreground)]"
        >
          {description}
        </p>
      ) : null}
      {children({ id, descriptionId, errorId, invalid, ariaDescribedBy })}
      {error ? <FieldError id={errorId}>{error}</FieldError> : null}
    </div>
  );
}

export interface LabelProps extends LabelHTMLAttributes<HTMLLabelElement> {
  required?: boolean;
}

export const Label = forwardRef<HTMLLabelElement, LabelProps>(function Label(
  { required, className, children, ...props },
  ref
) {
  return (
    <label
      ref={ref}
      className={cn(
        'text-xs uppercase tracking-widest text-[var(--color-muted-foreground)] font-semibold',
        className
      )}
      {...props}
    >
      {children}
      {required ? (
        <span aria-hidden="true" className="ml-1 text-[var(--color-atlantic)]">
          *
        </span>
      ) : null}
      {required ? <span className="sr-only"> (required)</span> : null}
    </label>
  );
});

export type FieldErrorProps = HTMLAttributes<HTMLParagraphElement>;

export const FieldError = forwardRef<HTMLParagraphElement, FieldErrorProps>(
  function FieldError({ className, children, ...props }, ref) {
    if (!children) return null;
    return (
      <p
        ref={ref}
        role="alert"
        aria-live="polite"
        className={cn(
          'text-[13px] leading-relaxed font-medium text-[var(--color-status-danger-fg)]',
          className
        )}
        {...props}
      >
        {children}
      </p>
    );
  }
);

const controlBaseClass =
  'w-full rounded-[var(--radius-glass,16px)] border bg-white/80 px-4 py-3 text-[15px] leading-relaxed text-[var(--color-ink)] placeholder:text-[var(--color-muted-foreground)] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)] focus-visible:ring-offset-1 focus-visible:ring-offset-[var(--color-background)] disabled:opacity-50 disabled:cursor-not-allowed';

const validBorderClass = 'border-[var(--color-border)] focus:border-[var(--color-atlantic)]';
const invalidBorderClass =
  'border-[var(--color-status-danger-border)] focus:border-[var(--color-status-danger-border)]';

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  invalid?: boolean;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { invalid, className, ...props },
  ref
) {
  return (
    <input
      ref={ref}
      aria-invalid={invalid || undefined}
      className={cn(controlBaseClass, invalid ? invalidBorderClass : validBorderClass, className)}
      {...props}
    />
  );
});

export interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  invalid?: boolean;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(function Textarea(
  { invalid, className, rows = 4, ...props },
  ref
) {
  return (
    <textarea
      ref={ref}
      rows={rows}
      aria-invalid={invalid || undefined}
      className={cn(
        controlBaseClass,
        'resize-y min-h-[96px]',
        invalid ? invalidBorderClass : validBorderClass,
        className
      )}
      {...props}
    />
  );
});

export interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  invalid?: boolean;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(function Select(
  { invalid, className, children, ...props },
  ref
) {
  return (
    <select
      ref={ref}
      aria-invalid={invalid || undefined}
      className={cn(
        controlBaseClass,
        'appearance-none pr-10 text-[var(--color-muted-foreground)]',
        invalid ? invalidBorderClass : validBorderClass,
        className
      )}
      style={{
        backgroundImage:
          'linear-gradient(45deg, transparent 50%, currentColor 50%), linear-gradient(135deg, currentColor 50%, transparent 50%)',
        backgroundPosition:
          'calc(100% - 18px) calc(50% - 2px), calc(100% - 13px) calc(50% - 2px)',
        backgroundSize: '5px 5px, 5px 5px',
        backgroundRepeat: 'no-repeat',
        color: 'var(--color-ink)',
      }}
      {...props}
    >
      {children}
    </select>
  );
});

export interface ChipOption<T extends string = string> {
  value: T;
  label: ReactNode;
  description?: ReactNode;
  disabled?: boolean;
}

export interface ChipGroupSingleProps<T extends string = string>
  extends Omit<HTMLAttributes<HTMLDivElement>, 'onChange' | 'defaultValue'> {
  options: ReadonlyArray<ChipOption<T>>;
  value: T | null;
  onChange: (next: T) => void;
  multiple?: false;
  ariaLabel?: string;
  invalid?: boolean;
  id?: string;
  describedBy?: string;
  disabled?: boolean;
}

export interface ChipGroupMultipleProps<T extends string = string>
  extends Omit<HTMLAttributes<HTMLDivElement>, 'onChange' | 'defaultValue'> {
  options: ReadonlyArray<ChipOption<T>>;
  value: ReadonlyArray<T>;
  onChange: (next: T[]) => void;
  multiple: true;
  ariaLabel?: string;
  invalid?: boolean;
  id?: string;
  describedBy?: string;
  disabled?: boolean;
}

export type ChipGroupProps<T extends string = string> =
  | ChipGroupSingleProps<T>
  | ChipGroupMultipleProps<T>;

export function ChipGroup<T extends string = string>(props: ChipGroupProps<T>) {
  const {
    options,
    ariaLabel,
    invalid,
    className,
    id,
    describedBy,
    disabled,
    value: _value,
    onChange: _onChange,
    multiple: _multiple,
    ...rest
  } = props as ChipGroupProps<T> & { className?: string };
  void _value;
  void _onChange;
  void _multiple;

  const isMultiple = props.multiple === true;
  const role = isMultiple ? 'group' : 'radiogroup';

  function isSelected(value: T): boolean {
    if (isMultiple) {
      return (props as ChipGroupMultipleProps<T>).value.includes(value);
    }
    return (props as ChipGroupSingleProps<T>).value === value;
  }

  function handleSelect(value: T) {
    if (disabled) return;
    if (isMultiple) {
      const current = (props as ChipGroupMultipleProps<T>).value;
      const next = current.includes(value)
        ? current.filter((v) => v !== value)
        : [...current, value];
      (props as ChipGroupMultipleProps<T>).onChange(next as T[]);
    } else {
      (props as ChipGroupSingleProps<T>).onChange(value);
    }
  }

  function handleKeyDown(event: KeyboardEvent<HTMLButtonElement>, index: number) {
    if (disabled) return;
    const enabledIndexes = options
      .map((o, i) => ({ o, i }))
      .filter(({ o }) => !o.disabled)
      .map(({ i }) => i);
    if (enabledIndexes.length === 0) return;

    const currentEnabledPos = enabledIndexes.indexOf(index);
    let nextIndex: number | null = null;

    switch (event.key) {
      case 'ArrowRight':
      case 'ArrowDown':
        event.preventDefault();
        nextIndex =
          enabledIndexes[(currentEnabledPos + 1 + enabledIndexes.length) % enabledIndexes.length] ??
          null;
        break;
      case 'ArrowLeft':
      case 'ArrowUp':
        event.preventDefault();
        nextIndex =
          enabledIndexes[(currentEnabledPos - 1 + enabledIndexes.length) % enabledIndexes.length] ??
          null;
        break;
      case 'Home':
        event.preventDefault();
        nextIndex = enabledIndexes[0] ?? null;
        break;
      case 'End':
        event.preventDefault();
        nextIndex = enabledIndexes[enabledIndexes.length - 1] ?? null;
        break;
      case ' ':
      case 'Enter':
        event.preventDefault();
        handleSelect(options[index]!.value);
        return;
      default:
        return;
    }

    if (nextIndex != null) {
      const target = event.currentTarget.parentElement?.querySelectorAll<HTMLButtonElement>(
        '[data-chip="true"]'
      );
      target?.[nextIndex]?.focus();
      // WAI-ARIA radiogroup: arrow keys also move selection, not just focus.
      if (!isMultiple) {
        handleSelect(options[nextIndex]!.value);
      }
    }
  }

  return (
    <div
      id={id}
      role={role}
      aria-label={ariaLabel}
      aria-invalid={invalid || undefined}
      aria-describedby={describedBy}
      className={cn('flex flex-wrap gap-2', className)}
      {...rest}
    >
      {options.map((option, index) => {
        const selected = isSelected(option.value);
        const isDisabled = disabled || option.disabled;
        const ariaProps = isMultiple
          ? { 'aria-pressed': selected }
          : { role: 'radio' as const, 'aria-checked': selected };
        const tabIndex = isMultiple
          ? 0
          : selected || (props as ChipGroupSingleProps<T>).value == null
            ? 0
            : -1;
        return (
          <button
            key={option.value}
            type="button"
            data-chip="true"
            data-selected={selected || undefined}
            disabled={isDisabled}
            tabIndex={isDisabled ? -1 : tabIndex}
            onClick={() => handleSelect(option.value)}
            onKeyDown={(event) => handleKeyDown(event, index)}
            className={cn(
              'inline-flex items-center gap-1.5 rounded-full border px-4 py-2 min-h-[44px] text-[13px] font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)] focus-visible:ring-offset-1 focus-visible:ring-offset-[var(--color-background)] disabled:opacity-50 disabled:cursor-not-allowed',
              selected
                ? 'border-[var(--color-atlantic)] bg-[var(--color-atlantic)] text-white shadow-[var(--shadow-stat-card)]'
                : 'border-[var(--color-border)] bg-[var(--color-cream)] text-[var(--color-ink)] hover:bg-white hover:border-[var(--color-atlantic)]'
            )}
            {...ariaProps}
          >
            <span>{option.label}</span>
            {option.description ? (
              <span
                className={cn(
                  'text-[11px]',
                  selected ? 'text-white/80' : 'text-[var(--color-muted-foreground)]'
                )}
              >
                {option.description}
              </span>
            ) : null}
          </button>
        );
      })}
    </div>
  );
}

export interface SubmitButtonProps
  extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'type' | 'children'> {
  loading?: boolean;
  loadingLabel?: string;
  children: ReactNode;
  className?: string;
}

export const SubmitButton = forwardRef<HTMLButtonElement, SubmitButtonProps>(
  function SubmitButton(
    { loading, loadingLabel = 'Saving…', disabled, children, className, ...props },
    ref
  ) {
    const isDisabled = disabled || loading;
    return (
      <button
        ref={ref}
        {...props}
        type="submit"
        disabled={isDisabled}
        aria-busy={loading || undefined}
        className={cn(
          'inline-flex items-center justify-center gap-2 rounded-full bg-[var(--color-foreground)] px-6 py-3 text-[15px] font-medium text-[var(--color-background)] shadow-[var(--shadow-stat-card)] transition-all hover:shadow-[var(--shadow-elevated)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--color-background)] disabled:opacity-60 disabled:cursor-not-allowed',
          className
        )}
      >
        {loading ? (
          <>
            <span
              aria-hidden="true"
              className="h-4 w-4 animate-spin rounded-full border-2 border-current border-r-transparent"
            />
            <span>{loadingLabel}</span>
          </>
        ) : (
          children
        )}
      </button>
    );
  }
);

export function getInputValue(
  event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
): string {
  return event.target.value;
}

/* ---------------------------------------------------------------------------
 * PR-3 InputAffix — input with leading / trailing icon or text.
 *
 * Used when an input needs visual context that a bare <input> cannot
 * express, e.g. a € price prefix or a search icon. The wrapper is
 * presentational; the inner <input> is the focusable element so the
 * existing accessibility tree is unchanged.
 * ------------------------------------------------------------------------- */

export interface InputAffixProps extends InputHTMLAttributes<HTMLInputElement> {
  leading?: ReactNode;
  trailing?: ReactNode;
  invalid?: boolean;
  inputClassName?: string;
}

export const InputAffix = forwardRef<HTMLInputElement, InputAffixProps>(
  function InputAffix(
    { leading, trailing, invalid, className, inputClassName, ...props },
    ref
  ) {
    return (
      <div
        className={cn(
          'flex items-center gap-2 rounded-[var(--radius-md,12px)] border bg-white/80 px-3 transition-colors',
          'focus-within:ring-2 focus-within:ring-[var(--color-accent)] focus-within:ring-offset-1',
          invalid
            ? 'border-[var(--color-status-danger-border)]'
            : 'border-[var(--color-border)]',
          className
        )}
      >
        {leading ? (
          <span className="text-[var(--color-muted-foreground)] select-none">
            {leading}
          </span>
        ) : null}
        <input
          ref={ref}
          {...props}
          className={cn(
            'h-10 flex-1 bg-transparent text-[15px] leading-relaxed text-[var(--color-ink)] placeholder:text-[var(--color-muted-foreground)] focus:outline-none disabled:opacity-50',
            inputClassName
          )}
        />
        {trailing ? (
          <span className="text-[var(--color-muted-foreground)] select-none">
            {trailing}
          </span>
        ) : null}
      </div>
    );
  }
);
