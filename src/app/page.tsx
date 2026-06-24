import LandingNav from "@/components/LandingNav";
import Hero from "@/components/Hero";
import MyStory from "@/components/MyStory";
import Projects from "@/components/Projects";
import SkillMap from "@/components/SkillMap";
import Education from "@/components/Education";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <>
      <LandingNav />
      <Hero />
      <MyStory />
      <Projects />
      <SkillMap />
      <Education />
      <Footer />
    </>
  );
}
