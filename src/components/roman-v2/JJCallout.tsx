"use client";

import type { RomanV2JJ } from "@/lib/roman-v2/types";
import JJButton from "./JJButton";
import shared from "./contemporary-roman.module.css";
import s from "./JJCallout.module.css";

export default function JJCallout({ jj }: { jj: RomanV2JJ }) {
  return (
    <section id="jj" aria-labelledby="jj-title" className={`${shared.section} ${s.section}`}>
      <div className={shared.container}>
        <h2 id="jj-title" className={shared.h2}>
          {jj.heading.lead} <span>{jj.heading.accent}</span>
        </h2>
        <p className={shared.lede}>{jj.body}</p>
        <JJButton label={jj.voiceLabel} variant="outline" />
      </div>
    </section>
  );
}
