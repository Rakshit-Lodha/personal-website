"use client";

import { useMusic } from "@/components/music/MusicPlayerProvider";
import type { RomanV2Track } from "@/lib/roman-v2/types";
import { ActionArrowIcon, actionClassName } from "./AvailabilityAction";
import s from "./BeyondWork.module.css";

/** Play control for the Music module. Drives the site-wide music provider; never owns audio itself. */
export default function BeyondMusic({ label, track }: { label: string; track: RomanV2Track | null }) {
  const { songs, song, isPlaying, play, setSong, openSheet } = useMusic();
  const index = track ? songs.findIndex((item) => item.id === track.id) : -1;

  if (!track || index === -1) {
    return (
      <button type="button" className={actionClassName("primary", true, s.musicAction)} disabled>
        <span>{label}</span>
        <ActionArrowIcon arrow="up-right" />
      </button>
    );
  }

  const trackId = track.id;

  function start() {
    // The provider can only start playback on the loaded song; a different one is selected and the sheet's controls play it.
    if (song.id !== trackId) setSong(index);
    else if (!isPlaying) play();
    openSheet();
  }

  return (
    <button
      type="button"
      className={actionClassName("primary", false, s.musicAction)}
      onClick={start}
      aria-label={`${label}: ${track.title}`}
    >
      <span>{label}</span>
      <ActionArrowIcon arrow="up-right" />
    </button>
  );
}
