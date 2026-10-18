import type { Metadata } from "next";
import ContemporaryRomanSite from "@/components/roman-v2/ContemporaryRomanSite";
import JJSessionProvider from "@/components/jj/JJSessionProvider";
import JJSurface from "@/components/jj/JJSurface";
import JJRealtimeController from "@/components/jj/JJRealtimeController";
import MusicSheet from "@/components/music/MusicSheet";
import { getRomanV2Content } from "@/lib/roman-v2/content";
import IntroReveal from "@/components/IntroReveal";

export const metadata: Metadata = {
  title: "Rakshit Lodha — Product judgment",
  description: "AI and financial products by Rakshit Lodha.",
};

// WHOOP snapshots are refreshed independently of deployments.
export const dynamic = "force-dynamic";

export default async function RomanV2Page() {
  const content = await getRomanV2Content();

  return (
    <JJSessionProvider>
      <IntroReveal />
      <ContemporaryRomanSite content={content} />
      <MusicSheet />
      <JJSurface />
      <JJRealtimeController />
    </JJSessionProvider>
  );
}
