"use client";

import type { CSSProperties } from "react";
import { useJJSession } from "@/components/jj/JJSessionProvider";
import type { RomanV2JJ } from "@/lib/roman-v2/types";
import JJButton from "./JJButton";
import LoopVideo from "./LoopVideo";
import shared from "./contemporary-roman.module.css";
import s from "./JJCallout.module.css";

/** Relative heights of the orb's waveform bars. */
const BARS = [0.28, 0.46, 0.72, 0.5, 0.86, 1, 0.78, 0.94, 0.56, 0.4, 0.24];

export default function JJCallout({ jj }: { jj: RomanV2JJ }) {
  const { isActive, state } = useJJSession();

  return (
    <section id="jj" aria-labelledby="jj-title" className={s.section}>
      <div className={`${shared.container} ${s.inner}`}>
        <div className={s.copy}>
          <h2 id="jj-title" className={`${shared.h2} ${s.title}`}>
            <span className={s.lead}>{jj.heading.lead}</span> <span className={s.accent}>{jj.heading.accent}</span>
          </h2>
          <p className={s.body}>{jj.body}</p>
          <div className={s.actions}>
            <JJButton label={jj.voiceLabel} variant="outline" className={s.voice} />
          </div>
        </div>
      </div>

      <div className={s.art} aria-hidden="true">
        <picture>
          {/* Hand down until the listen clip raises it; without motion the still is the finished pose. */}
          <source
            media="(prefers-reduced-motion: reduce) and (max-width: 767px)"
            type="image/avif"
            srcSet="/roman-v2/jj/jj-listener-mobile-420.avif 420w, /roman-v2/jj/jj-listener-mobile-560.avif 560w, /roman-v2/jj/jj-listener-mobile-1122.avif 1122w"
            sizes="100vw"
            width={1122}
            height={1402}
          />
          <source
            media="(prefers-reduced-motion: reduce) and (max-width: 767px)"
            type="image/webp"
            srcSet="/roman-v2/jj/jj-listener-mobile-420.webp 420w, /roman-v2/jj/jj-listener-mobile-560.webp 560w, /roman-v2/jj/jj-listener-mobile-1122.webp 1122w"
            sizes="100vw"
            width={1122}
            height={1402}
          />
          <source
            media="(prefers-reduced-motion: reduce)"
            type="image/avif"
            srcSet="/roman-v2/jj/jj-listener-680.avif 680w, /roman-v2/jj/jj-listener-1002.avif 1002w, /roman-v2/jj/jj-listener-1536.avif 1536w"
            sizes="(min-width: 1024px) max(96vw, 1260px), 100vw"
          />
          <source
            media="(prefers-reduced-motion: reduce)"
            type="image/webp"
            srcSet="/roman-v2/jj/jj-listener-680.webp 680w, /roman-v2/jj/jj-listener-1002.webp 1002w, /roman-v2/jj/jj-listener-1536.webp 1536w"
            sizes="(min-width: 1024px) max(96vw, 1260px), 100vw"
          />
          <source
            media="(max-width: 767px)"
            type="image/avif"
            srcSet="/roman-v2/jj/jj-listener-mobile-start-420.avif 420w, /roman-v2/jj/jj-listener-mobile-start-560.avif 560w, /roman-v2/jj/jj-listener-mobile-start-1122.avif 1122w"
            sizes="100vw"
            width={1122}
            height={1402}
          />
          <source
            media="(max-width: 767px)"
            type="image/webp"
            srcSet="/roman-v2/jj/jj-listener-mobile-start-420.webp 420w, /roman-v2/jj/jj-listener-mobile-start-560.webp 560w, /roman-v2/jj/jj-listener-mobile-start-1122.webp 1122w"
            sizes="100vw"
            width={1122}
            height={1402}
          />
          <source
            type="image/avif"
            srcSet="/roman-v2/jj/jj-listener-start-680.avif 680w, /roman-v2/jj/jj-listener-start-1002.avif 1002w, /roman-v2/jj/jj-listener-start-1536.avif 1536w"
            sizes="(min-width: 1024px) max(96vw, 1260px), 100vw"
          />
          <img
            src="/roman-v2/jj/jj-listener-start-1002.webp"
            srcSet="/roman-v2/jj/jj-listener-start-680.webp 680w, /roman-v2/jj/jj-listener-start-1002.webp 1002w, /roman-v2/jj/jj-listener-start-1536.webp 1536w"
            sizes="(min-width: 1024px) max(96vw, 1260px), 100vw"
            width={1536}
            height={1024}
            alt=""
            loading="lazy"
            decoding="async"
            className={s.artImage}
          />
        </picture>
        {/* Hand comes up to the ear once on first view (≥40% visible), then the idle loop. */}
        <LoopVideo intro="jj-listen" loop="jj-idle" mobileQuery="(max-width: 767px)" startRatio={0.4} />
        <div className={s.orb} data-state={isActive ? state : "idle"}>
          <div className={s.bars}>
            {BARS.map((height, index) => (
              <span key={index} style={{ "--h": height, "--i": index } as CSSProperties} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
