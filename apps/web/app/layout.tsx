import type { Metadata } from "next";
import { Inter, Noto_Serif } from "next/font/google";
import "@repo/ui/styles.css";
import "./globals.css";
import { WebVitalsReporter } from "./web-vitals-reporter";
import { MotionProvider } from "@repo/ui";

const bodyFont = Inter({
  subsets: ["latin"],
  variable: "--font-rota-body"
});

const displayFont = Noto_Serif({
  subsets: ["latin"],
  variable: "--font-rota-display"
});

export const metadata: Metadata = {
  metadataBase: new URL("https://rumia.pt"),
  title: {
    default: "rumia.pt | Portugal-first AI Travel Planning",
    template: "%s | rumia.pt"
  },
  description: "Portugal-first AI travel planning system without a chatbot UI. Structured routes, local quality, and human review trust layer.",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://rumia.pt",
    siteName: "rumia.pt",
    title: "rumia.pt | Portugal-first AI Travel Planning",
    description: "No AI chat. Just a calmer, better Portugal route. Structured trip control instead of open-ended conversation.",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "rumia.pt - Portugal-first AI Travel Planning"
      }
    ]
  },
  twitter: {
    card: "summary_large_image",
    title: "rumia.pt | Portugal-first AI Travel Planning",
    description: "Portugal-first AI travel planning system without a chatbot UI.",
    images: ["/og-image.jpg"]
  },
  robots: {
    index: true,
    follow: true
  }
};

export default function RootLayout({
  children
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${bodyFont.variable} ${displayFont.variable} relative`}>
      <body>
        <a 
          href="#main-content" 
          className="sr-only focus:not-sr-only focus:absolute focus:z-50 focus:p-4 focus:bg-[var(--color-foreground)] focus:text-[var(--color-background)]"
        >
          Skip to content
        </a>
        <WebVitalsReporter />
        <MotionProvider>{children}</MotionProvider>
      </body>
    </html>
  );
}
