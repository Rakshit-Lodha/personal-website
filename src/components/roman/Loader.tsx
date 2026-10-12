"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import s from "./roman.module.css";

const SEEN_KEY = "roman-entered";
/** The clip is about 1.5s; never hold a visitor longer than this if it stalls. */
const HARD_TIMEOUT_MS = 4000;

function seen() {
  try {
    return sessionStorage.getItem(SEEN_KEY) !== null;
  } catch {
    return true; // storage blocked: skip the intro rather than replay it on every visit
  }
}

function markSeen() {
  try {
    sessionStorage.setItem(SEEN_KEY, "1");
  } catch {}
}

/** Runs before paint so returning visitors, deep links and reduced motion never see the poster. */
const HIDE_BEFORE_PAINT = `try{if(sessionStorage.getItem("${SEEN_KEY}")!==null||location.hash||matchMedia("(prefers-reduced-motion: reduce)").matches)document.currentScript.parentElement.hidden=true}catch(e){document.currentScript.parentElement.hidden=true}`;

/** Once-per-session Augustus intro. The page is already rendered underneath. */
export default function Loader() {
  const [show, setShow] = useState(true);

  function enter() {
    markSeen();
    setShow(false);
  }

  useEffect(() => {
    const bypass = seen() || window.location.hash !== "" || window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const timer = window.setTimeout(enter, bypass ? 0 : HARD_TIMEOUT_MS);
    return () => window.clearTimeout(timer);
  }, []);

  return (
    <AnimatePresence>
      {show && (
        <motion.div className={s.loader} exit={{ opacity: 0 }} transition={{ duration: 0.45, ease: "easeOut" }} suppressHydrationWarning>
          <script dangerouslySetInnerHTML={{ __html: HIDE_BEFORE_PAINT }} />
          <video className={s.loaderVideo} autoPlay muted playsInline poster="/roman/loader-poster.jpg" onEnded={enter} onError={enter}>
            <source src="/roman/loader.mp4" type="video/mp4" />
          </video>
          <p className={s.loaderCredit}>FESTINA LENTE · AUGUSTUS</p>
          <button className={s.loaderSkip} onClick={enter}>
            Skip <ArrowRight size={16} aria-hidden="true" />
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
