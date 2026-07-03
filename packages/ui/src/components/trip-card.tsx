import type { ReactNode } from "react";
import { cn } from "../lib/cn";
import { Badge } from "./badge";
import { Button } from "./button";
import { Card, CardContent, CardHeader, CardTitle } from "./card";

export interface TripCardProps {
  icon?: ReactNode;
  title: string;
  caption?: string;
  meta?: ReactNode;
  href?: string;
  cta?: ReactNode;
  tone?: "default" | "highlight";
  testid?: string;
}

export function TripCard({
  icon,
  title,
  caption,
  meta,
  href,
  cta,
  tone = "default",
  testid,
}: TripCardProps) {
  return (
    <Card
      data-testid={testid}
      className={cn(
        "flex flex-col rounded-[20px] transition-all hover:bg-white/80",
        tone === "highlight" ? "border-[#181c1c] shadow-md" : "bg-white/70"
      )}
    >
      <CardHeader className="p-4 md:p-5 pb-2 md:pb-2">
        <div className="flex items-start justify-between gap-4">
          <div className="grid gap-2">
            {icon && <div className="text-[var(--color-foreground)]">{icon}</div>}
            <CardTitle className="text-base md:text-lg font-semibold tracking-normal font-[family-name:var(--font-inter)]">
              {title}
            </CardTitle>
          </div>
          {meta && (
            <div className="shrink-0">
              {typeof meta === "string" ? <Badge tone="soft">{meta}</Badge> : meta}
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent className="p-4 md:p-5 pt-0 md:pt-0 flex flex-1 flex-col gap-3">
        {caption && (
          <p className="text-sm leading-relaxed text-[var(--color-muted-foreground)]">
            {caption}
          </p>
        )}
        {(cta || href) && (
          <div className="mt-auto pt-1">
            {cta && href ? (
              <Button asChild variant={tone === "highlight" ? "primary" : "ghost"}>
                <a href={href}>{cta}</a>
              </Button>
            ) : cta ? (
              cta
            ) : href ? (
              <Button asChild variant={tone === "highlight" ? "primary" : "ghost"}>
                <a href={href}>{title}</a>
              </Button>
            ) : null}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
