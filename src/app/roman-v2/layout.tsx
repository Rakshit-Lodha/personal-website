import { Cinzel, Newsreader } from "next/font/google";

// Figtree comes from the root layout; Cinzel and the Newsreader headline serif are scoped to this route.
const cinzel = Cinzel({ subsets: ["latin"], weight: ["400", "500", "600"], variable: "--font-cinzel", display: "swap" });
// Variable weight + optical size: large headlines get the high-contrast display cut, small titles the sturdier text cut.
const newsreader = Newsreader({
  subsets: ["latin"],
  style: ["normal", "italic"],
  axes: ["opsz"],
  variable: "--font-newsreader",
  display: "swap",
});

export default function RomanV2Layout({ children }: { children: React.ReactNode }) {
  return <div className={`${cinzel.variable} ${newsreader.variable}`}>{children}</div>;
}
