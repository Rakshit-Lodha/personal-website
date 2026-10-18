import Link from "next/link";
import { getPublishedEditions } from "@/lib/reading/store";
import shared from "@/components/roman-v2/contemporary-roman.module.css";
import s from "./reading.module.css";

export const metadata = {
  title: "Daily reading — archive",
  description: "Ideas discovered across the internet, distilled by Muse.",
};

/** Edition dates are calendar days in Asia/Kolkata. */
function editionDate(date: string) {
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "Asia/Kolkata",
  }).format(new Date(`${date}T12:00:00+05:30`));
}

export default function ReadingArchivePage() {
  const editions = getPublishedEditions();
  const [latest, ...archive] = editions;

  return (
    <main className={`${shared.container} ${s.page}`}>
      <section className={s.intro} aria-labelledby="archive-title">
        <div className={s.introCopy}>
          <p className={shared.eyebrow}>Daily reading · by Muse</p>
          <h1 id="archive-title" className={s.title}>
            From my corner <span className={shared.accent}>of the internet</span>
          </h1>
          <p className={shared.lede}>Ideas I discover across the internet, distilled by Muse.</p>
        </div>
        <div className={s.introArt} aria-hidden="true" />
      </section>

      {editions.length === 0 ? (
        <p className={s.empty}>The first edition is on its way.</p>
      ) : (
        <>
          {latest && (
            <Link href={`/roman-v2/reading/${latest.date}`} className={s.featured}>
              <span className={s.featuredLabel}>Latest edition</span>
              <span className={s.featuredDate}>{editionDate(latest.date)}</span>
              <span className={s.featuredTitle}>{latest.title}</span>
            </Link>
          )}

          {archive.length > 0 && (
            <section className={s.archive} aria-labelledby="archive-index-title">
              <div className={s.archiveHeader}>
                <h2 id="archive-index-title">The archive</h2>
                <span>{archive.length} editions</span>
              </div>
              <ul className={s.list}>
                {archive.map((edition) => (
                  <li key={edition.date}>
                    <Link href={`/roman-v2/reading/${edition.date}`} className={s.row}>
                      <span className={s.rowDate}>{editionDate(edition.date)}</span>
                      <span className={s.rowTitle}>{edition.title}</span>
                      <span className={s.rowArrow} aria-hidden="true">→</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          )}
        </>
      )}
    </main>
  );
}
