import type { RomanV2Hero } from "@/lib/roman-v2/types";
import AvailabilityAction from "./AvailabilityAction";
import JJButton from "./JJButton";
import s from "./Hero.module.css";

export default function Hero({ hero }: { hero: RomanV2Hero }) {
  return (
    <section id="top" aria-labelledby="hero-title" className={s.section}>
      {/*
        The artwork ships on an opaque paper ground. This filter lifts that ground just above the hero
        paper and circle so the `darken` blend on .art drops it, leaving no art box and letting the
        circle show behind the head.
      */}
      <svg className={s.filters} aria-hidden="true" focusable="false">
        <filter id="roman-v2-hero-ground" colorInterpolationFilters="sRGB">
          <feColorMatrix type="matrix" values="1.02 0 0 0 0  0 1.03 0 0 0  0 0 1.055 0 0  0 0 0 1 0" />
        </filter>
      </svg>
      <div className={s.circle} aria-hidden="true" />
      {/* The page's only eager, high-priority image. Mobile gets a dedicated portrait crop. */}
      <picture className={s.art}>
        <source
          media="(max-width: 899px)"
          type="image/avif"
          srcSet="/roman-v2/hero/hero-figure-mobile-480.avif 480w, /roman-v2/hero/hero-figure-mobile-850.avif 850w"
          sizes="(max-width: 699px) 100vw, 640px"
          width={850}
          height={850}
        />
        <source
          media="(max-width: 899px)"
          type="image/webp"
          srcSet="/roman-v2/hero/hero-figure-mobile-480.webp 480w, /roman-v2/hero/hero-figure-mobile-850.webp 850w"
          sizes="(max-width: 699px) 100vw, 640px"
          width={850}
          height={850}
        />
        <source
          type="image/avif"
          srcSet="/roman-v2/hero/hero-figure-720.avif 720w, /roman-v2/hero/hero-figure-1105.avif 1105w"
          sizes="min(79.7vw, 1434px)"
        />
        <img
          src="/roman-v2/hero/hero-figure-1105.webp"
          srcSet="/roman-v2/hero/hero-figure-720.webp 720w, /roman-v2/hero/hero-figure-1105.webp 1105w"
          sizes="min(79.7vw, 1434px)"
          width={1105}
          height={737}
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
