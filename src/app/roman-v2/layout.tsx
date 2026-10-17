import { Cinzel, Gelasio } from "next/font/google";

// Figtree comes from the root layout; Cinzel and the Gelasio headline serif are scoped to this route.
const cinzel = Cinzel({ subsets: ["latin"], weight: ["400", "500", "600"], variable: "--font-cinzel", display: "swap" });
// Variable weight (400–700): the closest free match to the concept headline face, measured glyph-by-glyph.
const gelasio = Gelasio({
  subsets: ["latin"],
  style: ["normal", "italic"],
  variable: "--font-gelasio",
  display: "swap",
});

export default function RomanV2Layout({ children }: { children: React.ReactNode }) {
  return <div className={`${cinzel.variable} ${gelasio.variable}`}>{children}</div>;
}
