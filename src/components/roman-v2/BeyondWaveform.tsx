"use client";

import type { CSSProperties } from "react";
import { useMusic } from "@/components/music/MusicPlayerProvider";
import { useCardActive } from "./CardActivity";
import s from "./BeyondWork.module.css";

/** The music card's waveform: bars rise and fall whenever the knob turns (card active or a song playing). */
export default function BeyondWaveform({ bars }: { bars: number[] }) {
  const { isPlaying } = useMusic();
  const live = Boolean(useCardActive()) || isPlaying;

  return (
    <span className={s.waveform} data-live={live || undefined}>
      {bars.map((h, i) => (
        <span
          key={i}
          style={
            {
              height: `${h}%`,
              // Deterministic per-bar timing so neighbours never move in step.
              "--wave-duration": `${420 + ((i * 137) % 360)}ms`,
              "--wave-delay": `${-((i * 211) % 900)}ms`,
              "--wave-low": `${0.2 + ((i * 53) % 40) / 100}`,
            } as CSSProperties
          }
        />
      ))}
    </span>
  );
}
