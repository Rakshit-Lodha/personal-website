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
      <source type="image/avif" srcSet={`${base}-640.avif 640w, ${base}-960.avif 960w, ${base}-1536.avif 1536w`} sizes={sizes} />
      <source type="image/webp" srcSet={`${base}-640.webp 640w, ${base}-960.webp 960w, ${base}-1536.webp 1536w`} sizes={sizes} />
      <img className={className} src={`${base}-960.webp`} width={width} height={height} alt="" loading="lazy" decoding="async" />
    </picture>
  );
}

/** Hover-only detail panel. The card's own action stays the keyboard and touch path, so this is hidden from both. */
function Details({ item }: { item: RomanV2Product }) {
  if (!item.details) return null;
  return (
    <div className={s.details} aria-hidden="true">
      <p className={s.detailsTitle}>{item.details.title}</p>
      <p className={s.detailsBody}>{item.details.body}</p>
      {item.primaryAction.available && (
        <a
          href={item.primaryAction.href}
          tabIndex={-1}
          className={s.detailsAction}
          {...(/^https?:\/\//.test(item.primaryAction.href) ? { target: "_blank", rel: "noopener noreferrer" } : {})}
        >
          {item.details.actionLabel}
        </a>
      )}
    </div>
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
          <AvailabilityAction action={item.primaryAction} variant="primary" arrow="up-right" />
        </div>
        <Details item={item} />
      </div>
      <div className={s.stage}>
        <span className={s.sun} aria-hidden="true" />
        <div className={s.art}>
          <Art
            name="projects-frame"
            width={1536}
            height={1024}
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
      <Details item={item} />
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
