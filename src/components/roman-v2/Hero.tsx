import type { RomanV2Hero } from "@/lib/roman-v2/types";
import AvailabilityAction from "./AvailabilityAction";
import JJButton from "./JJButton";
import LoopVideo from "./LoopVideo";
import s from "./Hero.module.css";

export default function Hero({ hero }: { hero: RomanV2Hero }) {
  return (
    <section id="top" aria-labelledby="hero-title" className={s.section}>
      <div className={s.circle} aria-hidden="true" />
      {/* The page's only eager, high-priority image. Tablet gets a laptop-and-hands crop. */}
      <picture className={s.art} data-intro-art>
        <source
          media="(min-width: 701px) and (max-width: 899px)"
          type="image/avif"
          srcSet="/roman-v2/hero/hero-hands-mobile-480.avif 480w, /roman-v2/hero/hero-hands-mobile-780.avif 780w"
          sizes="100vw"
          width={780}
          height={614}
        />
        <source
          media="(min-width: 701px) and (max-width: 899px)"
          type="image/webp"
          srcSet="/roman-v2/hero/hero-hands-mobile-480.webp 480w, /roman-v2/hero/hero-hands-mobile-780.webp 780w"
          sizes="100vw"
          width={780}
          height={614}
        />
        <source
          type="image/avif"
          srcSet="/roman-v2/hero/hero-figure-typing-720.avif 720w, /roman-v2/hero/hero-figure-typing-1105.avif 1105w, /roman-v2/hero/hero-figure-typing-1536.avif 1536w"
          sizes="(max-width: 700px) 100vw, min(79.7vw, 1434px)"
        />
        <img
          src="/roman-v2/hero/hero-figure-typing-1105.webp"
          srcSet="/roman-v2/hero/hero-figure-typing-720.webp 720w, /roman-v2/hero/hero-figure-typing-1105.webp 1105w, /roman-v2/hero/hero-figure-typing-1536.webp 1536w"
          sizes="(max-width: 700px) 100vw, min(79.7vw, 1434px)"
          width={1536}
          height={1024}
          alt=""
          loading="eager"
          fetchPriority="high"
          decoding="async"
        />
        {/* The still is the typing pose the loop starts on, so the loop continues it without a jump; waits for IntroReveal. */}
        <LoopVideo loop="hero-loop" mobileQuery="(min-width: 701px) and (max-width: 899px)" className={s.motion} />
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
