"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  show: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, delay: i * 0.12, ease: "easeOut" as const },
  }),
};

export default function Hero({ onChatOpen }: { onChatOpen?: () => void }) {
  const scrollToStory = () => {
    document.getElementById("story")?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <section
      id="home"
      className="min-h-screen flex flex-col items-center justify-center relative px-6 pt-16"
    >
      {/* Headline */}
      <div className="text-center space-y-2 mb-10">
        <motion.h1
          custom={1}
          initial="hidden"
          animate="show"
          variants={fadeUp}
          className="text-5xl md:text-7xl font-bold text-foreground tracking-tight leading-[1.08]"
        >
          Hi, my name is{" "}
          <span className="text-[#1B6AE7]">Rakshit</span>
        </motion.h1>
        <motion.p
          custom={2}
          initial="hidden"
          animate="show"
          variants={fadeUp}
          className="text-5xl md:text-7xl text-foreground tracking-tight leading-[1.08]"
          style={{ fontFamily: "var(--font-instrument-serif), Georgia, serif" }}
        >
          and I love{" "}
          <span className="relative inline-block">
            building
            <svg
              className="absolute -bottom-2 left-0 w-full"
              viewBox="0 0 200 12"
              fill="none"
              preserveAspectRatio="none"
              aria-hidden="true"
            >
              <motion.path
                d="M2 8 C50 2, 150 2, 198 8"
                stroke="#1B6AE7"
                strokeWidth="3"
                strokeLinecap="round"
                fill="none"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 0.8, delay: 0.7, ease: "easeOut" }}
              />
            </svg>
          </span>
        </motion.p>
      </div>

      {/* CTAs */}
      <motion.div
        custom={3}
        initial="hidden"
        animate="show"
        variants={fadeUp}
        className="flex flex-col sm:flex-row gap-3 mb-10"
      >
        <a
          href="#story"
          className="inline-flex items-center justify-center gap-2 rounded-md px-8 h-11 bg-[#1B6AE7] hover:bg-[#1558c7] text-white text-sm font-medium transition-all hover:-translate-y-0.5 hover:shadow-lg focus-visible:outline-2 focus-visible:outline-[#1B6AE7]"
        >
          My Story
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
            <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </a>
        <Button
          size="lg"
          variant="outline"
          onClick={onChatOpen}
          className="h-11 rounded-md border-border px-8 gap-2 hover:-translate-y-0.5 hover:shadow-md transition-all hover:border-[#1B6AE7]"
        >
          Chat with my AI
          <span className="text-[#1B6AE7]" aria-hidden="true">✦</span>
        </Button>
      </motion.div>

      {/* Social links */}
      <motion.div
        custom={4}
        initial="hidden"
        animate="show"
        variants={fadeUp}
        className="flex items-center gap-6"
      >
        <SocialLink href="https://linkedin.com/in/rakshitlodha" label="LinkedIn">
          <LinkedInIcon />
        </SocialLink>
        <span className="w-px h-4 bg-border" aria-hidden="true" />
        <SocialLink href="https://x.com/rakshitlodha" label="X">
          <XIcon />
        </SocialLink>
        <span className="w-px h-4 bg-border" aria-hidden="true" />
        <SocialLink href="https://github.com/rakshitlodha" label="GitHub">
          <GitHubIcon />
        </SocialLink>
      </motion.div>

      {/* Scroll cue */}
      <motion.button
        type="button"
        onClick={scrollToStory}
        custom={5}
        initial="hidden"
        animate="show"
        variants={fadeUp}
        className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 rounded-xl px-4 py-3 text-muted-foreground transition-colors hover:text-[#1B6AE7] focus-visible:outline-2 focus-visible:outline-[#1B6AE7]"
        aria-label="Scroll to My Story"
      >
        <motion.div
          animate={{ y: [0, 6, 0] }}
          transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
          className="text-muted-foreground"
          aria-hidden="true"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M8 2v12M3 9l5 5 5-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </motion.div>
        <span className="text-xs text-muted-foreground tracking-wide">Scroll to explore</span>
      </motion.button>
    </section>
  );
}

function SocialLink({
  href,
  label,
  children,
}: {
  href: string;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors group"
      aria-label={label}
    >
      <span className="w-7 h-7 rounded-full border border-border flex items-center justify-center group-hover:border-foreground/30 transition-colors">
        {children}
      </span>
      {label}
    </a>
  );
}

function LinkedInIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
      <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6zM2 9h4v12H2z" />
      <circle cx="4" cy="4" r="2" />
    </svg>
  );
}

function XIcon() {
  return (
    <svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.741l7.73-8.835L1.254 2.25H8.08l4.253 5.622zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}

function GitHubIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0 1 12 6.844a9.59 9.59 0 0 1 2.504.337c1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0 0 22 12.017C22 6.484 17.522 2 12 2z" />
    </svg>
  );
}
