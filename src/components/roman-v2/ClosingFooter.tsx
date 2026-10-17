import type { RomanV2Closing } from "@/lib/roman-v2/types";
import AvailabilityAction from "./AvailabilityAction";
import shared from "./contemporary-roman.module.css";
import s from "./ClosingFooter.module.css";

/** Final invitation and site footer in one contentinfo landmark, so the invitation sits outside <main>. */
export default function ClosingFooter({ closing }: { closing: RomanV2Closing }) {
  return (
    <footer id="contact" aria-labelledby="contact-title" className={s.root}>
      <div className={s.backdrop} aria-hidden="true" />
      <div className={s.art} aria-hidden="true">
        <picture>
          <source type="image/avif" srcSet="/roman-v2/footer/footer-hand-490.avif" width={490} height={540} />
          <img
            src="/roman-v2/footer/footer-hand-490.webp"
            width={490}
            height={540}
            alt=""
            loading="lazy"
            decoding="async"
            className={s.artImage}
          />
        </picture>
      </div>

      <div className={`${shared.container} ${s.inner}`}>
        <div className={s.invite}>
          <h2 id="contact-title" className={`${shared.h2} ${s.title}`}>
            <span className={s.lead}>{closing.heading.lead}</span>{" "}
            <span className={shared.accent}>{closing.heading.accent}</span>
          </h2>
          <div className={s.ctas}>
            <AvailabilityAction action={closing.conversationAction} variant="text" className={s.conversation} />
            <AvailabilityAction action={closing.scheduleAction} variant="outline" className={s.schedule} />
          </div>
        </div>

        <div className={s.grid}>
          <div className={s.brand}>
            <p className={`${shared.inscription} ${s.wordmark}`}>{closing.wordmark}</p>
            <p className={s.tagline}>{closing.tagline}</p>
          </div>
          <nav aria-label="Footer" className={s.cell}>
            <ul className={s.list}>
              {closing.navItems.map((item) => (
                <li key={item.href}>
                  <a href={item.href} className={s.link}>
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
          <ul aria-label="Social profiles" className={`${s.cell} ${s.list}`}>
            {closing.socials.map((social) => (
              <li key={social.label}>
                <AvailabilityAction action={social} variant="text" arrow="none" disabledAs="span" className={s.link} />
              </li>
            ))}
          </ul>
          <p className={`${s.cell} ${s.timezone}`}>{closing.timezone}</p>
          <div className={`${s.cell} ${s.top}`}>
            <AvailabilityAction action={closing.backToTop} variant="text" arrow="up" className={s.link} />
          </div>
        </div>

        <p className={s.motto}>
          <span className={`${shared.inscription} ${s.latin}`} lang="la">
            {closing.inscription.latin.replace(/\.$/, "")}
          </span>
          <span className={s.translation}>{closing.inscription.translation}</span>
        </p>
      </div>
    </footer>
  );
}
