"use client";

import { useEffect, useId, useRef, useState, type KeyboardEvent } from "react";
import { onSelect } from "@/components/roman/select";
import { ChevronDown } from "lucide-react";
import { MOTION, motionClip } from "@/lib/roman-v2/motion";
import type { AvailableAction, RomanV2Career, RomanV2Chapter } from "@/lib/roman-v2/types";
import AvailabilityAction from "./AvailabilityAction";
import LoopVideo, { type MotionHandle, useMotionAllowed } from "./LoopVideo";
import Reveal from "./Reveal";
import shared from "./contemporary-roman.module.css";
import s from "./CareerJourney.module.css";

// Every chapter's follow-up questions go to JJ's chat.
const LEARN_MORE: AvailableAction = { available: true, label: "Learn More", href: "/chat" };

/** Periods read as one unit in the timeline ("2026—NOW"); the content keeps its spaced dash. */
const tightPeriod = (period: string) => period.replace(/\s*—\s*/g, "—");

const KEY_STEP: Record<string, number> = { ArrowDown: 1, ArrowRight: 1, ArrowUp: -1, ArrowLeft: -1 };

/**
 * Art state per chapter: S4 is the full structure in the approved still; each older chapter has one piece fewer.
 * Clips: career-rAB removes a piece (state A → B), career-rAB-rev puts it back, career-idle-sN loops on state N.
 */
const CAREER_STATE: Record<string, number> = { paytmmoney: 4, etmoney: 3, indmoney: 2, learnapp: 1 };
const CAREER_MOTION = Object.values(MOTION.clips).some((clip) => clip.section === "career");

/** The clip that builds each state from its neighbour: the cube goes onto S4, and each older state loses a piece. */
const ENTRANCE: Record<number, { clip: string; from: number }> = {
  4: { clip: "career-r43-rev", from: 3 },
  3: { clip: "career-r43", from: 4 },
  2: { clip: "career-r32", from: 3 },
  1: { clip: "career-r21", from: 2 },
};
/** Entrance for a state, only when its clip exists. */
const entrance = (stage: number) => (motionClip(ENTRANCE[stage]?.clip ?? "") ? ENTRANCE[stage] : undefined);

type ArtState = { depicted: number; target: number; still: boolean; idle: number; busy: boolean; hurry: boolean };

/** Shows state `to` directly with a crossfade: its idle loop, else the last frame of a clip ending on it, else the still. */
async function jumpTo(player: MotionHandle, art: ArtState, to: number) {
  const ok =
    (await player.play(`career-idle-s${to}`, { loop: true, fade: 200 })) ||
    (to < 4 && (await player.play(`career-r${to + 1}${to}`, { hold: true, fade: 200 }))) ||
    (to > 1 && (await player.play(`career-r${to}${to - 1}-rev`, { hold: true, fade: 200 })));
  // No clip shows this state: fall back to the one real still rather than inventing a state.
  if (!ok) player.still();
  art.depicted = to;
  art.still = !ok;
  art.idle = ok ? to : 0;
}

/**
 * Walks the art towards the latest target one piece at a time. Two steps chain at 2×, three crossfade; a target
 * that changes mid-clip lets the clip finish at 2× (clips always end on a state frame) and then reroutes.
 */
async function runArt(player: MotionHandle, art: ArtState) {
  art.busy = true;
  while (art.depicted !== art.target) {
    const from = art.depicted;
    const steps = art.target - from;
    // 0 = not yet shown (first view); the still only shows S4 truthfully. Either way, crossfade.
    if (Math.abs(steps) >= 3 || from === 0 || (art.still && from !== 4)) {
      await jumpTo(player, art, art.target);
      continue;
    }
    const next = from + Math.sign(steps);
    const id = next < from ? `career-r${from}${next}` : `career-r${next}${from}-rev`;
    // A multi-step jump keeps 2× for every hop, not just the first.
    if (Math.abs(steps) > 1) art.hurry = true;
    const rate = art.hurry ? 2 : 1;
    // Cut from the still or a clip's end frame (they match the clip's first frame); blend out of a mid-loop idle.
    if (!(await player.play(id, { rate, fade: art.idle ? 120 : 0 }))) {
      await jumpTo(player, art, art.target);
      continue;
    }
    art.depicted = next;
    art.still = false;
    art.idle = 0;
  }
  art.hurry = false;
  if (!art.still && art.idle !== art.depicted && (await player.play(`career-idle-s${art.depicted}`, { loop: true, fade: 0 })))
    art.idle = art.depicted;
  art.busy = false;
  if (art.depicted !== art.target) void runArt(player, art);
}

/** Drives the desktop card's art through the career clips; the chapter text never waits for it. */
function useCareerArt(activeId: string) {
  const player = useRef<MotionHandle>(null);
  const [ready, setReady] = useState(false);
  const art = useRef<ArtState>({ depicted: 4, target: 4, still: true, idle: 0, busy: false, hurry: false });
  const first = useRef(true);
  // Until the first view has played, the card's still shows the state the entrance clip starts from.
  const [entered, setEntered] = useState(false);

  useEffect(() => {
    const target = CAREER_STATE[activeId];
    if (!ready || !player.current || target === undefined) return;
    const state = art.current;
    state.target = target;
    // The page can open on another chapter than the still's S4: crossfade there rather than play a transition.
    if (first.current) {
      first.current = false;
      if (target !== 4) state.depicted = 0;
      // Opening on S4: the hand places the top cube as the card comes into view, then the idle loop.
      else if (entrance(4)) Object.assign(state, { depicted: entrance(4)!.from, still: false });
    }
    if (state.busy) {
      state.hurry = true;
      player.current.setRate(2);
    } else void runArt(player.current, state).then(() => setEntered(true));
  }, [activeId, ready]);

  return [player, () => setReady(true), entered] as const;
}

/** Structure stills: stage 4 (Paytm Money, full) is the approved art; stages 1–3 remove one piece each. */
function CareerArt({ sizes, stage = 4 }: { sizes: string; stage?: number }) {
  const base = stage === 4 ? "/roman-v2/career/career-hands" : `/roman-v2/motion/career/career-s${stage}`;
  const widths = stage === 4 ? [560, 812, 1072] : [1072];
  const srcSet = (format: string) => widths.map((w) => `${base}-${w}.${format} ${w}w`).join(", ");
  return (
    <picture>
      <source type="image/avif" srcSet={srcSet("avif")} sizes={sizes} />
      <source type="image/webp" srcSet={srcSet("webp")} sizes={sizes} />
      <img src={`${base}-${widths[Math.min(1, widths.length - 1)]}.webp`} alt="" width={1072} height={790} loading="lazy" decoding="async" />
    </picture>
  );
}

/**
 * Mobile accordion art. Every time the item opens, its entrance clip builds the chapter's state from its neighbour
 * (re-mounting the player replays it), then its idle loop runs. Without video, the chapter's own still.
 */
function AccordionArt({ stage, open, animated }: { stage?: number; open: boolean; animated: boolean }) {
  if (stage === undefined) return <CareerArt sizes="calc(100vw - 32px)" />;
  const enter = animated ? entrance(stage) : undefined;
  return (
    <>
      <CareerArt sizes="calc(100vw - 32px)" stage={enter?.from ?? stage} />
      {animated && <LoopVideo key={String(open)} intro={enter?.clip} loop={`career-idle-s${stage}`} startRatio={0.4} />}
    </>
  );
}

/** Outcomes; a chapter without any shows its tenure instead of empty slots. */
function Outcomes({ chapter }: { chapter: RomanV2Chapter }) {
  const items = chapter.outcomes.length
    ? chapter.outcomes.map((outcome) => ({ key: outcome.value, ...outcome }))
    : [{ key: "tenure", value: chapter.period, label: chapter.current ? "Current chapter" : "Tenure" }];
  return (
    <dl className={s.outcomes}>
      {items.map((item) => (
        <div key={item.key} className={s.outcome}>
          <dt className={s.outcomeLabel}>{item.label}</dt>
          <dd className={s.outcomeValue}>{item.value}</dd>
        </div>
      ))}
    </dl>
  );
}

function Progress({ chapters, activeId }: { chapters: RomanV2Chapter[]; activeId: string }) {
  return (
    <span className={s.progress} aria-hidden="true">
      {chapters.map((chapter) => (
        <span key={chapter.id} data-active={chapter.id === activeId || undefined} />
      ))}
    </span>
  );
}

export default function CareerJourney({ career }: { career: RomanV2Career }) {
  const { chapters } = career;
  const uid = useId();
  const [activeId, setActiveId] = useState(career.initialChapterId);
  const [openIds, setOpenIds] = useState<string[]>([career.initialChapterId]);
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const [artPlayer, onArtReady, artEntered] = useCareerArt(activeId);
  // With video the motion layer carries every change; without it (reduced motion, Save-Data) show each stage's still.
  const animated = useMotionAllowed() && CAREER_MOTION;

  // JJ asks for a chapter: select it on desktop and open it on mobile.
  useEffect(
    () =>
      onSelect("experience", (id) => {
        if (!chapters.some((chapter) => chapter.id === id)) return;
        setActiveId(id);
        setOpenIds((ids) => (ids.includes(id) ? ids : [...ids, id]));
      }),
    [chapters]
  );

  const onTabKeyDown = (event: KeyboardEvent<HTMLButtonElement>, index: number) => {
    const last = chapters.length - 1;
    let next: number;
    if (event.key === "Home") next = 0;
    else if (event.key === "End") next = last;
    else if (event.key in KEY_STEP) next = (index + KEY_STEP[event.key] + chapters.length) % chapters.length;
    else return;
    event.preventDefault();
    setActiveId(chapters[next].id);
    tabRefs.current[next]?.focus();
  };

  const toggle = (id: string) =>
    setOpenIds((ids) => (ids.includes(id) ? ids.filter((open) => open !== id) : [...ids, id]));

  return (
    <section id="work" aria-labelledby="work-title" className={`${shared.section} ${s.section}`}>
      <div className={s.backdrop} aria-hidden="true">
        <span className={s.circle} />
        <span className={s.halftone} />
        <span className={s.pediment} />
        <span className={s.lines} />
        <span className={s.marker} />
      </div>

      <div className={`${shared.container} ${s.inner}`}>
        <Reveal className={s.header}>
          <h2 id="work-title" className={s.title}>
            {career.heading.lead} <span className={shared.accent}>{career.heading.accent}</span>
          </h2>
          <p className={s.lede}>{career.body}</p>
        </Reveal>

        {/* Desktop: vertical timeline tablist + active chapter card */}
        <Reveal className={s.desktop}>
          <div role="tablist" aria-orientation="vertical" aria-label="Career chapters" className={s.timeline}>
            {chapters.map((chapter, index) => {
              const active = chapter.id === activeId;
              return (
                <button
                  key={chapter.id}
                  ref={(node) => {
                    tabRefs.current[index] = node;
                  }}
                  type="button"
                  role="tab"
                  id={`${uid}-tab-${chapter.id}`}
                  aria-controls={`${uid}-panel-${chapter.id}`}
                  aria-selected={active}
                  aria-current={active ? "true" : undefined}
                  tabIndex={active ? 0 : -1}
                  className={s.tab}
                  onClick={() => setActiveId(chapter.id)}
                  onKeyDown={(event) => onTabKeyDown(event, index)}
                >
                  <span className={s.dot} aria-hidden="true" />
                  <span className={s.company}>{chapter.company}</span>
                  <span className={s.period}>{tightPeriod(chapter.period)}</span>
                </button>
              );
            })}
          </div>

          <div className={s.card}>
            {/* Without video the chapter's stage still swaps in on every change; with it the motion layer carries the change. */}
            <div key={animated ? undefined : activeId} className={s.art} aria-hidden="true">
              <CareerArt sizes="49vw" stage={animated ? (artEntered ? 4 : (entrance(4)?.from ?? 4)) : CAREER_STATE[activeId]} />
              {CAREER_MOTION && <LoopVideo ref={artPlayer} onReady={onArtReady} startRatio={0.4} />}
            </div>
            <div className={s.stage}>
              {chapters.map((chapter) => {
                const active = chapter.id === activeId;
                return (
                  <div
                    key={chapter.id}
                    role="tabpanel"
                    id={`${uid}-panel-${chapter.id}`}
                    aria-labelledby={`${uid}-tab-${chapter.id}`}
                    className={s.panel}
                    data-active={active || undefined}
                    inert={!active}
                  >
                    <div className={s.copy}>
                      <h3 className={s.chapterTitle}>{chapter.title}</h3>
                      <p className={s.role}>{chapter.role}</p>
                      <p className={s.narrative}>{chapter.narrative}</p>
                    </div>
                    <div className={s.footer}>
                      <Outcomes chapter={chapter} />
                      <div className={s.actions}>
                        <AvailabilityAction action={LEARN_MORE} variant="primary" arrow="right" className={s.viewAction} />
                        <Progress chapters={chapters} activeId={chapter.id} />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </Reveal>

        {/* Mobile and tablet: native stacked accordions with equivalent content */}
        <ul className={s.accordion}>
          {chapters.map((chapter) => {
            const open = openIds.includes(chapter.id);
            return (
              <li key={chapter.id} className={s.item} data-open={open || undefined}>
                <h3 className={s.itemHeading}>
                  <button
                    type="button"
                    id={`${uid}-acc-${chapter.id}`}
                    aria-expanded={open}
                    aria-controls={`${uid}-region-${chapter.id}`}
                    className={s.itemButton}
                    onClick={() => toggle(chapter.id)}
                  >
                    <span className={s.dot} aria-hidden="true" />
                    <span className={s.itemLabel}>
                      <span className={s.company}>{chapter.company}</span>
                      <span className={s.period}>{tightPeriod(chapter.period)}</span>
                    </span>
                    <ChevronDown className={s.chevron} size={20} strokeWidth={1.75} aria-hidden="true" />
                  </button>
                </h3>
                <div
                  role="region"
                  id={`${uid}-region-${chapter.id}`}
                  aria-labelledby={`${uid}-acc-${chapter.id}`}
                  className={s.region}
                  hidden={!open}
                >
                  <div className={s.itemArt} aria-hidden="true">
                    <AccordionArt stage={CAREER_STATE[chapter.id]} open={open} animated={animated} />
                  </div>
                  <p className={s.itemTitle}>{chapter.title}</p>
                  <p className={s.role}>{chapter.role}</p>
                  <p className={s.narrative}>{chapter.narrative}</p>
                  <Outcomes chapter={chapter} />
                  <AvailabilityAction action={LEARN_MORE} variant="primary" arrow="right" className={s.viewAction} />
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
