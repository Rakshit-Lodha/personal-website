"use client";

import { useEffect, useRef } from "react";

/**
 * Sets `data-reach` on its parent: "out" while the footer is still below the fold, "in" once it is ≥35% in view,
 * so the parent's CSS slides the hand in once. Server HTML, reduced motion and an already visible footer keep the
 * final pose (no attribute).
 */
export default function FooterReach() {
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const art = ref.current?.parentElement;
    const footer = art?.closest("footer");
    if (!art || !footer || matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if (footer.getBoundingClientRect().top < innerHeight) return;
    art.dataset.reach = "out";
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        art.dataset.reach = "in";
        observer.disconnect();
      },
      { threshold: 0.35 }
    );
    observer.observe(footer);
    return () => observer.disconnect();
  }, []);

  return <span ref={ref} hidden />;
}
