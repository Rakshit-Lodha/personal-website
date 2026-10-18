"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import styles from "./IntroReveal.module.css";

/*
 * Opening sequence: the name, an emblem between its two words, the emblem opening into a framed window
 * that runs through the site's artwork, and the last frame (the hero figure) expanding onto the hero.
 * One rAF timeline drives every transform, so the window grows on a single continuous curve.
 */

/** Artwork shown in the window before the hero figure, each on its own ground. */
const SLIDES = [
  { src: "/roman-v2/projects/projects-head-300.webp", ground: "#b26e58" },
  { src: "/roman-v2/career/career-hands-560.webp", ground: "#d8ddd2" },
  { src: "/roman-v2/jj/jj-listener-680.webp", ground: "#5a1d1b" },
  { src: "/roman-v2/beyond/beyond-reading-584.webp", ground: "#e6dccd" },
  { src: "/roman-v2/beyond/beyond-music-536.webp", ground: "#222322" },
  { src: "/roman-v2/footer/footer-hand-490.webp", ground: "#e6dacd" },
  { src: "/roman-v2/beyond/beyond-column-560.webp", ground: "#c9cdbf" },
];

/** Desktop timeline in ms; mobile runs the same beats 15% faster. */
const T = {
  emblemIn: [350, 900],
  open: [900, 1800],
  drift: [900, 4300],
  expand: [2700, 4300],
  slides: [1000, 2900],
  wordsOut: [3000, 3600],
  cornersOut: [3900, 4400],
  fadeOut: [4500, 5100],
};

const clamp01 = (x: number) => Math.min(1, Math.max(0, x));
const span = (t: number, [a, b]: number[]) => clamp01((t - a) / (b - a));
const easeOut = (x: number) => 1 - (1 - x) ** 3;
const easeInOut = (x: number) => (x < 0.5 ? 4 * x ** 3 : 1 - (-2 * x + 2) ** 3 / 2);

export default function IntroReveal() {
  const [finished, setFinished] = useState(false);
  const [visit, setVisit] = useState(0);
  const finishedRef = useRef(false);
  const previousOverflow = useRef("");
  const introRef = useRef<HTMLDivElement>(null);
  const firstRef = useRef<HTMLSpanElement>(null);
  const lastRef = useRef<HTMLSpanElement>(null);
  const windowRef = useRef<HTMLDivElement>(null);
  const cornersRef = useRef<(HTMLElement | null)[]>([]);
  const slidesRef = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    // A cached page can be restored without remounting React. Recreate the overlay so
    // the sequence starts from frame one on every back/forward visit as well.
    const onPageShow = (event: PageTransitionEvent) => {
      if (!event.persisted) return;
      window.scrollTo({ top: 0, left: 0, behavior: "instant" });
      finishedRef.current = false;
      setFinished(false);
      setVisit((current) => current + 1);
    };
    window.addEventListener("pageshow", onPageShow);
    return () => window.removeEventListener("pageshow", onPageShow);
  }, []);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      const frame = requestAnimationFrame(() => setFinished(true));
      return () => cancelAnimationFrame(frame);
    }

    // Browser scroll restoration and hash links must not start the sequence halfway
    // down the page, where its artwork can no longer meet the hero.
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
    const target = document.querySelector<HTMLElement>("[data-intro-art]");
    const mobile = window.matchMedia("(max-width: 700px)").matches;
    const k = mobile ? 0.85 : 1;
    const corner = mobile ? 14 : 24;
    const gap = mobile ? 10 : 22;

    // The window box sits at the hero art's final rect; every frame places it with transforms only.
    let rect = { left: 0, top: 0, width: 1, height: 1 };
    const measureTarget = () => {
      if (!target || !windowRef.current || !target.offsetWidth) return;
      const r = target.getBoundingClientRect();
      rect = { left: r.left, top: r.top, width: r.width, height: r.height };
      const style = windowRef.current.style;
      style.left = `${rect.left}px`;
      style.top = `${rect.top}px`;
      style.width = `${rect.width}px`;
      style.height = `${rect.height}px`;
    };
    measureTarget();
    const resizeObserver = target ? new ResizeObserver(measureTarget) : null;
    if (target) resizeObserver?.observe(target);
    window.addEventListener("resize", measureTarget);

    previousOverflow.current = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    let frame = 0;
    const finish = () => {
      if (finishedRef.current) return;
      finishedRef.current = true;
      cancelAnimationFrame(frame);
      document.body.style.overflow = previousOverflow.current;
      setFinished(true);
    };

    const at = (key: keyof typeof T) => T[key].map((ms) => ms * k);
    const start = performance.now();
    let shownSlide = -2;
    const tick = (now: number) => {
      const t = now - start;
      const vw = window.innerWidth;
      const vh = window.innerHeight;

      // Window width as a fraction of the hero art: a quick opening, a slow drift while the slides run,
      // and the expansion. Overlapping smooth terms, so the growth never stalls between them.
      const expand = easeInOut(span(t, at("expand")));
      const grow = 0.22 * easeOut(span(t, at("open"))) + 0.16 * span(t, at("drift")) + 0.62 * expand;
      const w = rect.width * grow;
      const h = rect.height * grow;
      // Centred on the viewport until the expansion carries it onto the hero art.
      const cx = vw / 2 + (rect.left + rect.width / 2 - vw / 2) * expand;
      const cy = vh / 2 + (rect.top + rect.height / 2 - vh / 2) * expand;

      if (windowRef.current) {
        const dx = cx - (rect.left + rect.width / 2);
        const dy = cy - (rect.top + rect.height / 2);
        windowRef.current.style.transform = `translate(${dx}px, ${dy}px) scale(${Math.max(grow, 0.0001)})`;
      }

      // The emblem is the window at size zero: its four quarters sit on the window's corners.
      const emblem = easeOut(span(t, at("emblemIn")));
      const c = corner * emblem;
      const cornersOpacity = 1 - span(t, at("cornersOut"));
      const left = cx - w / 2;
      const right = cx + w / 2;
      const top = cy - h / 2;
      const bottom = cy + h / 2;
      const spots = [
        [left - c, top - c],
        [right, top - c],
        [left - c, bottom],
        [right, bottom],
      ];
      cornersRef.current.forEach((el, i) => {
        if (!el) return;
        el.style.width = el.style.height = `${c}px`;
        el.style.transform = `translate(${spots[i][0]}px, ${spots[i][1]}px)`;
        el.style.opacity = String(cornersOpacity);
      });

      // The words ride the window's sides until they fade.
      const offset = w / 2 + c + gap;
      const wordsOpacity = String(1 - span(t, at("wordsOut")));
      if (firstRef.current) {
        firstRef.current.style.transform = `translate(${cx - offset}px, ${cy}px) translate(-100%, -50%)`;
        firstRef.current.style.opacity = wordsOpacity;
      }
      if (lastRef.current) {
        lastRef.current.style.transform = `translate(${cx + offset}px, ${cy}px) translate(0, -50%)`;
        lastRef.current.style.opacity = wordsOpacity;
      }

      // Hard cuts between slides; the last frame (index SLIDES.length) is the hero figure.
      const [s0, s1] = at("slides");
      const slide = t < s0 ? -1 : Math.min(SLIDES.length, Math.floor(((t - s0) / (s1 - s0)) * SLIDES.length));
      if (slide !== shownSlide) {
        shownSlide = slide;
        slidesRef.current.forEach((el, i) => el?.toggleAttribute("data-on", i === slide));
      }

      if (introRef.current) introRef.current.style.opacity = String(1 - span(t, at("fadeOut")));
      if (t >= at("fadeOut")[1]) finish();
      else frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") finish();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("resize", measureTarget);
      resizeObserver?.disconnect();
      document.body.style.overflow = previousOverflow.current;
    };
  }, [visit]);

  if (finished) return null;

  return (
    <div key={visit} ref={introRef} className={styles.intro} aria-hidden="true">
      <div className={styles.paperGrain} />
      <span ref={firstRef} className={styles.first}>
        Rakshit
      </span>
      <span ref={lastRef} className={styles.last}>
        LODHA
      </span>

      <div ref={windowRef} className={styles.window}>
        {SLIDES.map((slide, i) => (
          <div
            key={slide.src}
            ref={(el) => {
              slidesRef.current[i] = el;
            }}
            className={styles.slide}
            style={{ background: slide.ground }}
          >
            <Image src={slide.src} alt="" fill sizes="40vw" loading="eager" className={styles.slideImage} />
          </div>
        ))}
        <div
          ref={(el) => {
            slidesRef.current[SLIDES.length] = el;
          }}
          className={`${styles.slide} ${styles.heroSlide}`}
        >
          <Image
            src="/roman-v2/hero/hero-figure-typing-1536.webp"
            alt=""
            fill
            priority
            sizes="(max-width: 700px) 100vw, 80vw"
            className={styles.heroFigure}
          />
          <Image
            src="/roman-v2/hero/hero-hands-mobile-780.webp"
            alt=""
            fill
            sizes="(max-width: 899px) 100vw, 1px"
            className={styles.heroHands}
          />
        </div>
      </div>

      {[0, 1, 2, 3].map((i) => (
        <i
          key={i}
          ref={(el) => {
            cornersRef.current[i] = el;
          }}
          className={styles.corner}
        />
      ))}
    </div>
  );
}
