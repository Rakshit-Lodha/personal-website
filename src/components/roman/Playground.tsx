"use client";

import Link from "next/link";
import { ArrowRight, FlaskConical, Music } from "lucide-react";
import { useMusic } from "@/components/music/MusicPlayerProvider";
import { SectionLabel } from "./parts";
import SceneIn from "./SceneIn";
import s from "./roman.module.css";

/** `children` is the server-rendered WHOOP card. */
export default function Playground({ children }: { children: React.ReactNode }) {
  const { openSheet } = useMusic();

  return (
    <section id="playground" className={`${s.section} ${s.plaster} ${s.playground}`}>
      <SceneIn name="playground" className={s.playgroundArt} />
      <div className={`${s.inner} ${s.grid} ${s.playgroundGrid}`}>
        <div>
          <SectionLabel n="06" title="Playground" />
          <h2 className={s.h2}>
            Outside the <br />
            day job
          </h2>
          <p className={s.lede}>Experiments, music and a few other explorations.</p>
          <div className={`${s.panel} ${s.rows}`}>
            <Link href="/city" className={s.row}>
              <FlaskConical aria-hidden="true" />
              <span>Experiments</span>
              <ArrowRight size={20} aria-hidden="true" />
            </Link>
            <button className={s.row} onClick={openSheet}>
              <Music aria-hidden="true" />
              <span>Music</span>
              <ArrowRight size={20} aria-hidden="true" />
            </button>
          </div>
        </div>
        {children}
      </div>
    </section>
  );
}
