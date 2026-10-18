import manifest from "./motion.json";

/**
 * Contract between the Roman v2 motion pipeline (scripts/roman-v2-motion*.mjs, which writes motion.json and
 * public/roman-v2/motion/**) and the page (src/components/roman-v2). Components never hard-code clip paths.
 */
export type MotionSource = {
  src: string;
  /** Full MIME type with codecs, e.g. `video/webm; codecs="vp09.00.10.08"` or `video/mp4; codecs="hvc1"`. */
  type: string;
  bytes: number;
};

export type MotionClip = {
  id: string;
  section: "hero" | "career" | "products" | "beyond" | "jj";
  role: "intro" | "loop" | "transition" | "transition-reverse" | "idle";
  device: "desktop" | "mobile";
  width: number;
  height: number;
  duration: number;
  fps: number;
  /** True when the clip carries an alpha channel matching the transparent still it replaces. */
  alpha: boolean;
  /** Ordered best-first; the player picks the first the browser can decode with alpha. */
  sources: MotionSource[];
  /** The existing still shown before and instead of the video (reduced motion, Save-Data, slow networks). */
  poster: string;
};

export type MotionManifest = { version: number; clips: Record<string, MotionClip> };

export const MOTION = manifest as MotionManifest;

export function motionClip(id: string): MotionClip | undefined {
  return MOTION.clips[id];
}
