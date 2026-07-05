import type {
  AnchorHTMLAttributes,
  ButtonHTMLAttributes,
  ReactElement,
  ReactNode
} from "react";
import { cloneElement, isValidElement } from "react";
import { cn } from "../lib/cn";

type SharedProps = {
  children: ReactNode;
  variant?: "primary" | "ghost";
  asChild?: boolean;
  /**
   * When true, the button is disabled, aria-busy is set, the
   * children are visually faded, and a small spinner is rendered
   * before the label. Use for form submissions and any async
   * action that takes more than ~300ms — the visual feedback
   * prevents double-clicks and tells the user their click
   * landed.
   */
  isLoading?: boolean;
  /**
   * Optional element shown instead of the spinner (e.g. a check
   * mark on success). When set, the button still behaves as
   * loading (disabled, aria-busy) so the user can't re-click
   * during the brief confirmation window.
   */
  loadingIndicator?: ReactNode;
};

type NativeButtonProps = SharedProps & ButtonHTMLAttributes<HTMLButtonElement>;

const baseClassName =
  "inline-flex items-center justify-center gap-2 rounded-full px-6 py-3.5 text-[15px] font-medium transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--color-background)] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60";

const variantClassName = {
  primary:
    "bg-[var(--color-foreground)] text-[var(--color-background)] shadow-[0_4px_14px_rgba(24,28,28,0.1)] hover:shadow-[0_6px_20px_rgba(24,28,28,0.15)] hover:bg-[#2a2e2e] disabled:hover:shadow-[0_4px_14px_rgba(24,28,28,0.1)]",
  ghost:
    "border border-[var(--color-border)] bg-transparent text-[var(--color-foreground)] hover:border-[var(--color-foreground)] hover:bg-white/50 backdrop-blur-sm disabled:hover:border-[var(--color-border)] disabled:hover:bg-transparent"
};

/**
 * Small inline spinner used while `isLoading` is true. Kept here
 * (rather than a separate Spinner component) because it's a 1-line
 * UI primitive that only the Button needs.
 */
function DefaultSpinner() {
  return (
    <span
      aria-hidden
      className="inline-block w-4 h-4 border-2 border-current border-r-transparent rounded-full animate-spin"
    />
  );
}

export function Button({
  children,
  variant = "primary",
  asChild,
  className,
  isLoading = false,
  loadingIndicator,
  disabled,
  ...props
}: NativeButtonProps & AnchorHTMLAttributes<HTMLAnchorElement>) {
  const combinedClassName = cn(baseClassName, variantClassName[variant], className);

  if (asChild && isValidElement(children)) {
    const child = children as ReactElement<{ className?: string }>;
    return cloneElement(child, {
      className: cn(combinedClassName, child.props.className)
    });
  }

  return (
    <button
      className={combinedClassName}
      disabled={disabled || isLoading}
      aria-busy={isLoading || undefined}
      {...props}
    >
      {isLoading ? (loadingIndicator ?? <DefaultSpinner />) : null}
      <span className={isLoading ? "opacity-80" : undefined}>{children}</span>
    </button>
  );
}
