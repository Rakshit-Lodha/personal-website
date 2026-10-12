import type { Metadata } from "next";
import RomanSite from "@/components/roman/RomanSite";
import JJSessionProvider from "@/components/jj/JJSessionProvider";
import JJSurface from "@/components/jj/JJSurface";
import JJRealtimeController from "@/components/jj/JJRealtimeController";
import MusicSheet from "@/components/music/MusicSheet";
import { getRomanContent } from "@/lib/roman/content";

export const metadata: Metadata = {
  title: "Rakshit Lodha — Work, curiosity & everything between",
  description: "Products, experiments, reading and life. A personal collection by Rakshit Lodha.",
  robots: { index: false, follow: false },
};

export default async function RomanPage() {
  const content = await getRomanContent();

  return (
    <JJSessionProvider>
      <RomanSite content={content} />
      <MusicSheet />
      <JJSurface />
      <JJRealtimeController />
    </JJSessionProvider>
  );
}
