"use client";

import { useEffect } from "react";
import { useMotionValue } from "framer-motion";

/**
 * 0 → 1 as the visitor scrolls the walk from the arrival to the journey wall. The distance is the
 * spacer after the journey stage (`--walk`); with reduced motion it is 0 and the value stays at `rest`.
 * `rest` is also the server-rendered value, so the journey is readable before hydration.
 */
export function useWalkProgress(rest: 0 | 1) {
  const progress = useMotionValue<number>(rest);

  useEffect(() => {
    const journey = document.getElementById("journey");
    if (!journey) return;
    let distance = 0;
    const update = () => progress.set(distance > 0 ? Math.min(1, Math.max(0, window.scrollY / distance)) : rest);
    const measure = () => {
      const stage = journey.querySelector<HTMLElement>("[data-walk-stage]");
      distance = stage ? journey.offsetHeight - stage.offsetHeight : 0;
      update();
    };
    measure();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", measure);
    return () => {
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", measure);
    };
  }, [progress, rest]);

  return progress;
}
