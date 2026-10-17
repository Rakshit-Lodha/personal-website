"use client";

import { useState, type CSSProperties, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, Mic } from "lucide-react";
import { useJJSession } from "@/components/jj/JJSessionProvider";
import type { RomanV2JJ } from "@/lib/roman-v2/types";
import JJButton from "./JJButton";
import shared from "./contemporary-roman.module.css";
import s from "./JJCallout.module.css";

/** Relative heights of the orb's waveform bars. */
const BARS = [0.28, 0.46, 0.72, 0.5, 0.86, 1, 0.78, 0.94, 0.56, 0.4, 0.24];

export default function JJCallout({ jj }: { jj: RomanV2JJ }) {
  const router = useRouter();
  const { isActive, state, open } = useJJSession();
  const [question, setQuestion] = useState("");
  const trimmed = question.trim();

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (trimmed) router.push(`${jj.chatPath}?q=${encodeURIComponent(trimmed)}`);
  }

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
            {/* Native GET keeps typed questions working before hydration; JS adds the non-empty check. */}
            <form className={s.ask} action={jj.chatPath} method="get" onSubmit={submit}>
              <label htmlFor="jj-question" className={shared.visuallyHidden}>
                {jj.questionLabel}
              </label>
              <input
                id="jj-question"
                name="q"
                type="text"
                required
                autoComplete="off"
                enterKeyHint="send"
                placeholder={jj.questionPlaceholder}
                value={question}
                onChange={(event) => setQuestion(event.target.value)}
                className={s.input}
              />
              {trimmed ? (
                <button type="submit" className={s.askButton} aria-label={jj.questionLabel}>
                  <ArrowRight size={20} strokeWidth={1.75} aria-hidden="true" />
                </button>
              ) : (
                // The microphone is only requested after this click.
                <button type="button" className={s.askButton} aria-label={`${jj.voiceLabel} by voice`} onClick={open}>
                  <Mic size={20} strokeWidth={1.75} aria-hidden="true" />
                </button>
              )}
            </form>
          </div>
        </div>
      </div>

      <div className={s.art} aria-hidden="true">
        <picture>
          <source
            media="(max-width: 767px)"
            type="image/avif"
            srcSet="/roman-v2/jj/jj-listener-mobile-420.avif 420w, /roman-v2/jj/jj-listener-mobile-560.avif 560w"
            sizes="100vw"
            width={560}
            height={700}
          />
          <source
            media="(max-width: 767px)"
            type="image/webp"
            srcSet="/roman-v2/jj/jj-listener-mobile-420.webp 420w, /roman-v2/jj/jj-listener-mobile-560.webp 560w"
            sizes="100vw"
            width={560}
            height={700}
          />
          <source
            type="image/avif"
            srcSet="/roman-v2/jj/jj-listener-680.avif 680w, /roman-v2/jj/jj-listener-1002.avif 1002w"
            sizes="(min-width: 1024px) 96vw, 100vw"
          />
          <img
            src="/roman-v2/jj/jj-listener-1002.webp"
            srcSet="/roman-v2/jj/jj-listener-680.webp 680w, /roman-v2/jj/jj-listener-1002.webp 1002w"
            sizes="(min-width: 1024px) 96vw, 100vw"
            width={1002}
            height={668}
            alt=""
            loading="lazy"
            decoding="async"
            className={s.artImage}
          />
        </picture>
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
