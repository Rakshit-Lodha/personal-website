"use client";

import { useEffect, useId, useRef, useState, type KeyboardEvent } from "react";
import { onSelect } from "@/components/roman/select";
import { ChevronDown } from "lucide-react";
import type { AvailableAction, RomanV2Career, RomanV2Chapter } from "@/lib/roman-v2/types";
import AvailabilityAction from "./AvailabilityAction";
import Reveal from "./Reveal";
import shared from "./contemporary-roman.module.css";
import s from "./CareerJourney.module.css";

// The content contract has no chapter destination yet, so the action stays inert.
const VIEW_CHAPTER: AvailableAction = { available: false, label: "View chapter" };

const KEY_STEP: Record<string, number> = { ArrowDown: 1, ArrowRight: 1, ArrowUp: -1, ArrowLeft: -1 };

function CareerArt({ sizes }: { sizes: string }) {
  return (
    <picture>
      <source
        type="image/avif"
        srcSet="/roman-v2/career/career-hands-560.avif 560w, /roman-v2/career/career-hands-812.avif 812w"
        sizes={sizes}
      />
      <source
        type="image/webp"
        srcSet="/roman-v2/career/career-hands-560.webp 560w, /roman-v2/career/career-hands-812.webp 812w"
        sizes={sizes}
      />
      <img src="/roman-v2/career/career-hands-812.webp" alt="" width={812} height={357} loading="lazy" decoding="async" />
    </picture>
  );
}

/** Verified outcomes; a chapter without any shows its tenure instead of empty slots. */
function Outcomes({ chapter }: { chapter: RomanV2Chapter }) {
  const items = chapter.outcomes.length
    ? chapter.outcomes.map((outcome) => ({ key: `${outcome.sourceId}-${outcome.value}`, ...outcome }))
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
                  <span className={s.period}>{chapter.period}</span>
                </button>
              );
            })}
          </div>

          <div className={s.card}>
            <div key={activeId} className={s.art} aria-hidden="true">
              <CareerArt sizes="49vw" />
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
                        <AvailabilityAction action={VIEW_CHAPTER} variant="primary" arrow="right" className={s.viewAction} />
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
                      <span className={s.period}>{chapter.period}</span>
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
                    <CareerArt sizes="calc(100vw - 32px)" />
                  </div>
                  <p className={s.itemTitle}>{chapter.title}</p>
                  <p className={s.role}>{chapter.role}</p>
                  <p className={s.narrative}>{chapter.narrative}</p>
                  <Outcomes chapter={chapter} />
                  <AvailabilityAction action={VIEW_CHAPTER} variant="primary" arrow="right" className={s.viewAction} />
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
