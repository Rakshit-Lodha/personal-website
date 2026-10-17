import { Cinzel, Instrument_Serif } from "next/font/google";

// Instrument Serif (roman) and Figtree come from the root layout; Cinzel and the serif italic are scoped to this route.
const cinzel = Cinzel({ subsets: ["latin"], weight: ["400", "500", "600"], variable: "--font-cinzel", display: "swap" });
const serifItalic = Instrument_Serif({
  subsets: ["latin"],
  weight: "400",
  style: "italic",
  variable: "--font-serif-italic",
  display: "swap",
});

export default function RomanV2Layout({ children }: { children: React.ReactNode }) {
  return <div className={`${cinzel.variable} ${serifItalic.variable}`}>{children}</div>;
}
