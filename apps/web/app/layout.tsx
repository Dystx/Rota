import type { Metadata } from "next";
import "@repo/ui/styles.css";
import "./globals.css";
import { WebVitalsReporter } from "./web-vitals-reporter";
import { MotionProvider, ToastViewport, BackToTop } from "@repo/ui";
import { RegisterServiceWorker } from "./_components/register-sw";
import { MapLibreErrorSuppressor } from "./_components/maplibre-error-suppressor";

export const metadata: Metadata = {
  metadataBase: new URL("https://rumia.pt"),
  title: {
    default: "What to do in Portugal, judged well | Rumia",
    template: "%s | Rumia",
  },
  description:
    "A Portugal-first guide to activities genuinely worth your limited time.",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://rumia.pt",
    siteName: "Rumia",
    title: "What to do in Portugal, judged well | Rumia",
    description:
      "A digital-first guide to what is genuinely worth doing in Portugal.",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Rumia — Portugal activity curation",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "What to do in Portugal, judged well | Rumia",
    description:
      "A digital-first guide to what is genuinely worth doing in Portugal.",
    images: ["/og-image.jpg"],
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      className="light relative"
      data-font-source="local-ofl"
    >
      <head>
        <link rel="icon" href="/brand/mark.svg" type="image/svg+xml" />
        {/* PWA: manifest + theme color. The manifest is harmless to
         * always link — the SW itself is feature-flagged via
         * NEXT_PUBLIC_PWA_ENABLED. */}
        <link rel="manifest" href="/manifest.webmanifest" />
        <meta name="theme-color" content="#18181B" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta
          name="apple-mobile-web-app-status-bar-style"
          content="black-translucent"
        />
      </head>
      <body className="bg-background text-on-background font-body-md text-body-md antialiased overflow-x-hidden">
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:z-50 focus:p-4 focus:bg-primary focus:text-on-primary"
        >
          Skip to content
        </a>
        <WebVitalsReporter />
        <RegisterServiceWorker />
        <MapLibreErrorSuppressor />
        <div className="rumia-app-root">
          <MotionProvider>{children}</MotionProvider>
        </div>
        <ToastViewport />
        <BackToTop />
      </body>
    </html>
  );
}
