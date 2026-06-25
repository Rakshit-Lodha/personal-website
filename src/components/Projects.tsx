"use client";

import Image from "next/image";
import NextLink from "next/link";

type Link = { label: string; href: string };

type Project = {
  id: string;
  banner: string;
  tags: string;
  desc: string;
  bullets: string[];
  links: Link[];
};

type MoreProject = {
  title: string;
  desc: string;
  links: Link[];
};

const PROJECTS: Project[] = [
  {
    id: "krux-new",
    banner: "/landing/krux-banner.png",
    tags: "AI CURATION | WEB RESEARCH | PUBLISHING",
    desc: "AI news product that turns fast-moving AI updates into short, swipeable stories.",
    bullets: [
      "Built the content pipeline and consumer web app.",
      "Designed a multi-stage AI workflow from ingestion to publishing.",
    ],
    links: [
      { label: "GitHub", href: "https://github.com/Rakshit-Lodha/ai-times" },
      { label: "Live Demo", href: "https://krux.news/" },
      { label: "Know More", href: `/chat?q=${encodeURIComponent("Tell me more about Krux")}` },
    ],
  },
  {
    id: "mf-semantic-search",
    banner: "/landing/mf-search-banner.png",
    tags: "EMBEDDINGS | INTENT ROUTING | CHROMADB",
    desc: "Semantic search engine across 16,197 mutual funds with intent-aware routing.",
    bullets: [
      "Routes queries into lookup, comparison, or filtered discovery.",
      "Handles typos, partial names, categories, and investment styles.",
      "Generates fund analysis across returns, risk, and expense ratios.",
    ],
    links: [
      { label: "GitHub", href: "https://github.com/Rakshit-Lodha/mf-search" },
      { label: "Live Demo", href: "https://mf-ai-search.streamlit.app/" },
      { label: "Know More", href: `/chat?q=${encodeURIComponent("Tell me more about MF Search")}` },
    ],
  },
  {
    id: "ai-hiring-chat",
    banner: "/landing/ai-hiring-chat-banner.png",
    tags: "AGENTS SDK | SSE STREAMING | JD PARSING",
    desc: "ChatGPT-style hiring assistant for recruiters to evaluate fit from a company URL, JD, upload, or question.",
    bullets: [
      "Built a standalone /chat interface with zero-state prompts, persistent composer, file chips, and streamed responses.",
      "Shipped a V3 agent pipeline with intent planning, optional company research, evidence gathering, and intent-specific answer agents.",
      "Kept V1, V2, and V3 eval history visible so quality, fit calibration, and latency tradeoffs can be compared over time.",
      "Supports PDF, DOCX, and TXT job descriptions with structured SSE final events for fit-level UI.",
    ],
    links: [
      { label: "GitHub", href: "https://github.com/Rakshit-Lodha/personal-website" },
      { label: "Live Demo", href: "/chat" },
      { label: "Know More", href: `/chat?q=${encodeURIComponent("How does the AI hiring chat work?")}` },
    ],
  },
];

const MORE_PROJECTS: MoreProject[] = [
  {
    title: "TalkToKrishna",
    desc: "RAG product grounded in 700 Bhagavad Gita verses with a 50-question eval suite.",
    links: [
      { label: "Read me", href: "https://github.com/Rakshit-Lodha/talktokrishna" },
      { label: "Know More", href: `/chat?q=${encodeURIComponent("Tell me more about TalkToKrishna")}` },
    ],
  },
  {
    title: "Evaluation Framework",
    desc: "LLM-as-judge and voice evaluation system for quality, safety, and ASR accuracy.",
    links: [
      { label: "Read me", href: "https://github.com/Rakshit-Lodha/evals" },
      { label: "Know More", href: `/chat?q=${encodeURIComponent("Tell me more about Evaluation Framework")}` },
    ],
  },
];

const MORE_BANNER = "/landing/more-banner.png";
const MORE_TAGS = "AGENTS SDK | SSE STREAMING | JD PARSING";

function LinkRow({ links, compact = false }: { links: Link[]; compact?: boolean }) {
  return (
    <div
      className="flex flex-wrap items-center"
      style={{
        gap: "clamp(10px,1.16vw,19px)",
        marginTop: compact ? 0 : "clamp(4px,0.4vw,6px)",
      }}
    >
      {links.map((l) => {
        const isInternal = l.href.startsWith("/");
        const className =
          "font-figtree inline-flex items-center text-[#456aff] no-underline transition-opacity hover:opacity-70";
        const style = {
          gap: "2px",
          fontSize: "clamp(11px,1.04vw,18px)",
          fontWeight: 500,
        };
        const content = (
          <>
            {l.label}
            <span
              className="inline-block"
              style={{ fontSize: "0.9em", transform: "rotate(45deg)" }}
              aria-hidden="true"
            >
              ↑
            </span>
          </>
        );
        return isInternal ? (
          <NextLink key={l.label} href={l.href} className={className} style={style}>
            {content}
          </NextLink>
        ) : (
          <a
            key={l.label}
            href={l.href}
            target="_blank"
            rel="noopener noreferrer"
            className={className}
            style={style}
          >
            {content}
          </a>
        );
      })}
    </div>
  );
}

function ProjectCard({ project }: { project: Project }) {
  return (
    <div
      data-jj-project-id={project.id}
      className="proj-card-hover flex flex-col"
      style={{ gap: "clamp(16px,2vw,32px)" }}
    >
      <div
        className="w-full overflow-hidden flex-shrink-0"
        style={{
          borderRadius: "clamp(8px,0.8vw,14px)",
          aspectRatio: "723 / 498",
        }}
      >
        <Image
          src={project.banner}
          alt=""
          width={723}
          height={498}
          className="block h-full w-full object-cover"
        />
      </div>
      <div className="flex flex-col" style={{ gap: "clamp(10px,1vw,16px)" }}>
        <p
          className="font-figtree uppercase text-[#8d8d8d]"
          style={{
            fontSize: "clamp(9px,0.87vw,15px)",
            letterSpacing: "0.22em",
            lineHeight: 1.3,
          }}
        >
          {project.tags}
        </p>
        <p
          className="font-figtree m-0 text-[#111]"
          style={{ fontSize: "clamp(14px,1.62vw,28px)", lineHeight: 1.45 }}
        >
          {project.desc}
        </p>
        <ul
          className="m-0 flex list-none flex-col p-0"
          style={{ gap: "clamp(8px,0.87vw,14px)" }}
        >
          {project.bullets.map((b, i) => (
            <li
              key={i}
              className="flex items-start font-figtree text-[#404040]"
              style={{
                gap: "clamp(6px,0.52vw,9px)",
                fontSize: "clamp(11px,1.04vw,18px)",
                lineHeight: 1.4,
              }}
            >
              <Image
                src="/landing/bullet-check.svg"
                alt=""
                width={22}
                height={22}
                className="flex-shrink-0"
                style={{
                  width: "clamp(13px,1.39vw,22px)",
                  height: "clamp(13px,1.39vw,22px)",
                  marginTop: "2px",
                }}
              />
              <span>{b}</span>
            </li>
          ))}
        </ul>
        <LinkRow links={project.links} />
      </div>
    </div>
  );
}

function MoreCard() {
  return (
    <div
      data-jj-project-id="more-projects"
      className="proj-card-hover flex flex-col"
      style={{ gap: "clamp(16px,2vw,32px)" }}
    >
      <div
        className="w-full overflow-hidden flex-shrink-0"
        style={{
          borderRadius: "clamp(8px,0.8vw,14px)",
          aspectRatio: "723 / 498",
        }}
      >
        <Image
          src={MORE_BANNER}
          alt=""
          width={723}
          height={498}
          className="block h-full w-full object-cover"
        />
      </div>
      <div className="flex flex-col" style={{ gap: "clamp(10px,1vw,16px)" }}>
        <p
          className="font-figtree uppercase text-[#8d8d8d]"
          style={{
            fontSize: "clamp(9px,0.87vw,15px)",
            letterSpacing: "0.22em",
            lineHeight: 1.3,
          }}
        >
          {MORE_TAGS}
        </p>
        {MORE_PROJECTS.map((m, idx) => (
          <div
            key={m.title}
            className="flex flex-col"
            style={{
              gap: "clamp(8px,0.8vw,12px)",
              marginTop: idx === 0 ? 0 : "clamp(14px,1.5vw,24px)",
            }}
          >
            <p
              className="font-figtree m-0 text-[#111]"
              style={{
                fontSize: "clamp(14px,1.62vw,28px)",
                lineHeight: 1.45,
                marginBottom: "2px",
              }}
            >
              {m.title}
            </p>
            <p
              className="font-figtree m-0 text-[#404040]"
              style={{ fontSize: "clamp(11px,1.04vw,18px)", lineHeight: 1.4 }}
            >
              {m.desc}
            </p>
            <LinkRow links={m.links} compact />
          </div>
        ))}
      </div>
    </div>
  );
}

export default function Projects() {
  return (
    <section
      id="projects"
      className="bg-[#F3F7F8]"
      style={{
        padding:
          "clamp(48px,5.5vw,96px) clamp(16px,5.3vw,92px) clamp(64px,9.3vw,120px)",
      }}
    >
      <div
        className="flex items-center"
        style={{ gap: "clamp(12px,1.4vw,24px)", marginBottom: "clamp(28px,4vw,64px)" }}
      >
        <div
          className="flex flex-shrink-0 items-center"
          style={{ gap: "clamp(8px,0.9vw,14px)" }}
        >
          <h2
            className="font-display whitespace-nowrap text-[#496dff]"
            style={{ fontSize: "clamp(28px,3.7vw,82px)", lineHeight: 1 }}
          >
            MY PROJECTS
          </h2>
          <Image
            src="/landing/projects-icon.png"
            alt=""
            width={96}
            height={96}
            className="flex-shrink-0 object-contain"
            style={{
              width: "clamp(40px,5.5vw,96px)",
              height: "clamp(40px,5.5vw,96px)",
            }}
          />
        </div>
        <div className="h-px flex-1 bg-[#c8d0ee]" />
      </div>

      <div
        className="grid grid-cols-1 md:grid-cols-2"
        style={{ gap: "clamp(16px,2.3vw,40px)" }}
      >
        {PROJECTS.map((p) => (
          <ProjectCard key={p.id} project={p} />
        ))}
        <MoreCard />
      </div>
    </section>
  );
}
