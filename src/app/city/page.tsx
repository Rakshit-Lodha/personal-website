import type { Metadata } from "next";
import CityLanding from "@/components/city/CityLanding";
import MusicSheet from "@/components/music/MusicSheet";
import MusicStripMobile from "@/components/music/MusicStripMobile";
import JJFloatingOrb from "@/components/jj/JJFloatingOrb";
import JJRealtimeController from "@/components/jj/JJRealtimeController";
import JJSessionProvider from "@/components/jj/JJSessionProvider";
import JJSurface from "@/components/jj/JJSurface";

export const metadata: Metadata = {
  title: "Rakshit Lodha — the city",
  description:
    "An isometric city where every building is a place Rakshit Lodha worked or a thing he built: four companies, seven projects, a factory of experiments, and a club.",
};

export default function CityPage() {
  return (
    <JJSessionProvider>
      <CityLanding />
      <div className="lg:hidden">
        <MusicStripMobile />
        <MusicSheet />
      </div>
      <JJFloatingOrb alwaysVisible />
      <JJSurface />
      <JJRealtimeController />
    </JJSessionProvider>
  );
}
