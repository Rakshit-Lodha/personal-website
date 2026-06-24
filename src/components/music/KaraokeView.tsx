"use client";

import { useMusic } from "./MusicPlayerProvider";

type Props = {
  /** font size for active line */
  fontSize?: number;
  /** number of lines to render in the viewport */
  windowSize?: number;
  /** background color of the karaoke surface (controls fade gradient) */
  background?: string;
};

export default function KaraokeView({
  fontSize = 16,
  windowSize = 5,
  background = "white",
}: Props) {
  const { song, currentLineIndex, currentTime } = useMusic();

  // Pick a window of lines centered on the active line so the scroll is virtual
  const total = song.lines.length;
  const half = Math.floor(windowSize / 2);
  const center = Math.max(0, Math.min(total - 1, currentLineIndex));
  const start = Math.max(0, center - half);
  const end = Math.min(total, start + windowSize);
  const visible = song.lines.slice(start, end);

  return (
    <div
      style={{
        position: "relative",
        overflow: "hidden",
        background,
        flex: 1,
        minHeight: 0,
      }}
    >
      {/* top + bottom fade */}
      <div
        aria-hidden
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          top: 0,
          height: 32,
          background: `linear-gradient(180deg, ${background}, transparent)`,
          pointerEvents: "none",
          zIndex: 2,
        }}
      />
      <div
        aria-hidden
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          bottom: 0,
          height: 32,
          background: `linear-gradient(0deg, ${background}, transparent)`,
          pointerEvents: "none",
          zIndex: 2,
        }}
      />
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          top: "50%",
          transform: "translateY(-50%)",
          display: "flex",
          flexDirection: "column",
          padding: "0 28px",
          gap: 14,
          transition: "transform .35s cubic-bezier(.2,.8,.2,1)",
        }}
      >
        {visible.map((line, i) => {
          const lineIdx = start + i;
          const isActive = lineIdx === currentLineIndex;
          const isPast = lineIdx < currentLineIndex;
          const opacity = isActive ? 1 : isPast ? 0.28 : 0.4;
          const color = isActive ? "#170f49" : "rgba(23,15,73,.45)";
          return (
            <div
              key={`${song.id}-${lineIdx}`}
              style={{
                fontFamily:
                  "var(--font-instrument-serif), Georgia, 'Times New Roman', serif",
                fontStyle: "italic",
                lineHeight: 1.3,
                fontSize,
                color,
                opacity,
                transition:
                  "color .25s ease, opacity .25s ease, transform .25s ease",
                textAlign: "center",
                wordBreak: "normal",
                overflowWrap: "break-word",
              }}
            >
              {isActive ? (
                <ActiveLineWords line={line} currentTime={currentTime} />
              ) : (
                line.text
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function ActiveLineWords({
  line,
  currentTime,
}: {
  line: { text: string; start: number; end: number; words: { word: string; start: number; end: number }[] };
  currentTime: number;
}) {
  // We re-render at rAF cadence via provider; compute word fill here.
  return (
    <span>
      {line.words.map((w, i) => {
        let fill = 0;
        if (currentTime >= w.end) fill = 1;
        else if (currentTime > w.start) {
          fill = (currentTime - w.start) / Math.max(0.001, w.end - w.start);
        }
        const sung = `rgba(27,106,231,${(0.85 + 0.15 * fill).toFixed(2)})`;
        const upcoming = "rgba(23,15,73,.32)";
        // gradient mask across the word width using background-clip text
        const bg = `linear-gradient(90deg, ${sung} 0%, ${sung} ${(
          fill * 100
        ).toFixed(1)}%, ${upcoming} ${(fill * 100).toFixed(1)}%, ${upcoming} 100%)`;
        return (
          <span
            key={i}
            style={{
              backgroundImage: bg,
              WebkitBackgroundClip: "text",
              backgroundClip: "text",
              WebkitTextFillColor: "transparent",
              color: "transparent",
              whiteSpace: "pre-wrap",
              // Extend background-clip rectangle slightly past glyph advance so
              // italic overhang on the trailing edge is not clipped.
              paddingInlineEnd: "0.08em",
              marginInlineEnd: "-0.08em",
            }}
          >
            {w.word}
            {i < line.words.length - 1 ? " " : ""}
          </span>
        );
      })}
    </span>
  );
}
