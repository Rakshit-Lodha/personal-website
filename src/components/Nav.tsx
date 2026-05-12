"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";

const links = [
  { label: "My Story", href: "#story" },
  { label: "Projects & Skills", href: "#projects" },
  { label: "Experience", href: "#story" },
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
        <div className="flex flex-col leading-tight">
          <span className="font-bold text-sm text-foreground tracking-tight">
            Rakshit Lodha<span className="text-[#1B6AE7]">.</span>
          </span>
        </div>

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

        <Button
          variant="outline"
          size="sm"
          className="gap-2 border-border hover:border-[#1B6AE7] hover:text-[#1B6AE7] transition-colors"
        >
          Resume
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
            <path d="M6 1v7M3 6l3 3 3-3M2 11h8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </Button>
      </div>
    </nav>
  );
}
