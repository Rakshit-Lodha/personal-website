"use client";
/* eslint-disable @next/next/no-img-element -- plain stacked layers, sized like the still under them */

import { useEffect, useRef, useState } from "react";
import { useMusic } from "@/components/music/MusicPlayerProvider";
import { MOTION, type MotionManifest } from "@/lib/roman-v2/motion";
import { useCardActive } from "./CardActivity";
import LoopVideo, { useMotionAllowed } from "./LoopVideo";
import s from "./BeyondWork.module.css";

/**
 * Knob layer spec, written into motion.json by the video pipeline (see design/roman-v2/motion/ENCODE.md). Every
 * layer is a transparent image at the strip's full size, so it lines up with the still under the same object-fit.
 */
type KnobSpec = {
  /** Strip size in px, e.g. [536, 215]. */
  size: [number, number];
  /** Knob axis in strip px. */
  center: [number, number];
  /** The strip with the knob face filled flat, covering the still's own notch. */
  plate?: string;
  /** The knob face with its notch; the only layer that turns. */
  face: string;
  /** Brushed highlight, fixed to the light. */
  highlight?: string;
  /** Thumb and index finger, on top until the hand loop takes over. */
  fingers?: string;
  /** Vertical squash of the face for its slight perspective (default 0.975). */
  scaleY?: number;
  /** Face angle (deg, non-decreasing) per frame of the hand loop, measured from its fingertips; one loop = the last value. */
  track?: { fps: number; angles: number[] };
};

const KNOB = (MOTION as MotionManifest & { knob?: KnobSpec }).knob;
/** The marble hand turning the knob: opaque over the whole strip but for a window onto the face where no finger is. */
const HAND_CLIP = "beyond-knob-hand";

/**
 * The music art's knob, turned by the hand: the hand loop plays while the card is active (hovered / focused, or in
 * view on touch screens) or a song plays, and the face under it follows the fingertips frame by frame. Paused, both
 * hold. Still only without a spec or track.
 */
export default function MusicKnob() {
  const allowed = useMotionAllowed();
  const active = useCardActive() ?? false;
  return allowed && KNOB?.track ? <Knob spec={KNOB} track={KNOB.track} active={active} /> : null;
}

function Knob({ spec, track, active }: { spec: KnobSpec; track: NonNullable<KnobSpec["track"]>; active: boolean }) {
  const { isPlaying } = useMusic();
  const faceRef = useRef<HTMLImageElement>(null);
  const [video, setVideo] = useState<HTMLVideoElement | null>(null);

  // Rotation origin: the knob axis under object-fit: cover and the strip's object-position (left on desktop, right on phones).
  useEffect(() => {
    const face = faceRef.current!;
    const [w, h] = spec.size;
    const [cx, cy] = spec.center;
    const observer = new ResizeObserver(() => {
      const k = Math.max(face.clientWidth / w, face.clientHeight / h);
      const [px, py] = getComputedStyle(face).objectPosition.split(" ").map((v) => parseFloat(v) / 100);
      const x = (face.clientWidth - w * k) * px + cx * k;
      const y = (face.clientHeight - h * k) * py + cy * k;
      face.style.transformOrigin = `${x}px ${y}px`;
    });
    observer.observe(face);
    return () => observer.disconnect();
  }, [spec]);

  // The face angle is the track's value at the frame on screen, plus one loop's turn per loop played, so the knob keeps
  // turning across loops and stops exactly when the video does.
  useEffect(() => {
    if (!video) return;
    const face = faceRef.current!;
    const squash = spec.scaleY ?? 0.975;
    const { fps, angles } = track;
    const perLoop = angles[angles.length - 1];
    let loops = 0;
    let last = 0;
    let handle = 0;
    const draw = (time: number) => {
      const frame = Math.min(angles.length - 1, Math.round(time * fps));
      if (frame < last - angles.length / 2) loops++; // wrapped to the start of the loop
      last = frame;
      // Un-squash, turn, re-squash, so the face turns as a disc seen slightly from the side.
      face.style.transform = `scaleY(${squash}) rotate(${(loops * perLoop + angles[frame]) % 360}deg) scaleY(${1 / squash})`;
    };
    if (typeof video.requestVideoFrameCallback === "function") {
      const onFrame: VideoFrameRequestCallback = (_, meta) => {
        draw(meta.mediaTime);
        handle = video.requestVideoFrameCallback(onFrame);
      };
      handle = video.requestVideoFrameCallback(onFrame);
      return () => video.cancelVideoFrameCallback(handle);
    }
    const tick = () => {
      draw(video.currentTime);
      if (!video.paused) handle = requestAnimationFrame(tick);
    };
    const start = () => {
      cancelAnimationFrame(handle);
      handle = requestAnimationFrame(tick);
    };
    video.addEventListener("play", start);
    start();
    return () => {
      video.removeEventListener("play", start);
      cancelAnimationFrame(handle);
    };
  }, [video, spec, track]);

  return (
    <>
      <span className={s.knob}>
        {spec.plate && <img src={spec.plate} alt="" loading="lazy" decoding="async" />}
        <img ref={faceRef} src={spec.face} alt="" loading="lazy" decoding="async" />
        {spec.highlight && <img src={spec.highlight} alt="" loading="lazy" decoding="async" />}
        {/* The still's fingertips, until the hand loop (which carries its own) is on screen. */}
        {spec.fingers && !video && <img src={spec.fingers} alt="" loading="lazy" decoding="async" />}
      </span>
      <LoopVideo loop={HAND_CLIP} active={isPlaying || active} className={s.knobHand} onShow={setVideo} />
    </>
  );
}
