"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import styles from "./IntroReveal.module.css";

const DURATION_MS = 5600;

export default function IntroReveal() {
  const [finished, setFinished] = useState(false);
  const [visit, setVisit] = useState(0);
  const finishedRef = useRef(false);
  const previousOverflow = useRef("");
  const introRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // A cached page can be restored without remounting React. Recreate the overlay so
    // its CSS animations start from frame one on every back/forward visit as well.
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

    // Browser scroll restoration and hash links must not start the reveal halfway
    // down the page, where its artwork can no longer meet the hero.
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
    const target = document.querySelector<HTMLElement>("[data-intro-art]");
    // The artwork box sits at the hero art's final rect and is flown in with transforms only
    // (centre offset + scale), so the reveal never animates layout and adds no layout shift.
    const measureTarget = () => {
      if (!target || !introRef.current || !target.offsetWidth) return;
      const rect = target.getBoundingClientRect();
      const introWidth = window.matchMedia("(max-width: 700px)").matches
        ? window.innerWidth * 0.72
        : Math.min(window.innerWidth * 0.45, 680);
      const style = introRef.current.style;
      style.setProperty("--box-x", `${rect.left}px`);
      style.setProperty("--box-y", `${rect.top}px`);
      style.setProperty("--box-w", `${rect.width}px`);
      style.setProperty("--box-h", `${rect.height}px`);
      style.setProperty("--dx", `${window.innerWidth / 2 - (rect.left + rect.width / 2)}px`);
      style.setProperty("--dy", `${window.innerHeight / 2 - (rect.top + rect.height / 2)}px`);
      style.setProperty("--s", `${introWidth / rect.width}`);
    };
    measureTarget();
    const settledMeasure = window.setTimeout(measureTarget, 1700);
    const resizeObserver = target ? new ResizeObserver(measureTarget) : null;
    if (target) resizeObserver?.observe(target);
    window.addEventListener("resize", measureTarget);

    previousOverflow.current = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const finish = () => {
      if (finishedRef.current) return;
      finishedRef.current = true;
      document.body.style.overflow = previousOverflow.current;
      setFinished(true);
    };
    const duration = window.matchMedia("(max-width: 700px)").matches ? 4400 : DURATION_MS;
    const timer = window.setTimeout(finish, duration);
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") finish();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => {
      window.clearTimeout(timer);
      window.clearTimeout(settledMeasure);
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
      <div className={styles.name}>
        <span className={styles.first}>Rakshit</span>
        <span className={styles.emblem}><i /><i /><i /><i /></span>
        <span className={styles.last}>LODHA</span>
      </div>

      <div className={`${styles.fragment} ${styles.fragmentOne}`}>
        <Image src="/roman-v2/projects/projects-head-300.webp" alt="" fill sizes="20vw" />
      </div>
      <div className={`${styles.fragment} ${styles.fragmentTwo}`}>
        <Image src="/roman-v2/career/career-hands-560.webp" alt="" fill sizes="22vw" />
      </div>
      <div className={`${styles.fragment} ${styles.fragmentThree}`}>
        <Image src="/roman-v2/beyond/beyond-music-536.webp" alt="" fill sizes="24vw" />
      </div>

      <div className={styles.artwork}>
        <span className={styles.cornerTopLeft} />
        <span className={styles.cornerTopRight} />
        <span className={styles.cornerBottomLeft} />
        <span className={styles.cornerBottomRight} />
        <Image
          src="/roman-v2/hero/hero-figure-typing-1536.webp"
          alt=""
          fill
          priority
          sizes="(max-width: 700px) 85vw, 50vw"
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
  );
}
