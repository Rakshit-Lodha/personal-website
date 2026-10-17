import type { RomanV2Beyond } from "@/lib/roman-v2/types";
import shared from "./contemporary-roman.module.css";
import s from "./BeyondWork.module.css";

export default function BeyondWork({ beyond }: { beyond: RomanV2Beyond }) {
  return (
    <section id="beyond" aria-labelledby="beyond-title" className={`${shared.section} ${s.section}`}>
      <div className={shared.container}>
        <h2 id="beyond-title" className={shared.h2}>
          {beyond.heading.lead} <span className={shared.accent}>{beyond.heading.accent}</span>
        </h2>
        <p className={shared.lede}>{beyond.body}</p>
        <h3 className={shared.h3}>{beyond.reading.heading}</h3>
        <h3 className={shared.h3}>{beyond.writing.eyebrow}</h3>
        <h3 className={shared.h3}>{beyond.music.heading}</h3>
        <h3 className={shared.h3}>{beyond.whoop.eyebrow}</h3>
      </div>
    </section>
  );
}
