"use client";

import { ArrowRight, AudioLines } from "lucide-react";
import { motion, useTransform } from "framer-motion";
import { useJJSession } from "@/components/jj/JJSessionProvider";
import type { RomanContent } from "@/lib/roman/types";
import { Scene } from "./parts";
import { useWalkProgress } from "./walk";
import s from "./roman.module.css";

/**
 * Pinned over the journey wall while the visitor scrolls the walk: the scene dollies in through the
 * arch, the copy drifts away early, and the whole layer dissolves once the arch has left the frame.
 */
export default function Arrival({ intro }: { intro: RomanContent["intro"] }) {
  const { open } = useJJSession();
  const [first, ...rest] = intro.name.split(" ");

  const walk = useWalkProgress(0);
  // Dolly: grow from the arch opening while easing it to the middle of the screen, so you end up inside it.
  const sceneScale = useTransform(walk, [0, 0.9], [1, 4.2]);
  const sceneX = useTransform(walk, (value) => `calc(var(--arch-dx) * ${Math.min(1, value / 0.9)})`);
  const sceneY = useTransform(walk, (value) => `calc(var(--arch-dy) * ${Math.min(1, value / 0.9)})`);
  const copyOpacity = useTransform(walk, [0, 0.3], [1, 0]);
  const copyY = useTransform(walk, [0, 0.3], [0, -36]);
  const opacity = useTransform(walk, [0.55, 0.88], [1, 0]);
  const visibility = useTransform(walk, (value) => (value >= 0.88 ? "hidden" : "visible"));

  return (
    <div className={s.arrivalRail}>
      <motion.section id="arrival" className={s.arrival} style={{ opacity, visibility }}>
        <motion.div className={`${s.fill} ${s.arrivalScene}`} style={{ scale: sceneScale, x: sceneX, y: sceneY }}>
          <Scene name="arrival" priority />
        </motion.div>
        <motion.div className={s.arrivalCopy} style={{ opacity: copyOpacity, y: copyY }}>
          <h1 className={s.name}>
            {first} <br />
            {rest.join(" ")}
          </h1>
          <p className={s.headline}>{intro.headline}</p>
          <p className={s.subline}>{intro.subline}</p>
          <div className={s.arrivalActions}>
            <a href="#journey" className={s.primary}>
              Explore my work <ArrowRight size={18} aria-hidden="true" />
            </a>
            <button className={s.talk} onClick={open}>
              <AudioLines size={24} aria-hidden="true" />
              <span>Talk to A</span>
            </button>
          </div>
        </motion.div>
        {/* The next section's label peeks in; the real one lives in #journey. */}
        <motion.div className={s.peek} style={{ opacity: copyOpacity }} aria-hidden="true">
          <p className={s.label}>
            <span>02</span>
            <span>/</span>
            <span>Work journey</span>
          </p>
        </motion.div>
      </motion.section>
    </div>
  );
}
