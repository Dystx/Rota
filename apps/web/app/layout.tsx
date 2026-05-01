import type { Metadata } from "next";
import { Inter, Noto_Serif } from "next/font/google";
import "@repo/ui/styles.css";
import "./globals.css";

const bodyFont = Inter({
  subsets: ["latin"],
  variable: "--font-rota-body"
});

const displayFont = Noto_Serif({
  subsets: ["latin"],
  variable: "--font-rota-display"
});

export const metadata: Metadata = {
  title: "rumia.pt",
  description: "rumia.pt is a Portugal-first AI travel planning system without a chatbot UI."
};

export default function RootLayout({
  children
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${bodyFont.variable} ${displayFont.variable}`}>
      <body>{children}</body>
    </html>
  );
}
