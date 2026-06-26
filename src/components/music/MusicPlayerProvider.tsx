"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { SONGS, type Song } from "@/lib/musicData";

type Ctx = {
  songs: Song[];
  songIndex: number;
  song: Song;
  isPlaying: boolean;
  isSheetOpen: boolean;
  isDocked: boolean;
  hasInteracted: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  currentLineIndex: number;
  currentWordIndex: number;
  summonedBy: "jj" | "user" | null;
  play: () => void;
  pause: () => void;
  toggle: () => void;
  next: () => void;
  prev: () => void;
  seek: (t: number) => void;
  setVolume: (v: number) => void;
  setSong: (i: number, opts?: { summonedBy?: "jj" }) => void;
  openSheet: () => void;
  closeSheet: () => void;
  resetSummonedBy: () => void;
};

const MusicCtx = createContext<Ctx | null>(null);

export function useMusic() {
  const v = useContext(MusicCtx);
  if (!v) throw new Error("useMusic must be inside <MusicPlayerProvider>");
  return v;
}

const SCROLL_DOCK_THRESHOLD = 200;

export default function MusicPlayerProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [songIndex, setSongIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [isDocked, setIsDocked] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolumeState] = useState(0.7);
  const [hasInteracted, setHasInteracted] = useState(false);
  const [currentLineIndex, setCurrentLineIndex] = useState(-1);
  const [currentWordIndex, setCurrentWordIndex] = useState(-1);
  const [summonedBy, setSummonedBy] = useState<"jj" | "user" | null>(null);

  const song = SONGS[songIndex];

  // Sync volume into the audio element whenever it changes
  useEffect(() => {
    const a = audioRef.current;
    if (a) a.volume = volume;
  }, [volume]);

  // rAF loop drives currentTime + line/word indices while playing
  useEffect(() => {
    if (!isPlaying) return;
    let raf = 0;
    const tick = () => {
      const a = audioRef.current;
      if (a) {
        const t = a.currentTime;
        setCurrentTime(t);
        const lines = song.lines;
        let lineIdx = -1;
        for (let i = 0; i < lines.length; i++) {
          if (t >= lines[i].start && t <= lines[i].end) {
            lineIdx = i;
            break;
          }
          if (t < lines[i].start) {
            // before this line — show the previous as fading-out context
            lineIdx = i - 1;
            break;
          }
          if (i === lines.length - 1 && t > lines[i].end) {
            lineIdx = i;
          }
        }
        setCurrentLineIndex(lineIdx);
        if (lineIdx >= 0) {
          const words = lines[lineIdx].words;
          let wIdx = -1;
          for (let j = 0; j < words.length; j++) {
            if (t >= words[j].start && t <= words[j].end) {
              wIdx = j;
              break;
            }
            if (t < words[j].start) {
              wIdx = j - 1;
              break;
            }
            if (j === words.length - 1 && t > words[j].end) {
              wIdx = j;
            }
          }
          setCurrentWordIndex(wIdx);
        } else {
          setCurrentWordIndex(-1);
        }
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [isPlaying, song]);

  // Scroll listener — toggles docked state for the mobile strip
  useEffect(() => {
    const onScroll = () => {
      setIsDocked(window.scrollY > SCROLL_DOCK_THRESHOLD);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const play = useCallback(() => {
    const a = audioRef.current;
    if (!a) return;
    setHasInteracted(true);
    a.play()
      .then(() => setIsPlaying(true))
      .catch(() => setIsPlaying(false));
  }, []);

  const pause = useCallback(() => {
    const a = audioRef.current;
    if (!a) return;
    setHasInteracted(true);
    setSummonedBy(null);
    a.pause();
    setIsPlaying(false);
  }, []);

  const toggle = useCallback(() => {
    if (isPlaying) pause();
    else play();
  }, [isPlaying, play, pause]);

  const setSong = useCallback(
    (i: number, opts?: { summonedBy?: "jj" }) => {
      const n = ((i % SONGS.length) + SONGS.length) % SONGS.length;
      setSongIndex(n);
      setCurrentTime(0);
      setCurrentLineIndex(-1);
      setCurrentWordIndex(-1);
      setSummonedBy(opts?.summonedBy ?? null);
    },
    []
  );

  const next = useCallback(() => {
    setSong(songIndex + 1);
  }, [songIndex, setSong]);

  const prev = useCallback(() => {
    setSong(songIndex - 1);
  }, [songIndex, setSong]);

  const seek = useCallback((t: number) => {
    const a = audioRef.current;
    if (!a) return;
    a.currentTime = t;
    setCurrentTime(t);
  }, []);

  const setVolume = useCallback((v: number) => {
    const clamped = Math.max(0, Math.min(1, v));
    setVolumeState(clamped);
    setSummonedBy(null);
  }, []);

  const openSheet = useCallback(() => {
    setHasInteracted(true);
    setIsSheetOpen(true);
  }, []);
  const closeSheet = useCallback(() => {
    setSummonedBy(null);
    setIsSheetOpen(false);
  }, []);
  const resetSummonedBy = useCallback(() => setSummonedBy(null), []);

  // When song changes, reset audio element to start. If we were playing, keep playing.
  useEffect(() => {
    const a = audioRef.current;
    if (!a) return;
    a.src = song.audio;
    a.load();
    if (isPlaying) {
      a.play().catch(() => setIsPlaying(false));
    }
    // Intentionally don't depend on isPlaying — we only want this to fire on song change.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [song.audio]);

  const onAudioEnded = useCallback(() => {
    const nextIdx = (songIndex + 1) % SONGS.length;
    setSongIndex(nextIdx);
    setCurrentTime(0);
    setCurrentLineIndex(-1);
    setCurrentWordIndex(-1);
    // play after src swap is handled by the effect above (isPlaying still true)
  }, [songIndex]);

  const onLoadedMetadata = useCallback(() => {
    const a = audioRef.current;
    if (a) setDuration(a.duration || song.duration);
  }, [song.duration]);

  const value = useMemo<Ctx>(
    () => ({
      songs: SONGS,
      songIndex,
      song,
      isPlaying,
      isSheetOpen,
      isDocked,
      hasInteracted,
      currentTime,
      duration,
      volume,
      currentLineIndex,
      currentWordIndex,
      summonedBy,
      play,
      pause,
      toggle,
      next,
      prev,
      seek,
      setVolume,
      setSong,
      openSheet,
      closeSheet,
      resetSummonedBy,
    }),
    [
      songIndex,
      song,
      isPlaying,
      isSheetOpen,
      isDocked,
      hasInteracted,
      currentTime,
      duration,
      volume,
      currentLineIndex,
      currentWordIndex,
      summonedBy,
      play,
      pause,
      toggle,
      next,
      prev,
      seek,
      setVolume,
      setSong,
      openSheet,
      closeSheet,
      resetSummonedBy,
    ]
  );

  return (
    <MusicCtx.Provider value={value}>
      {children}
      <audio
        ref={audioRef}
        src={song.audio}
        preload="metadata"
        onEnded={onAudioEnded}
        onLoadedMetadata={onLoadedMetadata}
      />
    </MusicCtx.Provider>
  );
}
