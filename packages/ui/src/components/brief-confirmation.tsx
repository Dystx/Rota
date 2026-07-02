import type { HTMLAttributes, ReactNode } from 'react';
import { cn } from '../lib/cn';
import { Card, CardHeader, CardTitle, CardContent } from './card';

export interface BriefFieldProps {
  label: string;
  value: ReactNode;
  onEdit?: () => void;
}

export function BriefField({ label, value, onEdit }: BriefFieldProps) {
  return (
    <div className="flex flex-col gap-1.5 py-4 border-b border-[var(--color-border)] last:border-0 group">
      <div className="flex justify-between items-center">
        <dt className="text-xs uppercase tracking-widest text-[var(--color-muted-foreground)] font-semibold">
          {label}
        </dt>
        {onEdit && (
          <button 
            type="button" 
            onClick={onEdit}
            className="opacity-0 group-hover:opacity-100 focus:opacity-100 text-xs text-[var(--color-atlantic)] font-medium hover:underline transition-opacity focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)] rounded px-1"
            aria-label={`Edit ${label}`}
          >
            Edit
          </button>
        )}
      </div>
      <dd className="text-base text-[var(--color-ink)] leading-relaxed">
        {value || <span className="text-[var(--color-muted-foreground)] italic">Not specified</span>}
      </dd>
    </div>
  );
}

export interface BriefConfirmationProps extends HTMLAttributes<HTMLDivElement> {
  title?: string;
  description?: string;
  children: ReactNode;
  actions?: ReactNode;
}

export function BriefConfirmation({
  title = "Review your trip brief",
  description = "Here is what we gathered from your prompt. You can adjust any details before we generate your final itinerary.",
  children,
  actions,
  className,
  ...props
}: BriefConfirmationProps) {
  return (
    <Card className={cn("w-full max-w-2xl mx-auto", className)} {...props}>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <p className="text-[var(--color-muted-foreground)] text-[15px] leading-relaxed">{description}</p>
      </CardHeader>
      <CardContent>
        <dl className="flex flex-col mt-2">
          {children}
        </dl>
        {actions && (
          <div className="mt-8 pt-6 border-t border-[var(--color-border)] flex items-center justify-end gap-4">
            {actions}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
