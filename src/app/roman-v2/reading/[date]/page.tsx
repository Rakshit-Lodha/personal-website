import { notFound } from "next/navigation";
import Link from "next/link";
import { Link2 } from "lucide-react";
import AudioPlayer from "@/components/roman/AudioPlayer";
import EditionFrame from "@/components/roman-v2/EditionFrame";
import { audioSrc, getEditionHtml, getPublishedEdition, getPublishedEditions } from "@/lib/reading/store";
import shared from "@/components/roman-v2/contemporary-roman.module.css";
import s from "../reading.module.css";

/** Edition dates are calendar days in Asia/Kolkata. */
function editionDate(date: string) {
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "Asia/Kolkata",
  }).format(new Date(`${date}T12:00:00+05:30`));
}

export function generateStaticParams() {
  return getPublishedEditions().map((edition) => ({ date: edition.date }));
}

export async function generateMetadata({ params }: { params: Promise<{ date: string }> }) {
  const { date } = await params;
  const edition = getPublishedEdition(date);
  return {
    title: edition ? `${edition.title} — Daily reading` : "Daily reading",
    description: edition?.summary,
  };
}

export default async function ReadingEditionPage({ params }: { params: Promise<{ date: string }> }) {
  const { date } = await params;
  const edition = getPublishedEdition(date);
  if (!edition) notFound();
  const fullHtml = getEditionHtml(date);

  return (
    <main className={`${shared.container} ${s.page}`}>
      <p className={shared.eyebrow}>Daily reading</p>
      <p className={s.date}>{editionDate(edition.date)}</p>
      <h1 className={s.title}>{edition.title}</h1>
      <p className={shared.lede}>{edition.summary}</p>

      {edition.audioAssetId && edition.audioDurationSeconds && (
        <div className={s.player}>
          <AudioPlayer
            src={audioSrc(edition.audioAssetId)}
            durationSeconds={edition.audioDurationSeconds}
          />
        </div>
      )}

      {fullHtml ? (
        <div className={s.fullEdition}>
          <EditionFrame html={fullHtml} title={`${edition.title} — full visual edition`} />
        </div>
      ) : (
        <p className={s.empty}>The full visual edition is on its way.</p>
      )}

      {edition.sources.length > 0 && (
        <section className={s.sources} aria-label="Original sources">
          <h2 className={s.sourcesTitle}>
            <Link2 size={18} aria-hidden="true" /> Original sources
          </h2>
          <ul>
            {edition.sources.map((source) => (
              <li key={source.url}>
                <a href={source.url} target="_blank" rel="noopener noreferrer">
                  {source.author ? `${source.label} — ${source.author}` : source.label}
                </a>
              </li>
            ))}
          </ul>
        </section>
      )}

      <p className={s.back}>
        <Link href="/roman-v2/reading">← All editions</Link>
      </p>
    </main>
  );
}
