"use client";

import { useMusic } from "./MusicPlayerProvider";

type Props = {
  size?: "sm" | "md";
  showVolume?: boolean;
};

export default function PlayerControls({ size = "md", showVolume = true }: Props) {
  const { isPlaying, toggle, next, prev, volume, setVolume } = useMusic();
  const btn = size === "sm" ? 32 : 38;
  const play = size === "sm" ? 44 : 52;

  return (
    <div
      style={{
        display: "flex",
        width: "100%",
        alignItems: "center",
        gap: 16,
        flexWrap: "wrap",
        justifyContent: "center",
      }}
    >
      <div style={{ display: "inline-flex", alignItems: "center", gap: size === "sm" ? 12 : 18 }}>
        <button
          type="button"
          aria-label="Previous song"
          onClick={(e) => {
            e.stopPropagation();
            prev();
          }}
          style={tBtn(btn)}
        >
          <svg width={size === "sm" ? 16 : 18} height={size === "sm" ? 16 : 18} viewBox="0 0 24 24" fill="currentColor">
            <path d="M6 6h2v12H6zM9.5 12l8.5 6V6z" />
          </svg>
        </button>
        <button
          type="button"
          aria-label={isPlaying ? "Pause" : "Play"}
          onClick={(e) => {
            e.stopPropagation();
            toggle();
          }}
          style={{
            width: play,
            height: play,
            borderRadius: "50%",
            background: "#1B6AE7",
            color: "white",
            border: "none",
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            boxShadow: "0 4px 12px rgba(27,106,231,.35)",
          }}
        >
          {isPlaying ? (
            <svg width={size === "sm" ? 13 : 15} height={size === "sm" ? 13 : 15} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
              <path d="M6 4h4v16H6zM14 4h4v16h-4z" />
            </svg>
          ) : (
            <svg width={size === "sm" ? 14 : 16} height={size === "sm" ? 14 : 16} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
              <path d="M8 5v14l11-7z" />
            </svg>
          )}
        </button>
        <button
          type="button"
          aria-label="Next song"
          onClick={(e) => {
            e.stopPropagation();
            next();
          }}
          style={tBtn(btn)}
        >
          <svg width={size === "sm" ? 16 : 18} height={size === "sm" ? 16 : 18} viewBox="0 0 24 24" fill="currentColor">
            <path d="M16 6h2v12h-2zM6 18l8.5-6L6 6z" />
          </svg>
        </button>
      </div>

      {showVolume && (
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
            width: size === "sm" ? 110 : 200,
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="rgba(23,15,73,.5)" aria-hidden>
            <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3a4.5 4.5 0 0 0-2.5-4v8a4.5 4.5 0 0 0 2.5-4z" />
          </svg>
          <input
            type="range"
            min={0}
            max={1}
            step={0.01}
            value={volume}
            onChange={(e) => setVolume(parseFloat(e.target.value))}
            aria-label="Volume"
            style={{
              flex: 1,
              accentColor: "#170f49",
              cursor: "pointer",
            }}
          />
        </div>
      )}
    </div>
  );
}

function tBtn(size: number): React.CSSProperties {
  return {
    width: size,
    height: size,
    borderRadius: "50%",
    background: "transparent",
    border: "none",
    color: "#170f49",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
  };
}
