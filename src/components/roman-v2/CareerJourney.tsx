"use client";

import type { RomanV2Career } from "@/lib/roman-v2/types";
import shared from "./contemporary-roman.module.css";
import s from "./CareerJourney.module.css";

export default function CareerJourney({ career }: { career: RomanV2Career }) {
  return (
    <section id="work" aria-labelledby="work-title" className={`${shared.section} ${s.section}`}>
      <div className={shared.container}>
        <h2 id="work-title" className={shared.h2}>
          {career.heading.lead} <span className={shared.accent}>{career.heading.accent}</span>
        </h2>
        <p className={shared.lede}>{career.body}</p>
        <ol>
          {career.chapters.map((chapter) => (
            <li key={chapter.id} aria-current={chapter.id === career.initialChapterId ? "step" : undefined}>
              {chapter.company} · {chapter.period}
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
