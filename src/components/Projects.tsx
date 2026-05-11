"use client";

import { useRef } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import SkillMap from "@/components/SkillMap";
import { EDUCATION } from "@/lib/resumeData";

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
  positioning: "TODO Krux positioning line.",
  proof: ["TODO Krux proof item", "TODO Krux pipeline proof item"],
  primitives: ["TODO", "TODO", "TODO"],
  githubUrl: "#",
  demoUrl: "#",
  screenshotSrc: "/krux-news-screenshot.png",
};

const stripProjects: StripCard[] = [
  {
    name: "MF Search",
    positioning: "TODO MF Search positioning line.",
    proof: ["TODO proof item", "TODO proof item", "TODO proof item"],
    primitives: ["TODO", "TODO", "TODO"],
    githubUrl: "#",
    demoUrl: "#",
  },
  {
    name: "US Stocks Agent",
    positioning: "TODO US Stocks Agent positioning line.",
    proof: ["TODO proof item", "TODO proof item", "TODO proof item"],
    primitives: ["TODO", "TODO", "TODO"],
    githubUrl: "#",
    demoUrl: "#",
  },
  {
    name: "Feedback Intelligence",
    positioning: "TODO Feedback Intelligence positioning line.",
    proof: ["TODO proof item", "TODO proof item", "TODO proof item"],
    primitives: ["TODO", "TODO", "TODO"],
    githubUrl: "#",
    demoUrl: "#",
  },
];

const otherProjects: OtherProject[] = [
  {
    name: "TalkToKrishna",
    description: "TODO short description.",
    readmeUrl: "#",
  },
  {
    name: "Voice Document Q&A",
    description: "TODO short description.",
    readmeUrl: "#",
  },
];

const githubProfileUrl = "#";

function PrimitivePills({ primitives }: { primitives: string[] }) {
  return (
    <div className="flex flex-wrap gap-2">
      {primitives.map((primitive) => (
        <span
          key={primitive}
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
      {items.map((item) => (
        <li key={item} className="pl-4 text-[13px] leading-[1.5] text-neutral-600">
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
      className="grid rounded-xl bg-neutral-50 p-5 md:min-h-[300px] md:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)] md:gap-8 md:p-8"
    >
      <div className="order-2 flex flex-col md:order-1">
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

      <div className="order-1 mb-6 md:order-2 md:mb-0">
        <div className="relative flex h-full min-h-[170px] items-center justify-center overflow-hidden rounded-lg bg-white md:min-h-[236px]">
          <span className="px-6 text-center text-sm leading-6 text-neutral-500">
            Krux.news screenshot placeholder
          </span>
          <Image
            src={project.screenshotSrc}
            alt={`${project.name} product screenshot`}
            fill
            sizes="(max-width: 767px) calc(100vw - 90px), 236px"
            className="object-cover"
            onError={(event) => {
              event.currentTarget.style.display = "none";
            }}
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

      <div className="mt-6 md:ml-[calc((100%_-_640px)/2)] md:w-[calc(50vw_+_288px)]">
        <div className="mx-auto flex max-w-[640px] justify-end gap-2 px-1 pb-3 md:max-w-none md:px-0">
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
          className="flex snap-x snap-mandatory gap-6 overflow-x-auto scroll-smooth px-6 pb-4 [scrollbar-color:#d4d4d4_#f5f5f5] [scrollbar-width:thin] md:px-0 md:pr-8"
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

        <div className="mx-auto mt-16 max-w-[640px] md:mt-24">
          <h3 className="mb-4 text-lg font-semibold text-foreground">
            Education
          </h3>
          <div className="flex flex-wrap items-center gap-4">
            {EDUCATION.map((edu, i) => (
              <div key={edu.name} className="flex items-center gap-3">
                {i > 0 && (
                  <span className="h-6 w-px bg-border" aria-hidden="true" />
                )}
                <div className="flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-muted text-xs font-bold text-muted-foreground">
                    {edu.short}
                  </div>
                  <span className="text-sm text-foreground">{edu.name}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
