import type { HTMLAttributes, ReactNode } from "react";
import { cn } from "../lib/cn";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "./card";

export interface PricingCardProps extends HTMLAttributes<HTMLDivElement> {
  title: string;
  description?: string;
  price: ReactNode;
  fulfillment?: string;
  highlighted?: boolean;
  highlightBadge?: ReactNode;
  features: string[];
  action: ReactNode;
}

export function PricingCard({
  title,
  description,
  price,
  fulfillment,
  highlighted = false,
  highlightBadge,
  features,
  action,
  className,
  ...props
}: PricingCardProps) {
  return (
    <Card
      className={cn(
        "relative flex flex-col",
        highlighted && "border-[var(--color-accent)] shadow-[var(--shadow-elevated)]",
        className
      )}
      {...props}
    >
      <CardHeader className="pb-6">
        {highlightBadge && <div className="mb-4">{highlightBadge}</div>}
        <CardTitle>{title}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent className="flex flex-1 flex-col gap-8">
        <ul className="rota-stack-list flex-1 space-y-3">
          {features.map((feature, i) => (
            <li key={i} className="flex items-start gap-3 text-base text-[var(--color-muted-foreground)]">
              <svg className="mt-1 h-4 w-4 shrink-0 text-[var(--color-aqua)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
              <span>{feature}</span>
            </li>
          ))}
        </ul>

        <div className="rounded-[var(--radius-glass)] border border-[var(--color-border)] bg-[var(--color-cream)] p-6">
          <div className="text-sm font-medium uppercase tracking-wider text-[var(--color-muted-foreground)]">Price</div>
          <div className="mt-2 text-2xl font-semibold text-[var(--color-foreground)]">{price}</div>
          {fulfillment && <div className="mt-2 text-sm text-[var(--color-muted-foreground)]">{fulfillment}</div>}
        </div>

        <div className="mt-auto pt-2">
          {action}
        </div>
      </CardContent>
    </Card>
  );
}
