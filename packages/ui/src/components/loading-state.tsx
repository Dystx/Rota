import * as React from "react";
import { cn } from "../lib/cn";

export type LoadingStateVariant = "cinematic" | "compact" | "table" | "form" | "map";

export interface LoadingStateProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: LoadingStateVariant;
  text?: string;
  hideSpinner?: boolean;
}

export const LoadingState = React.forwardRef<HTMLDivElement, LoadingStateProps>(
  (
    { variant = "cinematic", text, hideSpinner = false, className, ...props },
    ref
  ) => {
    const baseClasses = "flex flex-col items-center justify-center text-center animate-pulse";

    const variantClasses = {
      cinematic: "min-h-[60vh] py-16 md:py-24 px-4",
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
        {!hideSpinner && (
          <div className="mb-4">
            <svg
              className={cn("animate-spin text-[var(--color-accent)]", variant === "cinematic" ? "h-12 w-12" : "h-6 w-6")}
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              ></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
          </div>
        )}
        {text && (
          <p
            className={cn(
              "text-[var(--color-muted-foreground)] tracking-wide uppercase font-medium",
              variant === "cinematic" ? "text-sm" : "text-xs"
            )}
          >
            {text}
          </p>
        )}
      </div>
    );
  }
);
LoadingState.displayName = "LoadingState";

export const Skeleton = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn("animate-pulse rounded-md bg-[rgba(127,178,196,0.15)]", className)}
        {...props}
      />
    );
  }
);
Skeleton.displayName = "Skeleton";
