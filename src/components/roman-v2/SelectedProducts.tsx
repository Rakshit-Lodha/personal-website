import type { RomanV2Product, RomanV2Products } from "@/lib/roman-v2/types";
import AvailabilityAction from "./AvailabilityAction";
import shared from "./contemporary-roman.module.css";
import s from "./SelectedProducts.module.css";

function Screenshot({ shot, sizes, className }: { shot: RomanV2Product["screenshot"]; sizes: string; className: string }) {
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
        <span className={s.sun} aria-hidden="true" />
        <div className={s.art}>
          <Art
            name="projects-frame"
            width={960}
            height={640}
            sizes="(min-width: 900px) 63vw, 110vw"
            className={s.frame}
          />
          {/* Above the frame, clipped to the traced outline of its dark opening. */}
          <div className={s.window}>
            <Screenshot shot={item.screenshot} sizes="(min-width: 900px) 40vw, 75vw" className={s.windowShot} />
          </div>
        </div>
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
        {item.screenshot && (
          <div className={s.thumbScreen}>
            <Screenshot shot={item.screenshot} sizes="(min-width: 900px) 15vw, 50vw" className={s.thumbShot} />
          </div>
        )}
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
