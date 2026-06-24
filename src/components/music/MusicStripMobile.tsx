"use client";

import Image from "next/image";
import { useMusic } from "./MusicPlayerProvider";

export default function MusicStripMobile() {
  const { song, isPlaying, isDocked, isSheetOpen, openSheet } = useMusic();

  if (isSheetOpen) return null;

  return (
    <div
      className="music-strip-mobile"
      onClick={openSheet}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") openSheet();
      }}
      aria-label={`Open music player. Now playing: ${song.title}`}
      style={{
        position: "fixed",
        top: isDocked ? 68 : 80,
        left: 12,
        right: 12,
        height: isDocked ? 36 : 42,
        background: isDocked
          ? "linear-gradient(180deg, #fafaf7 0%, #ffffff 100%)"
          : "#ffffff",
        borderRadius: isDocked ? "0 0 12px 12px" : 12,
        border: "1px solid rgba(23,15,73,.08)",
        borderTop: isDocked ? "1px solid rgba(23,15,73,.06)" : "1px solid rgba(23,15,73,.08)",
        boxShadow: isDocked
          ? "0 23px 23px rgba(0,0,0,.07), 0 53px 32px rgba(0,0,0,.04)"
          : "0 4px 14px rgba(8,13,40,.22), 0 2px 6px rgba(8,13,40,.10)",
        overflow: "hidden",
        cursor: "pointer",
        zIndex: 49, // just under the nav
        transition:
          "top .35s cubic-bezier(.2,.8,.2,1), height .35s cubic-bezier(.2,.8,.2,1), border-radius .35s cubic-bezier(.2,.8,.2,1), box-shadow .35s ease, background .35s ease",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          padding: "0 12px",
          height: "100%",
        }}
      >
        <Image
          src={song.cover}
          alt=""
          width={isDocked ? 18 : 22}
          height={isDocked ? 18 : 22}
          style={{
            borderRadius: isDocked ? 4 : 5,
            flexShrink: 0,
            objectFit: "cover",
            transition: "width .35s ease, height .35s ease, border-radius .35s ease",
          }}
        />
        <span
          style={{
            fontFamily: "var(--font-figtree), ui-sans-serif, system-ui, sans-serif",
            fontSize: isDocked ? 11 : 12,
            fontWeight: 600,
            color: "#170f49",
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
            flex: 1,
            minWidth: 0,
            transition: "font-size .35s ease",
          }}
        >
          {song.title}
        </span>
        <span
          style={{
            fontFamily: "var(--font-geist-mono), ui-monospace, monospace",
            fontSize: 9,
            color: "#6b6f8a",
            letterSpacing: ".08em",
            textTransform: "uppercase",
            opacity: isDocked ? 0 : 1,
            maxWidth: isDocked ? 0 : 60,
            overflow: "hidden",
            flexShrink: 0,
            transition: "opacity .25s ease, max-width .35s ease",
          }}
        >
          Suno
        </span>
        <Equalizer playing={isPlaying} />
      </div>
    </div>
  );
}

function Equalizer({ playing }: { playing: boolean }) {
  return (
    <div
      aria-hidden
      style={{
        display: "inline-flex",
        gap: 2,
        alignItems: "flex-end",
        height: 12,
        flexShrink: 0,
        marginLeft: "auto",
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
            animation: "music-wave-m 1.1s ease-in-out infinite",
            animationDelay: `${-0.2 - i * 0.18}s`,
            animationPlayState: playing ? "running" : "paused",
            height: `${[30, 70, 50, 90][i]}%`,
          }}
        />
      ))}
      <style jsx>{`
        @keyframes music-wave-m {
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
