"use client";

import { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { PROJECTS, EDUCATION, TECHNICAL_SKILLS } from "@/lib/resumeData";

export default function Projects() {
  const skillsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = skillsRef.current;
    if (!root || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let hasAnimated = false;
    const observer = new IntersectionObserver(
      async ([entry]) => {
        if (!entry.isIntersecting || hasAnimated) return;
        hasAnimated = true;
        const { animate, stagger } = await import("animejs");
        animate(root.querySelectorAll(".skill-chip"), {
          opacity: [0, 1],
          y: [12, 0],
          scale: [0.96, 1],
          duration: 520,
          delay: stagger(35),
          ease: "out(3)",
        });
      },
      { threshold: 0.25 }
    );

    observer.observe(root);
    return () => observer.disconnect();
  }, []);

  return (
    <section id="projects" className="py-20 px-6 bg-white">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-8">
          {/* Left: projects + education */}
          <div>
            <div className="mb-8">
              <h2 className="text-3xl font-bold text-foreground mb-2">Projects & Skills</h2>
              <div className="w-10 h-0.5 bg-[#1B6AE7] mb-2" />
              <p className="text-muted-foreground text-sm">Products I&apos;ve built and the systems I use to build them.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-10">
              {PROJECTS.map((project, i) => (
                <motion.a
                  key={project.name}
                  href={project.href}
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: i * 0.08 }}
                  className="group bg-background rounded-2xl border border-border p-5 flex flex-col gap-3 hover:shadow-md hover:-translate-y-0.5 transition-all focus-visible:outline-2 focus-visible:outline-[#1B6AE7]"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <span className={`w-10 h-10 rounded-xl ${project.iconBg} flex items-center justify-center text-lg shrink-0`}>
                        {project.icon}
                      </span>
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-semibold text-sm text-foreground">{project.name}</span>
                        </div>
                        <span className="text-xs text-[#1B6AE7]">{project.tag}</span>
                      </div>
                    </div>
                    <span className="text-muted-foreground group-hover:text-[#1B6AE7] group-hover:translate-x-0.5 transition-all shrink-0" aria-hidden="true">→</span>
                  </div>
                  <p className="text-sm text-muted-foreground">{project.description}</p>
                </motion.a>
              ))}
            </div>

            {/* Technical Skills */}
            <div ref={skillsRef} className="mb-10">
              <h3 className="text-lg font-semibold text-foreground mb-4">Technical Skills</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {TECHNICAL_SKILLS.map((group) => (
                  <div
                    key={group.title}
                    className="rounded-2xl border border-border bg-background p-4"
                  >
                    <div className="text-xs font-semibold uppercase tracking-[0.08em] text-muted-foreground mb-3">
                      {group.title}
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {group.skills.map((skill) => (
                        <span
                          key={`${group.title}-${skill}`}
                          className="skill-chip opacity-0 rounded-full border border-border bg-white px-3 py-1 text-xs text-foreground shadow-sm"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Education */}
            <div>
              <h3 className="text-lg font-semibold text-foreground mb-4">Education</h3>
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
