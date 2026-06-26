import LandingNav from "@/components/LandingNav";
import Hero from "@/components/Hero";
import MyStory from "@/components/MyStory";
import Projects from "@/components/Projects";
import SkillMap from "@/components/SkillMap";
import Education from "@/components/Education";
import Footer from "@/components/Footer";
import MusicStripMobile from "@/components/music/MusicStripMobile";
import MusicSheet from "@/components/music/MusicSheet";
import JJFloatingOrb from "@/components/jj/JJFloatingOrb";
import JJSessionProvider from "@/components/jj/JJSessionProvider";
import JJSurface from "@/components/jj/JJSurface";
import JJRealtimeController from "@/components/jj/JJRealtimeController";

export default function Home() {
  return (
    <JJSessionProvider>
      <LandingNav />
      <Hero />
      <MyStory />
      <Projects />
      <SkillMap />
      <Education />
      <Footer />
      <div className="lg:hidden">
        <MusicStripMobile />
        <MusicSheet />
      </div>
      <JJFloatingOrb />
      <JJSurface />
      <JJRealtimeController />
    </JJSessionProvider>
  );
}
