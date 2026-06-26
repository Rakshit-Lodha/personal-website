"use client";

import { useCallback, useEffect, useState } from "react";
import JJOrb from "@/components/jj/JJOrb";
import { useJJSession } from "@/components/jj/JJSessionProvider";
import styles from "./JJFloatingOrb.module.css";

declare global {
  interface WindowEventMap {
    openJJ: CustomEvent;
  }
}

function getOrbSize() {
  return window.matchMedia("(max-width: 768px)").matches ? 58 : 64;
}

function shouldShowOrb() {
  const hero = document.getElementById("hero");
  const heroHeight = hero?.getBoundingClientRect().height ?? window.innerHeight;
  const heroTop = hero ? hero.getBoundingClientRect().top + window.scrollY : 0;
  return window.scrollY > heroTop + heroHeight * 0.6;
}

export default function JJFloatingOrb() {
  const { isActive, open } = useJJSession();
  const [visible, setVisible] = useState(false);
  const [size, setSize] = useState(64);

  useEffect(() => {
    const sync = () => {
      setVisible(shouldShowOrb());
      setSize(getOrbSize());
    };

    sync();
    window.addEventListener("scroll", sync, { passive: true });
    window.addEventListener("resize", sync);

    return () => {
      window.removeEventListener("scroll", sync);
      window.removeEventListener("resize", sync);
    };
  }, []);

  const openJJ = useCallback(() => {
    open();
  }, [open]);

  return (
    <button
      type="button"
      className={`${styles.button} ${visible && !isActive ? styles.buttonVisible : ""}`}
      onClick={openJJ}
      aria-label="Talk to JJ"
      data-visible={visible && !isActive}
    >
      <JJOrb size={size} state="idle" />
    </button>
  );
}
