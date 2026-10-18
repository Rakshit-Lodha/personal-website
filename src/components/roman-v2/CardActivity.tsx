"use client";

import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from "react";

const CardActiveContext = createContext<boolean | null>(null);

/** Whether the surrounding card is active; null outside a CardActivity. */
export function useCardActive() {
  return useContext(CardActiveContext);
}

const HOVER = "(hover: hover) and (pointer: fine)";

/**
 * Marks its card as active for motion inside it: while hovered or focused where a fine pointer can hover, and while
 * at least 40% in view on touch screens. Renders no box of its own.
 */
export default function CardActivity({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  const [visible, setVisible] = useState(false);
  const [canHover, setCanHover] = useState(true);

  useEffect(() => {
    const mq = matchMedia(HOVER);
    const update = () => setCanHover(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  useEffect(() => {
    const card = ref.current?.firstElementChild;
    if (canHover || !card) return;
    const observer = new IntersectionObserver(([entry]) => setVisible(entry.intersectionRatio >= 0.4), {
      threshold: [0, 0.4],
    });
    observer.observe(card);
    return () => observer.disconnect();
  }, [canHover]);

  const active = canHover ? hovered || focused : visible;

  return (
    <CardActiveContext.Provider value={active}>
      <div
        ref={ref}
        style={{ display: "contents" }}
        onPointerEnter={(event) => event.pointerType === "mouse" && setHovered(true)}
        onPointerLeave={() => setHovered(false)}
        onFocus={() => setFocused(true)}
        onBlur={(event) => !event.currentTarget.contains(event.relatedTarget) && setFocused(false)}
      >
        {children}
      </div>
    </CardActiveContext.Provider>
  );
}
