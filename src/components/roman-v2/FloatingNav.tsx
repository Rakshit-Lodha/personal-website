"use client";

import { useEffect, useState } from "react";
import { Menu, X } from "lucide-react";
import type { RomanV2Nav } from "@/lib/roman-v2/types";
import JJButton from "./JJButton";
import shared from "./contemporary-roman.module.css";
import s from "./FloatingNav.module.css";

export default function FloatingNav({ nav }: { nav: RomanV2Nav }) {
  const [scrolled, setScrolled] = useState(false);
  const [active, setActive] = useState<string | null>(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
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
    if (!open) return;
    const onKey = (event: KeyboardEvent) => event.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <header className={s.root}>
      <a href="#top" className={`${shared.inscription} ${s.wordmark}`}>
        {nav.wordmark}
      </a>
      <div className={s.pill} data-scrolled={scrolled || undefined}>
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
                  onClick={() => setOpen(false)}
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
