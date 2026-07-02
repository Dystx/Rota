import type { HTMLAttributes, ReactNode } from "react";
import { cn } from "../lib/cn";
import { Card, CardContent } from "./card";

export interface TestimonialCardProps extends HTMLAttributes<HTMLDivElement> {
  author: string;
  role?: string;
  avatar?: ReactNode;
  children: ReactNode;
}

export function TestimonialCard({
  author,
  role,
  avatar,
  children,
  className,
  ...props
}: TestimonialCardProps) {
  return (
    <Card className={cn("overflow-hidden", className)} {...props}>
      <CardContent className="grid gap-6 p-8 sm:p-10">
        <blockquote className="font-[family-name:var(--font-rota-display)] text-xl leading-relaxed text-[var(--color-foreground)] sm:text-2xl">
          "{children}"
        </blockquote>
        <div className="flex items-center gap-4">
          {avatar && (
            <div className="h-12 w-12 overflow-hidden rounded-full bg-[var(--color-surface-muted)]">
              {avatar}
            </div>
          )}
          <div>
            <div className="font-medium text-[var(--color-foreground)]">{author}</div>
            {role && <div className="text-sm text-[var(--color-muted-foreground)]">{role}</div>}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
