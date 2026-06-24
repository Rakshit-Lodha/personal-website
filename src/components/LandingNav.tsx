"use client";

import { useEffect, useState } from "react";

const NAV_LINKS = [
  { label: "My Story", href: "#my-story" },
  { label: "Projects", href: "#projects" },
  { label: "Skill Map", href: "#skill-map" },
  { label: "Education", href: "#education" },
];

export default function LandingNav() {
  const [activeId, setActiveId] = useState<string>("my-story");
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const ids = NAV_LINKS.map((l) => l.href.slice(1));
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio);
        if (visible[0]) setActiveId(visible[0].target.id);
      },
      { rootMargin: "-30% 0px -55% 0px", threshold: [0, 0.25, 0.5, 0.75, 1] }
    );
    ids.forEach((id) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const onResize = () => {
      if (window.innerWidth > 768) setMenuOpen(false);
    };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  return (
    <div
      className="fixed left-0 right-0 top-0 z-50 pointer-events-none"
      style={{
        padding:
          "clamp(12px,1.6vw,28px) clamp(12px,5.3vw,92px) 0",
      }}
    >
      <nav
        className="pointer-events-auto flex items-center justify-between bg-white"
        style={{
          borderRadius: "clamp(10px,1.04vw,18px)",
          padding: "clamp(10px,1.04vw,18px) clamp(14px,1.39vw,24px)",
          boxShadow:
            "0 6px 13px rgba(0,0,0,.10), 0 23px 23px rgba(0,0,0,.09), 0 53px 32px rgba(0,0,0,.05), 0 94px 37px rgba(0,0,0,.01)",
        }}
      >
        <a
          href="#hero"
          className="font-display text-[#170f49] whitespace-nowrap no-underline"
          style={{ fontSize: "clamp(13px,1.16vw,20px)", letterSpacing: ".01em" }}
        >
          Rakshit Lodha.
        </a>

        {/* Desktop pill bar */}
        <div
          className="hidden md:flex items-center rounded-[clamp(4px,.35vw,6px)] border border-[#f8f8f8] bg-[#eaf1ff]"
          style={{
            padding: "clamp(2px,.17vw,3px)",
            gap: "clamp(1px,.17vw,3px)",
            filter: "drop-shadow(0 0 2px rgba(0,0,0,.18))",
          }}
        >
          {NAV_LINKS.map((l) => {
            const id = l.href.slice(1);
            const isActive = activeId === id;
            return (
              <a
                key={l.label}
                href={l.href}
                className={`font-figtree text-center text-[#222] no-underline whitespace-nowrap transition-colors ${
                  isActive
                    ? "bg-white font-semibold rounded-[clamp(4px,.46vw,8px)]"
                    : "font-normal hover:bg-white/60 rounded-[clamp(3px,.23vw,4px)]"
                }`}
                style={{
                  padding: "clamp(4px,.35vw,6px) clamp(5px,.46vw,8px)",
                  fontSize: "clamp(9px,.81vw,14px)",
                  minWidth: "clamp(52px,5.79vw,100px)",
                  lineHeight: 1.3,
                  filter: isActive ? "drop-shadow(0 0 2px rgba(0,0,0,.18))" : undefined,
                }}
              >
                {l.label}
              </a>
            );
          })}
        </div>

        {/* Mobile hamburger */}
        <button
          type="button"
          aria-label={menuOpen ? "Close menu" : "Open menu"}
          aria-expanded={menuOpen}
          aria-controls="landing-mobile-menu"
          onClick={() => setMenuOpen((v) => !v)}
          className="md:hidden flex items-center justify-center"
          style={{
            width: 36,
            height: 36,
            borderRadius: 8,
            background: "#eaf1ff",
            border: "1px solid #f0f3ff",
          }}
        >
          <svg width="18" height="14" viewBox="0 0 18 14" fill="none" aria-hidden="true">
            {menuOpen ? (
              <path d="M2 2l14 10M16 2L2 12" stroke="#1a1a2e" strokeWidth="1.8" strokeLinecap="round" />
            ) : (
              <>
                <path d="M2 2h14" stroke="#1a1a2e" strokeWidth="1.8" strokeLinecap="round" />
                <path d="M2 7h14" stroke="#1a1a2e" strokeWidth="1.8" strokeLinecap="round" />
                <path d="M2 12h14" stroke="#1a1a2e" strokeWidth="1.8" strokeLinecap="round" />
              </>
            )}
          </svg>
        </button>
      </nav>

      {/* Mobile dropdown */}
      {menuOpen && (
        <div
          id="landing-mobile-menu"
          className="pointer-events-auto md:hidden flex flex-col bg-white"
          style={{
            marginTop: 8,
            borderRadius: 12,
            padding: "8px 12px",
            boxShadow:
              "0 6px 13px rgba(0,0,0,.10), 0 23px 23px rgba(0,0,0,.09), 0 53px 32px rgba(0,0,0,.05)",
          }}
        >
          {NAV_LINKS.map((l) => {
            const id = l.href.slice(1);
            const isActive = activeId === id;
            return (
              <a
                key={l.label}
                href={l.href}
                onClick={() => setMenuOpen(false)}
                className="font-figtree text-[#222] no-underline"
                style={{
                  padding: "12px 6px",
                  fontSize: 15,
                  fontWeight: isActive ? 600 : 400,
                  borderBottom: "1px solid #f1f2f7",
                }}
              >
                {l.label}
              </a>
            );
          })}
        </div>
      )}
    </div>
  );
}
