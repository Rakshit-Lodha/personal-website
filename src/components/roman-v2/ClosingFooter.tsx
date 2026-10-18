import type { RomanV2Closing } from "@/lib/roman-v2/types";
import AvailabilityAction from "./AvailabilityAction";
import FooterReach from "./FooterReach";
import shared from "./contemporary-roman.module.css";
import s from "./ClosingFooter.module.css";

/** Closing motto and contact links in one contentinfo landmark, so they sit outside <main>. */
export default function ClosingFooter({ closing }: { closing: RomanV2Closing }) {
  return (
    <footer id="contact" aria-labelledby="contact-title" className={s.root}>
      <div className={s.backdrop} aria-hidden="true" />
      <div className={s.art} aria-hidden="true">
        <picture>
          <source
            type="image/avif"
            srcSet="/roman-v2/footer/footer-hand-490.avif 490w, /roman-v2/footer/footer-hand-980.avif 980w, /roman-v2/footer/footer-hand-1254.avif 1254w"
            sizes="(max-width: 1023px) 38vw, min(36.4vw, 612px)"
          />
          <img
            src="/roman-v2/footer/footer-hand-980.webp"
            srcSet="/roman-v2/footer/footer-hand-490.webp 490w, /roman-v2/footer/footer-hand-980.webp 980w, /roman-v2/footer/footer-hand-1254.webp 1254w"
            sizes="(max-width: 1023px) 38vw, min(36.4vw, 612px)"
            width={1254}
            height={1254}
            alt=""
            loading="lazy"
            decoding="async"
            className={s.artImage}
          />
        </picture>
        <svg className={s.cursor} viewBox="0 0 30 40" focusable="false">
          <path d="M1 1 28 25 16.5 26.5 9 39Z" fill="currentColor" />
        </svg>
        <FooterReach />
      </div>

      <div className={`${shared.container} ${s.inner}`}>
        <div className={s.invite}>
          <h2 id="contact-title" className={`${shared.h2} ${s.title}`}>
            <span className={s.lead} lang="la">
              {closing.heading.lead}
            </span>{" "}
            <span className={shared.accent}>{closing.heading.accent}</span>
          </h2>
          <p className={s.attribution}>— {closing.attribution}</p>
          <div className={s.ctas}>
            <AvailabilityAction action={closing.conversationAction} variant="text" className={s.conversation} />
            <ul aria-label="Social profiles" className={s.socials}>
              {closing.socials.map((social) => (
                <li key={social.label}>
                  <AvailabilityAction action={social} variant="outline" disabledAs="span" className={s.social} />
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </footer>
  );
}
