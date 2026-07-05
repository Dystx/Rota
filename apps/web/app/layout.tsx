import type { Metadata } from "next";
import { Inter, Playfair_Display, JetBrains_Mono } from "next/font/google";
import "@repo/ui/styles.css";
import "./globals.css";
import { WebVitalsReporter } from "./web-vitals-reporter";
import { MotionProvider, ToastViewport, BackToTop } from "@repo/ui";
import { RegisterServiceWorker } from "./_components/register-sw";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-body-md",
  weight: ["400", "600"],
  display: "swap",
});

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-display",
  weight: ["600", "700"],
  style: ["normal", "italic"],
  display: "swap",
});

const jetbrains = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono-micro",
  weight: ["500", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://rumia.pt"),
  title: {
    default: "Rumia | Intentional Humanism in Travel",
    template: "%s | Rumia",
  },
  description:
    "Portugal-first AI travel planning system. Cinematic itineraries, structured routes, and human-curated quality.",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://rumia.pt",
    siteName: "Rumia",
    title: "Rumia | Intentional Humanism in Travel",
    description:
      "Discover Portugal intentionally. Cinematic itineraries, structured routes, and human-curated quality.",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Rumia — Portugal-first AI travel planning",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Rumia | Intentional Humanism in Travel",
    description:
      "Discover Portugal intentionally. Cinematic itineraries, structured routes, and human-curated quality.",
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
      className={`light ${inter.variable} ${playfair.variable} ${jetbrains.variable} relative`}
    >
      <head>
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
        {/* Material Symbols Outlined — icon font used by the prototype */}
        <link
          rel="preconnect"
          href="https://fonts.googleapis.com"
        />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin=""
        />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap"
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
        <MotionProvider>{children}</MotionProvider>
        <ToastViewport />
        <BackToTop />
      </body>
    </html>
  );
}