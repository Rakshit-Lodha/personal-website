import { Cinzel, Cormorant_Garamond } from "next/font/google";

// Scoped to /roman so the Roman faces never load on the production routes.
const cinzel = Cinzel({ subsets: ["latin"], weight: ["400", "500"], variable: "--font-cinzel", display: "swap" });
const cormorant = Cormorant_Garamond({ subsets: ["latin"], weight: ["500", "600"], variable: "--font-cormorant", display: "swap" });

export default function RomanLayout({ children }: { children: React.ReactNode }) {
  return <div className={`${cinzel.variable} ${cormorant.variable}`}>{children}</div>;
}
