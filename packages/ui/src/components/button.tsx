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
};

type NativeButtonProps = SharedProps & ButtonHTMLAttributes<HTMLButtonElement>;

const baseClassName =
  "inline-flex items-center justify-center rounded-full px-6 py-3.5 text-[15px] font-medium transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--color-background)] active:scale-[0.98]";

const variantClassName = {
  primary:
    "bg-[var(--color-foreground)] text-[var(--color-background)] shadow-[0_4px_14px_rgba(24,28,28,0.1)] hover:shadow-[0_6px_20px_rgba(24,28,28,0.15)] hover:bg-[#2a2e2e]",
  ghost:
    "border border-[var(--color-border)] bg-transparent text-[var(--color-foreground)] hover:border-[var(--color-foreground)] hover:bg-white/50 backdrop-blur-sm"
};

export function Button({
  children,
  variant = "primary",
  asChild,
  className,
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
    <button className={combinedClassName} {...props}>
      {children}
    </button>
  );
}
