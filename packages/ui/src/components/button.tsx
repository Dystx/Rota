import type {
  AnchorHTMLAttributes,
  ButtonHTMLAttributes,
  ReactElement,
  ReactNode
} from "react";
import { cloneElement, isValidElement } from "react";
import { cn } from "../lib/cn";
import { Icon } from "./icon";

/**
 * Button — primary action primitive.
 *
 * PR-2 polish:
 *   - 5 variants: primary | secondary | ghost | destructive | link
 *   - 3 sizes: sm | md | lg
 *   - 4 tones: neutral | ochre | olive | danger (overlay on variant)
 *   - leadingIcon / trailingIcon: shared icon name or ReactNode
 *   - fullWidth: stretches to container
 *   - isLoading: pending state with spinner + aria-busy
 *   - loadingIndicator: replace the default spinner
 *   - Focus ring uses --shadow-focus (3px ochre) instead of Tailwind ring
 *
 * Backward compatible: existing call sites that pass only `variant`, `asChild`,
 * `isLoading`, and `loadingIndicator` continue to work. New props are optional.
 */

type ButtonVariant = "primary" | "secondary" | "ghost" | "destructive" | "link";
type ButtonSize = "sm" | "md" | "lg";
type ButtonTone = "neutral" | "ochre" | "olive" | "danger";

type SharedProps = {
  children: ReactNode;
  variant?: ButtonVariant;
  size?: ButtonSize;
  tone?: ButtonTone;
  leadingIcon?: ReactNode;
  trailingIcon?: ReactNode;
  fullWidth?: boolean;
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

const sizeClassName: Record<ButtonSize, string> = {
  sm: "h-9 px-4 text-[13px]",
  md: "h-11 px-6 text-[15px]",
  lg: "h-14 px-8 text-base"
};

const variantClassName: Record<ButtonVariant, string> = {
  primary:
    "bg-[var(--color-foreground)] text-[var(--color-background)] shadow-[var(--shadow-flat)] hover:shadow-[var(--shadow-raised)] hover:bg-[#2a2e2e] active:bg-[#1f2222] disabled:hover:shadow-[var(--shadow-flat)] disabled:hover:bg-[var(--color-foreground)]",
  secondary:
    "bg-olive-light text-on-primary hover:bg-olive-dark active:bg-olive-dark/90 shadow-[var(--shadow-flat)] hover:shadow-[var(--shadow-raised)]",
  ghost:
    "border border-[var(--color-border)] bg-transparent text-[var(--color-foreground)] hover:border-[var(--color-foreground)] hover:bg-white/50 backdrop-blur-sm disabled:hover:border-[var(--color-border)] disabled:hover:bg-transparent",
  destructive:
    "bg-[var(--color-status-danger-fg)] text-white hover:bg-[#5c1f1f] active:bg-[#4a1818] shadow-[var(--shadow-flat)] hover:shadow-[var(--shadow-raised)]",
  link:
    "bg-transparent text-[var(--color-foreground)] underline-offset-4 hover:underline px-0 h-auto shadow-none hover:shadow-none"
};

const toneClassName: Record<ButtonTone, string> = {
  neutral: "",
  ochre: "ring-1 ring-ochre-light/40 hover:ring-ochre-light/70",
  olive: "ring-1 ring-olive-light/40 hover:ring-olive-light/70",
  danger: "ring-1 ring-[var(--color-status-danger-border)] hover:ring-[var(--color-status-danger-fg)]"
};

const baseClassName = cn(
  "inline-flex items-center justify-center gap-2 rounded-full font-medium",
  "transition-all duration-base ease-standard",
  "focus-visible:outline-none focus-visible:shadow-focus",
  "active:scale-[0.98]",
  "disabled:cursor-not-allowed disabled:opacity-60"
);

const sizeOnlyLink = "px-0 py-0"; // link variant ignores size; flatten h-* overrides

/**
 * Small inline spinner used while `isLoading` is true. Kept here
 * (rather than a separate Spinner component) because it's a 1-line
 * UI primitive that only the Button needs.
 */
function DefaultSpinner({ tone }: { tone: "white" | "ink" }) {
  return (
    <span
      aria-hidden
      className={cn(
        "inline-block w-4 h-4 border-2 rounded-full animate-spin",
        tone === "white"
          ? "border-white/40 border-t-white"
          : "border-current/40 border-t-current"
      )}
    />
  );
}

function IconSlot({ icon }: { icon: ReactNode | undefined }) {
  if (!icon) return null;
  if (typeof icon === "string") return <Icon name={icon} className="text-[1.1em]" />;
  return <>{icon}</>;
}

export function Button({
  children,
  variant = "primary",
  size = "md",
  tone = "neutral",
  leadingIcon,
  trailingIcon,
  fullWidth = false,
  asChild,
  className,
  isLoading = false,
  loadingIndicator,
  disabled,
  ...props
}: NativeButtonProps & AnchorHTMLAttributes<HTMLAnchorElement>) {
  const isLink = variant === "link";
  const spinnerTone = variant === "primary" || variant === "destructive" ? "white" : "ink";

  const combinedClassName = cn(
    baseClassName,
    isLink ? sizeOnlyLink : sizeClassName[size],
    variantClassName[variant],
    toneClassName[tone],
    fullWidth && "w-full",
    className
  );

  const content = (
    <>
      {isLoading ? (loadingIndicator ?? <DefaultSpinner tone={spinnerTone} />) : (
        <IconSlot icon={leadingIcon} />
      )}
      <span className={cn(isLoading && "opacity-60")}>{children}</span>
      {!isLoading ? <IconSlot icon={trailingIcon} /> : null}
    </>
  );

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
      {content}
    </button>
  );
}
