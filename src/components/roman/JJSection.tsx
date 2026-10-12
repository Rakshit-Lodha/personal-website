"use client";

import Link from "next/link";
import { ArrowRight, Keyboard, Mic } from "lucide-react";
import { useJJSession } from "@/components/jj/JJSessionProvider";
import { SectionLabel } from "./parts";
import SceneIn from "./SceneIn";
import s from "./roman.module.css";

const QUESTIONS = ["What has Rakshit built?", "What’s he writing about?", "Where has he worked?"];

export default function JJSection() {
  const { open } = useJJSession();

  return (
    <section id="jj" className={`${s.plaster} ${s.jj}`}>
      <SceneIn name="closing" className={s.jjArt} />
      <div className={s.jjPanel}>
        <SectionLabel n="07" title="Talk to JJ" />
        <h2 className={s.h2}>Ask JJ about me</h2>
        <p className={s.lede}>My AI voice guide.</p>
        {/* The microphone is only requested after this tap. */}
        <button className={s.micButton} onClick={open}>
          <span>
            <Mic size={40} aria-hidden="true" />
          </span>
          <span>Tap to talk</span>
        </button>
        <p className={s.or}>Or</p>
        <ul className={`${s.rows} ${s.chips}`}>
          <li>
            <Link href="/chat" className={`${s.row} ${s.typing}`}>
              <Keyboard aria-hidden="true" />
              <span>Prefer typing?</span>
              <ArrowRight size={20} aria-hidden="true" />
            </Link>
          </li>
          {QUESTIONS.map((question) => (
            <li key={question}>
              <Link href={`/chat?q=${encodeURIComponent(question)}`} className={s.row}>
                <span>{question}</span>
                <ArrowRight size={20} aria-hidden="true" />
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
