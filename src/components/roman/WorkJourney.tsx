"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { animate, motion, useMotionValue, useTransform, type MotionValue } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { RomanJourneyEntry } from "@/lib/roman/types";
import { Scene, SectionLabel } from "./parts";
import { onSelect } from "./select";
import { useWalkProgress } from "./walk";
import s from "./roman.module.css";

/** How far the frieze lags the wall, as a share of its strip (three tiles wide): a quarter of a bay. */
const FRIEZE_LAG = 9.85;

function Bay({
  entry,
  index,
  active,
  position,
  reveal,
  onHeight,
}: {
  entry: RomanJourneyEntry;
  index: number;
  active: boolean;
  /** Where the hall is, in bays (1.5 = halfway between the second and third wall). */
  position: MotionValue<number>;
  reveal: { opacity: MotionValue<number>; y: MotionValue<number> };
  onHeight: (index: number, height: number) => void;
}) {
  const ref = useRef<HTMLElement>(null);
  const friezeX = useTransform(position, (value) => `${(value - index) * FRIEZE_LAG}%`);
  // The inscription is only legible when you stand at its wall, so it fades as the wall moves off. On desktop a
  // wall left of its place slides behind the heading, so there it must be gone before the two meet.
  const opacity = useTransform([position, reveal.opacity], ([at, shown]: number[]) => {
    const behindHeading = at > index && window.matchMedia("(min-width: 900px)").matches;
    return shown * Math.max(0, 1 - Math.abs(at - index) * (behindHeading ? 6 : 1.8));
  });

  useEffect(() => {
    const bay = ref.current;
    if (!bay) return;
    const observer = new ResizeObserver(() => onHeight(index, bay.offsetHeight));
    observer.observe(bay);
    return () => observer.disconnect();
  }, [index, onHeight]);

  return (
    // Walls you are not standing at stay in the DOM (JJ targets them by id) but are out of the tab order.
    <article ref={ref} id={`experience-${entry.id}`} className={s.bay} inert={!active} aria-label={entry.company}>
      <Scene name="journey" className={s.bayFloor} />
      <Scene name="journey" className={s.bayTop} />
      <div className={s.friezeWindow} aria-hidden="true">
        <motion.div className={s.friezeStrip} style={{ x: friezeX }} />
      </div>
      <motion.div className={`${s.panel} ${s.bayPanel}`} style={{ opacity, y: reveal.y }}>
        {entry.current && <span className={s.tag}>Current role</span>}
        <h3 className={s.h3}>{entry.company}</h3>
        <p className={s.chapterRole}>
          {entry.role} <span className={s.chapterPeriod}>· {entry.period}</span>
        </p>
        <p>{entry.summary}</p>
        {entry.story && (
          <>
            <h4>Why I joined</h4>
            <p>{entry.story}</p>
          </>
        )}
        {entry.outcomes.length > 0 && (
          <>
            <h4>What changed</h4>
            <ul className={s.outcomes}>
              {entry.outcomes.map((outcome) => (
                <li key={outcome.id} id={outcome.id}>
                  <span>{outcome.label}</span>
                  <strong>{outcome.metric}</strong>
                </li>
              ))}
            </ul>
          </>
        )}
      </motion.div>
    </article>
  );
}

/**
 * The hall. Every company is a wall bay on one horizontal track, with the plate's columns between bays,
 * so changing company carries you past a column. Phones swipe the track (native scroll snap); desktop
 * walks it from the selector. Either way the track's scroll position is the single source of truth.
 */
export default function WorkJourney({ entries }: { entries: RomanJourneyEntry[] }) {
  const hall = useRef<HTMLDivElement>(null);
  const walking = useRef(false);
  const [active, setActive] = useState(() => Math.max(0, entries.findIndex((entry) => entry.current)));
  const [heights, setHeights] = useState<number[]>([]);
  const position = useMotionValue(active);

  // Arriving from the arch: the wall starts a little oversized and settles, then the inscription appears.
  const walk = useWalkProgress(1);
  const hallScale = useTransform(walk, [0.5, 1], [1.15, 1]);
  const opacity = useTransform(walk, [0.8, 1], [0, 1]);
  const y = useTransform(walk, [0.8, 1], [24, 0]);

  const onHeight = useCallback((index: number, height: number) => {
    setHeights((current) => {
      if (current[index] === height) return current;
      const next = [...current];
      next[index] = height;
      return next;
    });
  }, []);

  const walkTo = useCallback(
    (index: number) => {
      const track = hall.current;
      if (!track || index < 0 || index >= entries.length) return;
      const from = track.scrollLeft;
      const to = index * track.clientWidth;
      setActive(index);
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        track.scrollLeft = to;
      } else if (getComputedStyle(track).scrollSnapType !== "none") {
        // Phones: the track is a native snap scroller.
        track.scrollTo({ left: to, behavior: "smooth" });
      } else {
        // Desktop: a measured walk. Passing several columns takes longer, but not proportionally.
        const bays = Math.abs(to - from) / track.clientWidth;
        walking.current = true;
        animate(from, to, {
          duration: Math.min(1.1, 0.5 + 0.2 * bays),
          ease: "easeInOut",
          onUpdate: (left) => (track.scrollLeft = left),
          onComplete: () => (walking.current = false),
        });
      }
    },
    [entries.length]
  );

  useEffect(
    () =>
      onSelect("experience", (id) => {
        const index = entries.findIndex((entry) => entry.id === id);
        if (index >= 0) walkTo(index);
      }),
    [entries, walkTo]
  );

  // Keep the track on the active wall when its width changes (and on first paint). The observer must not
  // be re-created when `active` changes, or it would yank the track out from under a swipe.
  const activeRef = useRef(active);
  useEffect(() => {
    activeRef.current = active;
  }, [active]);
  useEffect(() => {
    const track = hall.current;
    if (!track) return;
    let width = 0;
    const observer = new ResizeObserver(() => {
      if (track.clientWidth === width) return; // only the height changed
      width = track.clientWidth;
      if (!walking.current) track.scrollLeft = activeRef.current * width;
    });
    observer.observe(track);
    return () => observer.disconnect();
  }, []);

  function onScroll() {
    const track = hall.current;
    if (!track || track.clientWidth === 0) return;
    const at = track.scrollLeft / track.clientWidth;
    position.set(at);
    if (!walking.current) setActive(Math.round(at)); // a swipe: follow the finger
  }

  const number = (index: number) => String(index + 1).padStart(2, "0");

  return (
    <section id="journey" className={s.journeyWalk} aria-labelledby="journey-title">
      <div className={`${s.plaster} ${s.journey}`} data-walk-stage>
        <motion.div className={s.journeyIntro} style={{ opacity, y }}>
          <SectionLabel n="02" title="Work journey" />
          <h2 className={s.h2} id="journey-title">
            A path shaped <br />
            by products
          </h2>
          <p className={s.lede}>Different roles, same thread — building things that people use.</p>
          <div
            className={s.stepper}
            role="group"
            aria-label="Choose a company"
            onKeyDown={(event) => {
              if (event.key === "ArrowLeft") walkTo(active - 1);
              if (event.key === "ArrowRight") walkTo(active + 1);
            }}
          >
            <span className={s.counter} aria-live="polite">
              {number(active)} / {number(entries.length - 1)}
            </span>
            <button aria-label="Previous company" disabled={active === 0} onClick={() => walkTo(active - 1)}>
              <ChevronLeft aria-hidden="true" />
            </button>
            {entries.map((entry, index) => (
              <button
                key={entry.id}
                className={`${s.dot} ${index === active ? s.dotActive : ""}`}
                aria-label={`${number(index)}: ${entry.company}`}
                aria-current={index === active ? "true" : undefined}
                onClick={() => walkTo(index)}
              >
                {number(index)}
              </button>
            ))}
            <button aria-label="Next company" disabled={active === entries.length - 1} onClick={() => walkTo(active + 1)}>
              <ChevronRight aria-hidden="true" />
            </button>
          </div>
        </motion.div>

        <motion.div ref={hall} className={s.hall} style={{ scale: hallScale, height: heights[active] }} onScroll={onScroll}>
          {entries.map((entry, index) => (
            <Bay key={entry.id} entry={entry} index={index} active={index === active} position={position} reveal={{ opacity, y }} onHeight={onHeight} />
          ))}
        </motion.div>
      </div>
    </section>
  );
}
