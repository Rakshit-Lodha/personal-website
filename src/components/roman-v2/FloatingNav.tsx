"use client";

import { useEffect, useRef, useState } from "react";
import { Menu, X } from "lucide-react";
import type { RomanV2Nav } from "@/lib/roman-v2/types";
import JJButton from "./JJButton";
import shared from "./contemporary-roman.module.css";
import s from "./FloatingNav.module.css";

export default function FloatingNav({ nav }: { nav: RomanV2Nav }) {
  const [scrolled, setScrolled] = useState(false);
  const [active, setActive] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const pillRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onScroll = () => {
      const isScrolled = window.scrollY > 96;
      setScrolled(isScrolled);
      if (!isScrolled) setExpanded(false);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // The active section is the one crossing a band just below the nav.
  useEffect(() => {
    const sections = nav.items
      .map((item) => document.getElementById(item.id))
      .filter((el): el is HTMLElement => el !== null);
    const visible = new Set<string>();
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) visible.add(entry.target.id);
          else visible.delete(entry.target.id);
        }
        setActive(nav.items.find((item) => visible.has(item.id))?.id ?? null);
      },
      { rootMargin: "-35% 0px -60% 0px" },
    );
    sections.forEach((section) => observer.observe(section));
    return () => observer.disconnect();
  }, [nav.items]);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      if (!open && !expanded && !pillRef.current?.contains(document.activeElement)) return;
      setOpen(false);
      setExpanded(false);
      if (pillRef.current?.contains(document.activeElement) && document.activeElement instanceof HTMLElement) {
        document.activeElement.blur();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, expanded]);

  useEffect(() => {
    if (!expanded) return;
    const onPointerDown = (event: PointerEvent) => {
      if (!pillRef.current?.contains(event.target as Node)) setExpanded(false);
    };
    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, [expanded]);

  return (
    <header className={s.root}>
      <a href="#top" className={`${shared.inscription} ${s.wordmark}`}>
        {nav.wordmark}
      </a>
      <div ref={pillRef} className={s.pill} data-scrolled={scrolled || undefined} data-expanded={expanded || undefined}>
        <button
          type="button"
          className={s.compactToggle}
          aria-label="Expand navigation"
          aria-expanded={expanded}
          aria-hidden={!scrolled}
          tabIndex={scrolled ? 0 : -1}
          onClick={() => setExpanded((value) => !value)}
        >
          <span className={s.compactMonogram} aria-hidden="true">RL</span>
          <span className={s.compactDivider} aria-hidden="true" />
          <Menu size={19} strokeWidth={1.7} aria-hidden="true" />
        </button>
        <button
          type="button"
          className={s.menuToggle}
          aria-expanded={open}
          aria-controls="roman-v2-nav-links"
          onClick={() => setOpen((value) => !value)}
        >
          {open ? <X size={20} strokeWidth={1.75} aria-hidden="true" /> : <Menu size={20} strokeWidth={1.75} aria-hidden="true" />}
          <span className={shared.visuallyHidden}>Menu</span>
        </button>
        <nav aria-label="Primary" id="roman-v2-nav-links" className={s.links} data-open={open || undefined}>
          <ul>
            {nav.items.map((item) => (
              <li key={item.id}>
                <a
                  href={item.href}
                  className={s.link}
                  aria-current={active === item.id ? "location" : undefined}
                  onClick={() => { setOpen(false); setExpanded(false); }}
                >
                  {item.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>
        <JJButton label={nav.jjLabel} variant="primary" className={s.jj} />
      </div>
    </header>
  );
}
