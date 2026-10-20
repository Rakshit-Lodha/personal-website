import { notFound } from "next/navigation";
import Link from "next/link";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import ReadingAudioPlayer from "@/components/roman-v2/ReadingAudioPlayer";
import ReadingShell from "@/components/roman-v2/ReadingShell";
import EditionFrame from "@/components/roman-v2/EditionFrame";
import { audioSrc, getEditionHtml, getPublishedEdition, getPublishedEditions } from "@/lib/reading/store";
import s from "../reading.module.css";

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

export default async function ReadingEditionPage({
  params,
  searchParams,
}: {
  params: Promise<{ date: string }>;
  searchParams: Promise<{ view?: string }>;
}) {
  const { date } = await params;
  const mode = (await searchParams).view === "agent" ? "agent" : "human";
  const edition = getPublishedEdition(date);
  if (!edition) notFound();
  const fullHtml = getEditionHtml(date);
  if (edition.htmlAssetId && !fullHtml) {
    throw new Error(
      `Reading edition ${date}: htmlAssetId "${edition.htmlAssetId}" is set but the file is missing from content/reading/editions-html/. Check .vercelignore.`,
    );
  }

  const humanHref = `/reading/${date}`;
  const agentHref = `/reading/${date}?view=agent`;

  return (
    <ReadingShell mode={mode} humanHref={humanHref} agentHref={agentHref}>
      {mode === "agent" ? (
        <main className={s.agentPage}>
          <article className={s.agentArticle}>
            <header>
              <p>EDITION · {edition.date}</p>
              <h1>{edition.title}</h1>
              <p>{edition.summary}</p>
            </header>
            <div className={s.agentMarkdown}>
              <ReactMarkdown remarkPlugins={[remarkGfm]}>{edition.bodyMarkdown}</ReactMarkdown>
            </div>
            {edition.sources.length > 0 && (
              <section className={s.agentSources} aria-labelledby="agent-sources-title">
                <h2 id="agent-sources-title">Original sources</h2>
                <ol>
                  {edition.sources.map((source) => (
                    <li key={source.url}>
                      <a href={source.url}>{source.author ? `${source.label} — ${source.author}` : source.label}</a>
                    </li>
                  ))}
                </ol>
              </section>
            )}
            {edition.audioTranscript && (
              <details className={s.agentTranscript}>
                <summary>Audio transcript</summary>
                <p>{edition.audioTranscript}</p>
              </details>
            )}
            <Link href="/reading?view=agent" className={s.agentBack}>[← ALL EDITIONS]</Link>
          </article>
        </main>
      ) : (
        <main className={s.humanPage}>
          <article className={s.editionPage}>
            <Link href="/reading" className={s.backLink}>← All editions</Link>
            <header className={s.editionHeader}>
              <p className={s.eyebrow}>Daily reading · {editionDate(edition.date)}</p>
              <h1>{edition.title}</h1>
              <p>{edition.summary}</p>
            </header>

            {edition.audioAssetId && edition.audioDurationSeconds && (
              <ReadingAudioPlayer
                src={audioSrc(edition.audioAssetId)}
                durationSeconds={edition.audioDurationSeconds}
              />
            )}

            {fullHtml ? (
              <div className={s.fullEdition}>
                <EditionFrame html={fullHtml} title={`${edition.title} — full visual edition`} />
              </div>
            ) : (
              <div className={s.markdownFallback}>
                <ReactMarkdown remarkPlugins={[remarkGfm]}>{edition.bodyMarkdown}</ReactMarkdown>
              </div>
            )}
          </article>
        </main>
      )}
    </ReadingShell>
  );
}
