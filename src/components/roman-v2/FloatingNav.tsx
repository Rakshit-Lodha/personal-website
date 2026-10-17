"use client";

import type { RomanV2Nav } from "@/lib/roman-v2/types";
import JJButton from "./JJButton";
import shared from "./contemporary-roman.module.css";
import s from "./FloatingNav.module.css";

export default function FloatingNav({ nav }: { nav: RomanV2Nav }) {
  return (
    <header className={s.root}>
      <a href="#top" className={shared.inscription}>
        {nav.wordmark}
      </a>
      <nav aria-label="Primary">
        <ul>
          {nav.items.map((item) => (
            <li key={item.id}>
              <a href={item.href}>{item.label}</a>
            </li>
          ))}
        </ul>
      </nav>
      <JJButton label={nav.jjLabel} variant="primary" />
    </header>
  );
}
