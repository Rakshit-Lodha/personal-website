import Link from "next/link";
import ReadingShell from "@/components/roman-v2/ReadingShell";
import { getPublishedEditions } from "@/lib/reading/store";
import s from "./reading.module.css";

export const metadata = {
  title: "Daily reading — archive",
  description: "Ideas discovered across the internet, distilled by Muse.",
};

function editionDate(date: string) {
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "Asia/Kolkata",
  }).format(new Date(`${date}T12:00:00+05:30`));
}

export default async function ReadingArchivePage({
  searchParams,
}: {
  searchParams: Promise<{ view?: string }>;
}) {
  const mode = (await searchParams).view === "agent" ? "agent" : "human";
  const editions = getPublishedEditions();
  const [latest, ...archive] = editions;

  return (
    <ReadingShell mode={mode} humanHref="/reading" agentHref="/reading?view=agent">
      {mode === "agent" ? (
        <main className={s.agentPage}>
          <header className={s.agentIntro}>
            <p>READING_INDEX</p>
            <h1>Daily reading</h1>
            <p>A chronological, machine-readable index of ideas discovered across the internet and distilled by Muse.</p>
          </header>
          <ol className={s.agentList}>
            {editions.map((edition, index) => (
              <li key={edition.date}>
                <article>
                  <p>{String(index + 1).padStart(3, "0")} · {edition.date}</p>
                  <h2>{edition.title}</h2>
                  <p>{edition.summary}</p>
                  <Link href={`/reading/${edition.date}?view=agent`}>[READ EDITION]</Link>
                </article>
              </li>
            ))}
          </ol>
        </main>
      ) : (
        <main className={s.humanPage}>
          <header className={s.archiveIntro}>
            <p className={s.eyebrow}>Daily reading · by Muse</p>
            <h1>From my corner of the internet</h1>
            <p>Ideas I discover across the internet, distilled into a daily edition.</p>
          </header>

          {editions.length === 0 ? (
            <p className={s.empty}>The first edition is on its way.</p>
          ) : (
            <>
              {latest && (
                <Link href={`/reading/${latest.date}`} className={s.latestArticle}>
                  <div>
                    <span className={s.latestLabel}>Latest edition</span>
                    <span className={s.latestDate}>{editionDate(latest.date)}</span>
                  </div>
                  <div>
                    <h2>{latest.title}</h2>
                    <p>{latest.summary}</p>
                    <span className={s.readLink}>Read edition <span aria-hidden="true">→</span></span>
                  </div>
                </Link>
              )}

              {archive.length > 0 && (
                <section className={s.archive} aria-labelledby="archive-title">
                  <div className={s.archiveHeading}>
                    <h2 id="archive-title">All editions</h2>
                    <span>{editions.length} published</span>
                  </div>
                  <ol className={s.editionList}>
                    {archive.map((edition, index) => (
                      <li key={edition.date}>
                        <Link href={`/reading/${edition.date}`}>
                          <span className={s.editionNumber}>{String(index + 2).padStart(2, "0")}</span>
                          <span className={s.editionDate}>{editionDate(edition.date)}</span>
                          <span className={s.editionTitle}>{edition.title}</span>
                          <span className={s.editionArrow} aria-hidden="true">→</span>
                        </Link>
                      </li>
                    ))}
                  </ol>
                </section>
              )}
            </>
          )}
        </main>
      )}
    </ReadingShell>
  );
}
