"use client";

import { useEffect, useState } from "react";
import { AudioLines, Menu, X } from "lucide-react";
import { useJJSession } from "@/components/jj/JJSessionProvider";
import s from "./roman.module.css";

const LINKS = [
  ["journey", "Work"],
  ["projects", "Projects"],
  ["reading", "Reading"],
  ["writing", "Writing"],
];

export default function Nav() {
  const [menu, setMenu] = useState(false);
  const { open } = useJJSession();

  useEffect(() => {
    if (!menu) return;
    const close = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMenu(false);
    };
    window.addEventListener("keydown", close);
    return () => window.removeEventListener("keydown", close);
  }, [menu]);

  return (
    <header className={s.nav}>
      <a href="#arrival" className={s.wordmark}>
        RAKSHIT LODHA
      </a>
      <button className={s.menuButton} aria-label={menu ? "Close menu" : "Open menu"} aria-expanded={menu} aria-controls="roman-nav" onClick={() => setMenu(!menu)}>
        {menu ? <X aria-hidden="true" /> : <Menu aria-hidden="true" />}
      </button>
      <nav id="roman-nav" aria-label="Main" className={`${s.links} ${menu ? s.linksOpen : ""}`}>
        {LINKS.map(([id, title]) => (
          <a key={id} href={`#${id}`} onClick={() => setMenu(false)}>
            {title}
          </a>
        ))}
        <button
          onClick={() => {
            setMenu(false);
            open();
          }}
        >
          <AudioLines size={18} aria-hidden="true" className={s.mobileOnly} /> Talk to A
        </button>
      </nav>
    </header>
  );
}
