import { Cinzel } from "next/font/google";

// Instrument Serif and Figtree come from the root layout; only Cinzel is scoped to this route.
const cinzel = Cinzel({ subsets: ["latin"], weight: ["400", "500", "600"], variable: "--font-cinzel", display: "swap" });

export default function RomanV2Layout({ children }: { children: React.ReactNode }) {
  return <div className={cinzel.variable}>{children}</div>;
}
