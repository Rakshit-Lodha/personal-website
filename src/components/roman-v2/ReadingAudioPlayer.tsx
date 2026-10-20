"use client";

import { useRef, useState } from "react";
import { Pause, Play } from "lucide-react";
import { useMusic } from "@/components/music/MusicPlayerProvider";
import s from "@/app/roman-v2/reading/reading.module.css";

const RATES = [1, 1.5, 2] as const;

function clock(seconds: number) {
  return `${Math.floor(seconds / 60)}:${String(Math.floor(seconds % 60)).padStart(2, "0")}`;
}

export default function ReadingAudioPlayer({ src, durationSeconds }: { src: string; durationSeconds: number }) {
  const audio = useRef<HTMLAudioElement>(null);
  const [playing, setPlaying] = useState(false);
  const [time, setTime] = useState(0);
  const [rate, setRate] = useState<(typeof RATES)[number]>(1);
  const music = useMusic();

  function toggle() {
    const element = audio.current;
    if (!element) return;
    if (!element.paused) return element.pause();
    if (music.isPlaying) music.pause();
    element.play().catch(() => setPlaying(false));
  }

  function changeRate(nextRate: (typeof RATES)[number]) {
    setRate(nextRate);
    if (audio.current) audio.current.playbackRate = nextRate;
  }

  return (
    <div className={s.audioPlayer}>
      <audio
        ref={audio}
        src={src}
        preload="metadata"
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
        onEnded={() => setPlaying(false)}
        onTimeUpdate={(event) => setTime(event.currentTarget.currentTime)}
      />
      <button className={s.audioPlay} onClick={toggle} aria-label={playing ? "Pause edition audio" : "Play edition audio"}>
        {playing ? <Pause size={18} aria-hidden="true" /> : <Play size={18} aria-hidden="true" />}
      </button>
      <div className={s.audioTrack}>
        <div className={s.audioMeta}>
          <span>Listen</span>
          <span>{clock(time)} / {clock(durationSeconds)}</span>
        </div>
        <input
          type="range"
          aria-label="Seek through edition audio"
          min={0}
          max={durationSeconds}
          value={Math.min(time, durationSeconds)}
          onChange={(event) => {
            const next = Number(event.target.value);
            if (audio.current) audio.current.currentTime = next;
            setTime(next);
          }}
        />
      </div>
      <div className={s.audioRates} aria-label="Playback speed">
        {RATES.map((option) => (
          <button key={option} onClick={() => changeRate(option)} aria-pressed={rate === option}>
            {option}×
          </button>
        ))}
      </div>
    </div>
  );
}
