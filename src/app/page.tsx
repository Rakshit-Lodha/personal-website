import Nav from "@/components/Nav";
import Hero from "@/components/Hero";
import MyStory from "@/components/MyStory";
import Projects from "@/components/Projects";
import CtaSection from "@/components/CtaSection";

export default function Home() {
  return (
    <>
      <Nav />
      <main>
        <Hero />
        <MyStory />
        <Projects />
        <CtaSection />
      </main>
    </>
  );
}
