import * as React from "react";
import { cn } from "../lib/cn";

export type ErrorStateVariant = "cinematic" | "compact" | "table" | "form" | "map";

export interface ErrorStateProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: ErrorStateVariant;
  title?: string;
  message?: string;
  error?: Error | unknown;
  showDetails?: boolean;
  onRetry?: () => void;
  /** A server-rendered recovery destination for routes without client state. */
  retryHref?: string;
  retryText?: string;
  icon?: React.ReactNode;
}

export const ErrorState = React.forwardRef<HTMLDivElement, ErrorStateProps>(
  (
    { 
      variant = "cinematic", 
      title = "Something went wrong", 
      message = "We encountered an unexpected issue while loading this content.", 
      error,
      showDetails = false,
      onRetry,
      retryHref,
      retryText = "Try again",
      icon,
      className, 
      ...props 
    },
    ref
  ) => {
    const baseClasses = "flex flex-col items-center justify-center text-center";

    const variantClasses = {
      cinematic: "min-h-[60vh] py-16 md:py-24 px-4 sm:px-8 max-w-2xl mx-auto",
      compact: "py-8 px-4",
      table: "py-16 px-4 bg-white/40 border-b border-olive-light/20",
      form: "py-12 px-4 border border-dashed border-ochre-light/40 rounded-[var(--radius-glass)] bg-ochre-light/5",
      map: "absolute inset-0 bg-paper/85 backdrop-blur-sm z-10",
    };

    let errorDetails = null;
    if (showDetails && error) {
      if (error instanceof Error) {
        errorDetails = error.message;
      } else if (typeof error === "string") {
        errorDetails = error;
      } else {
        try {
          errorDetails = JSON.stringify(error);
        } catch {
          errorDetails = "Unknown error format";
        }
      }
    }

    return (
      <div
        ref={ref}
        className={cn(baseClasses, variantClasses[variant], className)}
        {...props}
      >
        <div className={cn("mb-4 text-ochre-dark", variant === 'cinematic' ? 'scale-125 mb-6' : '')}>
          {icon || (
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="12" y1="8" x2="12" y2="12"></line>
              <line x1="12" y1="16" x2="12.01" y2="16"></line>
            </svg>
          )}
        </div>
        
        <h3
          className={cn(
            "text-primary",
            variant === "cinematic" ? "font-display mb-4 text-3xl" : "font-medium text-lg mb-2"
          )}
        >
          {title}
        </h3>
        
        <p
          className={cn(
            "text-on-surface-variant max-w-md mx-auto",
            variant === "cinematic" ? "text-lg mb-8" : "text-sm mb-4"
          )}
        >
          {message}
        </p>

        {showDetails && errorDetails && (
          <div className="mt-4 p-4 bg-olive-light/15 border border-ochre-light/40 rounded-md max-w-full overflow-auto text-left w-full text-xs font-mono text-ochre-dark">
            {errorDetails}
          </div>
        )}

        {retryHref ? (
          <a
            href={retryHref}
            className="inline-flex min-h-[44px] items-center justify-center rounded-full bg-ink px-4 py-2 font-medium text-sm text-cream transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ochre-light focus-visible:ring-offset-2"
          >
            {retryText}
          </a>
        ) : onRetry ? (
          <button
            type="button"
            onClick={onRetry}
            className={cn(
              "px-4 py-2 min-h-[44px] bg-ink text-cream rounded-full font-medium text-sm transition-opacity hover:opacity-90",
              showDetails && errorDetails ? "mt-4" : ""
            )}
          >
            {retryText}
          </button>
        ) : null}
      </div>
    );
  }
);
ErrorState.displayName = "ErrorState";
