"use client";

import Image from "next/image";
import { AnimatePresence, motion, useMotionValue, useSpring } from "framer-motion";
import { ArrowDown, Menu, Mic, Pause, Play, X } from "lucide-react";
import { PointerEvent, useEffect, useRef, useState } from "react";
import styles from "./curious.module.css";

type Project = {
  id: string;
  title: string;
  subtitle: string;
  image: string;
  color: string;
  href: string;
};

const projects: Project[] = [
  {
    id: "01",
    title: "KRUX",
    subtitle: "AI news, made digestible.",
    image: "/landing/krux-banner.png",
    color: "#ff5d18",
    href: "https://krux.news/",
  },
  {
    id: "02",
    title: "MF SEARCH",
    subtitle: "Search across 16,197 mutual funds by intent.",
    image: "/landing/mf-search-banner.png",
    color: "#1748e9",
    href: "https://mf-ai-search.streamlit.app/",
  },
  {
    id: "03",
    title: "A",
    subtitle: "A voice-first guide to my work and thinking.",
    image: "/landing/ai-hiring-chat-banner.png",
    color: "#111111",
    href: "/chat",
  },
];

const chapters = [
  { year: "2018", company: "LearnApp", note: "My first builder instincts." },
  { year: "2020", company: "INDmoney", note: "Learning at product scale." },
  { year: "2022", company: "ET Money", note: "Products, systems, and AI." },
  { year: "2026", company: "Paytm Money", note: "Agents and the app experience." },
];

function Cursor() {
  const x = useMotionValue(-100);
  const y = useMotionValue(-100);
  const sx = useSpring(x, { stiffness: 700, damping: 45 });
  const sy = useSpring(y, { stiffness: 700, damping: 45 });
  const [label, setLabel] = useState("");

  useEffect(() => {
    const move = (event: MouseEvent) => {
      x.set(event.clientX - 16);
      y.set(event.clientY - 16);
      const target = (event.target as HTMLElement).closest<HTMLElement>("[data-cursor]");
      setLabel(target?.dataset.cursor ?? "");
    };
    window.addEventListener("mousemove", move);
    return () => window.removeEventListener("mousemove", move);
  }, [x, y]);

  return (
    <motion.div className={styles.cursor} style={{ x: sx, y: sy }} data-active={Boolean(label)}>
      {label && <span>{label}</span>}
    </motion.div>
  );
}

function MenuOverlay({ close }: { close: () => void }) {
  return (
    <motion.div
      className={styles.menuOverlay}
      initial={{ clipPath: "circle(0% at 92% 7%)" }}
      animate={{ clipPath: "circle(150% at 92% 7%)" }}
      exit={{ clipPath: "circle(0% at 92% 7%)" }}
      transition={{ duration: 0.7, ease: [0.76, 0, 0.24, 1] }}
    >
      <button onClick={close} aria-label="Close menu"><X /></button>
      <a href="#work" onClick={close}>Things I build <span>01</span></a>
      <a href="#story" onClick={close}>How I got here <span>02</span></a>
      <a href="#stay" onClick={close}>Stay a while <span>03</span></a>
    </motion.div>
  );
}

function JJControl({ expanded = false }: { expanded?: boolean }) {
  const [listening, setListening] = useState(false);
  return (
    <button
      className={`${styles.jjControl} ${expanded ? styles.jjExpanded : ""}`}
      onClick={() => setListening((value) => !value)}
      data-cursor={listening ? "stop" : "talk"}
      aria-pressed={listening}
    >
      <span className={styles.jjBadge}>{listening ? <Pause size={15} /> : "A"}</span>
      <span>{listening ? "Listening…" : "Talk to A"}</span>
      <span className={`${styles.wave} ${listening ? styles.waveActive : ""}`} aria-hidden="true">
        {Array.from({ length: 12 }).map((_, index) => <i key={index} />)}
      </span>
    </button>
  );
}

function Header({ onMenu }: { onMenu: () => void }) {
  return (
    <header className={styles.header}>
      <a href="#top" className={styles.wordmark}>Rakshit Lodha</a>
      <nav>
        <a href="#work">Work</a>
        <a href="#story">Story</a>
        <a href="#stay">Play</a>
      </nav>
      <button className={styles.menuButton} onClick={onMenu} aria-label="Open menu"><Menu /></button>
    </header>
  );
}

function HeroObject({ className, children, dragLabel = "drag" }: { className: string; children: React.ReactNode; dragLabel?: string }) {
  return (
    <motion.div
      className={className}
      drag
      dragElastic={0.16}
      dragConstraints={{ left: -90, right: 90, top: -70, bottom: 70 }}
      whileDrag={{ scale: 1.06, rotate: 3, cursor: "grabbing" }}
      whileHover={{ scale: 1.025 }}
      transition={{ type: "spring", stiffness: 280, damping: 23 }}
      data-cursor={dragLabel}
    >
      {children}
    </motion.div>
  );
}

function Hero({ displayClassName }: { displayClassName: string }) {
  return (
    <section id="top" className={styles.hero}>
      <div className={`${styles.heroTitle} ${displayClassName}`} aria-label="Always curious">
        <span>ALWAYS</span>
        <span>CURIOUS.</span>
      </div>
      <HeroObject className={styles.ribbon} dragLabel="pull">
        <span /><span /><span />
      </HeroObject>
      <HeroObject className={styles.cartridge}>
        <span className={styles.cartridgeRidge} />
        <span className={styles.cartridgeLabel}>KRUX</span>
        <span className={styles.cartridgeScrew} />
      </HeroObject>
      <HeroObject className={styles.notebook} dragLabel="open">
        <span>NOTES</span>
        <i />
      </HeroObject>
      <HeroObject className={styles.record} dragLabel="spin">
        <span>GOOD<br />IDEAS</span>
      </HeroObject>
      <HeroObject className={styles.speaker} dragLabel="talk">
        <span className={styles.speakerGrille}>A</span>
        <i />
      </HeroObject>
      <div className={styles.heroNote}>01 / THINGS I BUILD</div>
      <div className={styles.dragHint}><span /> drag the objects</div>
      <div className={styles.heroBottom}>
        <a href="#work">Scroll to explore <ArrowDown size={18} /></a>
        <JJControl />
      </div>
    </section>
  );
}

function Work({ displayClassName }: { displayClassName: string }) {
  const [active, setActive] = useState(0);
  const project = projects[active];
  return (
    <section id="work" className={styles.work} style={{ "--project-color": project.color } as React.CSSProperties}>
      <div className={styles.sectionEyebrow}>01 / OPEN A PROJECT</div>
      <h2 className={`${styles.sectionTitle} ${displayClassName}`}>THINGS I BUILD.</h2>
      <div className={styles.projectGrid}>
        <div className={styles.projectMeta}>
          <div className={styles.projectTabs} role="tablist" aria-label="Projects">
            {projects.map((item, index) => (
              <button
                key={item.title}
                onClick={() => setActive(index)}
                aria-selected={active === index}
                role="tab"
                data-cursor="view"
              >
                <span>{item.id}</span>{item.title}
              </button>
            ))}
          </div>
          <AnimatePresence mode="wait">
            <motion.div key={project.title} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }}>
              <p>{project.subtitle}</p>
              <div className={styles.projectActions}>
                <a href={project.href} target={project.href.startsWith("http") ? "_blank" : undefined} rel="noreferrer" data-cursor="open">
                  Open project
                </a>
                <a href="/chat" data-cursor="ask"><Mic size={17} /> Ask A</a>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
        <motion.div
          className={styles.projectObject}
          key={project.title}
          initial={{ rotate: -7, scale: 0.88, opacity: 0 }}
          animate={{ rotate: -2, scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 120, damping: 18 }}
          drag="x"
          dragConstraints={{ left: 0, right: 0 }}
          dragElastic={0.12}
          onDragEnd={(_, info) => {
            if (Math.abs(info.offset.x) > 55) setActive((value) => (value + (info.offset.x < 0 ? 1 : projects.length - 1)) % projects.length);
          }}
          data-cursor="swipe"
        >
          <div className={styles.projectCase}>
            <span className={styles.caseName}>{project.title}</span>
            <div className={styles.projectScreen}>
              <div className={styles.screenBar}><b>{project.title}</b><span>Discover&nbsp;&nbsp; For you&nbsp;&nbsp; Library</span></div>
              <Image src={project.image} alt="" fill sizes="(max-width: 700px) 90vw, 55vw" />
            </div>
          </div>
        </motion.div>
      </div>
      <div className={styles.mobileNext}>Swipe the object to explore <span>→</span></div>
    </section>
  );
}

function Story({ displayClassName }: { displayClassName: string }) {
  const [active, setActive] = useState(2);
  const turn = (direction: number) => setActive((value) => Math.min(chapters.length - 1, Math.max(0, value + direction)));
  return (
    <section id="story" className={styles.story}>
      <div className={styles.sectionEyebrow}>02 / TURN THE PAGE</div>
      <h2 className={`${styles.sectionTitle} ${displayClassName}`}>HOW I GOT HERE.</h2>
      <div className={styles.notebookStage}>
        <motion.div
          className={styles.openBook}
          drag="x"
          dragConstraints={{ left: 0, right: 0 }}
          dragElastic={0.1}
          onDragEnd={(_, info) => Math.abs(info.offset.x) > 50 && turn(info.offset.x < 0 ? 1 : -1)}
          data-cursor="turn"
        >
          <div className={styles.bookSpine} />
          <div className={styles.bookCopy}>
            <em>Different problems.<br />Same curiosity.</em>
            <AnimatePresence mode="wait">
              <motion.div key={active} initial={{ opacity: 0, rotateY: 26, x: 30 }} animate={{ opacity: 1, rotateY: 0, x: 0 }} exit={{ opacity: 0, rotateY: -26, x: -30 }}>
                <small>{chapters[active].year}</small>
                <h3>{chapters[active].company}</h3>
                <p>{chapters[active].note}</p>
              </motion.div>
            </AnimatePresence>
          </div>
          <div className={styles.bookPath}>
            <svg viewBox="0 0 600 180" preserveAspectRatio="none" aria-hidden="true">
              <path d="M18,118 C125,22 175,152 270,72 C350,4 410,154 580,50" />
            </svg>
            {chapters.map((chapter, index) => (
              <button key={chapter.company} className={styles[`chapter${index}`]} data-active={active === index} onClick={() => setActive(index)}>
                <i /> <span>{chapter.company}</span>
              </button>
            ))}
          </div>
          <div className={styles.bookmark} />
        </motion.div>
        <div className={styles.pageControls}>
          <button onClick={() => turn(-1)} disabled={active === 0}>← Previous</button>
          <span>{active + 1} / {chapters.length}</span>
          <button onClick={() => turn(1)} disabled={active === chapters.length - 1}>Next →</button>
        </div>
      </div>
    </section>
  );
}

function Stay({ displayClassName }: { displayClassName: string }) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [playing, setPlaying] = useState(false);
  const [rotation, setRotation] = useState(0);

  const toggleMusic = async () => {
    if (!audioRef.current) return;
    if (playing) audioRef.current.pause();
    else await audioRef.current.play();
    setPlaying(!playing);
  };

  const spin = (event: PointerEvent<HTMLDivElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const x = event.clientX - rect.left - rect.width / 2;
    const y = event.clientY - rect.top - rect.height / 2;
    setRotation(Math.atan2(y, x) * (180 / Math.PI) + 90);
  };

  return (
    <section id="stay" className={styles.stay}>
      <audio ref={audioRef} src="/music/open-it-up.mp3" onEnded={() => setPlaying(false)} />
      <div className={styles.sectionEyebrow}>03 / STAY A WHILE</div>
      <h2 className={`${styles.sectionTitle} ${displayClassName}`}>STAY A WHILE.</h2>
      <div className={styles.stayObjects}>
        <div
          className={`${styles.giantRecord} ${playing ? styles.spinning : ""}`}
          style={playing ? undefined : { transform: `rotate(${rotation}deg)` }}
          onPointerMove={(event) => event.buttons === 1 && spin(event)}
          data-cursor="spin"
        ><span>GOOD IDEAS<br />PLAY LONGER :)</span></div>
        <div className={styles.giantSpring}>{Array.from({ length: 6 }).map((_, index) => <i key={index} />)}</div>
        <div className={styles.giantSpeaker}><span>A</span><i /></div>
      </div>
      <div className={styles.stayControls}>
        <button onClick={toggleMusic} data-cursor={playing ? "pause" : "play"}>
          {playing ? <Pause size={17} /> : <Play size={17} fill="currentColor" />} {playing ? "Pause music" : "Play some music"}
        </button>
        <JJControl expanded />
        <a href="mailto:rlodha1@gmail.com" data-cursor="hello">Say hello</a>
      </div>
      <footer>
        <span>© 2026 Rakshit Lodha</span>
        <div><a href="mailto:rlodha1@gmail.com">Email</a><a href="https://www.linkedin.com/in/rakshit-lodha-360241187/">LinkedIn</a><a href="https://github.com/Rakshit-Lodha">GitHub</a></div>
        <a href="#top">Back to top ↑</a>
      </footer>
    </section>
  );
}

export default function CuriousExperience({ displayClassName }: { displayClassName: string }) {
  const [menuOpen, setMenuOpen] = useState(false);
  return (
    <main className={styles.page}>
      <Cursor />
      <Header onMenu={() => setMenuOpen(true)} />
      <AnimatePresence>{menuOpen && <MenuOverlay close={() => setMenuOpen(false)} />}</AnimatePresence>
      <Hero displayClassName={displayClassName} />
      <Work displayClassName={displayClassName} />
      <Story displayClassName={displayClassName} />
      <Stay displayClassName={displayClassName} />
    </main>
  );
}
