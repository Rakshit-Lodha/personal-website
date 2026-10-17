import { Cinzel, Instrument_Serif } from "next/font/google";

const cinzel = Cinzel({ subsets: ["latin"], weight: ["400", "500", "600"], variable: "--font-privacy-inscription", display: "swap" });
const serif = Instrument_Serif({ subsets: ["latin"], weight: "400", variable: "--font-privacy-serif", display: "swap" });

export default function PrivacyLayout({ children }: { children: React.ReactNode }) {
  return <div className={`${cinzel.variable} ${serif.variable}`}>{children}</div>;
}
