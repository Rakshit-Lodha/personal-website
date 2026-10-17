import type { RomanV2Hero } from "@/lib/roman-v2/types";
import AvailabilityAction from "./AvailabilityAction";
import JJButton from "./JJButton";
import s from "./Hero.module.css";

export default function Hero({ hero }: { hero: RomanV2Hero }) {
  return (
    <section id="top" aria-labelledby="hero-title" className={s.section}>
      <div className={s.circle} aria-hidden="true" />
      {/* The page's only eager, high-priority image. Mobile gets a dedicated portrait crop. */}
      <picture className={s.art}>
        <source
          media="(max-width: 899px)"
          type="image/avif"
          srcSet="/roman-v2/hero/hero-figure-mobile-480.avif 480w, /roman-v2/hero/hero-figure-mobile-850.avif 850w"
          sizes="(max-width: 699px) 100vw, 640px"
          width={850}
          height={748}
        />
        <source
          media="(max-width: 899px)"
          type="image/webp"
          srcSet="/roman-v2/hero/hero-figure-mobile-480.webp 480w, /roman-v2/hero/hero-figure-mobile-850.webp 850w"
          sizes="(max-width: 699px) 100vw, 640px"
          width={850}
          height={748}
        />
        <source
          type="image/avif"
          srcSet="/roman-v2/hero/hero-figure-720.avif 720w, /roman-v2/hero/hero-figure-1105.avif 1105w"
          sizes="min(66.4vw, 1195px)"
        />
        <img
          src="/roman-v2/hero/hero-figure-1105.webp"
          srcSet="/roman-v2/hero/hero-figure-720.webp 720w, /roman-v2/hero/hero-figure-1105.webp 1105w"
          sizes="min(66.4vw, 1195px)"
          width={1105}
          height={748}
          alt=""
          loading="eager"
          fetchPriority="high"
          decoding="async"
        />
      </picture>
      <div className={s.copy}>
        <h1 id="hero-title" className={s.title}>
          <span className={s.lead}>{hero.heading.lead}</span>{" "}
          <span className={s.accent}>{hero.heading.accent}</span>
        </h1>
        <p className={s.body}>{hero.body}</p>
        <div className={s.actions}>
          <AvailabilityAction action={hero.primaryAction} variant="primary" className={s.cta} />
          <JJButton label={hero.jjLabel} variant="outline" className={s.cta} />
        </div>
      </div>
    </section>
  );
}
