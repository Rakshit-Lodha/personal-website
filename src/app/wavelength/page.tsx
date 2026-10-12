import { Cormorant_Garamond } from "next/font/google";
import WavelengthExperience from "./WavelengthExperience";

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  display: "swap",
});

export const metadata = {
  title: "On My Wavelength — Rakshit Lodha",
  description: "An audiovisual personal website concept for Rakshit Lodha.",
};

export default function WavelengthPage() {
  return <WavelengthExperience serifClassName={cormorant.className} />;
}
