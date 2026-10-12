"use client";

import { useRef, useState } from "react";
import { Pause, Play } from "lucide-react";
import { useMusic } from "@/components/music/MusicPlayerProvider";
import s from "./roman.module.css";

function clock(seconds: number) {
  return `${Math.floor(seconds / 60)}:${String(Math.floor(seconds % 60)).padStart(2, "0")}`;
}

/** Edition audio. Nothing loads or plays until the visitor presses play. */
export default function AudioPlayer({ src, durationSeconds }: { src: string; durationSeconds: number }) {
  const audio = useRef<HTMLAudioElement>(null);
  const [playing, setPlaying] = useState(false);
  const [time, setTime] = useState(0);
  const music = useMusic();

  function toggle() {
    const element = audio.current;
    if (!element) return;
    if (!element.paused) return element.pause();
    if (music.isPlaying) music.pause(); // one voice at a time
    element.play().catch(() => setPlaying(false));
  }

  return (
    <div className={s.player}>
      <audio
        ref={audio}
        src={src}
        preload="none"
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
        onTimeUpdate={(event) => setTime(event.currentTarget.currentTime)}
      />
      <button onClick={toggle} aria-label={playing ? "Pause the edition audio" : "Play the edition audio"}>
        {playing ? <Pause size={18} aria-hidden="true" /> : <Play size={18} aria-hidden="true" />}
      </button>
      <input
        type="range"
        aria-label="Seek"
        min={0}
        max={durationSeconds}
        value={Math.min(time, durationSeconds)}
        onChange={(event) => {
          const next = Number(event.target.value);
          if (audio.current) audio.current.currentTime = next;
          setTime(next);
        }}
      />
      <span>
        {clock(time)} / {clock(durationSeconds)}
      </span>
    </div>
  );
}
