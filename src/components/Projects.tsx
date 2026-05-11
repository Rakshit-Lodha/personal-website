"use client";

import { motion } from "framer-motion";
import { EDUCATION } from "@/lib/resumeData";

export type FeaturedProject = {
  name: string;
  positioning: string;
  proof: string;
  primitives: string[];
  githubUrl: string;
  demoUrl: string;
};

export type OtherProject = {
  name: string;
  description: string;
  readmeUrl: string;
};

const featuredProjects: FeaturedProject[] = [
  {
    name: "TODO project name",
    positioning: "TODO one-sentence description of what this project does well.",
    proof: "TODO specific proof point",
    primitives: ["TODO primitive", "TODO primitive"],
    githubUrl: "#",
    demoUrl: "#",
  },
  {
    name: "TODO project name",
    positioning: "TODO one-sentence description of what this project does well.",
    proof: "TODO specific proof point",
    primitives: ["TODO primitive", "TODO primitive"],
    githubUrl: "#",
    demoUrl: "#",
  },
  {
    name: "TODO project name",
    positioning: "TODO one-sentence description of what this project does well.",
    proof: "TODO specific proof point",
    primitives: ["TODO primitive", "TODO primitive"],
    githubUrl: "#",
    demoUrl: "#",
  },
  {
    name: "TODO project name",
    positioning: "TODO one-sentence description of what this project does well.",
    proof: "TODO specific proof point",
    primitives: ["TODO primitive", "TODO primitive"],
    githubUrl: "#",
    demoUrl: "#",
  },
];

const otherProjects: OtherProject[] = [
  {
    name: "TODO project name",
    description: "TODO one short sentence about the project.",
    readmeUrl: "#",
  },
  {
    name: "TODO project name",
    description: "TODO one short sentence about the project.",
    readmeUrl: "#",
  },
  {
    name: "TODO project name",
    description: "TODO one short sentence about the project.",
    readmeUrl: "#",
  },
];

const skillsLine =
  "TODO one-sentence prose summary of the technical primitives used across these projects.";

const githubProfileUrl = "https://github.com/rakshitlodha";

export function FeaturedProjectCard({
  project,
  index,
}: {
  project: FeaturedProject;
  index: number;
}) {
  return (
    <motion.article
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4, delay: index * 0.06 }}
      className="flex h-full flex-col rounded-xl border-[0.5px] border-neutral-200 bg-neutral-50/70 p-5 md:p-6"
    >
      <h3 className="text-lg font-medium text-[#111111]">{project.name}</h3>
      <p className="mt-2 text-[15px] leading-[1.5] text-neutral-700">
        {project.positioning}
      </p>
      <p className="mt-3 truncate text-[13px] leading-5 text-neutral-500">
        {project.proof}
      </p>

      <div className="mt-4 flex flex-wrap gap-2">
        {project.primitives.map((primitive, index) => (
          <span
            key={`${primitive}-${index}`}
            className="rounded-full border-[0.5px] border-neutral-300 bg-transparent px-2.5 py-1 text-xs font-normal leading-none text-neutral-700"
          >
            {primitive}
          </span>
        ))}
      </div>

      <div className="mt-auto flex gap-4 pt-5 text-[13px] font-medium text-[#1B6AE7]">
        <a
          href={project.githubUrl}
          target="_blank"
          rel="noreferrer"
          className="focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#1B6AE7]"
        >
          GitHub ↗
        </a>
        <a
          href={project.demoUrl}
          target="_blank"
          rel="noreferrer"
          className="focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#1B6AE7]"
        >
          Live demo ↗
        </a>
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
  featuredProjects,
  otherProjects,
  skillsLine,
  githubProfileUrl,
}: {
  featuredProjects: FeaturedProject[];
  otherProjects: OtherProject[];
  skillsLine: string;
  githubProfileUrl: string;
}) {
  return (
    <div className="mx-auto max-w-[640px]">
      <h2 className="text-[32px] font-medium leading-tight tracking-normal text-[#111111] md:text-[40px]">
        Projects
      </h2>

      <div className="mt-8 grid grid-cols-1 gap-4 md:mt-12 md:grid-cols-2 md:gap-6">
        {featuredProjects.map((project, index) => (
          <FeaturedProjectCard
            key={`${project.name}-${index}`}
            project={project}
            index={index}
          />
        ))}
      </div>

      <div className="mt-12 md:mt-16">
        <h3 className="text-base font-medium text-[#111111]">Also built</h3>
        <ul className="mt-5 space-y-3">
          {otherProjects.map((project, index) => (
            <OtherProjectRow
              key={`${project.name}-${index}`}
              project={project}
            />
          ))}
        </ul>
      </div>

      <p className="mt-12 text-sm leading-6 text-neutral-600">{skillsLine}</p>

      <a
        href={githubProfileUrl}
        target="_blank"
        rel="noreferrer"
        className="mt-8 inline-block text-sm font-medium text-[#1B6AE7] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#1B6AE7]"
      >
        More on GitHub ↗
      </a>
    </div>
  );
}

export default function Projects() {
  return (
    <section id="projects" className="bg-white px-5 pb-20 pt-16 text-[#111111] sm:px-6 md:pt-24 lg:px-8 lg:pb-24">
      <div className="mx-auto max-w-7xl">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_360px]">
          <div>
            <ProjectsSection
              featuredProjects={featuredProjects}
              otherProjects={otherProjects}
              skillsLine={skillsLine}
              githubProfileUrl={githubProfileUrl}
            />

            {/* Education */}
            <div className="mx-auto mt-16 max-w-[640px] md:mt-24">
              <h3 className="mb-4 text-lg font-semibold text-foreground">Education</h3>
              <div className="flex flex-wrap items-center gap-4">
                {EDUCATION.map((edu, i) => (
                  <div key={edu.name} className="flex items-center gap-3">
                    {i > 0 && <span className="w-px h-6 bg-border" aria-hidden="true" />}
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center text-xs font-bold text-muted-foreground">
                        {edu.short}
                      </div>
                      <span className="text-sm text-foreground">{edu.name}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right: chat panel (desktop sidebar) */}
          
        </div>
      </div>
    </section>
  );
}
