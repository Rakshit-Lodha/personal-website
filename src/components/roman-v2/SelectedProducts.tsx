import type { RomanV2Image, RomanV2Product, RomanV2Products } from "@/lib/roman-v2/types";
import AvailabilityAction from "./AvailabilityAction";
import shared from "./contemporary-roman.module.css";
import s from "./SelectedProducts.module.css";

const SCREENS = "/roman-v2/projects/screens";

/**
 * Real product captures (1440×900 viewport). Local until content.ts carries `screenshot`;
 * Feedback Intelligence has none because its Render service is suspended.
 */
const SCREENSHOTS: Record<string, RomanV2Image & { widths: number[] }> = {
  "ai-hiring-chat": {
    src: `${SCREENS}/ai-hiring-chat`,
    alt: "AI Hiring Chat welcome screen with suggested questions and a message box",
    width: 1100,
    height: 866,
    widths: [560, 1100],
  },
  "krux-new": {
    src: `${SCREENS}/krux-new`,
    alt: "Krux.news introduction card: everything about AI in 100 words",
    width: 960,
    height: 900,
    widths: [480, 960],
  },
  "mf-semantic-search": {
    src: `${SCREENS}/mf-semantic-search`,
    alt: "MF Semantic Search with example queries and a fund search box",
    width: 900,
    height: 833,
    widths: [450, 900],
  },
};

function Screenshot({ id, sizes, className }: { id: string; sizes: string; className: string }) {
  const shot = SCREENSHOTS[id];
  if (!shot) return null;
  return (
    // Pre-sized WebP exports with an explicit srcset, like the <picture> artwork.
    // eslint-disable-next-line @next/next/no-img-element
    <img
      className={className}
      src={`${shot.src}-${shot.widths[0]}.webp`}
      srcSet={shot.widths.map((w) => `${shot.src}-${w}.webp ${w}w`).join(", ")}
      sizes={sizes}
      width={shot.width}
      height={shot.height}
      alt={shot.alt}
      loading="lazy"
      decoding="async"
    />
  );
}

function Art({ name, width, height, sizes, className }: { name: string; width: number; height: number; sizes: string; className: string }) {
  const base = `/roman-v2/projects/${name}`;
  return (
    <picture>
      <source type="image/avif" srcSet={`${base}-640.avif 640w, ${base}-960.avif 960w`} sizes={sizes} />
      <source type="image/webp" srcSet={`${base}-640.webp 640w, ${base}-960.webp 960w`} sizes={sizes} />
      <img className={className} src={`${base}-960.webp`} width={width} height={height} alt="" loading="lazy" decoding="async" />
    </picture>
  );
}

function Featured({ item }: { item: RomanV2Product }) {
  return (
    <article className={`${s.featured} ${item.primaryAction.available ? s.enabled : ""}`} aria-labelledby={`product-${item.id}`}>
      <div className={s.featuredCopy}>
        <h3 id={`product-${item.id}`} className={s.featuredTitle}>
          {item.name}
        </h3>
        <p className={s.featuredTagline}>{item.tagline}</p>
        <div className={s.featuredActions}>
          <span className={s.status}>
            <span className={s.statusDot} aria-hidden="true" />
            {item.status}
          </span>
          <AvailabilityAction action={item.primaryAction} variant="primary" arrow="up-right" />
        </div>
      </div>
      <div className={s.stage}>
        <div className={s.window}>
          <Screenshot id={item.id} sizes="(min-width: 900px) 34vw, 60vw" className={s.windowShot} />
        </div>
        <Art
          name="projects-frame"
          width={960}
          height={590}
          sizes="(min-width: 900px) 63vw, 110vw"
          className={s.frame}
        />
      </div>
    </article>
  );
}

function Card({ item }: { item: RomanV2Product }) {
  return (
    <li className={`${s.card} ${item.primaryAction.available ? s.enabled : ""}`}>
      <div className={s.cardCopy}>
        <h3 className={s.cardTitle}>{item.name}</h3>
        <p className={s.cardTagline}>{item.tagline}</p>
        <AvailabilityAction action={item.primaryAction} variant="icon" arrow="right" className={s.cardAction} />
      </div>
      <div className={s.thumb} aria-hidden="true">
        <span className={s.thumbSun} />
        <span className={s.thumbDots} />
        {SCREENSHOTS[item.id] && (
          <div className={s.thumbScreen}>
            <Screenshot id={item.id} sizes="(min-width: 900px) 15vw, 50vw" className={s.thumbShot} />
          </div>
        )}
        <picture>
          <source type="image/avif" srcSet="/roman-v2/projects/projects-card-plinth-300.avif" />
          <img
            className={s.plinth}
            src="/roman-v2/projects/projects-card-plinth-300.webp"
            width={300}
            height={58}
            alt=""
            loading="lazy"
            decoding="async"
          />
        </picture>
      </div>
    </li>
  );
}

export default function SelectedProducts({ products }: { products: RomanV2Products }) {
  const [featured, ...rest] = products.items;
  return (
    <section id="products" aria-labelledby="products-title" className={s.section}>
      <div className={`${shared.container} ${s.inner}`}>
        <div className={s.top}>
          <div className={s.backdrop} aria-hidden="true">
            <span className={s.sun} />
          </div>
          <header className={s.header}>
            <h2 id="products-title" className={s.title}>
              {products.heading.lead} <span className={shared.accent}>{products.heading.accent}</span>
            </h2>
            <p className={s.lede}>{products.body}</p>
          </header>
          {featured && <Featured item={featured} />}
        </div>
        <ul className={s.cards}>
          {rest.map((item) => (
            <Card key={item.id} item={item} />
          ))}
        </ul>
      </div>
    </section>
  );
}
