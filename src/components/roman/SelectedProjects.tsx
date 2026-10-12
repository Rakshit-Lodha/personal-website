"use client";

import { useEffect, useState } from "react";
import { ArrowRight, Minus } from "lucide-react";
import type { RomanProject } from "@/lib/roman/types";
import { Scene, SectionLabel, linkProps } from "./parts";
import SceneIn from "./SceneIn";
import { onSelect } from "./select";
import s from "./roman.module.css";

/** Same pattern as WorkJourney: expanding rows on mobile, list + single preview on desktop. */
export default function SelectedProjects({ projects }: { projects: RomanProject[] }) {
  const [open, setOpen] = useState<number | null>(0);
  const shown = open ?? 0;

  useEffect(
    () =>
      onSelect("project", (id) => {
        const index = projects.findIndex((project) => project.id === id);
        if (index >= 0) setOpen(index);
      }),
    [projects]
  );

  return (
    <section id="projects" className={`${s.section} ${s.plaster} ${s.room} ${s.projects}`}>
      <SceneIn name="projects" className={s.plate} />
      <Scene name="projects" className={`${s.mobileOnly} ${s.plateBottom}`} />
      <div className={`${s.inner} ${s.grid}`}>
        <div>
          <SectionLabel n="03" title="Selected projects" />
          <h2 className={s.h2}>
            Products that <br />
            turn ideas into use
          </h2>
          <p className={s.lede}>A few projects I’ve worked on, from idea to real users.</p>
          <div className={`${s.projectTabs} ${s.desktopOnly}`} role="group" aria-label="Choose a project">
            {projects.map((project, index) => (
              <button
                key={project.id}
                className={`${s.row} ${index === shown ? s.rowActive : ""}`}
                aria-pressed={index === shown}
                onClick={() => setOpen(index)}
              >
                <span>{project.name}</span>
                <ArrowRight size={20} aria-hidden="true" />
              </button>
            ))}
          </div>
        </div>

        <div>
          {projects.map((project, index) => (
            <article
              key={project.id}
              id={`project-${project.id}`}
              className={`${s.panel} ${s.project} ${index === open ? s.open : ""} ${index === shown ? s.shown : ""}`}
            >
              <h3 className={`${s.projectHead} ${s.mobileOnly}`}>
                <button aria-expanded={index === open} aria-controls={`project-body-${project.id}`} onClick={() => setOpen(index === open ? null : index)}>
                  {project.name}
                  {index === open ? <Minus aria-hidden="true" /> : <ArrowRight aria-hidden="true" />}
                </button>
              </h3>
              <div className={s.projectBody} id={`project-body-${project.id}`}>
                <p className={s.projectTagline}>{project.tagline}</p>
                <p className={s.body}>{project.summary}</p>
                {project.image && (
                  <div className={s.projectFigure}>
                    {/* Dimensions come from the data layer; a plain img avoids remote-host config. */}
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img className={s.projectImage} {...project.image} alt={project.image.alt} loading="lazy" decoding="async" />
                  </div>
                )}
                {(project.demoUrl || project.sourceUrl) && (
                  <div className={s.actions}>
                    {project.demoUrl && (
                      <a className={s.primary} {...linkProps(project.demoUrl)}>
                        Try it <ArrowRight size={18} aria-hidden="true" />
                      </a>
                    )}
                    {project.sourceUrl && (
                      <a className={s.secondary} {...linkProps(project.sourceUrl)}>
                        Behind the build <ArrowRight size={18} aria-hidden="true" />
                      </a>
                    )}
                  </div>
                )}
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
