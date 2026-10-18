import { ArrowRight, ArrowUp, FileText, Link2, Mail } from "lucide-react";
import type { RomanContent } from "@/lib/roman/types";
import { Scene, SectionLabel, linkProps } from "./parts";
import SceneIn from "./SceneIn";
import s from "./roman.module.css";

export default function Closing({ contact, quote }: Pick<RomanContent, "contact" | "quote">) {
  return (
    <section id="contact" className={`${s.section} ${s.plaster} ${s.room} ${s.closing}`}>
      <SceneIn name="contact" className={s.plate} />
      <Scene name="contact" className={`${s.mobileOnly} ${s.plateBottom}`} />
      <div className={`${s.inner} ${s.grid} ${s.closingGrid}`}>
        <div>
          <SectionLabel n="08" title="Get in touch" />
          <ul className={s.contactRows}>
            <li>
              <a className={s.row} href={`mailto:${contact.email}`}>
                <Mail aria-hidden="true" />
                <span>Email</span>
                <ArrowRight size={20} aria-hidden="true" />
              </a>
            </li>
            {contact.links.map((link) => (
              <li key={link.url}>
                <a className={s.row} {...linkProps(link.url)}>
                  <Link2 aria-hidden="true" />
                  <span>{link.label}</span>
                </a>
              </li>
            ))}
            {contact.resumeUrl && (
              <li>
                <a className={s.row} {...linkProps(contact.resumeUrl)}>
                  <FileText aria-hidden="true" />
                  <span>Resume</span>
                  <ArrowRight size={20} aria-hidden="true" />
                </a>
              </li>
            )}
          </ul>
        </div>

        <figure className={s.quote}>
          <blockquote>
            <p>{quote.text}</p>
          </blockquote>
          <figcaption>
            <span className={s.quoteAuthor}>{quote.author}</span>
            <cite>{quote.source}</cite>
          </figcaption>
        </figure>
      </div>

      <a href="#arrival" className={s.backTop}>
        <ArrowUp size={20} aria-hidden="true" />
        Back to top
      </a>
    </section>
  );
}
