import type { ReactNode } from "react";
import { cn } from "../lib/cn";
import { Badge } from "./badge";
import { Button } from "./button";
import { Card, CardContent, CardHeader, CardTitle } from "./card";

/**
 * Region-keyed CSS gradients used as the cover area background.
 * The `<img>` rendering of the SVG covers in `/public/trip-covers/`
 * has been unreliable in some browsers (the SVGs load with 200
 * + correct content-type but the browser doesn't paint them on
 * top of the fallback gradient — the SVGs have complex gradients
 * + filters that some renderers drop). The CSS gradient is
 * always available, always renders, and is keyed off the
 * coverImage path so each card has a distinct, region-appropriate
 * color.
 */
const COVER_GRADIENT_BY_REGION: Record<string, string> = {
  porto: "linear-gradient(135deg, #D4A574 0%, #A87149 35%, #5C3826 75%, #2A1A14 100%)",
  lisbon: "linear-gradient(135deg, #F2C5A0 0%, #E08860 40%, #5A2A2E 85%, #1D2A23 100%)",
  douro: "linear-gradient(135deg, #8B6F47 0%, #5C4530 35%, #3A2D1E 75%, #1A1410 100%)",
  azores: "linear-gradient(135deg, #6FA89E 0%, #3D7A6F 35%, #1F4A44 75%, #0D2624 100%)",
  algarve: "linear-gradient(135deg, #E8B86C 0%, #C49542 35%, #8A6428 75%, #4A3812 100%)",
  sintra: "linear-gradient(135deg, #A8B8C8 0%, #708090 35%, #4A5868 75%, #2A3440 100%)",
  cascais: "linear-gradient(135deg, #7AB5C8 0%, #4A8FA8 35%, #2A6080 75%, #0F3D55 100%)",
  coimbra: "linear-gradient(135deg, #C49542 0%, #8A6428 35%, #5C4520 75%, #2E2410 100%)",
  aveiro: "linear-gradient(135deg, #B5C9B0 0%, #7A9080 35%, #4A6055 75%, #2A3830 100%)",
  alentejo: "linear-gradient(135deg, #C9B584 0%, #8A7854 35%, #5A4D30 75%, #2E2615 100%)",
  iberia: "linear-gradient(135deg, #8B6F47 0%, #5C4530 35%, #3A2D1E 75%, #1A1410 100%)"
};

const DEFAULT_COVER_GRADIENT =
  "linear-gradient(135deg, #5A2A2E 0%, #3A2D1E 50%, #1A1410 100%)";

/**
 * Maps a coverImage path to a region-keyed gradient. The mapping
 * is intentionally lenient — we look for the region slug anywhere
 * in the path so callers can pass any of:
 *   - a full URL ("/trip-covers/lisbon-tagus.svg")
 *   - a bare slug ("lisbon")
 *   - a future CDN URL
 */
const gradientForCover = (coverImage: string): string => {
  const lower = coverImage.toLowerCase();
  for (const [region, gradient] of Object.entries(COVER_GRADIENT_BY_REGION)) {
    if (lower.includes(region)) return gradient;
  }
  return DEFAULT_COVER_GRADIENT;
};

/**
 * 8-colour hash-picked palette for cards that don't pass a
 * `coverImage`. Used by the Portugal page (which has 9 regions
 * but stopped passing SVG covers after the lisbon-tagus.svg
 * paint issue — see commit history). The hash is over the
 * card title so the same trip always gets the same cover.
 */
const NO_IMAGE_PALETTE: readonly string[] = [
  "linear-gradient(135deg, #B89878 0%, #7A5C3A 35%, #4A3622 75%, #1F1610 100%)",
  "linear-gradient(135deg, #C49542 0%, #8A6428 35%, #5C4520 75%, #2E2410 100%)",
  "linear-gradient(135deg, #6F8FA8 0%, #4A6F88 35%, #2E4A60 75%, #142838 100%)",
  "linear-gradient(135deg, #A87060 0%, #7A4838 35%, #4A2A20 75%, #1F1410 100%)",
  "linear-gradient(135deg, #7AB5C8 0%, #4A8FA8 35%, #2A6080 75%, #0F3D55 100%)",
  "linear-gradient(135deg, #8FB89E 0%, #5C8870 35%, #2E5848 75%, #143028 100%)",
  "linear-gradient(135deg, #C49542 0%, #8A6428 50%, #4A3618 100%)",
  "linear-gradient(135deg, #B89878 0%, #7A5C3A 50%, #3A2818 100%)"
] as const;

const djb2 = (value: string): number => {
  let hash = 5381;
  for (let i = 0; i < value.length; i += 1) {
    hash = ((hash << 5) + hash + value.charCodeAt(i)) | 0;
  }
  return Math.abs(hash);
};

const gradientForTitle = (title: string): string =>
  NO_IMAGE_PALETTE[djb2(title) % NO_IMAGE_PALETTE.length] ?? NO_IMAGE_PALETTE[0] ?? DEFAULT_COVER_GRADIENT;

export interface TripCardProps {
  icon?: ReactNode;
  title: string;
  caption?: string;
  meta?: ReactNode;
  href?: string;
  cta?: ReactNode;
  tone?: "default" | "highlight";
  testid?: string;
  /**
   * Optional cover image rendered as a 16:9 panel at the top
   * of the card. Phase 4.2: the Portugal page uses this to
   * show a stylized landscape per region (e.g. the Douro's
   * terraced vineyards, the Algarve's golden cliffs).
   *
   * The SVG behind this URL is rendered as the top layer of
   * the cover panel. If it doesn't paint (some browsers drop
   * complex SVG gradients/filters), the region-keyed CSS
   * gradient below still gives the card a distinct color.
   */
  coverImage?: string;
  coverAlt?: string;
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
  coverImage,
  coverAlt
}: TripCardProps) {
  const coverGradient = coverImage
    ? gradientForCover(coverImage)
    : gradientForTitle(title);
  return (
    <Card
      data-testid={testid}
      className={cn(
        "flex flex-col overflow-hidden rounded-[20px] transition-all hover:bg-white/80",
        tone === "highlight" ? "border-[#181c1c] shadow-md" : "bg-white/70"
      )}
    >
      <div
        className="relative aspect-[16/9] w-full overflow-hidden"
        style={{ background: coverGradient }}
        data-testid={testid ? `${testid}-cover` : undefined}
      >
        {/* The <img> is rendered as a layer over the region
            gradient. Some browsers drop the complex SVG paint
            inside it (see comment on `gradientForCover`); when
            that happens, the gradient below still gives the
            card a distinct, region-appropriate color. */}
        {coverImage ? (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img
            src={coverImage}
            alt={coverAlt ?? ""}
            className="absolute inset-0 h-full w-full object-cover"
            loading="eager"
            decoding="sync"
          />
        ) : null}
      </div>
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
          <p className="text-base leading-7 text-[var(--color-muted-foreground)]">
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
