import type { HTMLAttributes, ReactNode } from "react";
import { cn } from "../lib/cn";

export interface FeatureGridProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
}

export function FeatureGrid({ children, className, ...props }: FeatureGridProps) {
  return (
    <div
      className={cn(
        "grid gap-8 sm:grid-cols-2 lg:grid-cols-3",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export interface FeatureGridItemProps extends HTMLAttributes<HTMLDivElement> {
  icon?: ReactNode;
  title: string;
  children: ReactNode;
}

export function FeatureGridItem({ icon, title, children, className, ...props }: FeatureGridItemProps) {
  return (
    <div className={cn("flex flex-col gap-4", className)} {...props}>
      {icon && (
        <div className="flex h-12 w-12 items-center justify-center rounded-[var(--radius-soft)] bg-[var(--color-cream)] text-[var(--color-atlantic)]">
          {icon}
        </div>
      )}
      <h3 className="font-display text-xl font-medium tracking-tight text-[var(--color-foreground)]">
        {title}
      </h3>
      <p className="text-base leading-relaxed text-[var(--color-muted-foreground)]">
        {children}
      </p>
    </div>
  );
}
