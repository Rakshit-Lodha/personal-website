"use client";

import Image from "next/image";
import { AnimatePresence, motion, useMotionValue, useSpring } from "framer-motion";
import { ArrowDown, Menu, Mic, Pause, Play, Radio, X } from "lucide-react";
import { PointerEvent, useEffect, useMemo, useRef, useState } from "react";
import styles from "./wavelength.module.css";

type Project = {
  id: string;
  title: string;
  copy: string;
  image: string;
  href: string;
};

const projects: Project[] = [
  { id: "01", title: "KRUX", copy: "AI news, made digestible.", image: "/landing/krux-banner.png", href: "https://krux.news/" },
  { id: "02", title: "MF SEARCH", copy: "Intent-aware discovery across 16,197 mutual funds.", image: "/landing/mf-search-banner.png", href: "https://mf-ai-search.streamlit.app/" },
  { id: "03", title: "A", copy: "Augustus, a voice-first guide to my work and thinking.", image: "/landing/ai-hiring-chat-banner.png", href: "/chat" },
];

const story = [
  { company: "LearnApp", note: "My first builder instincts.", x: 9, y: 42 },
  { company: "INDmoney", note: "Learning at product scale.", x: 32, y: 66 },
  { company: "ET Money", note: "Products, systems, and AI.", x: 62, y: 38 },
  { company: "Paytm Money", note: "Agents and the app experience.", x: 89, y: 58 },
];

function ChromeDefs({ id }: { id: string }) {
  return (
    <defs>
      <linearGradient id={`${id}-chrome`} x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#151515" />
        <stop offset=".18" stopColor="#f9f6ec" />
        <stop offset=".34" stopColor="#555" />
        <stop offset=".52" stopColor="#fffdf5" />
        <stop offset=".69" stopColor="#777" />
        <stop offset=".84" stopColor="#f4efe2" />
        <stop offset="1" stopColor="#111" />
      </linearGradient>
      <filter id={`${id}-shadow`} x="-20%" y="-40%" width="140%" height="180%">
        <feDropShadow dx="0" dy="18" stdDeviation="16" floodColor="#000" floodOpacity=".72" />
      </filter>
      <filter id={`${id}-glow`} x="-50%" y="-50%" width="200%" height="200%">
        <feGaussianBlur stdDeviation="5" result="blur" />
        <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
      </filter>
    </defs>
  );
}

function ChromePath({ d, id, width = 44 }: { d: string; id: string; width?: number }) {
  return (
    <>
      <path d={d} fill="none" stroke="#050505" strokeWidth={width + 18} strokeLinecap="round" filter={`url(#${id}-shadow)`} />
      <path d={d} fill="none" stroke={`url(#${id}-chrome)`} strokeWidth={width} strokeLinecap="round" />
      <path d={d} fill="none" stroke="#dbff00" strokeWidth="2.4" strokeLinecap="round" opacity=".9" filter={`url(#${id}-glow)`} />
      <path d={d} fill="none" stroke="#fff" strokeWidth="1" strokeLinecap="round" opacity=".55" transform="translate(0 -7)" />
    </>
  );
}

function CustomCursor() {
  const x = useMotionValue(-100);
  const y = useMotionValue(-100);
  const sx = useSpring(x, { stiffness: 800, damping: 48 });
  const sy = useSpring(y, { stiffness: 800, damping: 48 });
  const [label, setLabel] = useState("");

  useEffect(() => {
    const move = (event: MouseEvent) => {
      x.set(event.clientX - 9);
      y.set(event.clientY - 9);
      setLabel((event.target as HTMLElement).closest<HTMLElement>("[data-cursor]")?.dataset.cursor ?? "");
    };
    window.addEventListener("mousemove", move);
    return () => window.removeEventListener("mousemove", move);
  }, [x, y]);

  return <motion.div className={styles.cursor} data-active={Boolean(label)} style={{ x: sx, y: sy }}>{label && <span>{label}</span>}</motion.div>;
}

function Header({ openMenu }: { openMenu: () => void }) {
  return (
    <header className={styles.header}>
      <a href="#top">Rakshit Lodha</a>
      <nav><a href="#work">Work</a><a href="#story">Story</a><a href="#play">Play</a></nav>
      <button onClick={openMenu} aria-label="Open menu"><Menu /></button>
    </header>
  );
}

function MenuOverlay({ close }: { close: () => void }) {
  return (
    <motion.div className={styles.menu} initial={{ y: "-100%" }} animate={{ y: 0 }} exit={{ y: "-100%" }} transition={{ duration: .65, ease: [0.76, 0, 0.24, 1] }}>
      <button onClick={close} aria-label="Close menu"><X /></button>
      <span>TUNE TO</span>
      <a href="#work" onClick={close}><b>01</b> Work</a>
      <a href="#story" onClick={close}><b>02</b> Story</a>
      <a href="#play" onClick={close}><b>03</b> Play & talk</a>
    </motion.div>
  );
}

function VoiceButton({ large = false }: { large?: boolean }) {
  const [listening, setListening] = useState(false);
  return (
    <button className={`${styles.voiceButton} ${large ? styles.voiceLarge : ""}`} onClick={() => setListening((value) => !value)} data-active={listening} data-cursor={listening ? "stop" : "talk"}>
      <Mic size={large ? 23 : 17} />
      <span>{listening ? "Listening…" : "Talk to A"}</span>
      <i className={styles.voiceWave}>{Array.from({ length: 15 }).map((_, index) => <b key={index} />)}</i>
    </button>
  );
}

function HeroWave({ amplitude, setAmplitude }: { amplitude: number; setAmplitude: (value: number) => void }) {
  const [pulling, setPulling] = useState(false);
  const d = useMemo(() => `M -40 320 C 85 ${80 + amplitude}, 210 ${560 - amplitude}, 350 315 S 625 ${55 + amplitude}, 765 320 S 1040 ${575 - amplitude}, 1190 290 S 1440 ${90 + amplitude}, 1610 300`, [amplitude]);

  const pull = (event: PointerEvent<SVGSVGElement>) => {
    if (!pulling) return;
    const box = event.currentTarget.getBoundingClientRect();
    setAmplitude(Math.max(-105, Math.min(105, ((event.clientY - box.top) / box.height - .5) * 210)));
  };

  return (
    <svg
      className={styles.heroWave}
      viewBox="0 0 1500 620"
      preserveAspectRatio="none"
      onPointerDown={(event) => { setPulling(true); event.currentTarget.setPointerCapture(event.pointerId); }}
      onPointerMove={pull}
      onPointerUp={() => setPulling(false)}
      data-cursor="pull"
    >
      <ChromeDefs id="hero" />
      <motion.path d={d} animate={{ d }} transition={{ type: "spring", stiffness: 120, damping: 18 }} fill="none" stroke="#020202" strokeWidth="77" strokeLinecap="round" filter="url(#hero-shadow)" />
      <motion.path d={d} animate={{ d }} transition={{ type: "spring", stiffness: 120, damping: 18 }} fill="none" stroke="url(#hero-chrome)" strokeWidth="54" strokeLinecap="round" />
      <motion.path d={d} animate={{ d }} transition={{ type: "spring", stiffness: 120, damping: 18 }} fill="none" stroke="#dbff00" strokeWidth="3" strokeLinecap="round" filter="url(#hero-glow)" />
    </svg>
  );
}

function Hero({ serifClassName }: { serifClassName: string }) {
  const [amplitude, setAmplitude] = useState(0);
  return (
    <section id="top" className={styles.hero}>
      <div className={styles.heroKicker}>PERSONAL FREQUENCY / 2026</div>
      <h1 className={serifClassName}><span>A little out</span><span>of frequency.</span></h1>
      <HeroWave amplitude={amplitude} setAmplitude={setAmplitude} />
      <div className={styles.pullHint}><i /> pull</div>
      <div className={styles.tuner}>
        {[["01", "WORK"], ["02", "PLAY"], ["03", "STORY"]].map(([number, label], index) => (
          <a key={label} href={index === 0 ? "#work" : index === 1 ? "#play" : "#story"} data-active={index === 1}>
            <i /><b>{number}</b><span>{label}</span>
          </a>
        ))}
      </div>
      <div className={styles.heroFooter}>
        <a href="#work">Scroll to tune <ArrowDown size={16} /></a>
        <VoiceButton />
      </div>
    </section>
  );
}

function ProjectFrame({ project }: { project: Project }) {
  const frame = "M 90 70 C 25 185, 38 420, 125 525 C 325 590, 645 570, 840 490 C 925 355, 910 140, 825 75 C 610 5, 275 12, 90 70";
  return (
    <motion.div className={styles.projectFrame} key={project.title} initial={{ opacity: 0, scale: .9, rotate: 4 }} animate={{ opacity: 1, scale: 1, rotate: 0 }} transition={{ type: "spring", stiffness: 110, damping: 19 }}>
      <svg viewBox="0 0 930 610" preserveAspectRatio="none"><ChromeDefs id="frame" /><ChromePath id="frame" d={frame} width={34} /></svg>
      <div className={styles.projectScreen}>
        <div><b>{project.title}</b><span>Discover&nbsp;&nbsp; For you&nbsp;&nbsp; Library</span></div>
        <Image src={project.image} alt="" fill sizes="(max-width: 760px) 90vw, 55vw" />
      </div>
    </motion.div>
  );
}

function Work({ serifClassName }: { serifClassName: string }) {
  const [active, setActive] = useState(0);
  const project = projects[active];
  return (
    <section id="work" className={styles.work}>
      <div className={styles.index}>01 / WORK</div>
      <div className={styles.workCopy}>
        <h2 className={serifClassName}>Ideas,<br />in the wild<span>.</span></h2>
        <AnimatePresence mode="wait"><motion.div key={project.title} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
          <p><b>{project.title}</b> / {project.copy}</p>
        </motion.div></AnimatePresence>
        <div className={styles.projectTabs} role="tablist">
          {projects.map((item, index) => <button key={item.title} onClick={() => setActive(index)} role="tab" aria-selected={active === index} data-cursor="tune">{item.title}</button>)}
        </div>
        <div className={styles.workActions}>
          <a href={project.href} target={project.href.startsWith("http") ? "_blank" : undefined} rel="noreferrer">Open project</a>
          <a href="/chat"><Radio size={16} /> Ask A</a>
        </div>
      </div>
      <ProjectFrame project={project} />
      <div className={styles.swipeHint}>Tap a frequency to change the project</div>
    </section>
  );
}

function Story({ serifClassName }: { serifClassName: string }) {
  const [active, setActive] = useState(2);
  const path = "M 45 210 C 150 12, 275 390, 430 205 S 720 5, 860 220 S 1110 370, 1350 160";
  return (
    <section id="story" className={styles.story}>
      <div className={styles.index}>02 / STORY</div>
      <h2 className={serifClassName}>A few changes<br />of direction<span>.</span></h2>
      <p>Different problems.<br />Same curiosity.</p>
      <div className={styles.storyPath}>
        <svg viewBox="0 0 1400 430" preserveAspectRatio="none"><ChromeDefs id="story" /><ChromePath id="story" d={path} width={26} /></svg>
        {story.map((chapter, index) => (
          <button key={chapter.company} style={{ left: `${chapter.x}%`, top: `${chapter.y}%` }} data-active={active === index} onClick={() => setActive(index)} data-cursor="read">
            <i /><b>{chapter.company}</b>{active === index && <motion.span initial={{ opacity: 0, y: 7 }} animate={{ opacity: 1, y: 0 }}>{chapter.note}</motion.span>}
          </button>
        ))}
      </div>
      <div className={styles.storyMobileCopy}>
        <b>{story[active].company}</b><span>{story[active].note}</span>
      </div>
    </section>
  );
}

function Equalizer({ active }: { active: boolean }) {
  return <div className={`${styles.equalizer} ${active ? styles.equalizerActive : ""}`}>{Array.from({ length: 44 }).map((_, index) => <i key={index} style={{ animationDelay: `${-(index % 8) * .11}s` }} />)}</div>;
}

function PlaySection({ serifClassName }: { serifClassName: string }) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [playing, setPlaying] = useState(false);
  const [bend, setBend] = useState(0);
  const d = useMemo(() => `M -50 180 C 120 ${35 + bend}, 210 ${315 - bend}, 365 170 S 640 ${15 + bend}, 790 175 S 1045 ${330 - bend}, 1210 160 S 1430 ${30 + bend}, 1580 175`, [bend]);
  const [dragging, setDragging] = useState(false);

  const dragWave = (event: PointerEvent<SVGSVGElement>) => {
    if (!dragging) return;
    const box = event.currentTarget.getBoundingClientRect();
    setBend(Math.max(-90, Math.min(90, ((event.clientY - box.top) / box.height - .5) * 180)));
  };

  const toggle = async () => {
    if (!audioRef.current) return;
    if (playing) audioRef.current.pause(); else await audioRef.current.play();
    setPlaying(!playing);
  };

  return (
    <section id="play" className={styles.play}>
      <audio ref={audioRef} src="/music/open-it-up.mp3" onEnded={() => setPlaying(false)} />
      <div className={styles.index}>03 / PLAY & TALK</div>
      <h2 className={serifClassName}>Let’s find<br />a frequency<span>.</span></h2>
      <p>Ideas sound better together.</p>
      <svg className={styles.playWave} viewBox="0 0 1500 360" preserveAspectRatio="none" onPointerDown={(event) => { setDragging(true); event.currentTarget.setPointerCapture(event.pointerId); }} onPointerMove={dragWave} onPointerUp={() => setDragging(false)} data-cursor="pluck">
        <ChromeDefs id="play" />
        <motion.path d={d} animate={{ d }} transition={{ type: "spring", stiffness: 140, damping: 17 }} fill="none" stroke="#050505" strokeWidth="65" strokeLinecap="round" filter="url(#play-shadow)" />
        <motion.path d={d} animate={{ d }} transition={{ type: "spring", stiffness: 140, damping: 17 }} fill="none" stroke="url(#play-chrome)" strokeWidth="42" strokeLinecap="round" />
        <motion.path d={d} animate={{ d }} transition={{ type: "spring", stiffness: 140, damping: 17 }} fill="none" stroke="#dbff00" strokeWidth="2" />
      </svg>
      <div className={styles.playHint}>← drag to play →</div>
      <div className={styles.playControls}>
        <button><Radio /><span>Tune</span></button>
        <button onClick={toggle} data-active={playing}>{playing ? <Pause /> : <Play fill="currentColor" />}<span>{playing ? "Pause" : "Listen"}</span></button>
        <VoiceButton large />
      </div>
      <Equalizer active={playing} />
      <footer><span>© 2026 Rakshit Lodha</span><div><a href="mailto:rlodha1@gmail.com">Email</a><a href="https://www.linkedin.com/in/rakshit-lodha-360241187/">LinkedIn</a><a href="https://github.com/Rakshit-Lodha">GitHub</a></div><a href="#top">Back to top ↑</a></footer>
    </section>
  );
}

export default function WavelengthExperience({ serifClassName }: { serifClassName: string }) {
  const [menu, setMenu] = useState(false);
  return (
    <main className={styles.page}>
      <CustomCursor />
      <Header openMenu={() => setMenu(true)} />
      <AnimatePresence>{menu && <MenuOverlay close={() => setMenu(false)} />}</AnimatePresence>
      <Hero serifClassName={serifClassName} />
      <Work serifClassName={serifClassName} />
      <Story serifClassName={serifClassName} />
      <PlaySection serifClassName={serifClassName} />
    </main>
  );
}
