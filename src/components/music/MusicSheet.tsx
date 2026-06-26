"use client";

import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import { useEffect } from "react";
import { useMusic } from "./MusicPlayerProvider";
import KaraokeView from "./KaraokeView";
import PlayerControls from "./PlayerControls";

export default function MusicSheet() {
  const { isSheetOpen, closeSheet, resetSummonedBy, song } = useMusic();

  // ESC closes
  useEffect(() => {
    if (!isSheetOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        resetSummonedBy();
        closeSheet();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isSheetOpen, closeSheet, resetSummonedBy]);

  // Lock body scroll while sheet is open
  useEffect(() => {
    if (!isSheetOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [isSheetOpen]);

  return (
    <AnimatePresence>
      {isSheetOpen && (
        <motion.div
          key="music-sheet"
          className="music-sheet-mobile"
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 24 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          style={{
            position: "fixed",
            inset: 0,
            background: "#F5F3EF",
            zIndex: 60,
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              padding: "44px 20px 12px",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <span
              style={{
                fontFamily: "var(--font-geist-mono), ui-monospace, monospace",
                fontSize: 10,
                letterSpacing: ".14em",
                textTransform: "uppercase",
                color: "#1B6AE7",
              }}
            >
              Now Playing
            </span>
            <button
              type="button"
              aria-label="Close player"
              onClick={() => {
                resetSummonedBy();
                closeSheet();
              }}
              style={{
                width: 36,
                height: 36,
                borderRadius: "50%",
                background: "rgba(23,15,73,.06)",
                border: "none",
                color: "#170f49",
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
              }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                <path d="M5 5l14 14M19 5L5 19" />
              </svg>
            </button>
          </div>

          <div style={{ padding: "0 32px", display: "flex", justifyContent: "center" }}>
            <Image
              src={song.cover}
              alt=""
              width={220}
              height={220}
              priority
              style={{
                borderRadius: 18,
                objectFit: "cover",
                boxShadow:
                  "0 12px 32px rgba(8,13,40,.20), 0 4px 8px rgba(8,13,40,.10)",
              }}
            />
          </div>

          <div
            style={{
              padding: "22px 24px 6px",
              textAlign: "center",
              fontFamily: "var(--font-instrument-serif), Georgia, serif",
              fontStyle: "italic",
              fontSize: 24,
              color: "#170f49",
              lineHeight: 1.15,
            }}
          >
            {song.title}
          </div>

          <div style={{ flex: 1, minHeight: 0, display: "flex", flexDirection: "column" }}>
            <KaraokeView fontSize={17} windowSize={5} background="#F5F3EF" />
          </div>

          <div
            style={{
              padding: "14px 20px 24px",
              borderTop: "1px solid rgba(23,15,73,.08)",
              display: "flex",
              flexDirection: "column",
              gap: 16,
              alignItems: "center",
            }}
          >
            <PlayerControls size="md" showVolume />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
