"use client";

import { useSyncExternalStore } from "react";

let webglCache: boolean | null = null;
function detectWebgl() {
  if (webglCache !== null) return webglCache;
  try {
    const probe = document.createElement("canvas");
    webglCache = Boolean(probe.getContext("webgl2") || probe.getContext("webgl"));
  } catch {
    webglCache = false;
  }
  return webglCache;
}

const noopSubscribe = () => () => {};

/** null while server-rendering, boolean once mounted in the browser. */
export function useWebglSupport(): boolean | null {
  return useSyncExternalStore(noopSubscribe, detectWebgl, () => null);
}

const REDUCED = "(prefers-reduced-motion: reduce)";

export function useReducedMotion(): boolean {
  return useSyncExternalStore(
    (onChange) => {
      const mq = window.matchMedia(REDUCED);
      mq.addEventListener("change", onChange);
      return () => mq.removeEventListener("change", onChange);
    },
    () => window.matchMedia(REDUCED).matches,
    () => false
  );
}
