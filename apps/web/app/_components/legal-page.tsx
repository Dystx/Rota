import Link from "next/link";
import * as React from "react";
import type { ReactNode } from "react";
import { PublicRouteLayout } from "./public-route-layout";
import type { RouteSceneTone } from "./route-scene";

export interface LegalSection {
  id: string;
  heading: string;
  content: ReactNode;
}

interface LegalPageProps {
  scene?: RouteSceneTone;
  kicker: string;
  title: string;
  updated?: string;
  intro: string;
  asideTitle: string;
  asideText: string;
  asideHref?: string;
  asideLinkLabel?: string;
  sections?: readonly LegalSection[];
  children?: ReactNode;
}

/**
 * A quiet, structured document frame for legal and promise pages.
 * Keeping this shared prevents short documents from collapsing into a
 * visually empty full-height surface while preserving semantic article text.
 */
export function LegalPage({
  scene = "utility",
  kicker,
  title,
  updated,
  intro,
  asideTitle,
  asideText,
  asideHref,
  asideLinkLabel,
  sections,
  children
}: LegalPageProps) {
  return (
    <PublicRouteLayout scene={scene} footerMode="compact" surfaceTone="linen" surfaceTexture="none">
      <div className="rumia-legal-page">
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

            <div className="grid min-w-0 gap-4">
              {sections?.length ? (
                <details open className="grid gap-2 rounded-2xl border border-olive-light/15 bg-linen/90 p-4 shadow-sm backdrop-blur-xl lg:sticky lg:top-24">
                  <summary className="min-h-11 cursor-pointer list-none py-2 font-mono-micro text-mono-micro uppercase tracking-[0.18em] text-ochre-dark">
                    Contents
                  </summary>
                  <nav aria-label="Contents">
                    <ol className="m-0 flex list-none flex-wrap gap-x-5 gap-y-1 p-0">
                      {sections.map((section) => (
                        <li key={section.id}>
                          <Link
                            href={`#${section.id}`}
                            className="inline-flex min-h-11 items-center text-sm font-semibold text-primary underline decoration-ochre-dark/55 underline-offset-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ochre-light"
                          >
                            {section.heading}
                          </Link>
                        </li>
                      ))}
                    </ol>
                  </nav>
                </details>
              ) : null}

              <div className="rumia-legal-body font-body-md text-body-md text-on-surface">
                {sections?.length
                  ? sections.map((section) => (
                      <section key={section.id} id={`${section.id}-section`} aria-labelledby={section.id} className="[&+section]:mt-10 [&+section]:border-t [&+section]:border-olive-light/15 [&+section]:pt-10">
                        <h2 id={section.id} className="font-display text-3xl leading-tight text-primary">
                          {section.heading}
                        </h2>
                        <div className="mt-4 grid gap-5">{section.content}</div>
                      </section>
                    ))
                  : children}
              </div>
            </div>
          </div>
        </article>
      </div>
    </PublicRouteLayout>
  );
}
