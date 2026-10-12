import { ArrowRight, Link2, Plus } from "lucide-react";
import type { ReadingEdition } from "@/lib/roman/types";
import AudioPlayer from "./AudioPlayer";
import { Scene, SectionLabel, linkProps } from "./parts";
import SceneIn from "./SceneIn";
import s from "./roman.module.css";

/** Edition dates are calendar days in Asia/Kolkata. */
function editionDate(date: string) {
  return new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "long", year: "numeric", timeZone: "Asia/Kolkata" }).format(
    new Date(date.length === 10 ? `${date}T12:00:00+05:30` : date)
  );
}

export default function DailyReading({ edition }: { edition: ReadingEdition | null }) {
  return (
    <section id="reading" className={`${s.section} ${s.plaster} ${s.room} ${s.reading}`}>
      <SceneIn name="reading" className={s.plate} />
      <Scene name="reading" className={`${s.mobileOnly} ${s.plateBottom}`} />
      <div className={`${s.inner} ${s.grid}`}>
        <div>
          <SectionLabel n="04" title="Daily reading" />
          <h2 className={s.h2}>
            From my corner <br />
            of the internet
          </h2>
          <p className={s.lede}>Curated by Muse. A daily edition of ideas, links and observations worth your time.</p>
        </div>

        <div className={`${s.panel} ${s.edition}`}>
          {edition ? (
            <>
              <p className={s.kicker}>
                Latest edition <span>{editionDate(edition.date)}</span>
                {edition.sample && <b className={s.tagNeutral}>Sample edition</b>}
              </p>
              <h3 className={s.h3}>{edition.title}</h3>
              <p className={s.body}>{edition.summary}</p>
              {edition.audio && <AudioPlayer src={edition.audio.src} durationSeconds={edition.audio.durationSeconds} />}
              {edition.url && (
                <div className={s.actions}>
                  <a className={s.primary} {...linkProps(edition.url)}>
                    Read the one-pager <ArrowRight size={18} aria-hidden="true" />
                  </a>
                </div>
              )}
              {edition.sources.length > 0 && (
                <details className={s.sources}>
                  <summary>
                    <Link2 size={18} aria-hidden="true" />
                    <span>Original sources ({edition.sources.length})</span>
                    <Plus size={18} aria-hidden="true" />
                  </summary>
                  <ul>
                    {edition.sources.map((source) => (
                      <li key={source.url}>
                        <a {...linkProps(source.url)}>{source.author ? `${source.label} — ${source.author}` : source.label}</a>
                      </li>
                    ))}
                  </ul>
                </details>
              )}
            </>
          ) : (
            <>
              <p className={s.kicker}>Latest edition</p>
              <h3 className={s.h3}>First edition is on its way</h3>
              <p className={s.body}>The daily one-pager, its audio and the original sources will appear here.</p>
            </>
          )}
        </div>
      </div>
    </section>
  );
}
