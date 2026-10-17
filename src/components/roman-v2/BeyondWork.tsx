import { ArrowUpRight } from "lucide-react";
import type { RomanV2Beyond, RomanV2WritingRow } from "@/lib/roman-v2/types";
import AvailabilityAction from "./AvailabilityAction";
import BeyondMusic from "./BeyondMusic";
import Reveal from "./Reveal";
import shared from "./contemporary-roman.module.css";
import s from "./BeyondWork.module.css";

const ART = "/roman-v2/beyond";
const THUMBS = ["writing-thumb-head", "writing-thumb-column", "writing-thumb-mountain"];
const WAVEFORM = [18, 34, 52, 26, 70, 44, 88, 36, 60, 96, 48, 74, 30, 82, 56, 100, 40, 66, 28, 90, 50, 78, 34, 62, 86, 42, 70, 24, 58, 38, 80, 46, 64, 30, 52, 22];

/** Decorative artwork layer: AVIF with WebP fallback, hidden from assistive technology. */
function Art({
  name,
  widths,
  width,
  height,
  sizes,
  className,
}: {
  name: string;
  widths: number[];
  width: number;
  height: number;
  sizes: string;
  className: string;
}) {
  const srcSet = (ext: string) => widths.map((w) => `${ART}/${name}-${w}.${ext} ${w}w`).join(", ");
  return (
    <span className={className} aria-hidden="true">
      <picture>
      <source type="image/avif" srcSet={srcSet("avif")} sizes={sizes} />
      <img
        src={`${ART}/${name}-${widths[widths.length - 1]}.webp`}
        srcSet={srcSet("webp")}
        sizes={sizes}
        width={width}
        height={height}
        alt=""
        loading="lazy"
          decoding="async"
        />
      </picture>
    </span>
  );
}

function PreviewTag() {
  return <span className={s.previewTag}>Preview</span>;
}

function WritingRow({ row, index }: { row: RomanV2WritingRow; index: number }) {
  const body = (
    <>
      <Art name={THUMBS[index % THUMBS.length]} widths={[100]} width={100} height={68} sizes="104px" className={s.thumb} />
      {row.fixture ? (
        <span className={s.rowText}>
          <span className={s.skeleton} aria-hidden="true" />
          <span className={`${s.skeleton} ${s.skeletonWide}`} aria-hidden="true" />
          <span className={shared.visuallyHidden}>Preview row: {row.title}</span>
        </span>
      ) : (
        <span className={s.rowText}>
          <span className={s.rowTitle}>{row.title}</span>
          <span className={s.rowMeta}>{row.date ? `${row.kind} · ${row.date}` : row.kind}</span>
        </span>
      )}
      <ArrowUpRight className={s.rowArrow} size={20} strokeWidth={1.5} aria-hidden="true" />
    </>
  );

  const { action } = row;
  if (!action.available) {
    return (
      <div className={s.row} aria-disabled="true">
        {body}
      </div>
    );
  }
  const external = /^https?:\/\//.test(action.href);
  return (
    <a
      href={action.href}
      className={`${s.row} ${s.rowLink}`}
      {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
    >
      {body}
    </a>
  );
}

export default function BeyondWork({ beyond }: { beyond: RomanV2Beyond }) {
  const { reading, writing, music, whoop } = beyond;
  const edition = reading.edition;
  const writingIsPreview = writing.rows.some((row) => row.fixture);

  return (
    <section id="beyond" aria-labelledby="beyond-title" className={s.section}>
      <div className={s.backdrop} aria-hidden="true" />
      <Art
        name="beyond-column"
        widths={[560, 812]}
        width={812}
        height={266}
        sizes="(max-width: 767px) 72vw, min(812px, 49vw)"
        className={s.column}
      />

      <div className={s.inner}>
        <header className={s.header}>
          <h2 id="beyond-title" className={s.title}>
            {beyond.heading.lead} <span className={shared.accent}>{beyond.heading.accent}</span>
          </h2>
          <p className={s.subtitle}>{beyond.body}</p>
        </header>

        <div className={s.grid}>
          <Reveal className={s.reading}>
            <article className={`${s.card} ${s.readingCard}`} aria-labelledby="beyond-reading-title">
              <div className={s.readingCopy}>
                <p className={`${shared.eyebrow} ${s.eyebrow}`}>
                  {reading.eyebrow}
                  {edition.fixture && <PreviewTag />}
                </p>
                <h3 id="beyond-reading-title" className={s.readingTitle}>
                  {reading.heading}
                </h3>
                <p className={s.readingBody}>{reading.body}</p>
                {!edition.fixture && (
                  <p className={s.edition}>
                    {edition.title} · {edition.date}
                  </p>
                )}
                <AvailabilityAction action={reading.action} className={s.readingAction} />
              </div>
              <Art
                name="beyond-reading"
                widths={[584]}
                width={584}
                height={419}
                sizes="(max-width: 767px) 100vw, 584px"
                className={s.readingArt}
              />
            </article>
          </Reveal>

          <Reveal className={s.writing} delay={80}>
            <article className={`${s.card} ${s.writingCard}`} aria-labelledby="beyond-writing-title">
              <h3 id="beyond-writing-title" className={`${shared.eyebrow} ${s.eyebrow}`}>
                {writing.eyebrow}
                {writingIsPreview && <PreviewTag />}
              </h3>
              <p className={s.writingBody}>{writing.body}</p>
              <ul className={s.rows}>
                {writing.rows.slice(0, 3).map((row, index) => (
                  <li key={row.id}>
                    <WritingRow row={row} index={index} />
                  </li>
                ))}
              </ul>
              <AvailabilityAction action={writing.indexAction} variant="outline" className={s.writingAction} />
            </article>
          </Reveal>

          <Reveal className={s.music} delay={120}>
            <article className={`${s.card} ${s.musicCard}`} aria-labelledby="beyond-music-title">
              <div className={s.musicCopy}>
                <p className={`${shared.eyebrow} ${s.eyebrow}`}>{music.eyebrow}</p>
                <h3 id="beyond-music-title" className={s.musicTitle}>
                  {music.heading}
                </h3>
                <BeyondMusic label={music.actionLabel} track={music.track} />
              </div>
              <div className={s.musicStage} aria-hidden="true">
                <Art
                  name="beyond-music"
                  widths={[516]}
                  width={516}
                  height={210}
                  sizes="516px"
                  className={s.musicArt}
                />
                <span className={s.musicPanel} />
                <span className={s.player}>
                  <span className={s.waveform}>
                    {WAVEFORM.map((h, i) => (
                      <span key={i} style={{ height: `${h}%` }} />
                    ))}
                  </span>
                  <span className={s.progress}>
                    <span />
                  </span>
                  <span className={s.transport}>
                    <span className={s.skipBack} />
                    <span className={s.playIcon} />
                    <span className={s.skipForward} />
                  </span>
                </span>
              </div>
            </article>
          </Reveal>

          <Reveal className={s.whoop} delay={160}>
            <article className={`${s.card} ${s.whoopCard}`} aria-labelledby="beyond-whoop-title">
              <h3 id="beyond-whoop-title" className={`${shared.eyebrow} ${s.eyebrow}`}>
                {whoop.eyebrow}
              </h3>
              <dl className={s.metrics}>
                {whoop.metrics.map((metric) => (
                  <div key={metric.key} className={s.metric}>
                    <dt className={s.metricLabel}>{metric.label}</dt>
                    <dd className={s.metricValue}>
                      {metric.value === null ? (
                        <>
                          <span aria-hidden="true">—</span>
                          <span className={shared.visuallyHidden}>Not available</span>
                        </>
                      ) : (
                        `${metric.value}${metric.unit}`
                      )}
                    </dd>
                  </div>
                ))}
              </dl>
              <Art
                name="beyond-whoop-fragment"
                widths={[144]}
                width={144}
                height={206}
                sizes="144px"
                className={s.whoopArt}
              />
            </article>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
