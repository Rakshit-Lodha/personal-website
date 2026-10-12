import { ArrowRight } from "lucide-react";
import type { WritingEntry, WritingKind } from "@/lib/roman/types";
import { Scene, SectionLabel, linkProps } from "./parts";
import SceneIn from "./SceneIn";
import s from "./roman.module.css";

const KIND: Record<WritingKind, { label: string; className: string }> = {
  essay: { label: "Essay", className: s.tag },
  note: { label: "Note", className: s.tagNeutral },
  "work-in-progress": { label: "Work in progress", className: s.tag },
};

function meta(entry: WritingEntry) {
  const date = entry.date && new Intl.DateTimeFormat("en-GB", { month: "long", year: "numeric", timeZone: "Asia/Kolkata" }).format(new Date(entry.date));
  return [date, entry.readingMinutes && `${entry.readingMinutes} min read`].filter(Boolean).join(" · ");
}

export default function WritingList({ entries }: { entries: WritingEntry[] }) {
  return (
    <section id="writing" className={`${s.section} ${s.plaster} ${s.room} ${s.writing}`}>
      <SceneIn name="writing" className={s.plate} />
      <Scene name="writing" className={`${s.mobileOnly} ${s.plateBottom}`} />
      <div className={`${s.inner} ${s.grid}`}>
        <div>
          <SectionLabel n="05" title="Thoughts & writing" />
          <h2 className={s.h2}>
            Thoughts, <br />
            still forming
          </h2>
          <p className={s.lede}>Essays, notes and ideas in progress.</p>
        </div>

        <div className={s.writingList}>
          {entries.length === 0 && <p className={s.body}>Writing coming soon.</p>}
          {entries.map((entry) => {
            // Samples are placeholders: never a working link, never an arrow.
            const live = entry.url && !entry.sample;
            const content = (
              <>
                <div>
                  <span className={KIND[entry.kind].className}>{KIND[entry.kind].label}</span>
                  <h3>{entry.title}</h3>
                  <p>{entry.summary}</p>
                  {meta(entry) && <p className={s.entryMeta}>{meta(entry)}</p>}
                </div>
                {live && <ArrowRight aria-hidden="true" />}
              </>
            );
            return live ? (
              <a key={entry.slug} className={s.entry} {...linkProps(entry.url!)}>
                {content}
              </a>
            ) : (
              <div key={entry.slug} className={s.entry}>
                {content}
              </div>
            );
          })}
          {entries.some((entry) => entry.sample) && <p className={s.note}>Sample entries — writing coming soon.</p>}
        </div>
      </div>
    </section>
  );
}
