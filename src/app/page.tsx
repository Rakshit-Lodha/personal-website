"use client";

import { useState } from "react";
import Nav from "@/components/Nav";
import Hero from "@/components/Hero";
import MyStory from "@/components/MyStory";
import Projects from "@/components/Projects";
import CtaSection from "@/components/CtaSection";
import ChatDrawer from "@/components/ChatDrawer";

export default function Home() {
  const [chatOpen, setChatOpen] = useState(false);

  return (
    <>
      <Nav />
      <main>
        <Hero onChatOpen={() => setChatOpen(true)} />
        <MyStory />
        <Projects />
        <CtaSection onChatOpen={() => setChatOpen(true)} />
      </main>
      <ChatDrawer open={chatOpen} onClose={() => setChatOpen(false)} />
    </>
  );
}
