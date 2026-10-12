import s from "./roman.module.css";

/** Responsive, text-free architectural art. Portrait and landscape are separate compositions. */
export function Scene({ name, className = s.fill, priority = false }: { name: string; className?: string; priority?: boolean }) {
  const mobile = "(max-width: 899px)";
  return (
    <picture className={`${s.scene} ${className}`}>
      <source media={mobile} type="image/avif" srcSet={`/roman/${name}-mobile-v1-480.avif 480w, /roman/${name}-mobile-v1-800.avif 800w`} sizes="100vw" />
      <source media={mobile} type="image/webp" srcSet={`/roman/${name}-mobile-v1-480.webp 480w, /roman/${name}-mobile-v1-800.webp 800w`} sizes="100vw" />
      <source type="image/avif" srcSet={`/roman/${name}-desktop-v1-960.avif 960w, /roman/${name}-desktop-v1-1600.avif 1600w`} sizes="100vw" />
      {/* Native picture keeps the separate mobile art direction. */}
      <img
        src={`/roman/${name}-desktop-v1-1600.webp`}
        srcSet={`/roman/${name}-desktop-v1-960.webp 960w, /roman/${name}-desktop-v1-1600.webp 1600w`}
        sizes="100vw"
        alt=""
        width={1600}
        height={900}
        loading={priority ? "eager" : "lazy"}
        fetchPriority={priority ? "high" : "auto"}
        decoding="async"
      />
    </picture>
  );
}

export function SectionLabel({ n, title }: { n: string; title: string }) {
  return (
    <p className={s.label}>
      <span>{n}</span>
      <span aria-hidden="true">/</span>
      <span>{title}</span>
    </p>
  );
}

/** External links open in a new tab; internal routes and mailto stay in place. */
export function linkProps(url: string) {
  return /^https?:/.test(url) ? { href: url, target: "_blank", rel: "noreferrer" } : { href: url };
}
