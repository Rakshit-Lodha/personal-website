"use client";

import { Mic, MicOff, X } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState, type CSSProperties } from "react";
import JJOrb from "@/components/jj/JJOrb";
import { useJJSession } from "@/components/jj/JJSessionProvider";
import { useMusic } from "@/components/music/MusicPlayerProvider";
import styles from "./JJSurface.module.css";

function getSurfaceLayout() {
  if (typeof window === "undefined") {
    return { right: 28, bottom: 28, fullscreenSize: 240, dockedSize: 88 };
  }

  const mobile = window.matchMedia("(max-width: 768px)").matches;
  return mobile
    ? { right: 16, bottom: 92, fullscreenSize: 200, dockedSize: 76 }
    : { right: 28, bottom: 28, fullscreenSize: 240, dockedSize: 88 };
}

function useFullscreenTransform(isActive: boolean, mode: "fullscreen" | "docked") {
  const [layout, setLayout] = useState(getSurfaceLayout);

  useEffect(() => {
    if (!isActive) return;

    const sync = () => setLayout(getSurfaceLayout());
    sync();
    window.addEventListener("resize", sync);

    return () => window.removeEventListener("resize", sync);
  }, [isActive]);

  return useMemo(() => {
    const size = mode === "fullscreen" ? layout.fullscreenSize : layout.dockedSize;
    if (mode === "docked" || typeof window === "undefined") {
      return { size, transform: "translate(0, 0)" };
    }

    const anchorCenterX = window.innerWidth - layout.right - size / 2;
    const anchorCenterY = window.innerHeight - layout.bottom - size / 2;
    const dx = window.innerWidth / 2 - anchorCenterX;
    const dy = window.innerHeight / 2 - anchorCenterY;

    return {
      size,
      transform: `translate(${Math.round(dx)}px, ${Math.round(dy)}px)`,
    };
  }, [layout, mode]);
}

export default function JJSurface() {
  const { isActive, mode, state, close, setMode } = useJJSession();
  const { closeSheet, resetSummonedBy } = useMusic();
  const [muted, setMuted] = useState(false);
  const closeRef = useRef<HTMLButtonElement>(null);
  const dockCloseRef = useRef<HTMLButtonElement>(null);
  const dockedByCommandRef = useRef(false);
  const { size, transform } = useFullscreenTransform(isActive, mode);

  const closeSurface = useCallback(() => {
    setMuted(false);
    dockedByCommandRef.current = false;
    document
      .querySelectorAll(".jj-highlight, .jj-command-highlight")
      .forEach((element) => element.classList.remove("jj-highlight", "jj-command-highlight"));
    closeSheet();
    resetSummonedBy();
    close();
  }, [close, closeSheet, resetSummonedBy]);

  useEffect(() => {
    if (!isActive || mode !== "fullscreen") return;
    dockedByCommandRef.current = false;
    closeRef.current?.focus();

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") closeSurface();
      if (event.key === "Tab") {
        const focusables = [closeRef.current, document.querySelector<HTMLButtonElement>(
          `.${styles.micButton}`
        )].filter((element): element is HTMLButtonElement => Boolean(element));
        const currentIndex = focusables.indexOf(document.activeElement as HTMLButtonElement);
        const nextIndex = event.shiftKey
          ? (currentIndex - 1 + focusables.length) % focusables.length
          : (currentIndex + 1) % focusables.length;
        event.preventDefault();
        focusables[nextIndex]?.focus();
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [closeSurface, isActive, mode]);

  useEffect(() => {
    if (!isActive || mode !== "docked") return;
    dockCloseRef.current?.focus();
  }, [isActive, mode]);

  useEffect(() => {
    const onCommandResult = (event: WindowEventMap["jj:site-command-result"]) => {
      if (!isActive || mode !== "fullscreen" || dockedByCommandRef.current) return;
      if (!event.detail.result.ok) return;

      dockedByCommandRef.current = true;
      setMode("docked");
    };

    window.addEventListener("jj:site-command-result", onCommandResult);
    return () => window.removeEventListener("jj:site-command-result", onCommandResult);
  }, [isActive, mode, setMode]);

  if (!isActive) return null;

  const isSpeaking = state === "speaking";
  const fullscreen = mode === "fullscreen";
  const surfaceStyle = {
    "--jj-surface-orb-size": `${size}px`,
    "--jj-surface-orb-transform": transform,
  } as CSSProperties;

  return (
    <div
      className={`${styles.surface} ${fullscreen ? styles.fullscreen : styles.docked}`}
      style={surfaceStyle}
      role={fullscreen ? "dialog" : undefined}
      aria-label={fullscreen ? "JJ voice assistant" : undefined}
      aria-modal={fullscreen ? "true" : undefined}
      data-mode={mode}
    >
      <span className="sr-only" aria-live="polite">
        {isSpeaking ? "JJ is speaking" : "JJ is listening"}
      </span>
      <div className={styles.dim} aria-hidden="true" />
      <div className={styles.orbHost}>
        <JJOrb size={size} state={isSpeaking ? "speaking" : "idle"} withRings={fullscreen} />
      </div>
      <button
        ref={closeRef}
        type="button"
        className={styles.fullscreenClose}
        onClick={closeSurface}
        aria-label="Close JJ"
        tabIndex={fullscreen ? 0 : -1}
      >
        <X size={14} aria-hidden="true" />
      </button>
      <button
        ref={dockCloseRef}
        type="button"
        className={styles.dockClose}
        onClick={closeSurface}
        aria-label="Close JJ"
        tabIndex={fullscreen ? -1 : 0}
      >
        <X size={12} aria-hidden="true" />
      </button>
      <button
        type="button"
        className={`${styles.micButton} ${muted ? styles.muted : ""}`}
        onClick={() =>
          setMuted((value) => {
            const nextMuted = !value;
            window.dispatchEvent(
              new CustomEvent("jj:mic-muted", { detail: { muted: nextMuted } })
            );
            return nextMuted;
          })
        }
        aria-label={muted ? "Unmute microphone" : "Mute microphone"}
        aria-pressed={muted}
        tabIndex={fullscreen ? 0 : -1}
      >
        {muted ? <MicOff size={18} aria-hidden="true" /> : <Mic size={18} aria-hidden="true" />}
      </button>
    </div>
  );
}
