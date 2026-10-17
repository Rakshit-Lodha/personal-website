import Link from "next/link";
import { getPublishedEditions } from "@/lib/reading/store";
import shared from "@/components/roman-v2/contemporary-roman.module.css";
import s from "./reading.module.css";

export const metadata = {
  title: "Daily reading — archive",
  description: "Every edition of the daily one-pager, distilled by Muse.",
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

  return (
    <main className={`${shared.container} ${s.page}`}>
      <p className={shared.eyebrow}>Daily reading</p>
      <h1 className={s.title}>
        From my corner <span className={shared.accent}>of the internet</span>
      </h1>
      <p className={shared.lede}>Today&rsquo;s ideas, distilled by Muse. Every edition, newest first.</p>

      {editions.length === 0 ? (
        <p className={s.empty}>The first edition is on its way.</p>
      ) : (
        <ul className={s.list}>
          {editions.map((edition) => (
            <li key={edition.date}>
              <Link href={`/roman-v2/reading/${edition.date}`} className={s.row}>
                <span className={s.rowDate}>{editionDate(edition.date)}</span>
                <span className={s.rowTitle}>{edition.title}</span>
                <span className={s.rowArrow} aria-hidden="true">→</span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
