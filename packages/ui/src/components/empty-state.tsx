import * as React from "react";
import { cn } from "../lib/cn";

export type EmptyStateVariant = "cinematic" | "compact" | "table" | "form" | "map";

export interface EmptyStateProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: EmptyStateVariant;
  title: string;
  description?: string;
  icon?: React.ReactNode;
  action?: React.ReactNode;
}

export const EmptyState = React.forwardRef<HTMLDivElement, EmptyStateProps>(
  (
    { variant = "cinematic", title, description, icon, action, className, ...props },
    ref
  ) => {
    const baseClasses = "flex flex-col items-center justify-center text-center";

    const variantClasses = {
      cinematic: "min-h-[60vh] py-16 md:py-24 px-4 sm:px-8 max-w-2xl mx-auto",
      compact: "py-8 px-4",
      table: "py-16 px-4 bg-[rgba(255,255,255,0.4)] border-b border-[var(--color-border)]",
      form: "py-12 px-4 border border-dashed border-[var(--color-border)] rounded-[var(--radius-glass)]",
      map: "absolute inset-0 bg-[rgba(253,251,247,0.85)] backdrop-blur-sm z-10",
    };

    return (
      <div
        ref={ref}
        className={cn(baseClasses, variantClasses[variant], className)}
        {...props}
      >
        {icon && (
          <div className={cn("mb-6 text-[var(--color-muted-foreground)]", variant === 'cinematic' ? 'scale-150 mb-8' : '')}>
            {icon}
          </div>
        )}
        <h3
          className={cn(
            "text-[var(--color-foreground)]",
            variant === "cinematic" ? "rota-heading mb-4" : "font-medium text-lg mb-2"
          )}
        >
          {title}
        </h3>
        {description && (
          <p
            className={cn(
              "text-[var(--color-muted-foreground)] max-w-md mx-auto",
              variant === "cinematic" ? "text-lg" : "text-sm"
            )}
          >
            {description}
          </p>
        )}
        {action && <div className={cn("mt-8", variant === 'cinematic' ? 'mt-12' : '')}>{action}</div>}
      </div>
    );
  }
);
EmptyState.displayName = "EmptyState";
