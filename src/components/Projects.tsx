"use client";

import { useRef } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import Education from "@/components/Education";
import SkillMap from "@/components/SkillMap";

type HeroProject = {
  name: string;
  positioning: string;
  proof: string[];
  primitives: string[];
  githubUrl: string;
  demoUrl: string;
  screenshotSrc: string;
};

type StripCard = {
  name: string;
  positioning: string;
  proof: string[];
  primitives: string[];
  githubUrl: string;
  demoUrl: string;
};

export type OtherProject = {
  name: string;
  description: string;
  readmeUrl: string;
};

const heroProject: HeroProject = {
  name: "Krux.news",
  positioning:
    "AI news product that turns fast-moving AI updates into short, swipeable stories.",
  proof: [
    "Built the content pipeline and consumer web app.",
    "Designed a multi-stage AI workflow from ingestion to publishing.",
  ],
  primitives: ["AI curation", "Web research", "Publishing"],
  githubUrl: "https://github.com/Rakshit-Lodha/ai-times",
  demoUrl: "https://krux.news/",
  screenshotSrc: "/krux-logo.jpeg",
};

const stripProjects: StripCard[] = [
  {
    name: "MF Search",
    positioning:
      "Semantic search engine across 16,197 mutual funds with intent-aware routing.",
    proof: [
      "Routes queries into lookup, comparison, or filtered discovery.",
      "Handles typos, partial names, categories, and investment styles.",
      "Generates fund analysis across returns, risk, and expense ratios.",
    ],
    primitives: ["Embeddings", "Intent routing", "ChromaDB"],
    githubUrl: "https://github.com/Rakshit-Lodha/mf-search",
    demoUrl: "https://mf-ai-search.streamlit.app/",
  },
  {
    name: "US Stocks Agent",
    positioning:
      "Multi-agent stock analysis system with financial tools and voice input/output.",
    proof: [
      "Improved tool-use accuracy from 58% to 90%.",
      "Moved from one agent to specialist handoffs after evals.",
      "Covers 20+ test cases across 5 query categories.",
    ],
    primitives: ["Agent handoffs", "Voice AI", "Evals"],
    githubUrl: "https://github.com/Rakshit-Lodha/us-stock-agent",
    demoUrl: "https://us-stock-agent.streamlit.app/",
  },
  {
    name: "Feedback Intelligence",
    positioning:
      "Cross-channel agent that turns public feedback into prioritized product signals.",
    proof: [
      "Ingests Play Store, App Store, YouTube, and X feedback.",
      "Classifies bugs, UX complaints, feature requests, and sentiment trends.",
      "Separates UI chat state from persistent model session memory.",
    ],
    primitives: ["Agents SDK", "Function tools", "Memory"],
    githubUrl: "https://github.com/Rakshit-Lodha/managed-agents-review",
    demoUrl: "https://managed-agents-review.onrender.com",
  },
];

const otherProjects: OtherProject[] = [
  {
    name: "TalkToKrishna",
    description:
      "RAG product grounded in 700 Bhagavad Gita verses with a 50-question eval suite.",
    readmeUrl: "https://github.com/Rakshit-Lodha/talktokrishna",
  },
  {
    name: "Evaluation Framework",
    description:
      "LLM-as-judge and voice evaluation system for quality, safety, and ASR accuracy.",
    readmeUrl: "https://github.com/Rakshit-Lodha/evals",
  },
];

const githubProfileUrl = "https://github.com/Rakshit-Lodha";

function PrimitivePills({ primitives }: { primitives: string[] }) {
  return (
    <div className="flex flex-wrap gap-2">
      {primitives.map((primitive, index) => (
        <span
          key={`${primitive}-${index}`}
          className="rounded-full border-[0.5px] border-neutral-300 px-2.5 py-1 text-xs font-normal leading-none text-neutral-700"
        >
          {primitive}
        </span>
      ))}
    </div>
  );
}

function ActionLinks({
  githubUrl,
  demoUrl,
}: {
  githubUrl: string;
  demoUrl: string;
}) {
  return (
    <div className="flex gap-4 text-[13px] font-medium text-[#1B6AE7]">
      <a
        href={githubUrl}
        target="_blank"
        rel="noreferrer"
        className="focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#1B6AE7]"
      >
        GitHub ↗
      </a>
      <a
        href={demoUrl}
        target="_blank"
        rel="noreferrer"
        className="focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#1B6AE7]"
      >
        Live demo ↗
      </a>
    </div>
  );
}

function ProofList({ items }: { items: string[] }) {
  return (
    <ul className="space-y-2 border-l border-neutral-200">
      {items.map((item, index) => (
        <li
          key={`${item}-${index}`}
          className="pl-4 text-[13px] leading-[1.5] text-neutral-600"
        >
          {item}
        </li>
      ))}
    </ul>
  );
}

export function HeroProjectCard({ project }: { project: HeroProject }) {
  return (
    <motion.article
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.45, ease: "easeOut" }}
      className="grid rounded-xl bg-neutral-50 p-5 sm:min-h-[300px] sm:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)] sm:gap-8 md:p-8"
    >
      <div className="order-2 flex flex-col sm:order-1">
        <h3 className="text-xl font-medium leading-tight text-[#111111]">
          {project.name}
        </h3>
        <p className="mt-3 text-[15px] leading-[1.5] text-neutral-700">
          {project.positioning}
        </p>
        <div className="mt-5">
          <ProofList items={project.proof} />
        </div>
        <div className="mt-5">
          <PrimitivePills primitives={project.primitives} />
        </div>
        <div className="mt-6">
          <ActionLinks githubUrl={project.githubUrl} demoUrl={project.demoUrl} />
        </div>
      </div>

      <div className="order-1 mb-6 sm:order-2 sm:mb-0">
        <div className="relative flex h-full min-h-[170px] items-center justify-center overflow-hidden rounded-lg bg-white sm:min-h-[236px]">
          <Image
            src={project.screenshotSrc}
            alt={`${project.name} product screenshot`}
            fill
            sizes="(max-width: 639px) calc(100vw - 90px), 236px"
            className="object-cover"
          />
        </div>
      </div>
    </motion.article>
  );
}

export function StripProjectCard({
  project,
  index,
}: {
  project: StripCard;
  index: number;
}) {
  return (
    <motion.article
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4, delay: index * 0.06, ease: "easeOut" }}
      className="flex min-h-[310px] w-[280px] shrink-0 snap-start flex-col rounded-xl bg-neutral-50 p-5 md:w-[340px] md:p-6"
    >
      <h3 className="text-lg font-medium leading-tight text-[#111111]">
        {project.name}
      </h3>
      <p className="mt-3 text-sm leading-[1.5] text-neutral-700">
        {project.positioning}
      </p>
      <div className="mt-5">
        <ProofList items={project.proof} />
      </div>
      <div className="mt-5">
        <PrimitivePills primitives={project.primitives.slice(0, 3)} />
      </div>
      <div className="mt-auto pt-6">
        <ActionLinks githubUrl={project.githubUrl} demoUrl={project.demoUrl} />
      </div>
    </motion.article>
  );
}

export function OtherProjectRow({ project }: { project: OtherProject }) {
  return (
    <li className="text-[15px] leading-6">
      <span className="font-medium text-[#111111]">{project.name}</span>
      <span className="text-neutral-600"> — {project.description} </span>
      <a
        href={project.readmeUrl}
        target="_blank"
        rel="noreferrer"
        className="text-[13px] font-medium text-[#1B6AE7] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#1B6AE7]"
      >
        README ↗
      </a>
    </li>
  );
}

export function ProjectsSection({
  heroProject,
  stripProjects,
  otherProjects,
  githubProfileUrl,
}: {
  heroProject: HeroProject;
  stripProjects: StripCard[];
  otherProjects: OtherProject[];
  githubProfileUrl: string;
}) {
  const stripRef = useRef<HTMLDivElement>(null);

  function scrollStrip(direction: "left" | "right") {
    stripRef.current?.scrollBy({
      left: direction === "left" ? -364 : 364,
      behavior: "smooth",
    });
  }

  return (
    <>
      <div className="mx-auto max-w-[640px] px-1 md:px-0">
        <h2 className="text-[32px] font-medium leading-tight tracking-normal text-[#111111] md:text-[40px]">
          Projects
        </h2>

        <div className="mt-8 md:mt-12">
          <HeroProjectCard project={heroProject} />
        </div>
      </div>

      <div className="mx-auto mt-6 max-w-[640px] md:max-w-[704px]">
        <div className="flex justify-end gap-2 px-1 pb-3 md:px-0">
          <button
            type="button"
            onClick={() => scrollStrip("left")}
            className="hidden h-8 w-8 items-center justify-center rounded-full border-[0.5px] border-neutral-300 text-sm text-neutral-700 transition-colors hover:bg-neutral-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#1B6AE7] md:inline-flex"
            aria-label="Scroll projects left"
          >
            ←
          </button>
          <button
            type="button"
            onClick={() => scrollStrip("right")}
            className="hidden h-8 w-8 items-center justify-center rounded-full border-[0.5px] border-neutral-300 text-sm text-neutral-700 transition-colors hover:bg-neutral-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#1B6AE7] md:inline-flex"
            aria-label="Scroll projects right"
          >
            →
          </button>
        </div>

        <div
          ref={stripRef}
          className="flex snap-x snap-mandatory gap-6 overflow-x-auto scroll-smooth px-6 pb-4 [scrollbar-color:#d4d4d4_#f5f5f5] [scrollbar-width:thin] md:px-0"
        >
          {stripProjects.map((project, index) => (
            <StripProjectCard
              key={project.name}
              project={project}
              index={index}
            />
          ))}
        </div>
      </div>

      <div className="mx-auto mt-20 max-w-[640px] px-1 md:px-0">
        <h3 className="text-base font-medium text-[#111111]">Also built</h3>
        <ul className="mt-5 space-y-3">
          {otherProjects.map((project) => (
            <OtherProjectRow key={project.name} project={project} />
          ))}
        </ul>

        <a
          href={githubProfileUrl}
          target="_blank"
          rel="noreferrer"
          className="mt-12 inline-block text-sm font-medium text-[#1B6AE7] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#1B6AE7]"
        >
          More on GitHub ↗
        </a>
      </div>
    </>
  );
}

export default function Projects() {
  return (
    <section
      id="projects"
      className="bg-white px-5 pb-20 pt-16 text-[#111111] sm:px-6 md:pt-24 lg:px-8 lg:pb-24"
    >
      <div className="mx-auto max-w-7xl">
        <ProjectsSection
          heroProject={heroProject}
          stripProjects={stripProjects}
          otherProjects={otherProjects}
          githubProfileUrl={githubProfileUrl}
        />

        <SkillMap />
        <Education />
      </div>
    </section>
  );
}
