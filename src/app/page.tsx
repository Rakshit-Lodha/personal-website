import Nav from "@/components/Nav";
import Hero from "@/components/Hero";
import MyStory from "@/components/MyStory";
import Projects from "@/components/Projects";
import Failures from "@/components/Failures";
import ClosingSection from "@/components/ClosingSection";

export default function Home() {
  return (
    <>
      <Nav />
      <main>
        <Hero />
        <MyStory />
        <Projects />
        <Failures />
        <ClosingSection />
      </main>
    </>
  );
}
