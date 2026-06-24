import LandingNav from "@/components/LandingNav";
import Hero from "@/components/Hero";
import MyStory from "@/components/MyStory";
import Projects from "@/components/Projects";
import SkillMap from "@/components/SkillMap";
import Education from "@/components/Education";
import Footer from "@/components/Footer";
import MusicPlayerProvider from "@/components/music/MusicPlayerProvider";
import MusicStripMobile from "@/components/music/MusicStripMobile";
import MusicSheet from "@/components/music/MusicSheet";

export default function Home() {
  return (
    <MusicPlayerProvider>
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
    </MusicPlayerProvider>
  );
}
