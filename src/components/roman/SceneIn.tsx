"use client";

import { useRef } from "react";
import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import { Scene } from "./parts";
import s from "./roman.module.css";

/** A scene that settles as its room scrolls into view: the same push-in as the walk, much lighter. */
export default function SceneIn({ name, className }: { name: string; className: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();
  const { scrollY } = useScroll();
  // 0 when the room's top edge reaches the bottom of the screen, 1 once it is at the top. Measured from
  // the room (the parent), since this element is the one being transformed. Settled until measured, and
  // always settled with reduced motion.
  const entered = useTransform(scrollY, () => {
    const room = ref.current?.parentElement;
    if (reduced || !room) return 1;
    return Math.min(1, Math.max(0, 1 - room.getBoundingClientRect().top / window.innerHeight));
  });
  const scale = useTransform(entered, [0, 1], [1.06, 1]);
  const y = useTransform(entered, [0, 1], [18, 0]);

  return (
    <motion.div ref={ref} className={className} style={{ scale, y }}>
      <Scene name={name} className={s.fill} />
    </motion.div>
  );
}
