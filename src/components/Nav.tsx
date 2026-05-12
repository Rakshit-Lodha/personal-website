"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

const resumeUrl =
  "https://drive.google.com/file/d/1vfbeiJ50qj7MTv7lo_7MzssiH57VcBrW/view?usp=sharing";

const links = [
  { label: "My Story", href: "#story" },
  { label: "Projects & Skills", href: "#projects" },
  { label: "Education", href: "#education" },
];

export default function Nav({ sectionHrefPrefix = "" }: { sectionHrefPrefix?: string }) {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handler, { passive: true });
    return () => window.removeEventListener("scroll", handler);
  }, []);

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? "bg-background/95 backdrop-blur-sm shadow-sm" : "bg-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        <Link
          href="/"
          className="flex flex-col leading-tight focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#1B6AE7]"
        >
          <span className="font-bold text-sm text-foreground tracking-tight">
            Rakshit Lodha<span className="text-[#1B6AE7]">.</span>
          </span>
        </Link>

        <div className="hidden md:flex items-center gap-8">
          {links.map((l) => (
            <a
              key={l.label}
              href={`${sectionHrefPrefix}${l.href}`}
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              {l.label}
            </a>
          ))}
        </div>

        <a
          href={resumeUrl}
          target="_blank"
          rel="noreferrer"
          className="inline-flex h-7 shrink-0 items-center justify-center gap-2 rounded-[min(var(--radius-md),12px)] border border-border bg-background px-2.5 text-[0.8rem] font-medium whitespace-nowrap transition-colors outline-none select-none hover:border-[#1B6AE7] hover:bg-muted hover:text-[#1B6AE7] focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
        >
          Resume
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
            <path d="M6 1v7M3 6l3 3 3-3M2 11h8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </a>
      </div>
    </nav>
  );
}
