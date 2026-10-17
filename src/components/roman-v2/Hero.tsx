import type { RomanV2Hero } from "@/lib/roman-v2/types";
import AvailabilityAction from "./AvailabilityAction";
import JJButton from "./JJButton";
import shared from "./contemporary-roman.module.css";
import s from "./Hero.module.css";

export default function Hero({ hero }: { hero: RomanV2Hero }) {
  return (
    <section id="top" aria-labelledby="hero-title" className={s.section}>
      <div className={shared.container}>
        <h1 id="hero-title" className={shared.display}>
          {hero.heading.lead} <span className={shared.accent}>{hero.heading.accent}</span>
        </h1>
        <p className={shared.lede}>{hero.body}</p>
        <AvailabilityAction action={hero.primaryAction} variant="primary" arrow="right" />
        <JJButton label={hero.jjLabel} variant="outline" />
      </div>
    </section>
  );
}
