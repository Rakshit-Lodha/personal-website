"use client";

import Image from "next/image";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { useEffect, useRef } from "react";
import { useMusic } from "./MusicPlayerProvider";
import KaraokeView from "./KaraokeView";
import PlayerControls from "./PlayerControls";

// Same shadow stack as LandingNav so the chip reads as a sibling card.
const SHADOW =
  "0 6px 13px rgba(0,0,0,.10), 0 23px 23px rgba(0,0,0,.09), 0 53px 32px rgba(0,0,0,.05), 0 94px 37px rgba(0,0,0,.01)";

const EASE = "easeOut";

type Props = {
  /** matches the nav's outer height so the collapsed chip sits flush with the nav */
  collapsedHeight?: number;
};

export default function MusicChipDesktop({ collapsedHeight = 56 }: Props) {
  const {
    song,
    isPlaying,
    isSheetOpen,
    hasInteracted,
    summonedBy,
    openSheet,
    closeSheet,
    resetSummonedBy,
    toggle,
  } = useMusic();
  const ref = useRef<HTMLDivElement>(null);
  const reduceMotion = useReducedMotion();

  // Click outside or ESC closes
  useEffect(() => {
    if (!isSheetOpen) return;
    const onDown = (e: MouseEvent) => {
      const el = ref.current;
      if (!el) return;
      if (e.target instanceof Node && !el.contains(e.target)) {
        resetSummonedBy();
        closeSheet();
      }
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        resetSummonedBy();
        closeSheet();
      }
    };
    window.addEventListener("mousedown", onDown);
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("mousedown", onDown);
      window.removeEventListener("keydown", onKey);
    };
  }, [isSheetOpen, closeSheet, resetSummonedBy]);

  return (
    <motion.div
      ref={ref}
      onClick={() => {
        if (!isSheetOpen) {
          resetSummonedBy();
          openSheet();
        }
      }}
      initial={false}
      animate={{
        width: isSheetOpen ? 420 : 240,
        height: isSheetOpen ? 460 : collapsedHeight,
      }}
      transition={{ duration: reduceMotion ? 0 : 0.4, ease: EASE }}
      style={{
        background: "white",
        borderRadius: isSheetOpen ? 18 : "clamp(10px,1.04vw,18px)",
        boxShadow:
          summonedBy === "jj"
            ? `${SHADOW}, 0 0 0 4px rgba(27,106,231,.22)`
            : SHADOW,
        overflow: "hidden",
        cursor: isSheetOpen ? "default" : "pointer",
        position: "relative",
        flexShrink: 0,
      }}
    >
      <AnimatePresence mode="wait">
        {!isSheetOpen ? (
          <motion.div
            key="collapsed"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            style={{
              display: "flex",
              alignItems: "stretch",
              gap: "clamp(6px,.7vw,10px)",
              // Vertical padding matches nav exactly so the chip's height
              // (content-area + 2 × padding) renders identical to the nav.
              padding: "clamp(10px,1.04vw,18px) clamp(8px,1vw,14px)",
              height: "100%",
              boxSizing: "border-box",
            }}
          >
            <div
              style={{
                aspectRatio: "1 / 1",
                borderRadius: "clamp(4px,.46vw,8px)",
                flexShrink: 0,
                position: "relative",
                overflow: "hidden",
              }}
            >
              <Image
                src={song.cover}
                alt=""
                fill
                sizes="60px"
                style={{ objectFit: "cover" }}
              />
            </div>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                minWidth: 0,
                flex: 1,
                lineHeight: 1.15,
              }}
            >
              <span
                style={{
                  fontWeight: 600,
                  fontSize: "clamp(11px,.95vw,14px)",
                  color: "#170f49",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                {song.title}
              </span>
              <span
                style={{
                  fontFamily: "var(--font-geist-mono), ui-monospace, monospace",
                  fontSize: "clamp(8px,.65vw,10px)",
                  color: "#6b6f8a",
                  letterSpacing: ".06em",
                  textTransform: "uppercase",
                }}
              >
                Now Playing
              </span>
            </div>
            <Equalizer playing={isPlaying} />
            <div
              style={{
                position: "relative",
                aspectRatio: "1 / 1",
                height: "100%",
                flexShrink: 0,
              }}
            >
              {!hasInteracted && (
                <>
                  <span aria-hidden className="chip-play-pulse chip-play-pulse-a" />
                  <span aria-hidden className="chip-play-pulse chip-play-pulse-b" />
                </>
              )}
              <button
                type="button"
                aria-label={isPlaying ? "Pause" : "Play"}
                onClick={(e) => {
                  e.stopPropagation();
                  resetSummonedBy();
                  toggle();
                }}
                style={{
                  position: "relative",
                  zIndex: 1,
                  width: "100%",
                  height: "100%",
                  borderRadius: "50%",
                  background: "#1B6AE7",
                  color: "white",
                  border: "none",
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                  padding: 0,
                }}
              >
                {isPlaying ? (
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
                    <path d="M6 4h4v16H6zM14 4h4v16h-4z" />
                  </svg>
                ) : (
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
                    <path d="M8 5v14l11-7z" />
                  </svg>
                )}
              </button>
              <style jsx>{`
                .chip-play-pulse {
                  position: absolute;
                  inset: 0;
                  border-radius: 50%;
                  border: 2px solid #1b6ae7;
                  opacity: 0;
                  pointer-events: none;
                  animation: chip-play-pulse 2.2s ease-out infinite;
                }
                .chip-play-pulse-b {
                  animation-delay: 1.1s;
                }
                @keyframes chip-play-pulse {
                  0% {
                    transform: scale(1);
                    opacity: 0.55;
                  }
                  100% {
                    transform: scale(2.2);
                    opacity: 0;
                  }
                }
                @media (prefers-reduced-motion: reduce) {
                  .chip-play-pulse {
                    animation: none;
                  }
                }
              `}</style>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="expanded"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25, delay: 0.1 }}
            style={{
              position: "absolute",
              inset: 0,
              display: "flex",
              flexDirection: "column",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ padding: 16, display: "flex", gap: 12, alignItems: "center" }}>
              <Image
                src={song.cover}
                alt=""
                width={64}
                height={64}
                style={{ borderRadius: 12, flexShrink: 0, objectFit: "cover" }}
              />
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: 4,
                  fontFamily: "var(--font-instrument-serif), Georgia, serif",
                  fontStyle: "italic",
                  fontSize: 22,
                  color: "#170f49",
                  lineHeight: 1.1,
                  flex: 1,
                  minWidth: 0,
                }}
              >
                <span>{song.title}</span>
                {summonedBy === "jj" && (
                  <span
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 5,
                      alignSelf: "flex-start",
                      fontFamily: "var(--font-figtree), ui-sans-serif, system-ui, sans-serif",
                      fontStyle: "normal",
                      fontSize: 10,
                      fontWeight: 700,
                      color: "#1B6AE7",
                    }}
                  >
                    <span
                      aria-hidden
                      style={{
                        width: 8,
                        height: 8,
                        borderRadius: 99,
                        background: "#1B6AE7",
                        boxShadow: "0 0 0 3px rgba(27,106,231,.15)",
                      }}
                    />
                    Summoned by JJ
                  </span>
                )}
              </div>
              <button
                type="button"
                aria-label="Close player"
                onClick={(e) => {
                  e.stopPropagation();
                  resetSummonedBy();
                  closeSheet();
                }}
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: "50%",
                  background: "rgba(23,15,73,.06)",
                  border: "none",
                  cursor: "pointer",
                  color: "#170f49",
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                  <path d="M5 5l14 14M19 5L5 19" />
                </svg>
              </button>
            </div>
            <div
              style={{
                flex: 1,
                minHeight: 0,
                borderTop: "1px solid rgba(23,15,73,.08)",
                borderBottom: "1px solid rgba(23,15,73,.08)",
                display: "flex",
                flexDirection: "column",
              }}
            >
              <KaraokeView fontSize={17} windowSize={5} background="white" />
            </div>
            <div style={{ padding: "14px 16px" }}>
              <PlayerControls size="sm" showVolume />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

function Equalizer({ playing }: { playing: boolean }) {
  // 4 bars; CSS keyframes handled inline via animationPlayState
  return (
    <div
      aria-hidden
      style={{
        display: "inline-flex",
        gap: 2,
        alignItems: "flex-end",
        height: 12,
        flexShrink: 0,
        alignSelf: "center",
      }}
    >
      {[0, 1, 2, 3].map((i) => (
        <span
          key={i}
          style={{
            width: 2,
            background: "#1B6AE7",
            borderRadius: 1,
            display: "inline-block",
            transformOrigin: "bottom",
            animation: "music-wave 1.1s ease-in-out infinite",
            animationDelay: `${-0.2 - i * 0.18}s`,
            animationPlayState: playing ? "running" : "paused",
            height: `${[30, 70, 50, 90][i]}%`,
          }}
        />
      ))}
      <style jsx>{`
        @keyframes music-wave {
          0%,
          100% {
            transform: scaleY(0.4);
          }
          50% {
            transform: scaleY(1);
          }
        }
      `}</style>
    </div>
  );
}
