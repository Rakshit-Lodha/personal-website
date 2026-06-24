import type { Metadata } from "next";
import { Suspense } from "react";
import { Inter } from "next/font/google";
import { Instrument_Serif } from "next/font/google";
import { Geist_Mono } from "next/font/google";
import { Figtree } from "next/font/google";
import localFont from "next/font/local";
import Analytics from "@/components/Analytics";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const instrumentSerif = Instrument_Serif({
  variable: "--font-instrument-serif",
  subsets: ["latin"],
  weight: "400",
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const figtree = Figtree({
  variable: "--font-figtree",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
});

const offbitDisplay = localFont({
  src: "../../public/fonts/OffBitTrialDotBold.otf",
  variable: "--font-display",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Rakshit Lodha — AI Product Manager",
  description:
    "AI Product Manager with 5+ years in fintech. Built LLM products across RAG, semantic search, agentic workflows, and eval systems.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${instrumentSerif.variable} ${geistMono.variable} ${figtree.variable} ${offbitDisplay.variable} antialiased`}
    >
      <body className="min-h-screen bg-background">
        {children}
        <Suspense fallback={null}>
          <Analytics />
        </Suspense>
      </body>
    </html>
  );
}
