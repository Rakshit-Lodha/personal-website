import Link from "next/link";
import type { ReactNode } from "react";
import s from "@/app/roman-v2/reading/reading.module.css";

export default function ReadingShell({
  mode,
  humanHref,
  agentHref,
  children,
}: {
  mode: "human" | "agent";
  humanHref: string;
  agentHref: string;
  children: ReactNode;
}) {
  return (
    <div className={s.readingRoot} data-mode={mode}>
      <header className={s.siteHeader}>
        <Link href="/" className={s.wordmark}>Rakshit Lodha</Link>
        <nav aria-label="Reading navigation">
          <Link href="/">Home</Link>
          <Link href="/reading" aria-current="page">Reading</Link>
        </nav>
      </header>

      {children}

      <nav className={s.modeNav} aria-label="Choose reading view">
        <Link href={humanHref} aria-current={mode === "human" ? "page" : undefined}>
          <span aria-hidden="true">{mode === "human" ? "●" : "○"}</span> Human
        </Link>
        <Link href={agentHref} aria-current={mode === "agent" ? "page" : undefined}>
          <span aria-hidden="true">{mode === "agent" ? "●" : "○"}</span> Agent
        </Link>
      </nav>
    </div>
  );
}
