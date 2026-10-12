import { Anton } from "next/font/google";
import CuriousExperience from "./CuriousExperience";

const anton = Anton({
  subsets: ["latin"],
  weight: "400",
  display: "swap",
});

export const metadata = {
  title: "Always Curious — Rakshit Lodha",
  description: "An interactive personal website concept for Rakshit Lodha.",
};

export default function CuriousPage() {
  return <CuriousExperience displayClassName={anton.className} />;
}
