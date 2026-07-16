import Link from "next/link";
import type { ReactNode } from "react";
import { PublicRouteLayout } from "./public-route-layout";

interface LegalPageProps {
  kicker: string;
  title: string;
  updated?: string;
  intro: string;
  asideTitle: string;
  asideText: string;
  asideHref?: string;
  asideLinkLabel?: string;
  children: ReactNode;
}

/**
 * A quiet, structured document frame for legal and promise pages.
 * Keeping this shared prevents short documents from collapsing into a
 * visually empty full-height surface while preserving semantic article text.
 */
export function LegalPage({
  kicker,
  title,
  updated,
  intro,
  asideTitle,
  asideText,
  asideHref,
  asideLinkLabel,
  children
}: LegalPageProps) {
  return (
    <PublicRouteLayout scene="utility" footerMode="compact" surfaceTone="linen" surfaceTexture="none">
      <div
        className="rumia-legal-page rumia-surface rumia-surface-linen"
        data-surface="linen"
        data-surface-texture="editorial"
      >
        <article className="rumia-legal-document mx-auto w-full max-w-[76rem] px-container-padding-sm md:px-container-padding-lg">
          <header className="rumia-legal-header">
            <div>
              <p className="font-mono-micro text-mono-micro uppercase tracking-[0.2em] text-ochre-dark">
                {kicker}
              </p>
              <h1 className="mt-3 font-display text-headline-lg leading-[0.95] text-primary md:text-display">
                {title}
              </h1>
            </div>
            <div className="rumia-legal-intro">
              <p className="max-w-2xl text-lg leading-relaxed text-on-surface-variant">
                {intro}
              </p>
              {updated ? (
                <p className="mt-4 font-mono-micro text-mono-micro uppercase tracking-[0.16em] text-olive-dark">
                  {updated}
                </p>
              ) : null}
            </div>
          </header>

          <div className="rumia-legal-layout">
            <aside className="rumia-legal-rail" aria-label="Page summary">
              <p className="font-mono-micro text-mono-micro uppercase tracking-[0.18em] text-ochre-dark">
                In brief
              </p>
              <h2 className="mt-3 font-display text-headline-sm leading-tight text-primary">
                {asideTitle}
              </h2>
              <p className="mt-3 text-base leading-relaxed text-on-surface-variant">
                {asideText}
              </p>
              {asideHref && asideLinkLabel ? (
                <Link
                  href={asideHref}
                  className="mt-6 inline-flex min-h-11 items-center justify-center rounded-full border border-olive-light/30 px-4 text-sm font-medium text-primary transition-colors hover:border-olive-light hover:bg-white/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ochre-light focus-visible:ring-offset-2"
                >
                  {asideLinkLabel}
                </Link>
              ) : null}
            </aside>

            <div className="rumia-legal-body font-body-md text-body-md text-on-surface">
              {children}
            </div>
          </div>
        </article>
      </div>
    </PublicRouteLayout>
  );
}
